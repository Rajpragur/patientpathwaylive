# AI Landing Pages - Doctor Profile Status

## Overview
This document tracks the status of doctor profile information (including avatar_url) being properly uploaded and fetched across all quiz types in the AI landing pages system.

## Quiz Types with Landing Pages

### 1. NOSE (Nasal Obstruction Symptom Evaluation)
- **File**: `src/pages/share/NOSELandingPage.tsx`
- **Status**: ✅ **COMPLETE**
- **Doctor Profile Storage**: 
  - Stored in `content.doctor_profile` field
  - Stored in dedicated `doctor_profile` column
  - Includes: id, name, credentials, locations, testimonials, website, avatar_url
- **Database Operations**: Insert and Update with full doctor profile data
- **URL Handling**: ✅ **FIXED** - Now checks both route params (`doctorId`) and query params (`doctor`)

### 2. SNOT22 (Comprehensive Sinus and Nasal Symptoms)
- **File**: `src/pages/share/SNOT22LandingPage.tsx`
- **Status**: ✅ **COMPLETE**
- **Doctor Profile Storage**: 
  - Stored in `content.doctor_profile` field
  - Stored in dedicated `doctor_profile` column
  - Includes: id, name, credentials, locations, testimonials, website, avatar_url
- **Database Operations**: Insert and Update with full doctor profile data
- **URL Handling**: ✅ **FIXED** - Now checks both route params (`doctorId`) and query params (`doctor`)

### 3. SNOT12 (Short-form Sinus and Nasal Symptoms)
- **File**: `src/pages/share/SNOT12LandingPage.tsx`
- **Status**: ✅ **COMPLETE**
- **Doctor Profile Storage**: 
  - Stored in `content.doctor_profile` field
  - Stored in dedicated `doctor_profile` column
  - Includes: id, name, credentials, locations, testimonials, website, avatar_url
- **Database Operations**: Insert and Update with full doctor profile data
- **URL Handling**: ✅ **FIXED** - Now checks both route params (`doctorId`) and query params (`doctor`)

### 4. TNSS (Total Nasal Symptom Score)
- **File**: `src/pages/share/TNSSLandingPage.tsx`
- **Status**: ✅ **COMPLETE**
- **Doctor Profile Storage**: 
  - Stored in `content.doctor_profile` field
  - Stored in dedicated `doctor_profile` column
  - Includes: id, name, credentials, locations, testimonials, website, avatar_url
- **Database Operations**: Insert and Update with full doctor profile data
- **URL Handling**: ✅ **FIXED** - Now checks both route params (`doctorId`) and query params (`doctor`)

## Database Schema

### Table: `ai_landing_pages`
```sql
- id: UUID (Primary Key)
- doctor_id: TEXT (NOT NULL)
- quiz_type: TEXT (NOT NULL)
- content: JSONB (Contains doctor_profile nested object)
- chatbot_colors: JSONB
- doctor_profile: JSONB (Dedicated column for doctor profile)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Doctor Profile Structure (Both in content and dedicated column)
```json
{
  "id": "doctor_id",
  "name": "Dr. Smith",
  "credentials": "MD",
  "locations": [
    {
      "city": "Main Office",
      "address": "Please contact for address",
      "phone": "Please contact for phone"
    }
  ],
  "testimonials": [],
  "website": "#",
  "avatar_url": "/path/to/avatar.jpg"
}
```

## Editor Pages Status

### NoseEditorPage
- **File**: `src/pages/NoseEditorPage.tsx`
- **Status**: ✅ **UPDATED**
- **Changes Made**: 
  - Now stores doctor profile in both content and dedicated column
  - Ensures avatar_url and all profile details are preserved
  - Consistent with landing page implementations

## URL Parameter Handling

### Issue Identified and Fixed
- **Problem**: Landing pages were only checking route parameters (`doctorId`) but URLs contained query parameters (`doctor`)
- **Impact**: Doctor profiles were falling back to demo data instead of loading actual doctor information
- **Solution**: Updated all landing page components to check both route params and query parameters
- **Priority**: Query parameter `doctor` takes precedence over route param `doctorId`

### URL Format Support
```
Route-based: /nose/196f77ac-461d-43b7-9dcc-ef643cbb75b7
Query-based: /nose?doctor=196f77ac-461d-43b7-9dcc-ef643cbb75b7
Combined: /nose/196f77ac-461d-43b7-9dcc-ef643cbb75b7?doctor=196f77ac-461d-43b7-9dcc-ef643cbb75b7
```

## Utility Functions

### `createDoctorProfileForLandingPage()`
- **File**: `src/lib/utils.ts`
- **Purpose**: Creates standardized doctor profile objects
- **Features**: 
  - Handles both `location` and `locations` properties for compatibility
  - Provides fallback values for missing fields
  - Ensures consistent structure across all quiz types

### `ensureContentWithDoctorProfile()`
- **File**: `src/lib/utils.ts`
- **Purpose**: Ensures content includes doctor profile information
- **Usage**: Used when saving AI landing page content

## Data Flow

1. **Landing Page Creation**: When a landing page is first created, it fetches doctor profile and stores it in both locations
2. **Content Updates**: When content is edited, doctor profile is preserved and updated
3. **Shared Links**: When landing pages are shared, they retrieve the stored doctor profile data
4. **Avatar Display**: All landing pages use `doctor?.avatar_url` with fallback to default image
5. **URL Handling**: Landing pages now properly extract doctor ID from both route and query parameters

## Verification Checklist

- [x] NOSE quiz type stores doctor profile with avatar_url
- [x] SNOT22 quiz type stores doctor profile with avatar_url  
- [x] SNOT12 quiz type stores doctor profile with avatar_url
- [x] TNSS quiz type stores doctor profile with avatar_url
- [x] All quiz types store profile in both content and dedicated column
- [x] Editor pages preserve doctor profile when updating content
- [x] Fallback avatar image is provided when avatar_url is missing
- [x] Database schema supports both storage methods
- [x] Utility functions ensure consistency across implementations
- [x] **URL parameter handling fixed for all landing pages**
- [x] **Doctor profiles now load correctly from shared links**

## Recent Fixes Applied

### URL Parameter Handling (Critical Fix)
- **Date**: Current session
- **Issue**: Landing pages were not loading doctor profiles from shared links
- **Root Cause**: URLs used query parameter `doctor` but code only checked route parameter `doctorId`
- **Solution**: Updated all 4 landing page components to check both parameter types
- **Result**: Doctor profiles now load correctly from shared links, ensuring avatar_url and all profile details are displayed

## Conclusion

All 4 quiz types (NOSE, SNOT22, SNOT12, TNSS) are now properly configured to:
1. **Upload** complete doctor profile information including avatar_url to the `ai_landing_pages` table
2. **Store** the profile in both the `content` JSONB field and the dedicated `doctor_profile` column
3. **Fetch** and display the profile information when landing pages are accessed
4. **Preserve** all profile details during content updates
5. **Handle** both route-based and query-based URL formats for proper doctor profile loading

The system is now fully consistent and ensures that all necessary doctor information, including the avatar_url, is properly maintained across all quiz types and landing page operations. The critical URL parameter handling fix ensures that shared links now work correctly and display the proper doctor profiles with avatars.
