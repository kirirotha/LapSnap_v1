# Practice Mode Settings Profiles

## Overview
Save and manage different configuration profiles for Practice Mode sessions. Profiles persist across app restarts and can be easily switched between different setups.

## Features

### ✅ Profile Management
- **Save Profiles**: Store settings with custom names
- **Load Profiles**: Quickly recall saved configurations
- **Update Profiles**: Modify existing profiles
- **Delete Profiles**: Remove unwanted profiles
- **Export/Import**: Backup and share profiles as JSON files

### ✅ Automatic Settings Persistence
- **Last Used Settings**: Automatically saves the last configuration used
- **Auto-Load**: Opens with your most recent settings
- **Profile Memory**: Remembers which profile was last selected

## How to Use

### Saving a Profile

1. **Open Practice Mode Settings**
   - Click "Start Practice" or the Settings icon
   
2. **Configure Your Settings**
   - Set minimum lap time
   - Enable/disable antennas
   - Adjust power levels

3. **Save the Profile**
   - Click the **Save** icon (💾)
   - Enter a descriptive name (e.g., "Indoor Track", "Outdoor Race")
   - Click **Save**

### Loading a Profile

1. **Open Settings Modal**
2. **Select from Dropdown**
   - Choose a profile from "Load Profile" dropdown
   - Settings automatically populate
3. **Start Session**
   - Click "Start Practice" to use the profile

### Managing Profiles

**Update Profile:**
- Load the profile
- Modify settings as needed
- Click Save icon and use the same name

**Delete Profile:**
- Select the profile from dropdown
- Click Delete icon (🗑️)
- Confirm deletion

**Export Profiles:**
- Click Export icon (⬇️)
- Downloads `practice-profiles-YYYY-MM-DD.json`
- Share or backup this file

**Import Profiles:**
- Click Import icon (⬆️)
- Select a `.json` file
- Profiles are merged with existing ones

## Profile Structure

Each profile contains:
```json
{
  "id": "profile_1698765432000",
  "name": "Indoor Track Setup",
  "settings": {
    "minLapTime": 5000,
    "antennas": [
      { "antennaNumber": 1, "isActive": true, "powerLevel": 150 },
      { "antennaNumber": 2, "isActive": true, "powerLevel": 150 },
      { "antennaNumber": 3, "isActive": false, "powerLevel": 150 },
      { "antennaNumber": 4, "isActive": false, "powerLevel": 150 }
    ]
  },
  "createdAt": "2025-10-21T10:00:00.000Z",
  "lastUsedAt": "2025-10-21T14:30:00.000Z"
}
```

## Storage

- **Location**: Browser LocalStorage
- **Keys**:
  - `practice_profiles` - Array of all saved profiles
  - `practice_last_used_profile` - ID of last used profile
  - `practice_last_settings` - Last used settings (fallback)

## Use Cases

### Quick Scenario Switching

**Example Profiles:**

1. **"Indoor Practice"**
   - Min lap time: 5 seconds
   - Antennas: 1-2 active (medium power)
   - For controlled environment testing

2. **"Outdoor Race"**
   - Min lap time: 3 seconds
   - Antennas: 1-4 active (high power)
   - For competition day

3. **"Testing Mode"**
   - Min lap time: 10 seconds
   - Antennas: 1 only (low power)
   - For equipment verification

### Team Sharing

1. **Export** your working profile on competition laptop
2. **Share** JSON file with team
3. **Import** on all devices
4. Everyone uses identical settings

## Keyboard Shortcuts

- Press **F11** for fullscreen mode (works with profiles!)

## Tips

✅ **Naming Convention**: Use descriptive names
- ✅ Good: "Outdoor Marathon - High Power"
- ❌ Bad: "Setup1"

✅ **Regular Backups**: Export profiles monthly

✅ **Profile per Venue**: Create profiles for each race location

✅ **Test Before Race**: Verify profile works before competition

## Troubleshooting

### Profile Not Loading?
- Check if profile still exists in dropdown
- Try refreshing the page
- Re-import from backup if needed

### Settings Not Saving?
- Ensure browser allows localStorage
- Check browser console for errors
- Verify you clicked "Save" in the dialog

### Lost Profiles After Browser Clear?
- Profiles are stored in localStorage
- Clearing browser data removes them
- Always keep JSON exports as backups

## Technical Details

### Implementation Files
- **Storage Service**: `frontend/src/services/practiceSettingsStorage.ts`
- **Settings Modal**: `frontend/src/components/PracticeSettingsModal.tsx`
- **Practice Page**: `frontend/src/pages/PracticeMode.tsx`

### Storage API
```typescript
// Get all profiles
PracticeSettingsStorage.getProfiles()

// Save new profile
PracticeSettingsStorage.saveProfile(name, settings)

// Load profile
PracticeSettingsStorage.getProfile(id)

// Delete profile
PracticeSettingsStorage.deleteProfile(id)

// Get last used
PracticeSettingsStorage.getLastUsedProfile()
```

## Future Enhancements

Potential additions:
- Cloud sync for profiles
- Profile templates library
- Auto-naming based on settings
- Profile categories/tags
- Duplicate profile function
- Quick switch toolbar

---

**Created:** October 21, 2025  
**Status:** ✅ Production Ready
