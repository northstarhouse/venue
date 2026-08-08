-- Lets staff tag a batch of availability slots as one weekly recurring
-- series, so the whole series can be removed together later.
alter table venue_tour_availability add column if not exists recurrence_id uuid;
