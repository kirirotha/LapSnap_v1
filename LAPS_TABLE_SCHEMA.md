# Laps Table - Database Schema

## Overview
The `laps` table is a **dedicated table for storing calculated lap times**. It replaces parsing `time_records` rawData and provides a clean, queryable structure for lap data.

## Table Structure

```sql
CREATE TABLE laps (
  id                VARCHAR PRIMARY KEY,
  eventId           VARCHAR NOT NULL,
  participantId     VARCHAR NULL,          -- NULL for practice mode
  tagId             VARCHAR NOT NULL,
  checkpointId      VARCHAR NOT NULL,
  lapNumber         INTEGER NOT NULL,      -- Sequential lap number per tag
  startTime         TIMESTAMP NOT NULL,
  endTime           TIMESTAMP NULL,        -- NULL while lap is in progress
  lapTime           INTEGER NULL,          -- Duration in milliseconds
  status            LapStatus DEFAULT 'IN_PROGRESS',
  startAntenna      INTEGER NULL,
  endAntenna        INTEGER NULL,
  startTimeRecordId VARCHAR NULL,          -- Reference to time_records
  endTimeRecordId   VARCHAR NULL,          -- Reference to time_records
  isValid           BOOLEAN DEFAULT TRUE,
  invalidReason     VARCHAR NULL,
  notes             VARCHAR NULL,
  createdAt         TIMESTAMP DEFAULT NOW(),
  updatedAt         TIMESTAMP NOT NULL,
  
  FOREIGN KEY (eventId) REFERENCES events(id),
  FOREIGN KEY (participantId) REFERENCES participants(id),
  FOREIGN KEY (tagId) REFERENCES rfid_tags(id),
  FOREIGN KEY (checkpointId) REFERENCES checkpoints(id)
);

CREATE INDEX idx_laps_event_lapnumber ON laps(eventId, lapNumber);
CREATE INDEX idx_laps_participant_lapnumber ON laps(participantId, lapNumber);
CREATE INDEX idx_laps_tag_starttime ON laps(tagId, startTime);
CREATE INDEX idx_laps_event_status ON laps(eventId, status);
```

## LapStatus Enum

```typescript
enum LapStatus {
  IN_PROGRESS  // Lap started, not yet finished
  COMPLETED    // Lap successfully completed
  INVALID      // Lap completed but below minimum time
  DNF          // Did Not Finish
}
```

## Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| **id** | UUID | Unique lap identifier |
| **eventId** | UUID | Practice session or race event |
| **participantId** | UUID? | NULL for practice mode, participant ID for races |
| **tagId** | UUID | RFID tag that triggered this lap |
| **checkpointId** | UUID | Timing point (usually finish line) |
| **lapNumber** | Integer | Sequential lap count per tag (1, 2, 3...) |
| **startTime** | Timestamp | When lap started (first tag read) |
| **endTime** | Timestamp? | When lap completed (second tag read) |
| **lapTime** | Integer? | Duration in milliseconds (endTime - startTime) |
| **status** | Enum | IN_PROGRESS, COMPLETED, INVALID, or DNF |
| **startAntenna** | Integer? | Which antenna detected lap start |
| **endAntenna** | Integer? | Which antenna detected lap end |
| **startTimeRecordId** | UUID? | Link to raw time_records entry |
| **endTimeRecordId** | UUID? | Link to raw time_records entry |
| **isValid** | Boolean | True if lap meets minimum time requirement |
| **invalidReason** | String? | Why lap is invalid (if applicable) |
| **notes** | String? | Optional notes |

## Example Data

### Active Lap (In Progress)
```json
{
  "id": "lap-123",
  "eventId": "practice-event-456",
  "participantId": null,
  "tagId": "tag-789",
  "checkpointId": "checkpoint-finish",
  "lapNumber": 5,
  "startTime": "2025-10-20T22:30:15.234Z",
  "endTime": null,
  "lapTime": null,
  "status": "IN_PROGRESS",
  "startAntenna": 1,
  "endAntenna": null,
  "isValid": true
}
```

### Completed Lap
```json
{
  "id": "lap-124",
  "eventId": "practice-event-456",
  "participantId": null,
  "tagId": "tag-789",
  "checkpointId": "checkpoint-finish",
  "lapNumber": 6,
  "startTime": "2025-10-20T22:30:45.567Z",
  "endTime": "2025-10-20T22:31:20.890Z",
  "lapTime": 35323,
  "status": "COMPLETED",
  "startAntenna": 1,
  "endAntenna": 1,
  "isValid": true
}
```

### Invalid Lap (Too Fast)
```json
{
  "id": "lap-125",
  "eventId": "practice-event-456",
  "participantId": null,
  "tagId": "tag-789",
  "checkpointId": "checkpoint-finish",
  "lapNumber": 7,
  "startTime": "2025-10-20T22:31:22.100Z",
  "endTime": "2025-10-20T22:31:24.200Z",
  "lapTime": 2100,
  "status": "INVALID",
  "startAntenna": 1,
  "endAntenna": 1,
  "isValid": false,
  "invalidReason": "Lap time 2100ms is below minimum 5000ms"
}
```

## Common Queries

### Get All Active Laps
```sql
SELECT * FROM laps 
WHERE eventId = 'practice-event-456' 
  AND status = 'IN_PROGRESS'
ORDER BY startTime DESC;
```

### Get Completed Laps
```sql
SELECT * FROM laps 
WHERE eventId = 'practice-event-456' 
  AND status = 'COMPLETED'
  AND isValid = true
ORDER BY endTime DESC
LIMIT 50;
```

### Get Laps for Specific Tag
```sql
SELECT * FROM laps 
WHERE eventId = 'practice-event-456' 
  AND tagId = 'tag-789'
ORDER BY lapNumber ASC;
```

### Calculate Fastest Lap
```sql
SELECT MIN(lapTime) as fastestLap
FROM laps
WHERE eventId = 'practice-event-456'
  AND status = 'COMPLETED'
  AND isValid = true;
```

### Calculate Average Lap Time
```sql
SELECT AVG(lapTime) as averageLap
FROM laps
WHERE eventId = 'practice-event-456'
  AND status = 'COMPLETED'
  AND isValid = true;
```

### Get Lap Count Per Tag
```sql
SELECT 
  tagId,
  rfid_tags.tagId as tagEpc,
  COUNT(*) as totalLaps,
  AVG(lapTime) as avgLapTime
FROM laps
JOIN rfid_tags ON laps.tagId = rfid_tags.id
WHERE eventId = 'practice-event-456'
  AND status = 'COMPLETED'
  AND isValid = true
GROUP BY tagId, rfid_tags.tagId
ORDER BY avgLapTime ASC;
```

## Benefits Over time_records

### Before (time_records with rawData parsing)
```typescript
// Had to parse JSON from rawData
const records = await prisma.time_records.findMany({
  where: { rawData: { contains: 'lap_end' } }
});
const lapTime = JSON.parse(records[0].rawData).lapTime; // 😩
```

### After (dedicated laps table)
```typescript
// Clean, typed, queryable
const laps = await prisma.laps.findMany({
  where: { status: 'COMPLETED' }
});
const lapTime = laps[0].lapTime; // ✅
```

## Integration with Existing Tables

### Relationships
- **events** ← laps (1:many) - One event has many laps
- **participants** ← laps (1:many) - One participant has many laps (NULL for practice)
- **rfid_tags** ← laps (1:many) - One tag can complete many laps
- **checkpoints** ← laps (1:many) - One checkpoint records many laps
- **time_records** ← laps (1:1 start, 1:1 end) - Raw RFID reads linked via startTimeRecordId/endTimeRecordId

### Data Flow
```
1. RFID Read → time_records (raw data)
2. First scan → laps.create (status: IN_PROGRESS)
3. Second scan → laps.update (status: COMPLETED, calculate lapTime)
4. Display → Query laps table directly
```

## Prisma Usage

### Create Lap (Start)
```typescript
const lap = await prisma.laps.create({
  data: {
    id: uuidv4(),
    eventId: 'event-123',
    tagId: 'tag-456',
    checkpointId: 'checkpoint-789',
    lapNumber: 5,
    startTime: new Date(),
    status: 'IN_PROGRESS',
    startAntenna: 1,
    updatedAt: new Date(),
  }
});
```

### Complete Lap
```typescript
const updatedLap = await prisma.laps.update({
  where: { id: lapId },
  data: {
    endTime: new Date(),
    lapTime: 35000, // milliseconds
    status: 'COMPLETED',
    endAntenna: 1,
    updatedAt: new Date(),
  }
});
```

### Query with Relations
```typescript
const laps = await prisma.laps.findMany({
  where: { eventId: 'event-123' },
  include: {
    rfid_tags: true,
    checkpoints: true,
    participants: true,
  }
});
```

## Migration Applied
```bash
npx prisma migrate dev --name add_laps_table
npx prisma generate
```

## Frontend Display

Now your Practice Mode tables can directly query the `laps` table:

```typescript
// Get active laps
const activeLaps = await fetch('/api/practice/laps/active');
// Returns: Array of laps with status='IN_PROGRESS'

// Get completed laps
const completedLaps = await fetch('/api/practice/laps/completed');
// Returns: Array of laps with status='COMPLETED', sorted by endTime
```

Each lap object contains all the data you need without JSON parsing! 🎉
