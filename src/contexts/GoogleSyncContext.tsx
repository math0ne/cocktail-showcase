'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { useStore } from '@/store/useStore';
import {
  getStoredToken,
  storeToken,
  clearToken,
  loadFromDrive,
  saveToDrive,
  testConnection,
  type SyncData,
} from '@/lib/googleDrive';

interface GoogleSyncContextType {
  isSignedIn: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  hasPendingChanges: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
  signIn: () => void;
  signOut: () => void;
  syncNow: () => Promise<void>;
}

const GoogleSyncContext = createContext<GoogleSyncContextType | null>(null);

export function useGoogleSync() {
  const context = useContext(GoogleSyncContext);
  return context;
}

interface Props {
  children: React.ReactNode;
}

export function GoogleSyncProvider({ children }: Props) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncDataRef = useRef<string>('');

  // Get current state from store
  const myIngredients = useStore((state) => state.myIngredients);
  const shoppingList = useStore((state) => state.shoppingList);
  const customCocktails = useStore((state) => state.customCocktails);
  const triedCocktails = useStore((state) => state.triedCocktails);
  const heartedCocktails = useStore((state) => state.heartedCocktails);
  const cocktailNotes = useStore((state) => state.cocktailNotes);
  const slideShowSettings = useStore((state) => state.slideShowSettings);

  // Build data for comparison (without timestamp)
  const buildCompareData = useCallback(() => ({
    myIngredients,
    shoppingList,
    customCocktails,
    triedCocktails,
    heartedCocktails,
    cocktailNotes,
    slideShowSettings,
  }), [myIngredients, shoppingList, customCocktails, triedCocktails, heartedCocktails, cocktailNotes, slideShowSettings]);

  // Build full sync data (with timestamp)
  const buildSyncData = useCallback((): SyncData => ({
    version: 1,
    lastSyncedAt: new Date().toISOString(),
    ...buildCompareData(),
    imageRefs: {}, // TODO: implement image sync
  }), [buildCompareData]);

  // Apply sync data to store
  const applySyncData = useCallback((data: SyncData) => {
    useStore.setState({
      myIngredients: data.myIngredients || [],
      shoppingList: data.shoppingList || [],
      customCocktails: data.customCocktails || [],
      triedCocktails: data.triedCocktails || [],
      heartedCocktails: data.heartedCocktails || [],
      cocktailNotes: data.cocktailNotes || {},
      ...(data.slideShowSettings && { slideShowSettings: data.slideShowSettings }),
    });
  }, []);

  // Sync to Drive
  const syncToDrive = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;

    const compareData = buildCompareData();
    const compareString = JSON.stringify(compareData);

    // Skip if data hasn't changed
    if (compareString === lastSyncDataRef.current) {
      setHasPendingChanges(false);
      return;
    }

    setIsSyncing(true);
    setHasPendingChanges(false);
    setError(null);

    try {
      const syncData = buildSyncData();
      await saveToDrive(token.accessToken, syncData);
      lastSyncDataRef.current = compareString;
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Sync failed:', err);
      setError('Failed to sync to Google Drive');
    } finally {
      setIsSyncing(false);
    }
  }, [buildCompareData, buildSyncData]);

  // Debounced sync - waits for changes to settle
  const debouncedSync = useCallback(() => {
    // Check if data actually changed before triggering sync
    const compareString = JSON.stringify(buildCompareData());
    if (compareString === lastSyncDataRef.current) {
      return; // No actual changes
    }

    setHasPendingChanges(true);
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncToDrive();
    }, 4000); // Wait 4 seconds after last change
  }, [buildCompareData, syncToDrive]);

  // Watch for store changes and trigger sync
  useEffect(() => {
    if (!isSignedIn) return;
    debouncedSync();
  }, [myIngredients, shoppingList, customCocktails, triedCocktails, heartedCocktails, cocktailNotes, slideShowSettings, isSignedIn, debouncedSync]);

  // Check for existing token on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = getStoredToken();
      if (token) {
        const valid = await testConnection(token.accessToken);
        if (valid) {
          setIsSignedIn(true);
          // Load initial data from Drive
          try {
            const data = await loadFromDrive(token.accessToken);
            if (data) {
              applySyncData(data);
              // Store compare data (without timestamp/version) for change detection
              lastSyncDataRef.current = JSON.stringify({
                myIngredients: data.myIngredients,
                shoppingList: data.shoppingList,
                customCocktails: data.customCocktails,
                triedCocktails: data.triedCocktails,
                heartedCocktails: data.heartedCocktails,
                cocktailNotes: data.cocktailNotes,
                slideShowSettings: data.slideShowSettings,
              });
              setLastSyncedAt(new Date(data.lastSyncedAt));
            }
          } catch (err) {
            console.error('Failed to load initial data:', err);
          }
        } else {
          clearToken();
        }
      }
      setIsLoading(false);
    };

    checkToken();
  }, [applySyncData]);

  // Google login hook
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      storeToken(response.access_token, response.expires_in);
      setIsSignedIn(true);
      setError(null);

      // Check for existing data on Drive
      try {
        const driveData = await loadFromDrive(response.access_token);
        if (driveData) {
          // Ask user what to do - for now, we'll merge (Drive data takes precedence)
          applySyncData(driveData);
          // Store compare data (without timestamp/version) for change detection
          lastSyncDataRef.current = JSON.stringify({
            myIngredients: driveData.myIngredients,
            shoppingList: driveData.shoppingList,
            customCocktails: driveData.customCocktails,
            triedCocktails: driveData.triedCocktails,
            heartedCocktails: driveData.heartedCocktails,
            cocktailNotes: driveData.cocktailNotes,
            slideShowSettings: driveData.slideShowSettings,
          });
          setLastSyncedAt(new Date(driveData.lastSyncedAt));
        } else {
          // No existing data, upload current state
          await syncToDrive();
        }
      } catch (err) {
        console.error('Failed to handle sign in:', err);
        setError('Failed to sync after sign in');
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
      setError('Failed to sign in with Google');
    },
    scope: 'https://www.googleapis.com/auth/drive.appdata',
  });

  const signIn = useCallback(() => {
    login();
  }, [login]);

  const signOut = useCallback(() => {
    googleLogout();
    clearToken();
    setIsSignedIn(false);
    setLastSyncedAt(null);
    lastSyncDataRef.current = '';
  }, []);

  const syncNow = useCallback(async () => {
    await syncToDrive();
  }, [syncToDrive]);

  return (
    <GoogleSyncContext.Provider
      value={{
        isSignedIn,
        isLoading,
        isSyncing,
        hasPendingChanges,
        lastSyncedAt,
        error,
        signIn,
        signOut,
        syncNow,
      }}
    >
      {children}
    </GoogleSyncContext.Provider>
  );
}
