import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { C } from '../constants/theme';
import { apiGet } from '../api/client';

const WEB_INTEGRATIONS_URL = 'https://app.tackpilot.com/settings/integrations';

type ConnectorMeta = {
  id: string;
  apiKey: string;
  name: string;
  category: string;
  description: string;
  iconLetter: string;
  iconColor: string;
  iconBg: string;
};

const CONNECTORS: ConnectorMeta[] = [
  {
    id: 'stripe',
    apiKey: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    description: 'Send invoices and accept payments.',
    iconLetter: 'S',
    iconColor: '#635BFF',
    iconBg: '#EDECFE',
  },
  {
    id: 'quickbooks',
    apiKey: 'quickbooks',
    name: 'QuickBooks',
    category: 'Accounting',
    description: 'Sync invoices, payments, and customer records.',
    iconLetter: 'Q',
    iconColor: '#2CA01C',
    iconBg: '#E5F4E2',
  },
  {
    id: 'google-cal',
    apiKey: 'google_calendar',
    name: 'Google Calendar',
    category: 'Calendar',
    description: 'Two-way sync between TackPilot jobs and Google Calendar.',
    iconLetter: 'G',
    iconColor: '#4285F4',
    iconBg: '#E5EEFD',
  },
  {
    id: 'gmail',
    apiKey: 'gmail',
    name: 'Gmail',
    category: 'Email',
    description: 'Scan inbound leads from your inbox.',
    iconLetter: 'G',
    iconColor: '#EA4335',
    iconBg: '#FDE8E7',
  },
  {
    id: 'outlook',
    apiKey: 'outlook_calendar',
    name: 'Outlook',
    category: 'Calendar',
    description: 'Two-way sync with Outlook Calendar and O365 contacts.',
    iconLetter: 'O',
    iconColor: '#0078D4',
    iconBg: '#E1EEFA',
  },
  {
    id: 'outlook-mail',
    apiKey: 'outlook_mail',
    name: 'Outlook Mail',
    category: 'Email',
    description: 'Scan inbound leads from Outlook.',
    iconLetter: 'O',
    iconColor: '#0078D4',
    iconBg: '#E1EEFA',
  },
  {
    id: 'zoom',
    apiKey: 'zoom',
    name: 'Zoom',
    category: 'Meetings',
    description: 'Auto-schedule site walk video calls.',
    iconLetter: 'Z',
    iconColor: '#2D8CFF',
    iconBg: '#E4F0FF',
  },
  {
    id: 'hubspot',
    apiKey: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    description: 'Push customer records and deal stages to HubSpot.',
    iconLetter: 'H',
    iconColor: '#FF7A59',
    iconBg: '#FFE9E1',
  },
  {
    id: 'slack',
    apiKey: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: "Get TackPilot updates in your team's Slack channels.",
    iconLetter: 'S',
    iconColor: '#4A154B',
    iconBg: '#EFE3F0',
  },
];

export default function ConnectorsScreen() {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<Record<string, unknown>>('/v1/integrations/status');
      const map: Record<string, boolean> = {};
      for (const [key, val] of Object.entries(res)) {
        if (typeof val === 'object' && val !== null && 'connected' in val) {
          map[key] = !!(val as Record<string, unknown>).connected;
        } else if (typeof val === 'boolean') {
          map[key] = val;
        }
      }
      setStatuses(map);
    } catch {
      // Fall back to empty — rows will show "Connect →"
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStatuses();
    }, [fetchStatuses]),
  );

  const openOnWeb = () => {
    void Linking.openURL(WEB_INTEGRATIONS_URL);
  };

  const connectedCount = CONNECTORS.filter(
    (c) => statuses[c.apiKey],
  ).length;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchStatuses} tintColor={C.muted} />
      }
    >
      <View style={styles.header}>
        <View style={styles.eyebrowRow}>
          <MaterialCommunityIcons
            name="power-plug-outline"
            size={14}
            color={C.muted}
          />
          <Text style={styles.eyebrow}>INTEGRATIONS</Text>
        </View>
        <Text style={styles.h2}>Connect the tools you already use.</Text>
        <Text style={styles.subtitle}>
          {connectedCount > 0
            ? `${connectedCount} connected · ${CONNECTORS.length - connectedCount} available`
            : 'One-click connect via OAuth — no data leaves your account.'}
        </Text>
      </View>

      <TouchableOpacity
        onPress={openOnWeb}
        activeOpacity={0.85}
        style={styles.banner}
      >
        <View style={styles.bannerIcon}>
          <Ionicons name="open-outline" size={16} color={C.blue} />
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Manage on the web</Text>
          <Text style={styles.bannerBody}>
            Connecting new tools needs OAuth — open the dashboard to authorize.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.blue} />
      </TouchableOpacity>

      <View style={styles.section}>
        {loading && Object.keys(statuses).length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={C.ink} />
          </View>
        ) : (
          CONNECTORS.map((c, idx) => {
            const connected = !!statuses[c.apiKey];
            return (
              <ConnectorRow
                key={c.id}
                connector={c}
                connected={connected}
                isLast={idx === CONNECTORS.length - 1}
                onTap={openOnWeb}
              />
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function ConnectorRow({
  connector,
  connected,
  isLast,
  onTap,
}: {
  connector: ConnectorMeta;
  connected: boolean;
  isLast: boolean;
  onTap: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onTap}
      activeOpacity={0.6}
      style={[styles.row, !isLast && styles.rowBorder]}
    >
      <View style={[styles.iconTile, { backgroundColor: connector.iconBg }]}>
        <Text style={[styles.iconLetter, { color: connector.iconColor }]}>
          {connector.iconLetter}
        </Text>
      </View>

      <View style={styles.rowText}>
        <View style={styles.titleLine}>
          <Text style={styles.name} numberOfLines={1}>
            {connector.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            · {connector.category}
          </Text>
        </View>
        <Text style={styles.description}>{connector.description}</Text>
      </View>

      <View style={styles.rightCol}>
        {connected ? (
          <View style={styles.statusPill}>
            <Ionicons name="checkmark" size={11} color={C.green} />
            <Text style={styles.statusPillText}>Connected</Text>
          </View>
        ) : (
          <Text style={styles.connectLink}>Connect →</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 16,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 1.4,
  },
  h2: {
    fontSize: 22,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 8,
    lineHeight: 18,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: C.blueSoft,
    borderRadius: 14,
    marginBottom: 16,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.blueDeep,
  },
  bannerBody: {
    fontSize: 12,
    color: C.ink2,
    marginTop: 2,
  },
  section: {
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    paddingHorizontal: 14,
  },
  loadingBox: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLetter: {
    fontSize: 16,
    fontWeight: '900',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  category: {
    fontSize: 11,
    color: C.faded,
  },
  description: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
    lineHeight: 17,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: C.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.green,
  },
  connectLink: {
    fontSize: 12,
    fontWeight: '700',
    color: C.blue,
  },
});
