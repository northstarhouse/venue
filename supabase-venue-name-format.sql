-- Changes the auto-generated project name to "Last First + Last First Wedding"
-- instead of "First Last + First Last Wedding". Splits each full name on the
-- first space: everything after the first space is treated as the last name.

create or replace function reorder_last_first(full_name text)
returns text as $$
declare
  space_pos int;
begin
  if full_name is null or trim(full_name) = '' then
    return '';
  end if;
  full_name := trim(full_name);
  space_pos := position(' ' in full_name);
  if space_pos = 0 then
    return full_name;
  end if;
  return trim(substring(full_name from space_pos + 1)) || ' ' || trim(substring(full_name from 1 for space_pos - 1));
end;
$$ language plpgsql immutable;

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
        name = trim(both ' ' from reorder_last_first(v_primary_name) || ' + ' || reorder_last_first(v_partner_name) || ' Wedding'),
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
