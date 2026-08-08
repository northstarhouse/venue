-- Questionnaires & Final Prep: new columns, form-response sync triggers,
-- and the insurance-certificate storage bucket.

-- ── New columns on venue_inquiries ─────────────────────────────────────────
alter table venue_inquiries add column if not exists questionnaire_sent_at timestamptz;
alter table venue_inquiries add column if not exists questionnaire_form_response_id uuid references nsh_form_responses(id);
alter table venue_inquiries add column if not exists questionnaire_answers jsonb;
alter table venue_inquiries add column if not exists insurance_uploaded_at timestamptz;
alter table venue_inquiries add column if not exists insurance_file_path text;
alter table venue_inquiries add column if not exists completed_at timestamptz;
alter table venue_inquiries add column if not exists feedback_sent_at timestamptz;
alter table venue_inquiries add column if not exists feedback_form_response_id uuid references nsh_form_responses(id);

-- ── Sync trigger: Wedding Day Questionnaire submission -> venue_inquiries ──
-- Stores answers generically (raw jsonb) so the printable Site Manager Form
-- can render them dynamically via nsh_forms.fields, without hardcoding
-- field ids here — resilient to the form being edited later.
create or replace function sync_venue_questionnaire_from_form_response()
returns trigger as $$
declare
  v_email text;
  v_inquiry_id bigint;
begin
  if new.form_id <> 'e9be06b9-6788-41bc-a78a-28e02b8b749a'::uuid then
    return new;
  end if;

  begin
    v_email := new.answers->>'nzic6lad';

    select id into v_inquiry_id
    from venue_inquiries
    where email = v_email
    order by created_at desc
    limit 1;

    if v_inquiry_id is not null then
      update venue_inquiries set
        questionnaire_answers = new.answers,
        questionnaire_form_response_id = new.id,
        status = 'Questionnaire Completed'
      where id = v_inquiry_id;
    end if;
  exception when others then
    raise warning 'sync_venue_questionnaire_from_form_response failed: %', sqlerrm;
  end;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_venue_questionnaire on nsh_form_responses;
create trigger trg_sync_venue_questionnaire
  after insert on nsh_form_responses
  for each row execute function sync_venue_questionnaire_from_form_response();

-- ── Sync trigger: Final Feedback submission -> venue_inquiries ────────────
create or replace function sync_venue_feedback_from_form_response()
returns trigger as $$
declare
  v_email text;
  v_inquiry_id bigint;
begin
  if new.form_id <> '5ebe4961-d50e-47f1-9071-e81c2ada6233'::uuid then
    return new;
  end if;

  begin
    v_email := new.answers->>'w2yhaoaf';

    select id into v_inquiry_id
    from venue_inquiries
    where email = v_email
    order by created_at desc
    limit 1;

    if v_inquiry_id is not null then
      update venue_inquiries set
        feedback_form_response_id = new.id,
        status = 'Feedback Received'
      where id = v_inquiry_id;
    end if;
  exception when others then
    raise warning 'sync_venue_feedback_from_form_response failed: %', sqlerrm;
  end;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_venue_feedback on nsh_form_responses;
create trigger trg_sync_venue_feedback
  after insert on nsh_form_responses
  for each row execute function sync_venue_feedback_from_form_response();

-- ── Insurance certificate storage bucket (private) ─────────────────────────
insert into storage.buckets (id, name, public)
values ('venue-insurance', 'venue-insurance', false)
on conflict (id) do nothing;

-- Anyone can upload (the public upload page has no login), nobody can list/
-- read directly via the client — staff retrieve files via a signed URL
-- generated server-side (service role) instead.
drop policy if exists "venue_insurance_insert" on storage.objects;
create policy "venue_insurance_insert" on storage.objects
  for insert with check (bucket_id = 'venue-insurance');
