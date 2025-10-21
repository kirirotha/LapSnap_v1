# Practice Mode - Tag Debouncing Guide

## Problem: Multiple Lap Creations from Single Tag Scan

RFID readers typically emit **multiple reads** for the same tag within a short time period:
- A single tag pass can generate 5-50+ read events
- This was creating multiple lap records for one physical scan
- Result: Cluttered lap tables with duplicate entries

## Solution: Debouncing

We've implemented **debouncing** to ignore duplicate tag reads within a configurable time window.

### How It Works

1. **First Read**: Tag is scanned → Lap starts or completes
2. **Subsequent Reads**: Same tag within 2 seconds → Ignored (debounced)
3. **After Cooldown**: Tag can be scanned again after 2 seconds

```
Tag Scan 1 → Process ✅
Tag Scan 1 (0.1s later) → Ignore ❌ (debounced)
Tag Scan 1 (0.5s later) → Ignore ❌ (debounced)
Tag Scan 1 (1.0s later) → Ignore ❌ (debounced)
Tag Scan 1 (2.5s later) → Process ✅ (cooldown expired)
```

## Default Settings

- **Debounce Period**: 2000ms (2 seconds)
- **Applied To**: Both lap starts and lap completions
- **Per Tag**: Each tag has its own debounce timer

## Why 2 Seconds?

This provides a good balance:
- ✅ Prevents duplicate lap creation from rapid reads
- ✅ Allows legitimate re-scans after a reasonable interval
- ✅ Doesn't interfere with normal lap timing
- ✅ Works well with typical RFID reader behavior

## Customizing the Debounce Period

If you need to adjust the debounce period:

```typescript
import { practiceLapService } from './services/practiceLapService';

// Set to 1 second
practiceLapService.setDebouncePeriod(1000);

// Set to 3 seconds
practiceLapService.setDebouncePeriod(3000);

// Get current setting
const currentDebounce = practiceLapService.getDebouncePeriod();
```

## Logging

Debounced reads are logged for debugging:

```
Debouncing tag E2801170000002045D9A5B3E: 450ms since last read
Tag read debounced (duplicate): E2801170000002045D9A5B3E
```

Check your backend console to see when tags are being debounced.

## Testing Debouncing

### 1. With Test Scan (Mock Mode)
- Mock mode generates reads every 2 seconds
- You should see **one lap per mock read**
- No duplicate laps should appear

### 2. With Real RFID Reader
- Wave a tag past the antenna
- Backend will receive multiple reads
- Only the **first read** is processed
- Subsequent reads within 2s are ignored
- Check console for debounce logs

### 3. Expected Behavior

**Before Debouncing:**
```
Scan tag → 10 lap starts created ❌
```

**After Debouncing:**
```
Scan tag → 1 lap start created ✅
Scan same tag again (after 2s) → 1 lap completion ✅
```

## Implementation Details

### Data Structures

```typescript
// Tracks last read per tag
const lastReads = new Map<string, LastReadTracker>();

interface LastReadTracker {
  timestamp: Date;
  type: 'start' | 'complete';
}
```

### Processing Logic

```typescript
const lastRead = lastReads.get(tagEpc);
if (lastRead) {
  const timeSinceLastRead = timestamp.getTime() - lastRead.timestamp.getTime();
  if (timeSinceLastRead < DEBOUNCE_PERIOD) {
    // Ignore this read (debounced)
    return null;
  }
}

// Process the read
// ... lap start/complete logic ...

// Track this read
lastReads.set(tagEpc, {
  timestamp: timestamp,
  type: 'start' or 'complete'
});
```

### Memory Management

- Debounce tracker cleared when session stops
- Old entries automatically overwritten
- No memory leak concerns

## Troubleshooting

### Still Seeing Duplicate Laps?

1. **Check Debounce Period**: May need to increase from 2s to 3s or more
2. **Multiple Antennas**: Each antenna triggers separately (expected behavior)
3. **Session Restart**: Debounce tracker resets on session stop
4. **Check Logs**: Look for "debounced" messages in console

### Laps Not Being Created?

1. **Debounce Too High**: If set to 10s+, legitimate scans may be blocked
2. **Check Timestamps**: Tag must wait for debounce period to expire
3. **Review Logs**: Should see "Practice lap processed" messages

### Adjusting for Your Use Case

**Very Fast Scanning (< 1 second between laps)**
```typescript
practiceLapService.setDebouncePeriod(500); // 0.5 seconds
```

**Multiple Tags in Close Proximity**
```typescript
practiceLapService.setDebouncePeriod(3000); // 3 seconds
```

**High-Speed Racing**
```typescript
practiceLapService.setDebouncePeriod(1000); // 1 second
```

## Best Practices

1. **Start with Default (2s)**: Works for most scenarios
2. **Monitor Logs**: Watch for debounced messages during testing
3. **Adjust if Needed**: Based on your specific hardware and use case
4. **Document Changes**: If you change the default, note it in your config

## Related Files

- `services/core-api/src/services/practiceLapService.ts` - Debouncing implementation
- `services/core-api/src/index.ts` - Tag read event handler
- Backend console logs - Debugging information

---

**Summary**: Debouncing prevents duplicate lap creation from multiple RFID reads of the same tag. Default 2-second cooldown works well for most scenarios. Adjust if needed based on your specific requirements.
