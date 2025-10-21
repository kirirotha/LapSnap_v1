# Practice Mode - Quick Start Guide

## 🎯 What is Practice Mode?

Practice Mode is a **real-time lap timing system** that automatically tracks laps using RFID technology:

- **First Tag Scan** → Lap Starts (timer begins)
- **Second Tag Scan** → Lap Completes (time recorded)
- **Live Updates** → See laps in real-time via WebSocket
- **Automatic Validation** → Discard laps faster than minimum time

## 🚀 Quick Start (3 Steps)

### 1. Start Backend
```powershell
cd services\core-api
npm run dev
```

Look for these logs:
```
✅ Practice mode RFID listener initialized
✅ API routes registered: [..., /api/practice]
```

### 2. Start Frontend
```powershell
cd frontend
npm start
```

### 3. Navigate & Start
1. Open http://localhost:3000/practice-mode
2. Click **"Start Practice"**
3. Configure:
   - **Min Lap Time**: 5 seconds (default)
   - **Antennas**: Check which antennas to activate
   - **Power**: Set power level (1-200 = 0.1-20.0 dBm)
4. Click **"Start Practice"** (green button)

## 📊 How It Works

```
Tag Scanned → RFID Manager → Practice Service → Socket.IO → Frontend
                                     ↓
                            time_records table
```

### First Scan (Lap Start)
1. Tag detected by antenna
2. Creates record in `time_records` table
3. Adds to **Active Laps** table
4. Live countdown begins

### Second Scan (Lap Complete)
1. Same tag detected again
2. Calculates lap time
3. Validates against minimum time
4. If valid → Moves to **Completed Laps** table
5. If invalid → Discarded with error notification

## 🎮 Testing Without RFID Hardware

Use the **Test Scan** page:

1. Navigate to http://localhost:3000/scan-test
2. Click "Start Scanning" (mock mode)
3. Switch back to Practice Mode tab
4. Watch mock tags create laps automatically

## 📁 Data Storage

All practice data is stored in existing tables:

### Events Table
- Auto-created event: `"Practice - Oct 20, 2025 2:30 PM"`
- Event type: `OTHER`
- Status: `IN_PROGRESS` → `COMPLETED`

### Time Records Table
- Each tag scan = 1 record
- `rawData` contains lap metadata (JSON)
- `processed = true` when lap completes
- `isValid = false` if lap too fast

## 🔧 Configuration Options

### Minimum Lap Time
- Default: 5 seconds
- Purpose: Prevent false readings
- Invalid laps are discarded (not shown)

### Antenna Configuration
- Enable/disable antennas 1-4
- Set power per antenna (1-200 index)
- Power displayed as dBm (index/10)
- Example: 150 = 15.0 dBm

## 📡 API Endpoints

```
POST   /api/practice/session/start    - Start session
POST   /api/practice/session/stop     - Stop session
GET    /api/practice/session/active   - Get active session
GET    /api/practice/laps/active      - Get laps in progress
GET    /api/practice/laps/completed   - Get completed laps
GET    /api/practice/stats            - Get session statistics
```

## 🎨 UI Features

### Active Laps Table
- Shows laps currently in progress
- Live countdown timer (updates every 100ms)
- Displays tag EPC, athlete name, antenna
- Color-coded chips

### Completed Laps Table
- Shows last 50 valid laps
- Displays final lap time
- Completion timestamp
- Athlete information (if tag assigned)

### Notifications
- ✅ Green toast: Lap completed successfully
- ❌ Red toast: Lap too fast (invalid)
- ℹ️ Blue banner: Session info (min time, active antennas)

## 🐛 Troubleshooting

### Laps Not Appearing?
1. Check practice session is active (blue banner should show)
2. Verify RFID scanner is running
3. Open browser DevTools → Console
4. Look for `practice:lapUpdate` events

### "No active practice session" error?
- Click "Start Practice" button first
- Configure settings and start session
- Green "Stop Practice" button should appear

### Lap appears then disappears?
- Lap time was faster than minimum
- Check red error toast for actual time
- Increase minimum lap time in settings

### Tags not recognized?
- Tags are auto-created in database
- Check `rfid_tags` table
- No manual tag setup needed

## 📈 What's Next?

### View Historical Data
```sql
-- See all practice sessions
SELECT * FROM events WHERE name LIKE 'Practice%';

-- See all practice laps
SELECT * FROM time_records 
WHERE eventId IN (
  SELECT id FROM events WHERE name LIKE 'Practice%'
);
```

### Future Features
- 📊 Lap analytics dashboard
- 🏆 Athlete leaderboards
- 📄 Export to CSV/PDF
- 📧 Email results
- 📈 Lap time graphs
- 🎯 Multi-checkpoint support

## 💡 Pro Tips

1. **Start with high minimum time** (10s) for testing, then reduce
2. **Use 2 antennas** for best lap detection (start & finish)
3. **Power level 150** (15.0 dBm) is good for most scenarios
4. **Test Scan page** is great for development without hardware
5. **Check browser console** for real-time WebSocket messages

## 📞 Need Help?

Check these files:
- `PRACTICE_MODE_SETUP.md` - Full documentation
- Backend logs in terminal
- Browser console (F12)
- Network tab → WS (WebSocket messages)

---

**Happy Timing! 🏃‍♂️💨**
