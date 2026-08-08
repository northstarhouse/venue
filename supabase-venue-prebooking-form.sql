-- Creates the "Pre Booking Information Form" in NSH-forms (nsh_forms), so it
-- can be linked from the post-tour "Toured - Docs Sent" email.
insert into nsh_forms (title, description, fields, show_responses) values (
  'Pre Booking Information Form',
  'We''re so excited that you''re considering the historic North Star House for your upcoming event! Before we send your official booking paperwork, we just need a few quick details to make sure everything is correct and tailored to you.

This step is simple — just share your contact info, the date you''ve confirmed with our venue coordinator, and anyone else you would like to have access to your client portal. Once we have that, we''ll get your contract ready and officially reserve your spot on our calendar. We can''t wait to be part of your story and help create a day that feels timeless, memorable, and uniquely yours.',
  '[
    {"id": "7fnabd0i", "type": "short_text", "label": "Primary Signer - Full Name", "required": true},
    {"id": "c9u1sxb4", "type": "short_text", "label": "Primary Signer - Email Address", "required": true},
    {"id": "163otrai", "type": "short_text", "label": "Primary Signer - Phone Number", "required": true},
    {"id": "cm4d7gip", "type": "long_text", "label": "List the name, email address & phone number of anyone else that you like to have access to your client portal or make payments", "required": false},
    {"id": "sn9urgfr", "type": "date", "label": "Confirmed Event Date (discussed with Venue Coordinator)", "required": true}
  ]'::jsonb,
  true
)
returning id;
