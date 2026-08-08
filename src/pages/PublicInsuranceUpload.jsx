import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

const gold = '#886c44';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PublicInsuranceUpload({ inquiryId }) {
  const [inquiry, setInquiry] = useState(undefined);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.from('venue_inquiries').select('*').eq('id', inquiryId).maybeSingle().then(({ data, error }) => {
      if (error || !data) { setError('We could not find your booking. Please contact us directly.'); return; }
      setInquiry(data);
      if (data.insurance_uploaded_at) setDone(true);
    });
  }, [inquiryId]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) { setError('Please choose a file first.'); return; }
    setUploading(true);
    setError('');
    try {
      const base64 = await fileToBase64(file);
      const { data, error: fnError } = await supabase.functions.invoke('upload-insurance-cert', {
        body: { inquiryId, filename: file.name, mimeType: file.type, base64 },
      });
      if (fnError || data?.error) throw new Error(fnError?.message || data?.error || 'Upload failed.');
      setDone(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: '#2a2a2e', padding: '28px 16px', textAlign: 'center' }}>
        <img src="assets/logo.png" alt="North Star House" style={{ width: 200, maxWidth: '100%', margin: '0 auto', display: 'block' }} />
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '36px 16px 60px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2a2a2a', fontFamily: "'Cardo', serif", textAlign: 'center', marginBottom: 24 }}>Upload Liability Insurance</div>

        {error && <div style={{ color: '#c0392b', fontSize: 13, background: '#fbe9e7', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>{error}</div>}

        {done ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2a2a2a', marginBottom: 6 }}>Certificate Received</div>
            <div style={{ fontSize: 13, color: '#666' }}>Thank you! We've received your liability insurance certificate.</div>
          </div>
        ) : !inquiry ? null : (
          <>
            <div className="card" style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                Hi <strong>{inquiry.name}</strong> — please upload your $1 million liability insurance certificate naming <strong>North Star Historic Conservancy</strong> as additionally insured.
              </div>
            </div>

            <form onSubmit={handleUpload} className="card">
              <input type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginBottom: 14, fontSize: 13, width: '100%' }} />
              <button type="submit" className="btn-gold" disabled={uploading || !file} style={{ width: '100%', padding: '11px' }}>
                {uploading ? 'Uploading…' : 'Upload Certificate'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
