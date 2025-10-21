# Laps (Time Records) Feature

## Overview
The Laps feature provides a comprehensive interface for viewing and managing RFID timing records (time_records table). This allows race organizers to monitor all timing detections, validate records, and analyze participant lap times.

## Files Created

### Frontend
- **`frontend/src/services/lapApi.ts`** - API service for lap/time record operations
- **`frontend/src/pages/Laps.tsx`** - Main laps management page with DataGrid
- **`frontend/src/pages/Laps.css`** - Styling for laps page

### Backend
- **`services/core-api/src/controllers/lapController.ts`** - HTTP request handlers for laps
- **`services/core-api/src/services/lapService.ts`** - Database operations using Prisma
- **`services/core-api/src/routes/laps.ts`** - RESTful API routes for laps

### Modified Files
- **`services/core-api/src/index.ts`** - Registered `/api/laps` routes

## Database Schema

The `time_records` table includes:

### Core Fields
- `id` - Unique identifier
- `eventId` - Foreign key to events table (required)
- `participantId` - Foreign key to participants table (optional)
- `tagId` - Foreign key to rfid_tags table (required)
- `checkpointId` - Foreign key to checkpoints table (required)
- `timestamp` - When the tag was detected (required)

### Detection Details
- `rawData` - Raw RFID data from reader
- `signalStrength` - Signal strength percentage
- `readerId` - Which RFID reader detected the tag

### Validation & Processing
- `isValid` - Whether the record is considered valid (default: true)
- `invalidReason` - Reason if marked invalid
- `processed` - Whether the record has been processed into results (default: false)
- `processedAt` - Timestamp when processed

## API Endpoints

All endpoints are prefixed with `/api/laps`

- `GET /` - Get all lap records
- `GET /:id` - Get single lap record by ID
- `GET /event/:eventId` - Get all laps for an event
- `GET /participant/:participantId` - Get all laps for a participant
- `GET /search?q=query` - Search lap records
- `POST /` - Create new lap record
- `PUT /:id` - Update lap record
- `DELETE /:id` - Delete lap record

## Features

### Laps Management Page

**DataGrid Table with columns:**
- Time - Formatted timestamp of detection
- Participant - Bib number and name (or "Unassigned")
- Event - Event name
- Checkpoint - Checkpoint/timing point name
- Tag ID - RFID tag identifier
- Reader - Which reader detected the tag
- Signal - Signal strength percentage
- Valid - Validity status with color-coded chip (Valid/Invalid)
- Processed - Processing status chip (Yes/No)
- Actions - Toggle validity and delete buttons

**Filtering & Search:**
- **Search Box** - Filter by:
  - Participant name or bib number
  - Event name
  - Checkpoint name
  - Tag ID
  
- **Validity Filter** - Dropdown to filter by:
  - All records
  - Valid only
  - Invalid only

- **Processing Status Filter** - Dropdown to filter by:
  - All records
  - Processed only
  - Unprocessed only

**Actions:**
- **Toggle Valid/Invalid** - Click the checkmark/X icon to mark a record as valid or invalid
- **Delete** - Remove a lap record (with confirmation)
- **Refresh** - Reload all lap records from the database

**Pagination:**
- Support for 10, 25, 50, or 100 rows per page
- Default sorting by timestamp (newest first)

## Use Cases

### 1. Monitor Real-Time Detections
- View all RFID tag detections as they come in during a race
- See which participants are crossing which checkpoints
- Monitor signal strength to identify potential reader issues

### 2. Validate Timing Data
- Review records and mark invalid detections (e.g., false reads)
- Add invalidation reasons for record-keeping
- Filter to see only valid times for results calculation

### 3. Troubleshoot Issues
- Identify unassigned tag detections (no participant linked)
- Check signal strength for weak reads
- Review raw data from readers
- Find which reader detected specific tags

### 4. Process Results
- See which records have been processed into official results
- Identify unprocessed records that need attention
- Track processing timestamps

## Technical Details

### Relations
The lap records connect to:
- **Events** - Which event the detection occurred in
- **Participants** - Which participant (if tag is assigned)
- **Checkpoints** - Which timing point detected the tag
- **RFID Tags** - The tag that was detected

### Data Flow
1. RFID reader detects a tag
2. Raw timing record created in `time_records` table
3. Record appears in Laps interface
4. Organizer can validate/invalidate
5. Processing service reads valid, unprocessed records
6. Records marked as processed after results calculation

### Empty String Handling
The backend automatically converts empty strings to null for optional fields:
- `participantId`
- `rawData`
- `readerId`
- `invalidReason`
- `processedAt`

## Future Enhancements

Potential additions to the Laps feature:

1. **Bulk Operations**
   - Mark multiple records as valid/invalid
   - Bulk delete
   - Bulk assign to participants

2. **Advanced Filtering**
   - Filter by date range
   - Filter by reader ID
   - Filter by signal strength threshold
   - Filter unassigned tags only

3. **Data Export**
   - Export lap data to CSV
   - Export for specific events or participants
   - Include all related data

4. **Live Updates**
   - WebSocket integration for real-time updates
   - Auto-refresh when new detections come in
   - Notification for new records

5. **Lap Analysis**
   - Calculate split times between checkpoints
   - Compare lap times
   - Identify anomalies (too fast/slow)
   - Visual timeline of detections

6. **Tag Assignment**
   - Directly assign unassigned tags to participants
   - Quick-assign interface
   - Batch assignment tools

## Setup Instructions

### Prerequisites
- Backend API running on port 3000
- Database with `time_records` table properly set up
- RFID readers configured and sending data

### Testing

1. **Access the Page**
   Navigate to http://localhost:3002/laps

2. **View Records**
   - All timing records will be displayed
   - Most recent records appear first

3. **Test Filtering**
   - Use search box to find specific participants
   - Toggle validity filter to see valid/invalid records
   - Toggle processing filter to see processed/unprocessed

4. **Test Actions**
   - Click the checkmark/X icon to toggle validity
   - Click delete icon to remove a record (with confirmation)
   - Click Refresh button to reload data

### API Testing

You can test the API directly:

```bash
# Get all laps
curl http://localhost:3000/api/laps

# Get laps for specific event
curl http://localhost:3000/api/laps/event/event-id-here

# Get laps for specific participant
curl http://localhost:3000/api/laps/participant/participant-id-here

# Search laps
curl http://localhost:3000/api/laps/search?q=john

# Toggle validity
curl -X PUT http://localhost:3000/api/laps/lap-id-here \
  -H "Content-Type: application/json" \
  -d '{"isValid": false, "invalidReason": "False read"}'
```

## Troubleshooting

### No Records Showing
- Check that database has records in `time_records` table
- Verify backend API is running and accessible
- Check browser console for API errors
- Confirm database relationships are set up correctly

### Can't Delete Records
- Check for foreign key constraints
- Verify user has proper permissions
- Check backend logs for errors

### Filters Not Working
- Clear filters and try again
- Refresh the page
- Check that search query is valid

---

**Created:** October 20, 2025

**Status:** ✅ Ready for use
