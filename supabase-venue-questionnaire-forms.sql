-- Creates the Wedding Day Questionnaire (real field list from the venue
-- team) and a draft Final Feedback Questionnaire in NSH-forms.

insert into nsh_forms (title, description, fields, show_responses) values (
  'Wedding Day Questionnaire',
  'We''re so excited to host your wedding at the North Star House! To help us prepare, we''re collecting important event details. Our team will review everything and connect with you if we need to coordinate on any specific details.',
  '[
    {"id": "nzic6lad", "type": "short_text", "label": "Email Address (so we can match this to your booking)", "required": true},
    {"id": "efbv357w", "type": "short_text", "label": "What time would you like to start outside-only setup? (Your rental start time marks the beginning of access to inside the estate.)", "required": false},
    {"id": "lgznkge3", "type": "long_text", "label": "Day-of Coordinator — Full Name, Phone Number, and Company Name", "required": true},
    {"id": "q39vtj2z", "type": "long_text", "label": "What is your itinerary for the day? (Include outdoor setup start time, indoor house access time, and overall flow of the day.)", "required": true},
    {"id": "pqv3xvhy", "type": "short_text", "label": "What is your estimated final guest count? (250 max)", "required": true},
    {"id": "sv64qk5f", "type": "yes_no", "label": "Are you planning on decorating inside the house? (If yes, we''ll stow away furniture so it doesn''t get in the way.)", "required": false},
    {"id": "9d4w1mtr", "type": "short_text", "label": "How many of our folding wedding chairs are you planning to use? (200 max)", "required": false},
    {"id": "u1dxrj93", "type": "short_text", "label": "How many of our 60\" round dining tables are you planning to use? (25 max)", "required": false},
    {"id": "0b8exqpj", "type": "short_text", "label": "How many 8'' rectangle tables are you planning on using? (3 max)", "required": false},
    {"id": "fqexadj0", "type": "short_text", "label": "How many 6'' rectangle tables are you planning on using? (2 max)", "required": false},
    {"id": "ct8rut5k", "type": "short_text", "label": "Catering Company — Business Name & Phone Number", "required": true},
    {"id": "x69x2wmp", "type": "short_text", "label": "DJ — Name, Phone Number & Company", "required": false},
    {"id": "1nlza3rt", "type": "short_text", "label": "Photographer — Name, Phone Number & Company", "required": false},
    {"id": "7xbg0y8j", "type": "short_text", "label": "Rental Company — Company Name & Phone Number", "required": false},
    {"id": "ebr3yi5m", "type": "long_text", "label": "List Any Other On-Site Vendors — Company Name, Phone Number & Social Media Handles (if applicable)", "required": true},
    {"id": "05wji2y0", "type": "short_text", "label": "Where onsite is your dining taking place? (Example: Courtyard, East Lawn)", "required": false},
    {"id": "w25d5otp", "type": "short_text", "label": "Where onsite is your ceremony taking place? (Example: Courtyard, West Lawn)", "required": false},
    {"id": "7xqk8pj0", "type": "checkboxes", "label": "Please let us know any additional areas you plan to utilize:", "options": ["Heritage Garden", "Terrace", "West Lawn", "Living Room", "Dining Room", "Library"], "required": false},
    {"id": "y7iss6kf", "type": "multiple_choice", "label": "Do we have your permission to share photos from your event? (We''ll always give credit to your photographer and tagged vendors.)", "options": ["Yes, we give permission", "No, we do not give permission"], "required": true},
    {"id": "2tywmjis", "type": "short_text", "label": "Who should we write your Security Deposit refund check to? (First and Last Name)", "required": true},
    {"id": "qwb19pxp", "type": "short_text", "label": "Where should we mail the Security Deposit refund check? (Street Address, City, State, Zip)", "required": true}
  ]'::jsonb,
  true
) returning id;

insert into nsh_forms (title, description, fields, show_responses) values (
  'North Star House — Final Feedback',
  'Thank you for celebrating with us! We''d love to hear how everything went.',
  '[
    {"id": "w2yhaoaf", "type": "short_text", "label": "Email Address (so we can match this to your booking)", "required": true},
    {"id": "s0rj9fus", "type": "rating", "label": "Overall, how would you rate your experience at North Star House?", "required": true},
    {"id": "e9f6qkhy", "type": "long_text", "label": "What went well?", "required": false},
    {"id": "g6x214rm", "type": "long_text", "label": "Is there anything we could improve for future couples?", "required": false}
  ]'::jsonb,
  true
) returning id;
