-- Tracks the 4 payments described in the venue's FAQ: retainer, two 50%
-- installments, and the refundable security deposit.
alter table venue_inquiries add column if not exists payment_retainer_paid boolean not null default false;
alter table venue_inquiries add column if not exists payment_installment_1_paid boolean not null default false;
alter table venue_inquiries add column if not exists payment_installment_2_paid boolean not null default false;
alter table venue_inquiries add column if not exists payment_deposit_paid boolean not null default false;
