import React, { createContext, useContext, useEffect, useReducer } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as api from '../services/api';
import * as storage from '../services/Storage';
import { useNetwork } from './NetworkContext';

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

const STORAGE_KEY = '@notes';
const UNSYNCED_KEY = '@unsynced_notes';

const initialState = {
  notes: [],
  unsyncedNotes: [],
  loading: true,
  error: null,
};

function notesReducer(state, action) {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.payload, loading: false };
    case 'SET_UNSYNCED_NOTES':
      return { ...state, unsyncedNotes: action.payload };
    case 'ADD_NOTE': {
      const newNote = {
        ...action.payload,
        id: action.payload.id || uuidv4(),
        createdAt: action.payload.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: action.payload.synced || false,
      };
      return { 
        ...state, 
        notes: [newNote, ...state.notes],
        unsyncedNotes: newNote.synced ? state.unsyncedNotes : [...state.unsyncedNotes, newNote]
      };
    }
    case 'UPDATE_NOTE': {
      const updatedNote = {
        ...action.payload,
        updatedAt: new Date().toISOString(),
        synced: action.payload.synced || false,
      };
      
      const updatedNotes = state.notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      );
      
      const updatedUnsynced = updatedNote.synced
        ? state.unsyncedNotes.filter(note => note.id !== updatedNote.id)
        : [...state.unsyncedNotes.filter(note => note.id !== updatedNote.id), updatedNote];
      
      return { 
        ...state, 
        notes: updatedNotes,
        unsyncedNotes: updatedUnsynced
      };
    }
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        unsyncedNotes: state.unsyncedNotes.filter(note => note.id !== action.payload)
      };
    case 'MARK_AS_SYNCED':
      return {
        ...state,
        notes: state.notes.map(note => 
          note.id === action.payload ? { ...note, synced: true } : note
        ),
        unsyncedNotes: state.unsyncedNotes.filter(note => note.id !== action.payload)
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);
  const { isConnected } = useNetwork();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const [localNotes, unsyncedNotes] = await Promise.all([
          storage.getNotesFromStorage(),
          storage.getUnsyncedNotes()
        ]);
        dispatch({ type: 'SET_NOTES', payload: localNotes });
        dispatch({ type: 'SET_UNSYNCED_NOTES', payload: unsyncedNotes });
      } catch (error) {
        console.error('Failed to load notes:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load notes' });
      }
    };
    
    loadData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (!state.loading) {
      const saveData = async () => {
        await Promise.all([
          storage.saveNotesToStorage(state.notes),
          storage.saveUnsyncedNotes(state.unsyncedNotes)
        ]);
      };
      saveData();
    }
  }, [state.notes, state.unsyncedNotes]);

  // Sync when online
  useEffect(() => {
    const syncWithServer = async () => {
      if (isConnected && state.unsyncedNotes.length > 0 && !state.loading) {
        try {
          const syncedNotes = await api.syncNotes(state.unsyncedNotes);
          syncedNotes.forEach(note => {
            if (note.synced) {
              dispatch({ type: 'MARK_AS_SYNCED', payload: note.id });
            }
          });
        } catch (error) {
          console.error('Sync failed:', error);
        }
      }
    };
    
    syncWithServer();
  }, [isConnected, state.unsyncedNotes, state.loading]);

  const addNote = async (note) => {
    dispatch({ type: 'ADD_NOTE', payload: note });
    return note;
  };

  const updateNote = async (note) => {
    dispatch({ type: 'UPDATE_NOTE', payload: note });
    return note;
  };

  const deleteNote = async (id) => {
    dispatch({ type: 'DELETE_NOTE', payload: id });
  };

  const setNotes = (notes) => {
    dispatch({ type: 'SET_NOTES', payload: notes });
  };

  const syncNotes = async (notes) => {
    notes.forEach(note => {
      if (note.synced) {
        dispatch({ type: 'MARK_AS_SYNCED', payload: note.id });
      }
    });
  };

  return (
    <NotesContext.Provider 
      value={{ 
        notes: state.notes, 
        loading: state.loading, 
        error: state.error,
        unsyncedNotes: state.unsyncedNotes,
        addNote,
        updateNote,
        deleteNote,
        setNotes,
        syncNotes
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};