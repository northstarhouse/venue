-- Real copy for the post-tour "Toured - Docs Sent" email.
update venue_email_templates set
  subject = 'Thank you for touring North Star House!',
  body = $BODY$Hi {{name}},

Thank you for taking the time to tour North Star House! We hope you enjoyed exploring the estate and can envision it as the perfect setting for your upcoming wedding.

Attached, you'll find our Client Guidebook that your Venue Coordinator reviewed with you, along with a Contact Sheet to complete if you'd like to move forward with booking: {{prebooking_link}}

If you have any questions or need further details, please don't hesitate to reach out to your venue coordinator or respond to this email. We're here to support you every step of the way in bringing your vision to life.

Additionally, here is the link to view our booking availability: {{availability_calendar_link}}
(Note: If you have requested a date to be put on hold with a venue coordinator, your date may appear unavailable.)

The North Star House Venue Team
www.NorthStarHouse.org$BODY$,
  html_body = $HTML$
<h1 style="margin:0 0 16px;font-family:'Cardo',Georgia,'Times New Roman',serif;font-size:22px;color:#2a2a2a;">Thank you for touring North Star House!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#444;">Hi {{name}},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#444;">Thank you for taking the time to tour North Star House! We hope you enjoyed exploring the estate and can envision it as the perfect setting for your upcoming wedding.</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#444;">Attached, you'll find our Client Guidebook that your Venue Coordinator reviewed with you, along with a Contact Sheet to complete if you'd like to move forward with booking.</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
  <tr>
    <td style="padding:0 8px 0 0;"><a href="{{guidebook_link}}" style="display:inline-block;background:#886c44;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 18px;border-radius:8px;">View Guidebook</a></td>
    <td style="padding:0 0 0 8px;"><a href="{{prebooking_link}}" style="display:inline-block;background:transparent;color:#886c44;text-decoration:none;font-size:13px;font-weight:600;padding:10px 18px;border-radius:8px;border:1.5px solid #886c44;">Pre-Booking Form</a></td>
  </tr>
</table>

<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#444;">If you have any questions or need further details, please don't hesitate to reach out to your venue coordinator or respond to this email. We're here to support you every step of the way in bringing your vision to life.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f7f3ec;border-radius:10px;">
  <tr><td style="padding:16px 20px;text-align:center;">
    <a href="{{availability_calendar_link}}" style="font-size:13px;font-weight:700;color:#886c44;text-decoration:none;">View Venue Availability Calendar →</a>
    <div style="font-size:11px;color:#999;margin-top:6px;">If you've requested a date to be put on hold with a venue coordinator, your date may appear unavailable.</div>
  </td></tr>
</table>

<p style="margin:0;font-size:13px;color:#888;">The North Star House Venue Team<br/>www.NorthStarHouse.org</p>
$HTML$
where key = 'toured_docs';
