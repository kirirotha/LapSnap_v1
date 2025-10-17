# Athletes Management Feature - Setup Instructions

## What We've Built

### Frontend Components
✅ **Athletes Page** (`frontend/src/pages/Athletes.tsx`)
   - Data Grid table with MUI DataGrid
   - Search functionality
   - Add, Edit, Delete buttons
   - Snackbar notifications
   - Responsive design

✅ **Athlete Modal** (`frontend/src/components/AthleteModal.tsx`)
   - Multi-tab form (4 tabs):
     - Basic Info (name, email, phone, DOB, gender)
     - Contact & Location (address, team info)
     - Emergency & Medical (emergency contacts, medical info)
     - Additional (privacy settings, notes)
   - Form validation
   - Create and Edit modes

✅ **Athlete API Service** (`frontend/src/services/athleteApi.ts`)
   - TypeScript interfaces for Athlete data
   - CRUD operations (Create, Read, Update, Delete)
   - Search functionality

✅ **Styling** (`frontend/src/pages/Athletes.css`)
   - Clean, professional layout
   - Responsive design
   - Custom DataGrid styling

### Backend API
✅ **Athlete Controller** (`services/core-api/src/controllers/athleteController.ts`)
   - GET /api/athletes - Get all athletes
   - GET /api/athletes/:id - Get athlete by ID
   - POST /api/athletes - Create athlete
   - PATCH /api/athletes/:id - Update athlete
   - DELETE /api/athletes/:id - Delete athlete
   - GET /api/athletes/search?q=query - Search athletes

✅ **Athlete Service** (`services/core-api/src/services/athleteService.ts`)
   - Database operations using Prisma
   - Includes relationships (tags, participants)
   - Search with fuzzy matching

✅ **Routes** (`services/core-api/src/routes/athletes.ts`)
   - RESTful API routes
   - Registered in main index.ts

### Database
✅ **Athlete Table** - Already created in PostgreSQL with all fields

## Setup Steps

### 1. Fix Prisma Client Generation Issue

The Prisma client needs to be regenerated, but there's a file lock. Try these steps:

**Option A: Close VS Code and Regenerate**
```powershell
# Close VS Code completely
# Then in a fresh PowerShell:
cd c:\devProjects\playground22\LapSnap_v1\services\core-api
npx prisma generate
```

**Option B: Restart Computer** (if Option A doesn't work)
Sometimes Windows locks the DLL file. A restart will clear it.

### 2. Install Frontend Dependencies (if needed)
```powershell
cd c:\devProjects\playground22\LapSnap_v1\frontend
npm install
```

### 3. Start the Backend API
```powershell
cd c:\devProjects\playground22\LapSnap_v1\services\core-api
npm run dev
```

### 4. Start the Frontend
```powershell
cd c:\devProjects\playground22\LapSnap_v1\frontend
npm start
```

### 5. Test the Feature

1. Navigate to http://localhost:3000/athletes
2. Click "Add Athlete" button
3. Fill in the form (at minimum: First Name, Last Name)
4. Click "Create"
5. Your athlete should appear in the table
6. Try Edit and Delete buttons

## API Endpoints

All endpoints are prefixed with `/api/athletes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all athletes |
| GET | `/:id` | Get athlete by ID |
| POST | `/` | Create new athlete |
| PATCH | `/:id` | Update athlete |
| DELETE | `/:id` | Delete athlete |
| GET | `/search?q=query` | Search athletes |

## Features Implemented

### Table Features
- ✅ Sortable columns
- ✅ Pagination (10, 25, 50, 100 per page)
- ✅ Row selection with checkboxes
- ✅ Search/filter
- ✅ Responsive design
- ✅ Action buttons (Edit, Delete)
- ✅ Status chips (Active/Inactive)

### Modal Features
- ✅ Tabbed interface for better organization
- ✅ All athlete fields from database
- ✅ Form validation
- ✅ Date picker for DOB
- ✅ Dropdown selects for gender, privacy level
- ✅ Multi-line text fields for medical info, notes
- ✅ Create and Edit modes
- ✅ Cancel and Save buttons

### Data Management
- ✅ Create athletes
- ✅ Edit existing athletes
- ✅ Delete athletes (with confirmation)
- ✅ Search athletes by name, email, phone
- ✅ Success/error notifications

## Database Schema

The Athletes table includes:
- Personal info (name, email, phone, DOB, gender)
- Location (city, state, country, nationality)
- Emergency contacts
- Medical information (blood type, conditions, medications, allergies)
- Profile data (photo, team, club, sponsors)
- Account settings (privacy, marketing opt-in)
- RFID tag management
- Timestamps and metadata

## Troubleshooting

### Prisma Client Errors
If you see "Property 'athlete' does not exist":
1. Close ALL VS Code windows
2. Run `npx prisma generate` in core-api directory
3. Restart VS Code

### Backend Won't Start
- Make sure database is running: `docker ps`
- Check DATABASE_URL in `.env` file
- Run `npx prisma db push` to ensure schema is synced

### Frontend Can't Connect to API
- Check backend is running on port 3000
- Verify CORS settings in `services/core-api/src/index.ts`
- Check browser console for errors

## Next Steps

After testing the Athletes feature, you can:

1. **Add more features:**
   - Bulk import athletes from CSV
   - Export athlete data
   - Athlete statistics dashboard
   - Photo upload for profile pictures

2. **Link to other features:**
   - Assign athletes to events (via Participants)
   - Assign RFID tags to athletes
   - View athlete race history

3. **Enhance UI:**
   - Advanced filters (by team, location, etc.)
   - Athlete detail view page
   - Performance charts/graphs

## Files Created/Modified

### Frontend
- `frontend/src/pages/Athletes.tsx` - Main page component
- `frontend/src/pages/Athletes.css` - Styling
- `frontend/src/components/AthleteModal.tsx` - Add/Edit modal
- `frontend/src/services/athleteApi.ts` - API service

### Backend
- `services/core-api/src/controllers/athleteController.ts` - Controller
- `services/core-api/src/services/athleteService.ts` - Service layer
- `services/core-api/src/routes/athletes.ts` - Routes
- `services/core-api/src/index.ts` - Registered routes

### Database
- Athletes table already exists from previous schema migration

---

**Last Updated:** October 16, 2025

**Status:** Ready for testing once Prisma Client is regenerated
