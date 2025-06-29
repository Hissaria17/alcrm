# Career Guidance Integration with Mentorship Sessions Table

## Overview
The career guidance system has been fully integrated with the `mentorship_sessions` table as requested. All career guidance services now use this unified table for data storage and management.

## Database Integration

### Table Structure
The `mentorship_sessions` table now includes all the fields from your provided schema:

```sql
CREATE TABLE public.mentorship_sessions (
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NULL,
  user_id uuid NULL,
  session_type text NOT NULL,
  status text NOT NULL,
  scheduled_at timestamp with time zone NULL,
  completed_at timestamp with time zone NULL,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  is_deleted boolean NULL DEFAULT false,
  session_duration_minutes integer NULL,
  session_rating integer NULL,
  session_feedback text NULL,
  mentor_notes text NULL,
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT mentorship_sessions_session_rating_check CHECK (session_rating >= 1 AND session_rating <= 5)
);
```

### Session Types Used
The system uses the following session types to categorize different career guidance services:

- **`MOCK_INTERVIEW`** - Mock interview sessions
- **`DOMAIN_COACHING`** - Domain-specific coaching sessions  
- **`BEHAVIORAL_PREP`** - Behavioral interview preparation
- **`PERSONAL_REFERENCE`** - Personal job reference requests
- **`career-guidance`** - General career guidance sessions
- **`resume-review`** - Resume review sessions
- **`industry-insights`** - Industry insights sessions
- **`skill-development`** - Skill development sessions

## Updated Components

### 1. API Layer (`src/lib/api/career-guidance.ts`)
- Updated `MentorshipSession` interface with new fields
- Added new methods:
  - `rateSession()` - Rate completed sessions
  - `updateSessionDuration()` - Update session duration and mentor notes
- Enhanced existing methods to include `updated_at` timestamp

### 2. Mentorship Card (`src/module/user/components/career-guidance/mentorship-card.tsx`)
- Simplified to a concise card design
- Links to dedicated mentorship page (`/dashboard/career-guidance/mentorship`)
- Removed complex booking forms from the card

### 3. Mentorship Page (`src/app/(user)/dashboard/career-guidance/mentorship/page.tsx`)
- **NEW FILE** - Comprehensive mentorship management
- Features:
  - Session type selection with pricing
  - Available mentors display
  - Session booking with mentor selection
  - My sessions tracking with status and ratings
  - Mentor registration functionality

### 4. Interview Prep Page (`src/app/(user)/dashboard/career-guidance/interview-prep/page.tsx`)
- Integrated with `mentorship_sessions` table
- Creates sessions with type `MOCK_INTERVIEW`, `DOMAIN_COACHING`, or `BEHAVIORAL_PREP`
- Uses system mentor ID: `system-interview-prep`
- Stores form data in session notes

### 5. Personal References Page (`src/app/(user)/dashboard/career-guidance/personal-references/page.tsx`)
- Integrated with `mentorship_sessions` table
- Creates sessions with type `PERSONAL_REFERENCE`
- Uses system mentor ID: `system-reference-coordinator`
- Stores organization and message data in session notes

### 6. Types (`src/types/supabase.ts`)
- Updated `mentorship_sessions` interface with all new fields
- Proper TypeScript typing for all operations

## System Mentors

The integration includes system mentors for automated services:

```sql
INSERT INTO public.career_mentors (mentor_id, user_id, domain, experience_years, bio, is_active, created_at)
VALUES 
    ('system-interview-prep', null, 'Interview Preparation', 10, 'System mentor for interview preparation services', true, now()),
    ('system-reference-coordinator', null, 'Reference Coordination', 10, 'System coordinator for personal job references', true, now());
```

## Data Flow

### 1. Mentorship Sessions
- User selects session type and mentor
- Creates record with specific mentor_id
- Tracks status: PENDING → SCHEDULED → COMPLETED
- Supports rating and feedback after completion

### 2. Interview Preparation
- User fills form with domain, experience, target role
- Creates session with `system-interview-prep` mentor
- Form data stored in `notes` field
- Session type indicates specific prep type

### 3. Personal References
- User selects organization and writes message
- Creates session with `system-reference-coordinator` mentor
- Organization and message stored in `notes` field
- Session type is `PERSONAL_REFERENCE`

## Usage Tracking

Each service maintains usage limits:
- **Interview Prep**: 3 sessions per user
- **Personal References**: 3 requests per user
- **Mentorship**: No specific limit (flexible)

Filtering logic:
```typescript
// Interview sessions
const interviewSessions = sessions.filter(session => 
  session.session_type.includes('INTERVIEW') || 
  session.session_type.includes('COACHING') || 
  session.session_type.includes('BEHAVIORAL')
);

// Reference sessions  
const referenceSessions = sessions.filter(session => 
  session.session_type.toLowerCase().includes('reference') ||
  session.session_type === 'PERSONAL_REFERENCE'
);
```

## Status Management

All services use consistent status values:
- **`PENDING`** - Initial state when created
- **`SCHEDULED`** - Session has been scheduled
- **`COMPLETED`** - Session finished successfully
- **`CANCELLED`** - Session was cancelled

## Features Implemented

### Session Rating & Feedback
- Users can rate sessions 1-5 stars after completion
- Feedback text for detailed comments
- Only available for completed sessions

### Mentor Notes
- Private notes field for mentors
- Duration tracking for actual session length
- Admin/mentor interface can update these fields

### Performance Indexes
- Optimized queries with indexes on:
  - `session_type` - for filtering by service type
  - `scheduled_at` - for chronological ordering
  - `updated_at` - for recent activity tracking

## Admin Benefits

With this integration, administrators can:

1. **Unified Dashboard**: View all career guidance activities in one table
2. **Analytics**: Track usage patterns across all services
3. **Quality Control**: Monitor session ratings and feedback
4. **Resource Management**: Assign real mentors to system sessions
5. **Reporting**: Generate comprehensive reports on career guidance effectiveness

## Next Steps

To complete the setup:

1. **Run the SQL**: Execute `src/docs/mentorship-sessions-simple-update.sql` in your Supabase SQL editor
2. **Test Integration**: Verify all career guidance services create sessions correctly
3. **Admin Interface**: Consider building admin tools to manage and assign sessions
4. **Notifications**: Add email/SMS notifications for session updates
5. **Analytics**: Build dashboards to track service effectiveness

## File Structure

```
src/
├── lib/api/career-guidance.ts              # Enhanced API with new methods
├── app/(user)/dashboard/career-guidance/
│   ├── mentorship/page.tsx                 # NEW: Comprehensive mentorship page
│   ├── interview-prep/page.tsx             # Updated: Integrated with sessions table
│   └── personal-references/page.tsx        # Updated: Integrated with sessions table
├── module/user/components/career-guidance/
│   ├── mentorship-card.tsx                 # Updated: Simplified design
│   ├── personal-reference-card.tsx         # Updated: Links to detailed page
│   └── mentor-registration-dialog.tsx      # Existing: Works with career_mentors
├── types/supabase.ts                       # Updated: New fields added
└── docs/
    ├── mentorship-sessions-simple-update.sql  # SQL to run
    └── career-guidance-integration-summary.md # This file
```

This integration provides a robust, scalable foundation for all career guidance services while maintaining clean separation of concerns and efficient data management. 