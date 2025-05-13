// mobile/src/services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const NOTES_STORAGE_KEY = '@notes_app_notes';
const UNSYNCED_NOTES_KEY = '@notes_app_unsynced';
const SYNC_QUEUE_KEY = '@notes_app_sync_queue';

/**
 * Save notes to local storage
 * @param {Array} notes Array of notes to save
 * @returns {Promise<boolean>} Success status
 */
export const saveNotesToStorage = async (notes) => {
  try {
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Error saving notes to storage:', error);
    return false;
  }
};

/**
 * Get notes from local storage
 * @returns {Promise<Array>} Array of notes
 */
export const getNotesFromStorage = async () => {
  try {
    const notesJson = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error('Error getting notes from storage:', error);
    return [];
  }
};

/**
 * Save unsynced notes for later sync
 * @param {Array} notes Array of unsynced notes
 * @returns {Promise<boolean>} Success status
 */
export const saveUnsyncedNotes = async (notes) => {
  try {
    await AsyncStorage.setItem(UNSYNCED_NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Error saving unsynced notes:', error);
    return false;
  }
};

/**
 * Get unsynced notes
 * @returns {Promise<Array>} Array of unsynced notes
 */
export const getUnsyncedNotes = async () => {
  try {
    const notesJson = await AsyncStorage.getItem(UNSYNCED_NOTES_KEY);
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error('Error getting unsynced notes:', error);
    return [];
  }
};

/**
 * Save a note to sync queue for later synchronization
 * @param {Object} note Note to add to sync queue
 * @returns {Promise<boolean>} Success status
 */
export const addToSyncQueue = async (note) => {
  try {
    // Ensure note has a UUID for offline sync
    const noteWithId = {
      ...note,
      uuid: note.uuid || uuidv4(),
      synced: false,
      updatedAt: note.updatedAt || new Date().toISOString()
    };
    
    // Get existing queue
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    let queue = queueJson ? JSON.parse(queueJson) : [];
    
    // Check if note already exists in queue
    const existingIndex = queue.findIndex(n => n.uuid === noteWithId.uuid);
    
    if (existingIndex >= 0) {
      // Update existing note
      queue[existingIndex] = noteWithId;
    } else {
      // Add new note to queue
      queue.push(noteWithId);
    }
    
    // Save updated queue
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    
    return true;
  } catch (error) {
    console.error('Error adding note to sync queue:', error);
    return false;
  }
};

/**
 * Get all notes in sync queue
 * @returns {Promise<Array>} Array of notes in sync queue
 */
export const getSyncQueue = async () => {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

/**
 * Clear sync queue after successful sync
 * @returns {Promise<boolean>} Success status
 */
export const clearSyncQueue = async () => {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing sync queue:', error);
    return false;
  }
};

/**
 * Remove specific notes from sync queue
 * @param {Array} uuids Array of note UUIDs to remove
 * @returns {Promise<boolean>} Success status
 */
export const removeFromSyncQueue = async (uuids) => {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!queueJson) return true;
    
    let queue = JSON.parse(queueJson);
    queue = queue.filter(note => !uuids.includes(note.uuid));
    
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error('Error removing notes from sync queue:', error);
    return false;
  }
};

export default {
  saveNotesToStorage,
  getNotesFromStorage,
  saveUnsyncedNotes,
  getUnsyncedNotes,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue,
  removeFromSyncQueue
};