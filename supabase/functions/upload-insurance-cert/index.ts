// Public, no-login upload for a couple's liability insurance certificate.
// POST body: { inquiryId: number, filename: string, mimeType: string, base64: string }

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

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { inquiryId, filename, mimeType, base64 } = await req.json();
    if (!inquiryId || !filename || !base64) return json({ error: 'Missing inquiryId, filename, or base64' }, 400);

    const safeName = String(filename).replace(/[^A-Za-z0-9._-]/g, '_');
    const path = `${inquiryId}/${Date.now()}-${safeName}`;
    const bytes = base64ToBytes(base64);

    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': mimeType || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: bytes,
    });
    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return json({ error: `Upload failed: ${err}` }, 500);
    }

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/venue_inquiries?id=eq.${inquiryId}`, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ insurance_uploaded_at: new Date().toISOString(), insurance_file_path: path }),
    });
    if (!patchRes.ok) {
      const err = await patchRes.text();
      return json({ error: `Saved file but failed to update inquiry: ${err}` }, 500);
    }

    return json({ success: true, path });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
