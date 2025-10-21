# Laps Tab Update - Using New Laps Table

## Overview
Updated the Laps tab to display data from the new `laps` table instead of the old `time_records` table.

## Changes Made

### Frontend Changes (✅ Completed)

#### 1. Updated `frontend/src/services/lapApi.ts`
- **Changed interface fields** to match new laps table structure:
  - `timestamp` → `startTime`, added `endTime`
  - Added `lapNumber` (number)
  - Added `lapTime` (milliseconds)
  - Added `status` ('IN_PROGRESS' | 'COMPLETED' | 'INVALID' | 'DNF')
  - Added `startAntenna`, `endAntenna` (numbers)
  - Removed `rawData`, `signalStrength`, `readerId`, `processed`, `processedAt`
  - Changed `event` → `events`, `participant` → `participants`, `checkpoint` → `checkpoints`

#### 2. Updated `frontend/src/pages/Laps.tsx`
- **Added new columns:**
  - Lap # (first column, 80px width)
  - Lap Time (formatted as MM:SS.mmm with Timer icon chip)
  - Start Time (formatted timestamp)
  - End Time (formatted timestamp or '-')
  - Status (colored chip: COMPLETED=success, IN_PROGRESS=primary, INVALID=error, DNF=warning)
  
- **Removed old columns:**
  - Reader ID
  - Signal Strength
  - Processed status
  
- **Updated existing columns:**
  - Tag ID → Tag EPC (shows EPC or tagId, monospace font)
  - Time → Start Time

- **Updated search/filter logic:**
  - Changed field references: `lap.participant` → `lap.participants`, `lap.event` → `lap.events`
  - Added `rfid_tags.epc` to search
  - Changed Status filter: "Processed/Unprocessed" → "Completed/In Progress"
  - Status filter now checks `lap.status` field

- **Updated DataGrid sorting:**
  - Changed default sort field from `timestamp` to `startTime`

- **Added lap time formatter:**
  - `formatLapTime()` function converts milliseconds to MM:SS.mmm format

### Backend Changes (✅ Completed in code, ⚠️ Needs Prisma regeneration)

#### 1. Updated `services/core-api/src/services/lapService.ts`
- **Changed all queries** from `prisma.time_records` to `prisma.laps`
- **Updated ordering** from `timestamp: 'desc'` to `startTime: 'desc'`
- **Added `epc` field** to rfid_tags select in includes

Changes in:
- `getAll()` - Query all laps
- `getById()` - Query single lap
- `getByEvent()` - Query laps by event
- `getByParticipant()` - Query laps by participant

## Next Steps

### 🔴 REQUIRED: Regenerate Prisma Client
The Prisma client currently doesn't recognize the `laps` table. You need to:

```powershell
cd services\core-api
npx prisma generate
```

**Note:** If you get an error about file permissions, make sure to:
1. Stop all running backend services
2. Close Prisma Studio if it's open
3. Try the command again

Alternatively, run:
```powershell
npm run build
```

This will automatically run `npx prisma generate` as part of the build process.

## Data Structure Comparison

### Old (time_records table)
```typescript
{
  id: string
  eventId: string
  participantId?: string
  tagId: string
  checkpointId: string
  timestamp: DateTime
  rawData?: string
  signalStrength?: number
  readerId?: string
  isValid: boolean
  invalidReason?: string
  processed: boolean
  processedAt?: DateTime
}
```

### New (laps table)
```typescript
{
  id: string
  eventId: string
  participantId?: string
  tagId: string
  checkpointId: string
  lapNumber: number           // NEW
  startTime: DateTime         // Renamed from timestamp
  endTime?: DateTime          // NEW
  lapTime?: number            // NEW (milliseconds)
  status: LapStatus          // NEW (enum)
  startAntenna?: number       // NEW
  endAntenna?: number         // NEW
  startTimeRecordId?: string  // NEW
  endTimeRecordId?: string    // NEW
  isValid: boolean
  invalidReason?: string
  notes?: string              // NEW
}
```

## Display Features

### Lap Time Display
- Shows formatted lap time with Timer icon (green chip)
- Format: `M:SS.mmm` (e.g., "1:23.456")
- Shows "In Progress" for laps without end time

### Status Display
- **COMPLETED**: Green chip
- **IN_PROGRESS**: Blue chip (outlined)
- **INVALID**: Red chip
- **DNF**: Orange/warning chip

### Search Capabilities
Searches across:
- Participant name and bib number
- Event name
- Checkpoint name
- Tag EPC/ID

### Filter Options
1. **Validity**: All / Valid / Invalid
2. **Status**: All / Completed / In Progress

## Testing Checklist

Once Prisma client is regenerated:

- [ ] Backend compiles without errors
- [ ] `/api/laps` endpoint returns lap data
- [ ] Frontend displays laps in table
- [ ] Lap # column shows correctly
- [ ] Lap Time shows formatted time or "In Progress"
- [ ] Status column shows colored chips
- [ ] Search works for participant, event, tag
- [ ] Filters work (Validity, Status)
- [ ] Sorting works (default by Start Time descending)
- [ ] Actions work (Mark Valid/Invalid, Delete)

## Related Files

### Modified Files
- ✅ `frontend/src/services/lapApi.ts`
- ✅ `frontend/src/pages/Laps.tsx`
- ✅ `services/core-api/src/services/lapService.ts`

### Schema Files (Already Updated)
- ✅ `services/core-api/prisma/schema.prisma` (laps table exists)
- ✅ Database migration applied

### Documentation
- See `LAPS_TABLE_SCHEMA.md` for complete schema reference
- See `LAPS_IMPLEMENTATION.md` for backend implementation details
