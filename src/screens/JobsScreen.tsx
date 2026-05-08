import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { apiRequest } from '../api/client';

interface Job {
  id: string;
  title: string;
  status: string;
  location?: string;
}

const STATUS_TONES: Record<string, { fg: string; bg: string }> = {
  pending: { fg: C.amber, bg: C.amberSoft },
  in_progress: { fg: C.blue, bg: C.blueSoft },
  active: { fg: C.green, bg: C.greenSoft },
  completed: { fg: C.green, bg: C.greenSoft },
  delayed: { fg: C.amber, bg: C.amberSoft },
};

function getStatusTone(status: string) {
  const key = status.toLowerCase().replace(/[\s-]+/g, '_');
  return STATUS_TONES[key] ?? { fg: C.muted, bg: C.inset };
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
  const [search, setSearch] = useState('');

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
        <ActivityIndicator size="large" color={C.ink} />
      </View>
    );
  }

  const query = search.toLowerCase().trim();
  const filtered = query
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(query) ||
          (j.location && j.location.toLowerCase().includes(query)),
      )
    : jobs;

  if (jobs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.h1}>Jobs</Text>
        <View style={styles.emptyBox}>
          <Ionicons name="briefcase-outline" size={36} color={C.faded} style={{ marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>No jobs yet</Text>
          <Text style={styles.emptySubtext}>
            When you create or get assigned a job, it will show up here.
          </Text>
        </View>
      </View>
    );
  }

  const renderJob = ({ item }: { item: Job }) => {
    const tone = getStatusTone(item.status);
    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.7}>
        <View style={styles.rowText}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.rowMeta}>
            <View style={[styles.badge, { backgroundColor: tone.bg }]}>
              <Text style={[styles.badgeText, { color: tone.fg }]}>
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
        <Ionicons name="chevron-forward" size={18} color={C.faded} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.h1}>Jobs</Text>
        <Text style={styles.subtitle}>
          {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
        </Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={C.faded} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs"
          placeholderTextColor={C.faded}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.ink}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  empty: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: C.bg,
  },
  emptyBox: {
    marginTop: 32,
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  h1: {
    fontSize: 30,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: C.muted,
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.canvas,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.sep,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.ink,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
    marginBottom: 4,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  location: {
    fontSize: 12,
    color: C.muted,
    flexShrink: 1,
  },
  separator: {
    height: 1,
    backgroundColor: C.sep,
  },
});
