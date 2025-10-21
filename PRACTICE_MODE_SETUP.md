# Practice Mode Feature - Setup Instructions

## Overview

Practice Mode allows you to run real-time lap timing sessions with automatic lap detection using RFID tags. When a tag is scanned for the first time, a lap starts. When the same tag is scanned again, the lap completes and the time is recorded.

## What We've Built

### Backend Components

✅ **Practice Session Service** (`services/core-api/src/services/practiceSessionService.ts`)
   - Manages practice sessions
   - Creates automatic "Practice - [Date]" events
   - Creates default checkpoints
   - Tracks active session in memory

✅ **Practice Lap Service** (`services/core-api/src/services/practiceLapService.ts`)
   - Processes RFID tag reads
   - Starts laps on first scan
   - Completes laps on second scan
   - Validates lap times against minimum threshold
   - Tracks active laps in memory
   - Stores all lap data in `time_records` table

✅ **Practice Controller** (`services/core-api/src/controllers/practiceController.ts`)
   - Handles API requests for sessions and laps
   - Provides session statistics

✅ **Practice Routes** (`services/core-api/src/routes/practice.ts`)
   - RESTful API endpoints
   - Registered in main index.ts

✅ **Socket.IO Integration** (in `services/core-api/src/index.ts`)
   - Real-time tag read processing
   - Emits `practice:lapUpdate` events
   - Integrated with RFID Manager

### Frontend Components

✅ **Practice API Service** (`frontend/src/services/practiceApi.ts`)
   - TypeScript interfaces for Practice data
   - CRUD operations for sessions and laps
   - Statistics retrieval

✅ **Practice Settings Modal** (`frontend/src/components/PracticeSettingsModal.tsx`)
   - Configure minimum lap time (in seconds)
   - Enable/disable antennas (1-4)
   - Set power level for each antenna (1-200 index, displayed as dBm)
   - Visual feedback for active antennas

✅ **Practice Mode Page** (`frontend/src/pages/PracticeMode.tsx`)
   - Start/Stop practice session buttons
   - Settings button (disabled while scanning)
   - Active Laps table (live countdown of elapsed time)
   - Completed Laps table (last 50 valid laps)
   - Real-time Socket.IO updates
   - Toast notifications for lap events

✅ **Styling** (`frontend/src/pages/PracticeMode.css`)
   - Clean, professional layout
   - Responsive design
   - Custom DataGrid styling

## How It Works

### 1. Start Practice Session
1. Click "Start Practice" button
2. Configure settings:
   - Set minimum lap time (e.g., 5 seconds)
   - Choose which antennas to activate
   - Set power level for each antenna
3. Click "Start Practice"
4. Backend creates a new event: "Practice - [Date & Time]"
5. Backend creates a default checkpoint
6. Frontend starts RFID scanner with configured antennas

### 2. Tag Read Processing
1. RFID reader detects a tag
2. `rfidManager` emits `tagRead` event
3. Practice mode listener in `index.ts` processes the tag:
   - **Debouncing**: Ignores duplicate reads within 2 seconds
   - Checks if practice session is active
   - Calls `practiceLapService.processTagRead()`
4. Service logic:
   - **First scan**: Creates start record in `time_records`, adds to active laps
   - **Second scan**: Creates end record, calculates lap time, validates against min time
5. Result emitted via Socket.IO as `practice:lapUpdate`
6. Frontend updates UI in real-time:
   - Add to Active Laps table (first scan)
   - Move to Completed Laps table (second scan, if valid)
   - Show toast notification

### 3. Stop Practice Session
1. Click "Stop Practice" button
2. Frontend stops RFID scanner
3. Backend marks event as COMPLETED
4. Clears active laps from memory
5. UI resets to initial state

## Database Schema

Practice mode uses existing tables:

### Events Table
```sql
- id: UUID (auto-generated)
- name: "Practice - [Date & Time]"
- eventType: "OTHER"
- status: "IN_PROGRESS" → "COMPLETED"
- startTime: Session start timestamp
- endTime: Session end timestamp
- organizerId: System user ID
```

### Checkpoints Table
```sql
- id: UUID (auto-generated)
- eventId: Links to event
- name: "Practice Lap"
- order: 1
- isStart: true
- isFinish: true
```

### Time Records Table (Lap Data)
```sql
- id: UUID
- eventId: Links to practice event
- tagId: RFID tag ID
- checkpointId: Links to practice checkpoint
- timestamp: Tag read timestamp
- rawData: JSON with metadata (lap_start/lap_end, lapTime, etc.)
- readerId: "antenna_X"
- isValid: true/false (based on min lap time)
- invalidReason: Explanation if invalid
- processed: true when lap completes
- processedAt: Completion timestamp
```

## API Endpoints

All endpoints are prefixed with `/api/practice`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/session/start` | Start new practice session |
| POST | `/session/stop` | Stop current session |
| GET | `/session/active` | Get active session with stats |
| PATCH | `/session/settings` | Update session settings |
| GET | `/laps/active` | Get laps in progress |
| GET | `/laps/completed?limit=50` | Get completed laps |
| GET | `/stats` | Get session statistics |
| GET | `/history` | Get past practice sessions |

## Socket.IO Events

### Emitted by Backend
- `practice:lapUpdate` - Lap started or completed
  ```typescript
  {
    type: 'lap_started' | 'lap_completed',
    lap: {
      id, tagEpc, timestamp, lapTime, isValid, athlete, ...
    }
  }
  ```

### Consumed by Frontend
- Frontend listens to `practice:lapUpdate`
- Updates Active Laps or Completed Laps tables
- Shows toast notifications

## Setup Steps

### 1. Install Dependencies (if needed)

Backend should already have all dependencies. If not:
```powershell
cd services\core-api
npm install uuid
```

Frontend should have Socket.IO client:
```powershell
cd frontend
npm install socket.io-client
```

### 2. Start the Backend API
```powershell
cd services\core-api
npm run dev
```

Backend should log:
```
Practice mode RFID listener initialized
API routes registered: [..., /api/practice]
```

### 3. Start the Frontend
```powershell
cd frontend
npm start
```

### 4. Test the Feature

1. Navigate to http://localhost:3000/practice-mode
2. Click "Start Practice" button
3. Configure settings:
   - Min lap time: 5 seconds
   - Antennas: 1 & 2 active
   - Power: 150 (15.0 dBm)
4. Click "Start Practice"
5. Use Test Scan page to simulate tag reads OR use physical RFID reader
6. First scan → Tag appears in Active Laps with live countdown
7. Second scan → Lap moves to Completed Laps with final time
8. Click "Stop Practice" when done

## Testing Without Hardware

You can test without an RFID reader:

1. Start Practice Mode
2. In another tab, open Test Scan (`/scan-test`)
3. Click "Start Scanning" with mock mode
4. Mock tags will be read automatically
5. Watch laps appear in Practice Mode

## Features Implemented

### Session Management
- ✅ Start/stop practice sessions
- ✅ Auto-generate event names with timestamp
- ✅ Configure minimum lap time
- ✅ Configure antenna power and selection
- ✅ Session statistics (active, completed, invalid laps)

### Lap Tracking
- ✅ Automatic lap start on first tag read
- ✅ Automatic lap completion on second read
- ✅ **Debouncing** to prevent duplicate laps from multiple RFID reads (2s cooldown)
- ✅ Lap time validation (discard if too fast)
- ✅ Real-time elapsed time display
- ✅ Association with athletes (if tag is assigned)

### User Interface
- ✅ Live active laps table with countdown
- ✅ Completed laps history
- ✅ Toast notifications for lap events
- ✅ Settings modal with antenna configuration
- ✅ Power level slider (1-200 index → dBm)
- ✅ Responsive design

### Data Persistence
- ✅ All laps stored in `time_records` table
- ✅ Practice events stored in `events` table
- ✅ Can query historical practice sessions
- ✅ Can analyze lap times later

## Advanced Features

### Future Enhancements

1. **Lap Analytics**
   - Fastest/slowest lap display
   - Average lap time
   - Lap time chart/graph

2. **Athlete Leaderboard**
   - Best lap per athlete
   - Total laps per athlete
   - Real-time ranking

3. **Export Data**
   - Export to CSV
   - PDF reports
   - Email results

4. **Multi-Checkpoint Support**
   - Split times
   - Sector analysis

## Troubleshooting

### Backend Won't Start
- Check database is running: `docker ps`
- Verify `.env` file has correct DATABASE_URL
- Check logs for errors

### Frontend Can't Connect
- Verify backend is running on port 3000
- Check browser console for errors
- Verify Socket.IO connection in Network tab

### Laps Not Appearing
- Check practice session is active (blue info banner)
- Verify RFID scanner is running
- Check browser console for `practice:lapUpdate` events
- Verify tag reads are showing in Test Scan

### Invalid Laps
- Check minimum lap time setting
- Laps faster than minimum are discarded
- These won't appear in Completed Laps table
- Error toast will show with time

### Tags Not Being Recognized
- Tags are auto-created if they don't exist
- Check `rfid_tags` table in database
- Verify tag EPC format is correct

### Duplicate Laps Being Created
- **Solution implemented**: 2-second debounce period
- Multiple RFID reads within 2s are automatically ignored
- Check console logs for "Tag read debounced" messages
- See `PRACTICE_MODE_DEBOUNCING.md` for details
- Adjust debounce period if needed for your use case

## Files Created/Modified

### Backend
- `services/core-api/src/services/practiceSessionService.ts` - Session management
- `services/core-api/src/services/practiceLapService.ts` - Lap processing
- `services/core-api/src/controllers/practiceController.ts` - API controller
- `services/core-api/src/routes/practice.ts` - API routes
- `services/core-api/src/index.ts` - Added practice routes & Socket.IO listener
- `services/core-api/src/services/rfidManager.ts` - Added tagRead event emission

### Frontend
- `frontend/src/services/practiceApi.ts` - API service
- `frontend/src/components/PracticeSettingsModal.tsx` - Settings modal
- `frontend/src/pages/PracticeMode.tsx` - Main page (replaced stub)
- `frontend/src/pages/PracticeMode.css` - Styling

### No Database Migrations Needed
- Uses existing `events`, `checkpoints`, `time_records`, and `rfid_tags` tables
- No schema changes required

---

## Next Steps

After testing Practice Mode:

1. **Test with Real Hardware**
   - Connect FX9500 RFID reader
   - Use physical RFID tags
   - Test different antenna configurations
   - Validate power settings

2. **Add Analytics Dashboard**
   - Display fastest lap
   - Show average lap time
   - Graph lap times over session
   - Athlete performance comparison

3. **Enhance UI**
   - Add sound notifications for lap completion
   - Color-code fast/slow laps
   - Add lap time trends
   - Show antenna activity indicators

4. **Data Export**
   - Export session data to CSV
   - Generate PDF reports
   - Email results to athletes

---

**Last Updated:** October 20, 2025

**Status:** ✅ Ready for Testing

**Test Sequence:**
1. Start backend: `npm run dev` (core-api)
2. Start frontend: `npm start` (frontend)
3. Navigate to Practice Mode
4. Click "Start Practice"
5. Configure settings
6. Use Test Scan or physical reader
7. Watch laps appear in real-time!
