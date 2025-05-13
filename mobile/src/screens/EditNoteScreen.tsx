import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Button from '../components/Button';
import OfflineBanner from '../components/OfflineBanner';
import { useNetwork } from '../context/NetworkContext';
import { useNotes } from '../context/NotesContext';
import useTheme from '../hooks/useTheme';

export default function EditNoteScreen() {
  const theme  = useTheme();
  const { notes, updateNote, deleteNote } = useNotes();
  const { isConnected } = useNetwork();
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId } = route.params;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalNote, setOriginalNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setOriginalNote(note);
    } else {
      Alert.alert('Error', 'Note not found');
      navigation.goBack();
    }
  }, [noteId, notes]);
  
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your note');
      return;
    }
    
    try {
      setSaving(true);
      await updateNote({ id: noteId, title, content });
      setSaving(false);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update note:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to update note. Please try again.');
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteNote(noteId);
              setDeleting(false);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete note:', error);
              setDeleting(false);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleDelete} style={{ marginRight: 16 }}>
          <Feather name="trash-2" size={22} color={theme.colors.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  
  if (!originalNote) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <OfflineBanner />
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { 
              backgroundColor: originalNote.synced ? theme.colors.synced : theme.colors.pending 
            }]}>
              <Feather 
                name={originalNote.synced ? "check" : "clock"} 
                size={12} 
                color={theme.colors.white} 
              />
              <Text style={styles.statusText}>
                {originalNote.synced ? 'Synced' : 'Not synced'}
              </Text>
            </View>
            
            <Text style={[styles.lastUpdated, { color: theme.colors.textSecondary }]}>
              Last updated: {new Date(originalNote.updatedAt).toLocaleString()}
            </Text>
          </View>
          
          <TextInput
            style={[styles.titleInput, { 
              color: theme.colors.text,
              borderBottomColor: theme.colors.divider
            }]}
            placeholder="Title"
            placeholderTextColor={theme.colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          
          <TextInput
            style={[styles.contentInput, { color: theme.colors.text }]}
            placeholder="Note content..."
            placeholderTextColor={theme.colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
        
        <View style={styles.footer}>
          {!isConnected && (
            <View style={[styles.offlineIndicator, { backgroundColor: theme.colors.pending }]}>
              <Feather name="wifi-off" size={14} color={theme.colors.white} />
              <Text style={styles.offlineText}>Changes will be saved offline</Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <Button 
              title="Cancel" 
              type="outline" 
              onPress={() => navigation.goBack()} 
              style={{ marginRight: 12 }}
            />
            <Button 
              title="Save" 
              onPress={handleSave} 
              loading={saving}
              disabled={!title.trim() || (title === originalNote.title && content === originalNote.content)}
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  lastUpdated: {
    fontSize: 12,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    padding: 8,
    borderBottomWidth: 1,
  },
  contentInput: {
    fontSize: 18,
    flex: 1,
    padding: 8,
    minHeight: 200,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
  },
});
