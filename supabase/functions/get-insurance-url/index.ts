// Generates a short-lived signed URL for staff to view an uploaded insurance
// certificate. The storage bucket is private, so this is the only way in.
// POST body: { inquiryId: number }

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BUCKET = 'venue-insurance';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { inquiryId } = await req.json();
    if (!inquiryId) return json({ error: 'Missing inquiryId' }, 400);

    const inqRes = await fetch(`${SUPABASE_URL}/rest/v1/venue_inquiries?select=insurance_file_path&id=eq.${inquiryId}`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const rows = await inqRes.json();
    const path = rows?.[0]?.insurance_file_path;
    if (!path) return json({ error: 'No insurance file on record for this inquiry' }, 404);

    const signRes = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${path}`, {
      method: 'POST',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn: 300 }),
    });
    if (!signRes.ok) return json({ error: await signRes.text() }, 500);
    const { signedURL } = await signRes.json();

    return json({ url: `${SUPABASE_URL}/storage/v1${signedURL}` });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
