-- Phase 8: VAT Summary — add MST (tax code) to profiles
alter table profiles
  add column if not exists mst text;
