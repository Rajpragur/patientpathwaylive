# Doctor Access Control Setup

## Database Migration Required

Before using the access control features, you need to run the database migration:

```sql
-- Run this in your Supabase SQL Editor
ALTER TABLE doctor_profiles 
ADD COLUMN access_control BOOLEAN DEFAULT true;

-- Update existing doctors to have access by default
UPDATE doctor_profiles 
SET access_control = true 
WHERE access_control IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN doctor_profiles.access_control IS 'Controls whether doctor has access to the portal. true = has access, false = no access';

-- Create index for better performance on access control queries
CREATE INDEX idx_doctor_profiles_access_control ON doctor_profiles(access_control);
```

## How Access Control Works

### Admin Dashboard
1. **View Access Status**: All doctors show their current access status
2. **Revoke Access**: 
   - Click "Revoke Access" button
   - Warning dialog appears
   - Confirm → Doctor profile is **permanently deleted** from database
3. **Give Access**: 
   - Click "Give Access" button
   - Updates `access_control = true` in database

### Doctor Portal
1. **Login Check**: Every login checks `access_control` column
2. **Access Denied**: If `access_control = false` or profile doesn't exist → immediate logout
3. **Access Granted**: If `access_control = true` → normal portal access

## Testing the Feature

1. **Run the migration** (SQL above)
2. **Open Admin Dashboard**
3. **Click "Revoke Access"** on any doctor
4. **Confirm in warning dialog**
5. **Check console logs** for deletion confirmation
6. **Verify doctor is removed** from the doctors table
7. **Try logging in as that doctor** → should be denied access

## Debugging

The system includes extensive console logging:
- `Doctor access check:` - Shows access status for each doctor
- `Revoke access clicked for doctor:` - When revoke button is clicked
- `Deleting doctor profile:` - When deletion is confirmed
- `Doctor profile deleted successfully from database` - Confirmation of deletion

## Important Notes

- **Permanent Deletion**: Revoking access permanently deletes the doctor profile
- **No Recovery**: Deleted doctors cannot regain access without admin action
- **Immediate Effect**: Changes take effect immediately
- **Default Access**: New doctors get access by default
