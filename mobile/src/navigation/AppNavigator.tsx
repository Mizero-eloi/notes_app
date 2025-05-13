// src/navigation/AppNavigator.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
// Import from hooks instead of context
import useTheme from '../hooks/useTheme';
import CreateNoteScreen from '../screens/CreateNoteScreen';
import EditNoteScreen from '../screens/EditNoteScreen';
import NotesListScreen from '../screens/NotesListScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  // Get theme with fallback handling built into the hook
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="NotesList"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="NotesList" 
        component={NotesListScreen} 
        options={{ title: 'My Notes' }} 
      />
      <Stack.Screen 
        name="CreateNote" 
        component={CreateNoteScreen} 
        options={{ title: 'New Note' }} 
      />
      <Stack.Screen 
        name="EditNote" 
        component={EditNoteScreen} 
        options={{ title: 'Edit Note' }} 
      />
    </Stack.Navigator>
  );
}