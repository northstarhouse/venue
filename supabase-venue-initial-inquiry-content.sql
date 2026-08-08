-- Replaces the placeholder Initial Inquiry email with the real Information &
-- Pricing Guide content, reorganized for email (pricing + amenities up top,
-- live scheduling widget, then the full FAQ grouped by category).

update venue_email_templates set
  subject = 'Thank you for your interest in North Star House, {{name}}!',
  body = $BODY$Hi {{name}},

Thank you for your interest in North Star House! This historic estate, designed in 1905 by renowned architect Julia Morgan, offers a timeless setting for life's most memorable celebrations. The venue features a spacious catering kitchen, lighted courtyard, a beautiful garden, and a veranda offering sunset views. Conveniently located near downtown Grass Valley, your guests will be close to accommodations and local attractions.

BASE WEDDING RENTAL: $5,000
10 hours · up to 250 guests · includes a personalized commemorative brick placed on the grounds as a lasting part of North Star House's story.

All weddings also include: tables and chairs for up to 250 guests, a fully equipped catering kitchen, a lighted courtyard, the Heritage Garden (open for two hours of your event), preparation suites for both wedding parties, flexibility to bring your own vendors, four restrooms, ample on-site parking, and accessible parking for guests with mobility needs. Every booking also includes two on-site planning meetings with your venue coordinator.

SELF-SCHEDULE A COMPLIMENTARY ESTATE TOUR
Pick a time here: {{scheduling_link}}
If you'd like to request a different date or time, just reply to this email.

A FEW COMMON QUESTIONS

General Venue Information
- What is included in a base wedding rental? The base rental includes exclusive use of the North Star House and grounds for 10 hours, tables and chairs for up to 250 guests, and a personalized commemorative brick.
- What are the rental hours? A standard rental includes 10 consecutive hours covering setup, the event, and clean-up. Additional hours can be arranged in advance for a fee; the latest timeslot available is 1pm-11pm. You may begin setting up outside before your rental hours, but a site manager won't open the house itself until your contracted time begins.
- Who is responsible for clean-up? Couples and their vendors are responsible for all clean-up and décor removal within the rental period. We do not provide staff for these tasks.

Food, Beverage & Vendors
- Can we choose our own vendors? Absolutely — bring your own catering, rentals, bar service, florals, and more. We provide a recommended vendor list, and your caterer must be approved before signing the contract.
- Can we bring our own alcohol? Yes! North Star House is a BYO alcohol venue, with no corkage fee.
- Can we do self-serve alcohol? Yes, self-serve is allowed, but we require a fully staffed caterer to oversee bar service and support tear-down.

Booking & Payment
- What payments are required to reserve the venue? A non-refundable $800 retainer at signing, which counts toward your overall venue cost.
- When is the rental fee due? 50% due 5 months before the wedding, the remaining 50% due 3 months before.
- Is there a security deposit? Yes, an $800 refundable deposit due 1 month prior, returned after your event if no damages occur.
- Do you require liability insurance? Yes, a $1M policy naming North Star Historic Conservancy as additionally insured — typically affordable and easy to obtain.
- Are there any hidden costs? No — all required costs are in your rental agreement. Add-ons like additional hours are available but not required.

Staffing & Coordination
- Is there a venue host to help with vendors? Yes. A venue coordinator supports you leading up to your event; on the wedding day you'll need a designated day-of coordinator, and North Star House provides a site manager during your rental hours.

Rentals & Amenities
- Are linens included? No — rent them through your caterer or a rental company.
- Do you provide cutlery, glassware, or dishes? No — those come from your caterer or a rental vendor.
- Outdoor heating? 4 heaters available at $50 each with propane included, addable last-minute and deducted from your security deposit.
- What happens if the weather is bad? Indoor capacity is 70-75 guests. For larger groups we recommend a marquee tent on the courtyard/terrace — tenting on the grass creates mud and damages the lawns.

Music & Entertainment
- Do you have a stage for DJs or bands? No formal stage, but many couples use the courtyard as a dance floor. Performers must provide their own PA system and any staging they need.
- Do you provide a sound system? No, couples arrange their own DJ, band, or rental sound system.
- How late can music go? Music must end by 10:00 PM per local noise ordinances.

Warmly,
North Star House$BODY$,
  html_body = $HTML$
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#2a2a2a;">Thank you for your interest in North Star House!</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#444;">Hi {{name}},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#444;">This historic estate, designed in 1905 by renowned architect Julia Morgan, offers a timeless setting for life's most memorable celebrations. The venue features a spacious catering kitchen, lighted courtyard, a beautiful garden, and a veranda offering sunset views. Conveniently located near downtown Grass Valley, your guests will be close to accommodations and local attractions.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f7f3ec;border-radius:12px;">
  <tr><td style="padding:22px;text-align:center;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:#886c44;font-weight:700;margin-bottom:6px;">Base Wedding Rental</div>
    <div style="font-size:32px;font-weight:700;color:#2a2a2a;font-family:Georgia,'Times New Roman',serif;">$5,000</div>
    <div style="font-size:12px;color:#888;margin-top:6px;">10 hours &middot; up to 250 guests &middot; includes a personalized commemorative brick</div>
  </td></tr>
</table>

<div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#886c44;margin:0 0 12px;">Included Amenities</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
  <tr><td style="padding:4px 0;font-size:13px;line-height:1.6;color:#444;">&#10022; <strong>Tables &amp; Chairs</strong> — seating for up to 250 guests</td></tr>
  <tr><td style="padding:4px 0;font-size:13px;line-height:1.6;color:#444;">&#10022; <strong>Spacious Catering Kitchen</strong> — fully equipped for your caterer</td></tr>
  <tr><td style="padding:4px 0;font-size:13px;line-height:1.6;color:#444;">&#10022; <strong>Lighted Courtyard</strong> — a beautifully illuminated gathering space</td></tr>
  <tr><td style="padding:4px 0;font-size:13px;line-height:1.6;color:#444;">&#10022; <strong>Heritage Garden</strong> — open for two hours of your event</td></tr>
  <tr><td style="padding:4px 0;font-size:13px;line-height:1.6;color:#444;">&#10022; <strong>Preparation Suites</strong> — dedicated spaces for both wedding parties</td></tr>
  <tr><td style="padding:4px 0;font-size:13px;line-height:1.6;color:#444;">&#10022; <strong>Flexible Vendor Options</strong> — bring your own vendors</td></tr>
  <tr><td style="padding:4px 0;font-size:13px;line-height:1.6;color:#444;">&#10022; <strong>Four Restrooms</strong> — modern facilities for your guests</td></tr>
  <tr><td style="padding:4px 0;font-size:13px;line-height:1.6;color:#444;">&#10022; <strong>Ample Parking</strong> — on-site parking, including accessible spaces</td></tr>
  <tr><td style="padding:8px 0 0;font-size:12px;line-height:1.6;color:#888;font-style:italic;">Every booking also includes two on-site planning meetings with your venue coordinator.</td></tr>
</table>

<div style="font-size:16px;font-weight:700;color:#2a2a2a;font-family:Georgia,'Times New Roman',serif;text-align:center;margin:0 0 4px;">Self-Schedule a Complimentary Estate Tour</div>
<p style="margin:0 0 16px;font-size:12px;color:#999;text-align:center;font-style:italic;">Want a different date or time? Just reply to this email.</p>
{{slots_widget}}

<div style="border-top:1px solid #ece5d8;margin:32px 0 22px;"></div>
<div style="font-size:17px;font-weight:700;color:#2a2a2a;font-family:Georgia,'Times New Roman',serif;text-align:center;margin:0 0 18px;">Frequently Asked Questions</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:0 0 8px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#886c44;">General Venue Information</div></td></tr>
<tr><td style="padding:0 0 12px;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">What is included in a base wedding rental?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Exclusive use of the North Star House and grounds for 10 hours, tables and chairs for up to 250 guests, and a personalized commemorative brick placed on the grounds as a lasting part of North Star House's story.</div>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">What are the rental hours for the venue?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">A standard rental includes 10 consecutive hours, covering setup, the event, and clean-up. Additional hours may be arranged in advance for a fee — the latest timeslot available is 1p-11p. You may begin setting up outside before your rental hours, but a site manager won't open the house until your contracted time begins.</div>
</td></tr>
<tr><td style="padding:12px 0 16px;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Who is responsible for clean-up?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Couples and their vendors are responsible for all clean-up and removal of décor within the rental period. We do not provide staff for these tasks.</div>
</td></tr>

<tr><td style="padding:18px 0 8px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#886c44;">Food, Beverage &amp; Vendors</div></td></tr>
<tr><td style="padding:0 0 12px;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Can we choose our own vendors?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Absolutely. Bring your own vendors for catering, rentals, bar service, florals, and more. We also provide a recommended vendor list of trusted professionals. Your caterer must be approved before signing the contract.</div>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Can we bring our own alcohol?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Yes! North Star House is a BYO alcohol venue — beer, wine, and spirits, with no corkage fee.</div>
</td></tr>
<tr><td style="padding:12px 0 16px;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Can we do self-serve alcohol, like beer and wine in coolers?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Yes, self-serve is allowed. However, we require a fully staffed caterer to oversee bar service and support tear-down.</div>
</td></tr>

<tr><td style="padding:18px 0 8px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#886c44;">Booking &amp; Payment</div></td></tr>
<tr><td style="padding:0 0 12px;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">What payments are required to reserve the venue?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">A non-refundable $800 retainer is due at the time of signing, and counts toward the overall venue cost.</div>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">When is the rental fee due?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">The rental fee is split into two installments: 50% due 5 months before the wedding, and the remaining 50% due 3 months before.</div>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Is there a security deposit?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Yes. An $800 refundable security deposit is due 1 month prior to the wedding, returned after your event if no damages occur and policies are followed.</div>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Do you require liability insurance?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Yes — a $1 million liability policy naming North Star Historic Conservancy as additionally insured. These policies are typically very affordable and easy to obtain.</div>
</td></tr>
<tr><td style="padding:12px 0 16px;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Are there any hidden costs?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">No. We value transparency — all required costs are outlined clearly in your rental agreement. Add-ons like additional hours are available, but not required.</div>
</td></tr>

<tr><td style="padding:18px 0 8px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#886c44;">Staffing &amp; Coordination</div></td></tr>
<tr><td style="padding:0 0 16px;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Is there a venue host to help with vendors?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Yes. A venue coordinator supports you with venue-related questions, logistics, and tours leading up to your event. On the wedding day, you'll need a designated day-of coordinator as the main point of contact for your vendors, and North Star House provides a site manager during your rental hours.</div>
</td></tr>

<tr><td style="padding:18px 0 8px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#886c44;">Rentals &amp; Amenities</div></td></tr>
<tr><td style="padding:0 0 12px;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Are linens included?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">No — you may rent them through your caterer or a rental company.</div>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Do you provide cutlery, glassware, or dishes?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">No — those must come from your caterer or a rental vendor.</div>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Do you have outdoor heating options?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Yes — 4 heaters available for $50 each with propane included. This can be added last-minute and deducted from the security deposit.</div>
</td></tr>
<tr><td style="padding:12px 0 16px;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">What happens if the weather is bad?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Indoor capacity at the House is 70-75 guests. For larger groups, we recommend renting a marquee tent for the courtyard and terrace — tenting on the grass areas creates a muddy mess and damages the lawns.</div>
</td></tr>

<tr><td style="padding:18px 0 8px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#886c44;">Music &amp; Entertainment</div></td></tr>
<tr><td style="padding:0 0 12px;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Do you have a stage for DJs or bands?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">While there isn't a formal stage, many couples use the courtyard as a dance floor. The space features market lights and twinkle lights, with multiple outlets on separate circuits. Performers must provide their own PA system and any platform/staging they require.</div>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #ece5d8;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">Do you provide a sound system?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">No, couples must arrange for their own DJ, band, or rental sound system.</div>
</td></tr>
<tr><td style="padding:12px 0;">
  <div style="font-size:13px;font-weight:700;color:#2a2a2a;margin-bottom:3px;">How late can music go?</div>
  <div style="font-size:13px;color:#555;line-height:1.6;">Music (and the party) must end by 10:00 PM in compliance with local noise ordinances.</div>
</td></tr>
</table>
$HTML$
where key = 'initial_inquiry';
