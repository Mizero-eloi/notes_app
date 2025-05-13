import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useTheme from '../hooks/useTheme';

export default function NoteCard({ note, onPress }) {
  const theme  = useTheme();
  
  const getStatusColor = () => {
    return note.synced ? theme.colors.synced : theme.colors.pending;
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, theme.shadows.md, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {note.title}
        </Text>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
      </View>

      <Text style={[styles.content, { color: theme.colors.textSecondary }]} numberOfLines={3}>
        {note.content}
      </Text>
      
      <View style={styles.footer}>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
          {getFormattedDate(note.updatedAt)}
        </Text>
        <View style={styles.syncStatus}>
          {note.synced ? (
            <Feather name="check-circle" size={14} color={theme.colors.synced} />
          ) : (
            <Feather name="clock" size={14} color={theme.colors.pending} />
          )}
          <Text style={[styles.syncText, { color: note.synced ? theme.colors.synced : theme.colors.pending }]}>
            {note.synced ? 'Synced' : 'Pending'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  content: {
    fontSize: 16,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncText: {
    fontSize: 12,
    marginLeft: 4,
  },
});