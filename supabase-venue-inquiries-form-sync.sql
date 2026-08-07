-- Auto-creates a venue_inquiries row whenever someone submits the NSH-forms
-- "Event Inquiry Form" (id a87b86b0-94cd-4d28-b57e-00b79b5f1fee). Field ids
-- below come from that form's current `fields` definition — if the form is
-- rebuilt with new fields, update the ->>'...' keys to match.

alter table venue_inquiries add column if not exists source text not null default 'manual';
alter table venue_inquiries add column if not exists form_response_id uuid references nsh_form_responses(id);

create or replace function sync_venue_inquiry_from_form_response()
returns trigger as $$
begin
  if new.form_id = 'a87b86b0-94cd-4d28-b57e-00b79b5f1fee'::uuid then
    begin
      insert into venue_inquiries (name, email, phone, event_type, event_date, guest_count, message, status, source, form_response_id)
      values (
        new.answers->>'09djtu7v',
        new.answers->>'36rqaozk',
        new.answers->>'0hnxurnd',
        new.answers->>'99rfo9uf',
        nullif(new.answers->>'ugavm4wi', '')::date,
        nullif(regexp_replace(coalesce(new.answers->>'nnh608sc', ''), '[^0-9]', '', 'g'), '')::int,
        new.answers->>'2azigjzh',
        'New',
        'website',
        new.id
      );
    exception when others then
      raise warning 'sync_venue_inquiry_from_form_response failed: %', sqlerrm;
    end;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_venue_inquiry on nsh_form_responses;
create trigger trg_sync_venue_inquiry
  after insert on nsh_form_responses
  for each row execute function sync_venue_inquiry_from_form_response();
