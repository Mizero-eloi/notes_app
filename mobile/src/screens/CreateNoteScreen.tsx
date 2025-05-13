import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import Button from '../components/Button';
import OfflineBanner from '../components/OfflineBanner';
import { useNetwork } from '../context/NetworkContext';
import { useNotes } from '../context/NotesContext';
import useTheme from '../hooks/useTheme';

export default function CreateNoteScreen() {
  const theme = useTheme();
  const { addNote } = useNotes();
  const { isConnected } = useNetwork();
  const navigation = useNavigation();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your note');
      return;
    }
    
    try {
      setSaving(true);
      await addNote({ title, content });
      setSaving(false);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save note:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <OfflineBanner />
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TextInput
            style={[styles.titleInput, { 
              color: theme.colors.text,
              borderBottomColor: theme.colors.divider
            }]}
            placeholder="Title"
            placeholderTextColor={theme.colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            autoFocus
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
              <Text style={styles.offlineText}>Note will be saved offline</Text>
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
              disabled={!title.trim()}
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
  scrollContent: {
    padding: 16,
    flexGrow: 1,
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