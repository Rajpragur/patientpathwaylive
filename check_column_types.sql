-- Check the actual column types to understand the data structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('doctor_profiles', 'team_members')
AND column_name IN ('id', 'doctor_id', 'user_id', 'doctor_id_clinic')
ORDER BY table_name, column_name;
