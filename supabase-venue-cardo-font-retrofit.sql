-- Apply the Cardo-first heading font stack to the remaining placeholder
-- templates (initial_inquiry and toured_docs already have it from their
-- own content updates).
update venue_email_templates
set html_body = replace(html_body, $$Georgia,'Times New Roman',serif$$, $$'Cardo',Georgia,'Times New Roman',serif$$)
where key not in ('initial_inquiry', 'toured_docs');
