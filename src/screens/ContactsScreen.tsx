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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { apiRequest } from '../api/client';

interface Contact {
  id: string;
  name: string;
  trade?: string;
  role?: string;
  phone?: string;
}

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchContacts = useCallback(async () => {
    try {
      const res = await apiRequest('/v1/contacts');
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : data.contacts ?? []);
    } catch {
      setContacts([]);
    }
  }, []);

  useEffect(() => {
    fetchContacts().finally(() => setLoading(false));
  }, [fetchContacts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  }, [fetchContacts]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  const query = search.toLowerCase().trim();
  const filtered = query
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.trade && c.trade.toLowerCase().includes(query)) ||
          (c.role && c.role.toLowerCase().includes(query)) ||
          (c.phone && c.phone.includes(query)),
      )
    : contacts;

  if (contacts.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="people-outline" size={56} color={COLORS.gray} style={{ marginBottom: 12 }} />
        <Text style={styles.emptyTitle}>No contacts yet</Text>
        <Text style={styles.emptySubtext}>Your contacts will appear here once added.</Text>
      </View>
    );
  }

  const renderContact = ({ item }: { item: Contact }) => {
    const subtitle = item.trade || item.role;
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.contactName} numberOfLines={1}>
            {item.name}
          </Text>
          {subtitle ? (
            <Text style={styles.trade} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          {item.phone ? (
            <Text style={styles.phone} numberOfLines={1}>
              {item.phone}
            </Text>
          ) : null}
        </View>
        {item.phone ? (
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(item.phone!)}
            activeOpacity={0.6}
          >
            <Ionicons name="call" size={22} color={COLORS.userBubble} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={COLORS.placeholder}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.navy}
          />
        }
      />
    </View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
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
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 3,
  },
  trade: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.userBubble,
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    color: COLORS.gray,
  },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
