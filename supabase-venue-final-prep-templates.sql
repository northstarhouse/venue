insert into venue_email_templates (key, subject, body, html_body) values
  ('questionnaire_insurance_reminder', '[PLACEHOLDER SUBJECT] A few things before your big day, {{name}}!',
   '[PLACEHOLDER COPY]

Hi {{name}},

Your wedding date is coming up! To help us prepare, please:

1. Fill out our Wedding Day Questionnaire: {{questionnaire_link}}
2. Upload your $1M liability insurance certificate: {{insurance_link}}

Thank you!
The North Star House Venue Team',
   '<h1 style="margin:0 0 16px;font-family:''Cardo'',Georgia,''Times New Roman'',serif;font-size:22px;color:#2a2a2a;">A few things before your big day!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#444;">Hi {{name}},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#444;">[PLACEHOLDER COPY]</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
  <tr>
    <td style="padding:0 8px 0 0;"><a href="{{questionnaire_link}}" style="display:inline-block;background:#886c44;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 18px;border-radius:8px;">Wedding Day Questionnaire</a></td>
    <td style="padding:0 0 0 8px;"><a href="{{insurance_link}}" style="display:inline-block;background:transparent;color:#886c44;text-decoration:none;font-size:13px;font-weight:600;padding:10px 18px;border-radius:8px;border:1.5px solid #886c44;">Upload Insurance</a></td>
  </tr>
</table>')
on conflict (key) do nothing;

insert into venue_email_templates (key, subject, body, html_body) values
  ('final_feedback_request', '[PLACEHOLDER SUBJECT] How was your day, {{name}}?',
   '[PLACEHOLDER COPY]

Hi {{name}},

Thank you for celebrating with us at North Star House! We would love to hear about your experience: {{feedback_link}}

The North Star House Venue Team',
   '<h1 style="margin:0 0 16px;font-family:''Cardo'',Georgia,''Times New Roman'',serif;font-size:22px;color:#2a2a2a;">How was your day?</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#444;">Hi {{name}},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#444;">[PLACEHOLDER COPY — thank you for celebrating with us! We would love to hear about your experience.]</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
  <tr><td><a href="{{feedback_link}}" style="display:inline-block;background:#886c44;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 18px;border-radius:8px;">Share Your Feedback</a></td></tr>
</table>')
on conflict (key) do nothing;
