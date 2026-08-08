-- Adds branded HTML copy alongside the existing plain-text templates.
-- {{slots_widget}} is replaced by the edge function with a rendered list of
-- clickable open tour times (only used by the 3 scheduling-related emails).
alter table venue_email_templates add column if not exists html_body text;

update venue_email_templates set html_body = $$
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2a2a2a;">[PLACEHOLDER] Thank you for your inquiry, {{name}}!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">[PLACEHOLDER COPY — replace with real intro + Information &amp; Pricing Guide text/attachment]</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">We'd love to show you around. Pick a tour time below with Jen or Sierra:</p>
{{slots_widget}}
$$ where key = 'initial_inquiry';

update venue_email_templates set html_body = $$
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2a2a2a;">[PLACEHOLDER] Still thinking about a tour, {{name}}?</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">[PLACEHOLDER COPY]</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">Here are our next open times — happy to answer any questions along the way.</p>
{{slots_widget}}
$$ where key = 'follow_up_48h';

update venue_email_templates set html_body = $$
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2a2a2a;">[PLACEHOLDER] Last check-in, {{name}}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">[PLACEHOLDER COPY]</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">We haven't heard back — if you're still interested, here are our next open times:</p>
{{slots_widget}}
$$ where key = 'final_follow_up_30d';

update venue_email_templates set html_body = $$
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2a2a2a;">Your tour is confirmed!</h1>
<p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#444;">Hi {{name}},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444;">Your tour with <strong>{{host_name}}</strong> is confirmed for:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f7f3ec;border-radius:10px;">
  <tr><td style="padding:16px 20px;text-align:center;">
    <div style="font-size:16px;font-weight:700;color:#886c44;font-family:Georgia,'Times New Roman',serif;">{{tour_date}}</div>
    <div style="font-size:14px;color:#666;margin-top:2px;">{{tour_time}}</div>
  </td></tr>
</table>
<p style="margin:0;font-size:15px;line-height:1.6;color:#444;">[PLACEHOLDER — real arrival instructions go here]</p>
$$ where key = 'tour_confirmation';

update venue_email_templates set html_body = $$
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2a2a2a;">Reminder: your tour is tomorrow</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">Hi {{name}}, just a reminder that your tour with <strong>{{host_name}}</strong> is tomorrow, <strong>{{tour_date}}</strong> at <strong>{{tour_time}}</strong>.</p>
$$ where key = 'tour_reminder_24h';

update venue_email_templates set html_body = $$
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2a2a2a;">Reminder: your tour is in 1 hour</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">Hi {{name}}, your tour with <strong>{{host_name}}</strong> starts soon, at <strong>{{tour_time}}</strong>. See you shortly!</p>
$$ where key = 'tour_reminder_1h';

update venue_email_templates set html_body = $$
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2a2a2a;">Thanks for touring North Star House!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">Hi {{name}}, it was wonderful having you tour with <strong>{{host_name}}</strong>. [PLACEHOLDER COPY]</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444;">Here is our digital guidebook, and a pre-booking form if you'd like to move forward:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
  <tr>
    <td style="padding:0 8px 0 0;"><a href="{{guidebook_link}}" style="display:inline-block;background:#886c44;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 18px;border-radius:8px;">View Guidebook</a></td>
    <td style="padding:0 0 0 8px;"><a href="{{prebooking_link}}" style="display:inline-block;background:transparent;color:#886c44;text-decoration:none;font-size:13px;font-weight:600;padding:10px 18px;border-radius:8px;border:1.5px solid #886c44;">Pre-Booking Form</a></td>
  </tr>
</table>
$$ where key = 'toured_docs';
