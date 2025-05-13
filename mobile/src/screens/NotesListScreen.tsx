import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import EmptyState from '../components/EmptyState';
import NoteCard from '../components/NoteCard';
import OfflineBanner from '../components/OfflineBanner';
import { useNetwork } from '../context/NetworkContext';
import { useNotes } from '../context/NotesContext';
import useTheme from '../hooks/useTheme';
import * as api from '../services/api';

export default function NotesListScreen() {
  const theme = useTheme();
  const { notes, loading, unsyncedNotes, setNotes, syncNotes } = useNotes();
  const { isConnected } = useNetwork();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch notes when component mounts and when connection is restored
  useEffect(() => {
    if (isConnected) {
      fetchNotes();
    }
  }, [isConnected]);

  // Auto-sync when connection is restored and there are unsynced notes
  useEffect(() => {
    if (isConnected && unsyncedNotes.length > 0) {
      handleSync();
    }
  }, [isConnected, unsyncedNotes.length]);

  const fetchNotes = async () => {
    try {
      const remoteNotes = await api.fetchNotes();
      setNotes(remoteNotes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      // Handle error (maybe show a toast message)
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotes();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSync = async () => {
    if (isSyncing || unsyncedNotes.length === 0) return;
    
    setIsSyncing(true);
    try {
      const syncedNotes = await api.syncNotes(unsyncedNotes);
      await syncNotes(syncedNotes);
      await fetchNotes(); // Refresh the list after sync
    } catch (error) {
      console.error('Sync failed:', error);
      // Handle error (maybe show a toast message)
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredNotes = searchQuery 
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  const renderItem = ({ item }) => (
    <NoteCard 
      note={item} 
      onPress={() => navigation.navigate('EditNote', { noteId: item.id })}
    />
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <OfflineBanner />
      
      <View style={styles.searchBarContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.lightGray }]}>
          <Feather name="search" size={18} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search notes..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredNotes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<EmptyState message="No notes found" />}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreateNote')}
      >
        <Feather name="plus" size={24} color={theme.colors.white} />
      </TouchableOpacity>
      
      {unsyncedNotes.length > 0 && (
        <TouchableOpacity
          style={[styles.syncStatus, { 
            backgroundColor: isConnected ? theme.colors.primary : theme.colors.pending,
            opacity: isSyncing ? 0.8 : 1
          }]}
          onPress={isConnected ? handleSync : null}
          disabled={!isConnected || isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Feather 
              name={isConnected ? "refresh-cw" : "clock"} 
              size={14} 
              color={theme.colors.white} 
            />
          )}
          <Text style={styles.syncText}>
            {isConnected 
              ? `Sync ${unsyncedNotes.length} note${unsyncedNotes.length === 1 ? '' : 's'}` 
              : `${unsyncedNotes.length} note${unsyncedNotes.length === 1 ? '' : 's'} pending sync`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
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
  searchBarContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  syncStatus: {
    position: 'absolute',
    bottom: 88,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  syncText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
});