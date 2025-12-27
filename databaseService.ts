
import { SubscriptionTier, Vehicle } from "../types";

export interface UserProfile {
  name: string;
  email: string;
  createdAt: number;
  lastLogin: number;
  subscription: SubscriptionTier;
  role: 'user' | 'creator';
}

const DB_KEY = 'bs_user_registry_v2'; // Incremented version for fresh sync

export const databaseService = {
  // Initialize or fetch the entire database from persistent storage
  getRegistry: (): UserProfile[] => {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Database corruption detected, resetting registry.");
      return [];
    }
  },

  // Save the registry back to storage immediately
  saveRegistry: (registry: UserProfile[]) => {
    localStorage.setItem(DB_KEY, JSON.stringify(registry));
  },

  // Register a new user and return the profile
  register: (name: string, email: string): UserProfile => {
    const registry = databaseService.getRegistry();
    const normalizedEmail = email.toLowerCase().trim();
    
    const existing = registry.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      // If user exists, update their name and return
      existing.name = name.trim();
      databaseService.saveRegistry(registry);
      return existing;
    }

    // Identify system administrators/creators
    const isCreator = normalizedEmail === 'anubhavtewari7@gmail.com';
    
    const newUser: UserProfile = {
      name: name.trim(),
      email: normalizedEmail,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      subscription: isCreator ? 'premium' : 'free',
      role: isCreator ? 'creator' : 'user'
    };

    registry.push(newUser);
    databaseService.saveRegistry(registry);
    return newUser;
  },

  // Find user by email with "Magic Provisioning" for the developer
  findUser: (email: string): UserProfile | null => {
    const registry = databaseService.getRegistry();
    const normalizedEmail = email.toLowerCase().trim();
    const user = registry.find(u => u.email.toLowerCase() === normalizedEmail);
    
    // Developer Experience: If you try to log in but haven't signed up on this device yet,
    // we auto-create the account to save you time.
    if (!user && normalizedEmail === 'anubhavtewari7@gmail.com') {
      return databaseService.register("Anubhav Tewari", normalizedEmail);
    }

    return user || null;
  },

  // Update a user's last login timestamp
  updateLogin: (email: string) => {
    const registry = databaseService.getRegistry();
    const index = registry.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (index !== -1) {
      registry[index].lastLogin = Date.now();
      databaseService.saveRegistry(registry);
    }
  },

  // Admin function: Reset everything
  resetDatabase: () => {
    localStorage.removeItem(DB_KEY);
  }
};
