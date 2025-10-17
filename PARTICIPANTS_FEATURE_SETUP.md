# Participants Feature Setup

## Overview
The Participants feature manages event registrations, allowing you to track who has signed up for each event, their bib numbers, payment status, and more.

## Files Created

### Frontend
- **`frontend/src/services/participantApi.ts`** - API service for participant CRUD operations
- **`frontend/src/pages/Participants.tsx`** - Main participants management page with DataGrid
- **`frontend/src/pages/Participants.css`** - Styling for participants page
- **`frontend/src/components/ParticipantModal.tsx`** - 4-tab modal form for creating/editing participants

### Backend
- **`services/core-api/src/controllers/participantController.ts`** - HTTP request handlers
- **`services/core-api/src/services/participantService.ts`** - Database operations using Prisma
- **`services/core-api/src/routes/participants.ts`** - RESTful API routes

### Modified Files
- **`frontend/src/App.tsx`** - Added `/participants` route
- **`frontend/src/components/Layout/Layout.tsx`** - Added "Participants" navigation link

## Database Schema

The `participants` table includes:

### Core Fields
- `id` - Unique identifier
- `eventId` - Foreign key to events table
- `athleteId` - Optional foreign key to athletes table
- `bibNumber` - Required, unique per event
- `firstName` / `lastName` - Participant name
- `email` / `phone` - Contact information

### Registration Details
- `dateOfBirth` - Date of birth
- `gender` - MALE | FEMALE | NON_BINARY | PREFER_NOT_TO_SAY
- `category` - Age group or division
- `team` - Team name

### Event-Specific
- `shirtSize` - T-shirt size selection
- `startWave` - Wave assignment
- `seedTime` - Expected finish time in seconds

### Status Tracking
- `paymentStatus` - PENDING | PAID | REFUNDED | COMP
- `status` - REGISTERED | CHECKED_IN | STARTED | FINISHED | DNF | DNS | DQ
- `waiver` - NOT_SIGNED | SIGNED_DIGITAL | SIGNED_PAPER
- `waiverSignedAt` - Timestamp when waiver was signed

### Emergency & Additional
- `emergencyContact` - Emergency contact name
- `emergencyPhone` - Emergency contact phone
- `specialRequests` - Any special requirements
- `registrationSource` - Where registration came from (e.g., website, in-person)

## API Endpoints

All endpoints are prefixed with `/api/participants`

- `GET /` - Get all participants
- `GET /:id` - Get single participant by ID
- `GET /event/:eventId` - Get all participants for an event
- `GET /search?q=query` - Search participants
- `POST /` - Create new participant
- `PUT /:id` - Update participant
- `DELETE /:id` - Delete participant

## Features

### Participant Management Page
- **DataGrid Table** with columns:
  - Bib Number
  - Name (first + last)
  - Event Name
  - Email
  - Phone
  - Category
  - Payment Status (with color-coded chips)
  - Status (with color-coded chips)
  - Actions (Edit/Delete)

- **Search** - Filter participants by name, email, phone, bib number, or event
- **Add/Edit Modal** - 4-tab form for complete participant data entry
- **Delete** - Remove participants with confirmation
- **Pagination** - Support for 10, 25, 50, or 100 rows per page

### Modal Tabs

1. **Basic Info**
   - Event ID & Athlete ID
   - First & Last Name
   - Bib Number & Gender
   - Date of Birth & Category
   - Team

2. **Contact & Emergency**
   - Email & Phone
   - Emergency Contact Name
   - Emergency Contact Phone

3. **Event Details**
   - Payment Status
   - Waiver Status
   - Registration Status
   - Wave Assignment
   - Seed Time
   - Shirt Size

4. **Additional**
   - Special Requests
   - Registration Source

## Usage

### Access the Page
Navigate to "Participants" in the main navigation menu or go to `/participants`

### Add a Participant
1. Click "Add Participant" button
2. Fill in required fields (Event ID, Bib Number, First Name, Last Name)
3. Navigate through tabs to add additional information
4. Click "Create"

### Edit a Participant
1. Click the edit icon (pencil) in the Actions column
2. Modify fields as needed
3. Click "Update"

### Delete a Participant
1. Click the delete icon (trash) in the Actions column
2. Confirm deletion in the dialog

### Search Participants
Use the search box to filter by:
- Name (first or last)
- Email address
- Phone number
- Bib number
- Event name

## Technical Notes

### TypeScript Errors
If you see import errors for `ParticipantModal` or `participantService`, these are likely TypeScript caching issues. To resolve:
1. Restart the TypeScript server in VS Code
2. Or restart the development servers

### Unique Constraints
- Bib numbers must be unique within each event
- The backend validates this and will return an error if you try to create a duplicate

### Relations
- Participants can optionally be linked to an athlete record (for recurring participants)
- Participants are linked to an event (required)
- Deleting an event will cascade delete all its participants

### Payment Status Colors
- **PAID** - Green
- **PENDING** - Orange/Warning
- **COMP** - Blue/Info
- **REFUNDED** - Default/Gray

### Registration Status Colors
- **FINISHED** - Green
- **STARTED** - Blue/Primary
- **CHECKED_IN** - Blue/Info
- **REGISTERED** - Default/Gray
- **DNF/DNS/DQ** - Red/Error

## Next Steps

To start using the Participants feature:

1. Make sure the database is running:
   ```powershell
   docker-compose up -d
   ```

2. Start the backend API:
   ```powershell
   cd services/core-api
   npm run dev
   ```

3. Start the frontend:
   ```powershell
   cd frontend
   npm start
   ```

4. Navigate to http://localhost:3002/participants

## Testing

You can test the API directly using curl or Postman:

```bash
# Get all participants
curl http://localhost:3000/api/participants

# Create a participant
curl -X POST http://localhost:3000/api/participants \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-id-here",
    "bibNumber": "101",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "gender": "MALE",
    "paymentStatus": "PAID",
    "status": "REGISTERED"
  }'
```

## Known Issues

None currently. If you encounter issues:
1. Check the browser console for frontend errors
2. Check the backend terminal for API errors
3. Verify the database is running with `docker ps`
