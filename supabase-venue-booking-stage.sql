-- Booking stage: pre-booking form submission -> auto-populated inquiry,
-- coordinator review, "Reviewed - Send Proposal" action.

-- ── New columns on venue_inquiries ─────────────────────────────────────────
alter table venue_inquiries add column if not exists partner_name text;
alter table venue_inquiries add column if not exists additional_contacts text;
alter table venue_inquiries add column if not exists prebooking_form_response_id uuid references nsh_form_responses(id);
alter table venue_inquiries add column if not exists proposal_sent_at timestamptz;

-- ── Add "Partner's Full Name" field to the Pre Booking Information Form ───
-- Inserted right after "Primary Signer - Full Name" (position 1).
update nsh_forms
set fields = jsonb_insert(
  fields,
  '{1}',
  '{"id": "7leui2ic", "type": "short_text", "label": "Partner''s Full Name", "required": true}'::jsonb
)
where id = 'a3a383f7-e1db-4344-9dec-ea879ad3406d'
  and not exists (
    select 1 from jsonb_array_elements(fields) e where e->>'id' = '7leui2ic'
  );

-- ── Sync trigger: Pre-Booking form submission -> venue_inquiries ──────────
create or replace function sync_venue_booking_from_form_response()
returns trigger as $$
declare
  v_primary_name text;
  v_partner_name text;
  v_email text;
  v_phone text;
  v_additional text;
  v_event_date text;
  v_inquiry_id bigint;
begin
  if new.form_id <> 'a3a383f7-e1db-4344-9dec-ea879ad3406d'::uuid then
    return new;
  end if;

  begin
    v_primary_name := new.answers->>'7fnabd0i';
    v_partner_name := new.answers->>'7leui2ic';
    v_email        := new.answers->>'c9u1sxb4';
    v_phone        := new.answers->>'163otrai';
    v_additional   := new.answers->>'cm4d7gip';
    v_event_date   := new.answers->>'sn9urgfr';

    select id into v_inquiry_id
    from venue_inquiries
    where email = v_email
    order by created_at desc
    limit 1;

    if v_inquiry_id is not null then
      update venue_inquiries set
        name = trim(both ' ' from coalesce(v_primary_name, '') || ' + ' || coalesce(v_partner_name, '') || ' Wedding'),
        partner_name = v_partner_name,
        phone = coalesce(v_phone, phone),
        additional_contacts = v_additional,
        event_date = nullif(v_event_date, '')::date,
        status = 'Booking',
        prebooking_form_response_id = new.id
      where id = v_inquiry_id;
    end if;
  exception when others then
    raise warning 'sync_venue_booking_from_form_response failed: %', sqlerrm;
  end;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_venue_booking on nsh_form_responses;
create trigger trg_sync_venue_booking
  after insert on nsh_form_responses
  for each row execute function sync_venue_booking_from_form_response();

-- ── Placeholder proposal/contract/invoice email template ───────────────────
insert into venue_email_templates (key, subject, body, html_body) values (
  'proposal_sent',
  '[PLACEHOLDER SUBJECT] Your North Star House proposal is ready, {{name}}!',
  '[PLACEHOLDER COPY]

Hi {{name}},

Thank you for confirming your details! Attached you will find your proposal, contract, and invoice.

If you have any questions, just reply to this email.

The North Star House Venue Team',
  '<h1 style="margin:0 0 16px;font-family:''Cardo'',Georgia,''Times New Roman'',serif;font-size:22px;color:#2a2a2a;">Your proposal is ready!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#444;">Hi {{name}},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#444;">[PLACEHOLDER COPY — replace with real proposal/contract/invoice delivery text]</p>'
)
on conflict (key) do nothing;
