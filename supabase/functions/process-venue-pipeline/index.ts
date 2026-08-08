// Drives the wedding-inquiry pipeline: staged follow-up emails, tour
// confirmations/reminders, and post-tour docs. Invoked on a schedule by
// pg_cron (see supabase-venue-pipeline-cron.sql). Every step is guarded by
// a *_sent_at / status column so re-running this is always safe.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SCHEDULING_BASE_URL = 'https://northstarhouse.github.io/venue/';
const TZ = 'America/Los_Angeles';

const headers = (extra?: Record<string, string>) => ({
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  ...extra,
});

async function rest(path: string, init: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...headers(), ...(init.headers || {}) } });
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

let templateCache: Record<string, { subject: string; body: string }> | null = null;
async function getTemplates() {
  if (templateCache) return templateCache;
  const rows = await rest('venue_email_templates?select=key,subject,body');
  templateCache = {};
  for (const r of rows) templateCache[r.key] = { subject: r.subject, body: r.body };
  return templateCache;
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: TZ });
}
function fmtTime(d: string | Date) {
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
}

function render(tpl: { subject: string; body: string }, vars: Record<string, string>) {
  const sub = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
  return { subject: sub(tpl.subject), body: sub(tpl.body) };
}

async function sendEmail(to: string, subject: string, body: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({ to, subject, body, sender: 'Venue Team' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `send-email HTTP ${res.status}`);
  return data;
}

Deno.serve(async () => {
  const now = new Date();
  const nowIso = now.toISOString();
  const templates = await getTemplates();
  const result: Record<string, number> = { initial: 0, followUp48h: 0, finalFollowUp30d: 0, archived: 0, tourConfirmation: 0, reminder24h: 0, reminder1h: 0, touredDocs: 0, errors: 0 };

  // ── Step 1: New wedding inquiries -> send initial guide + scheduling link ──
  try {
    const rows = await rest(`venue_inquiries?select=*&status=eq.New&email=not.is.null`);
    for (const inq of rows) {
      try {
        const link = `${SCHEDULING_BASE_URL}?schedule=${inq.id}`;
        const { subject, body } = render(templates.initial_inquiry, { name: inq.name, event_date: inq.event_date || '', scheduling_link: link });
        await sendEmail(inq.email, subject, body);
        await rest(`venue_inquiries?id=eq.${inq.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'Initial Inquiry Sent', initial_sent_at: nowIso }) });
        result.initial++;
      } catch (e) { console.error('initial_inquiry failed for', inq.id, e); result.errors++; }
    }
  } catch (e) { console.error('step1 query failed', e); }

  // ── Step 2: No tour booked 48h after initial send -> follow-up ──
  try {
    const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const rows = await rest(`venue_inquiries?select=*&status=eq.${encodeURIComponent('Initial Inquiry Sent')}&initial_sent_at=lte.${encodeURIComponent(cutoff)}&email=not.is.null`);
    for (const inq of rows) {
      try {
        const link = `${SCHEDULING_BASE_URL}?schedule=${inq.id}`;
        const { subject, body } = render(templates.follow_up_48h, { name: inq.name, scheduling_link: link });
        await sendEmail(inq.email, subject, body);
        await rest(`venue_inquiries?id=eq.${inq.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'Follow Up Sent', follow_up_sent_at: nowIso }) });
        result.followUp48h++;
      } catch (e) { console.error('follow_up_48h failed for', inq.id, e); result.errors++; }
    }
  } catch (e) { console.error('step2 query failed', e); }

  // ── Step 3: No tour scheduled within 30 days of inquiry -> final follow-up ──
  try {
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const inList = encodeURIComponent('"Initial Inquiry Sent","Follow Up Sent"');
    const rows = await rest(`venue_inquiries?select=*&status=in.(${inList})&created_at=lte.${encodeURIComponent(cutoff)}&email=not.is.null`);
    for (const inq of rows) {
      try {
        const link = `${SCHEDULING_BASE_URL}?schedule=${inq.id}`;
        const { subject, body } = render(templates.final_follow_up_30d, { name: inq.name, scheduling_link: link });
        await sendEmail(inq.email, subject, body);
        await rest(`venue_inquiries?id=eq.${inq.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'Final Follow Up Sent', final_follow_up_sent_at: nowIso }) });
        result.finalFollowUp30d++;
      } catch (e) { console.error('final_follow_up_30d failed for', inq.id, e); result.errors++; }
    }
  } catch (e) { console.error('step3 query failed', e); }

  // ── Step 4: Archive 5 days after final follow-up if still no tour ──
  try {
    const cutoff = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const rows = await rest(`venue_inquiries?select=id&status=eq.${encodeURIComponent('Final Follow Up Sent')}&final_follow_up_sent_at=lte.${encodeURIComponent(cutoff)}`);
    for (const inq of rows) {
      try {
        await rest(`venue_inquiries?id=eq.${inq.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'Archive' }) });
        result.archived++;
      } catch (e) { console.error('archive failed for', inq.id, e); result.errors++; }
    }
  } catch (e) { console.error('step4 query failed', e); }

  // ── Step 5: Newly booked tours -> confirmation email ──
  try {
    const rows = await rest(`venue_tours?select=*,venue_inquiries(id,name,email),venue_tour_hosts(name)&status=eq.Scheduled&confirmation_sent_at=is.null`);
    for (const tour of rows) {
      const inq = tour.venue_inquiries;
      if (!inq?.email) continue;
      try {
        const { subject, body } = render(templates.tour_confirmation, {
          name: inq.name, host_name: tour.venue_tour_hosts?.name || '', tour_date: fmtDate(tour.slot_start), tour_time: fmtTime(tour.slot_start),
        });
        await sendEmail(inq.email, subject, body);
        await rest(`venue_tours?id=eq.${tour.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ confirmation_sent_at: nowIso }) });
        await rest(`venue_inquiries?id=eq.${inq.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'Tour Scheduled' }) });
        result.tourConfirmation++;
      } catch (e) { console.error('tour_confirmation failed for', tour.id, e); result.errors++; }
    }
  } catch (e) { console.error('step5 query failed', e); }

  // ── Step 6: 24h-before reminder ──
  try {
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const rows = await rest(`venue_tours?select=*,venue_inquiries(id,name,email),venue_tour_hosts(name)&status=eq.Scheduled&reminder_24h_sent_at=is.null&slot_start=lte.${encodeURIComponent(in24h)}&slot_start=gt.${encodeURIComponent(nowIso)}`);
    for (const tour of rows) {
      const inq = tour.venue_inquiries;
      if (!inq?.email) continue;
      try {
        const { subject, body } = render(templates.tour_reminder_24h, {
          name: inq.name, host_name: tour.venue_tour_hosts?.name || '', tour_date: fmtDate(tour.slot_start), tour_time: fmtTime(tour.slot_start),
        });
        await sendEmail(inq.email, subject, body);
        await rest(`venue_tours?id=eq.${tour.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ reminder_24h_sent_at: nowIso }) });
        result.reminder24h++;
      } catch (e) { console.error('reminder_24h failed for', tour.id, e); result.errors++; }
    }
  } catch (e) { console.error('step6 query failed', e); }

  // ── Step 7: 1h-before reminder ──
  try {
    const in1h = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    const rows = await rest(`venue_tours?select=*,venue_inquiries(id,name,email),venue_tour_hosts(name)&status=eq.Scheduled&reminder_1h_sent_at=is.null&slot_start=lte.${encodeURIComponent(in1h)}&slot_start=gt.${encodeURIComponent(nowIso)}`);
    for (const tour of rows) {
      const inq = tour.venue_inquiries;
      if (!inq?.email) continue;
      try {
        const { subject, body } = render(templates.tour_reminder_1h, {
          name: inq.name, host_name: tour.venue_tour_hosts?.name || '', tour_date: fmtDate(tour.slot_start), tour_time: fmtTime(tour.slot_start),
        });
        await sendEmail(inq.email, subject, body);
        await rest(`venue_tours?id=eq.${tour.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ reminder_1h_sent_at: nowIso }) });
        result.reminder1h++;
      } catch (e) { console.error('reminder_1h failed for', tour.id, e); result.errors++; }
    }
  } catch (e) { console.error('step7 query failed', e); }

  // ── Step 8: 1h after tour start -> docs + pre-booking form, mark completed ──
  try {
    const oneHourAgoStart = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const rows = await rest(`venue_tours?select=*,venue_inquiries(id,name,email),venue_tour_hosts(name)&status=eq.Scheduled&docs_sent_at=is.null&slot_start=lte.${encodeURIComponent(oneHourAgoStart)}`);
    for (const tour of rows) {
      const inq = tour.venue_inquiries;
      try {
        if (inq?.email) {
          const { subject, body } = render(templates.toured_docs, {
            name: inq.name, host_name: tour.venue_tour_hosts?.name || '', guidebook_link: '', prebooking_link: '',
          });
          await sendEmail(inq.email, subject, body);
        }
        await rest(`venue_tours?id=eq.${tour.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ docs_sent_at: nowIso, status: 'Completed' }) });
        if (inq?.id) await rest(`venue_inquiries?id=eq.${inq.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'Toured - Docs Sent' }) });
        result.touredDocs++;
      } catch (e) { console.error('toured_docs failed for', tour.id, e); result.errors++; }
    }
  } catch (e) { console.error('step8 query failed', e); }

  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
});
