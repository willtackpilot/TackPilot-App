import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { apiRequest } from '../api/client';

interface Job {
  id: string;
  title: string;
  status: string;
  location?: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FFF3CD', text: '#856404' },
  in_progress: { bg: '#D6EAFF', text: '#004085' },
  completed: { bg: '#D4EDDA', text: '#155724' },
};

function getStatusStyle(status: string) {
  const key = status.toLowerCase().replace(/[\s-]+/g, '_');
  return STATUS_STYLES[key] ?? { bg: COLORS.lightGray, text: COLORS.gray };
}

function formatStatus(status: string) {
  return status
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await apiRequest('/v1/jobs');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : data.jobs ?? []);
    } catch {
      // keep current list on error
    }
  }, []);

  useEffect(() => {
    fetchJobs().finally(() => setLoading(false));
  }, [fetchJobs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, [fetchJobs]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Jobs</Text>
        <Text style={styles.emptySubtext}>Your jobs will appear here</Text>
      </View>
    );
  }

  const renderJob = ({ item }: { item: Job }) => {
    const badge = getStatusStyle(item.status);
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardContent}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.cardRow}>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {formatStatus(item.status)}
              </Text>
            </View>
            {item.location ? (
              <Text style={styles.location} numberOfLines={1}>
                {item.location}
              </Text>
            ) : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.id}
      renderItem={renderJob}
      contentContainerStyle={styles.list}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.navy}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.gray,
  },
  list: {
    padding: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  location: {
    fontSize: 13,
    color: COLORS.gray,
    flexShrink: 1,
  },
});
