import { PracticeSessionSettings } from './practiceApi';

export interface PracticeProfile {
  id: string;
  name: string;
  settings: PracticeSessionSettings;
  createdAt: string;
  lastUsedAt: string;
}

const STORAGE_KEY = 'practice_profiles';
const LAST_USED_KEY = 'practice_last_used_profile';

export class PracticeSettingsStorage {
  /**
   * Get all saved profiles
   */
  static getProfiles(): PracticeProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading practice profiles:', error);
      return [];
    }
  }

  /**
   * Get a specific profile by ID
   */
  static getProfile(id: string): PracticeProfile | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  /**
   * Save a new profile
   */
  static saveProfile(name: string, settings: PracticeSessionSettings): PracticeProfile {
    const profiles = this.getProfiles();
    const now = new Date().toISOString();
    
    const newProfile: PracticeProfile = {
      id: `profile_${Date.now()}`,
      name,
      settings,
      createdAt: now,
      lastUsedAt: now,
    };

    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    
    return newProfile;
  }

  /**
   * Update an existing profile
   */
  static updateProfile(id: string, name: string, settings: PracticeSessionSettings): boolean {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    
    if (index === -1) return false;

    profiles[index] = {
      ...profiles[index],
      name,
      settings,
      lastUsedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return true;
  }

  /**
   * Delete a profile
   */
  static deleteProfile(id: string): boolean {
    const profiles = this.getProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    
    if (filtered.length === profiles.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Clear last used if it was this profile
    if (this.getLastUsedProfileId() === id) {
      localStorage.removeItem(LAST_USED_KEY);
    }
    
    return true;
  }

  /**
   * Get the last used profile ID
   */
  static getLastUsedProfileId(): string | null {
    return localStorage.getItem(LAST_USED_KEY);
  }

  /**
   * Get the last used profile
   */
  static getLastUsedProfile(): PracticeProfile | null {
    const id = this.getLastUsedProfileId();
    return id ? this.getProfile(id) : null;
  }

  /**
   * Set the last used profile
   */
  static setLastUsedProfile(id: string): void {
    localStorage.setItem(LAST_USED_KEY, id);
    
    // Update the lastUsedAt timestamp
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index !== -1) {
      profiles[index].lastUsedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    }
  }

  /**
   * Save settings as "last used" without a profile
   */
  static saveLastUsedSettings(settings: PracticeSessionSettings): void {
    localStorage.setItem('practice_last_settings', JSON.stringify(settings));
  }

  /**
   * Get last used settings (fallback if no profile)
   */
  static getLastUsedSettings(): PracticeSessionSettings | null {
    try {
      const data = localStorage.getItem('practice_last_settings');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading last used settings:', error);
      return null;
    }
  }

  /**
   * Export all profiles as JSON
   */
  static exportProfiles(): string {
    const profiles = this.getProfiles();
    return JSON.stringify(profiles, null, 2);
  }

  /**
   * Import profiles from JSON
   */
  static importProfiles(jsonData: string): boolean {
    try {
      const profiles = JSON.parse(jsonData);
      if (!Array.isArray(profiles)) return false;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      return true;
    } catch (error) {
      console.error('Error importing profiles:', error);
      return false;
    }
  }
}
