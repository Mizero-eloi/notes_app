import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import 'react-native-get-random-values'; // Required for uuid to work
import { v4 as uuidv4 } from 'uuid';
import { useNetwork } from './NetworkContext';

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

const STORAGE_KEY = '@notes';
const QUEUE_KEY = '@unsynced_notes';

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
        id: uuidv4(),
        title: action.payload.title,
        content: action.payload.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
      };
      return { 
        ...state, 
        notes: [newNote, ...state.notes],
        unsyncedNotes: [...state.unsyncedNotes, newNote]
      };
    }
    case 'UPDATE_NOTE': {
      const updatedNotes = state.notes.map(note => 
        note.id === action.payload.id 
          ? { ...note, ...action.payload, updatedAt: new Date().toISOString(), synced: false }
          : note
      );
      
      // Add to unsynced if not already there
      let updatedUnsyncedNotes = [...state.unsyncedNotes];
      const noteInUnsynced = state.unsyncedNotes.find(note => note.id === action.payload.id);
      
      if (!noteInUnsynced) {
        const noteToUpdate = updatedNotes.find(note => note.id === action.payload.id);
        updatedUnsyncedNotes.push(noteToUpdate);
      } else {
        updatedUnsyncedNotes = updatedUnsyncedNotes.map(note => 
          note.id === action.payload.id 
            ? { ...note, ...action.payload, updatedAt: new Date().toISOString() }
            : note
        );
      }
      
      return { 
        ...state, 
        notes: updatedNotes,
        unsyncedNotes: updatedUnsyncedNotes
      };
    }
    case 'DELETE_NOTE': {
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        unsyncedNotes: state.unsyncedNotes.filter(note => note.id !== action.payload)
      };
    }
    case 'MARK_AS_SYNCED': {
      const updatedNotes = state.notes.map(note => 
        note.id === action.payload
          ? { ...note, synced: true }
          : note
      );
      
      return {
        ...state,
        notes: updatedNotes,
        unsyncedNotes: state.unsyncedNotes.filter(note => note.id !== action.payload)
      };
    }
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

  // Load notes from local storage
  useEffect(() => {
    const loadNotes = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const storedNotes = await AsyncStorage.getItem(STORAGE_KEY);
        const parsedNotes = storedNotes ? JSON.parse(storedNotes) : [];
        dispatch({ type: 'SET_NOTES', payload: parsedNotes });
        
        const storedQueue = await AsyncStorage.getItem(QUEUE_KEY);
        const parsedQueue = storedQueue ? JSON.parse(storedQueue) : [];
        dispatch({ type: 'SET_UNSYNCED_NOTES', payload: parsedQueue });
      } catch (error) {
        console.error('Failed to load notes:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load notes' });
      }
    };
    
    loadNotes();
  }, []);

  // Save notes to local storage whenever they change
  useEffect(() => {
    const saveNotes = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(state.unsyncedNotes));
      } catch (error) {
        console.error('Failed to save notes:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save notes' });
      }
    };
    
    if (!state.loading) {
      saveNotes();
    }
  }, [state.notes, state.unsyncedNotes]);

  // Sync notes with the server when we're connected
  useEffect(() => {
    const trySyncNotes = async () => {
      if (isConnected && state.unsyncedNotes.length > 0) {
        try {
          // In a real app, this would communicate with the backend
          // For now we'll simulate a successful sync
          console.log('Syncing notes with server:', state.unsyncedNotes);
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mark all as synced
          state.unsyncedNotes.forEach(note => {
            dispatch({ type: 'MARK_AS_SYNCED', payload: note.id });
          });
        } catch (error) {
          console.error('Failed to sync notes:', error);
        }
      }
    };
    
    if (!state.loading) {
      trySyncNotes();
    }
  }, [isConnected, state.unsyncedNotes, state.loading]);

  const addNote = (note) => {
    dispatch({ type: 'ADD_NOTE', payload: note });
  };

  const updateNote = (note) => {
    dispatch({ type: 'UPDATE_NOTE', payload: note });
  };

  const deleteNote = (id) => {
    dispatch({ type: 'DELETE_NOTE', payload: id });
  };

  const setNotes = (notes) => {
    dispatch({ type: 'SET_NOTES', payload: notes });
  };

  const syncNotes = (syncedNotes) => {
    syncedNotes.forEach(note => {
      dispatch({ type: 'MARK_AS_SYNCED', payload: note.id });
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