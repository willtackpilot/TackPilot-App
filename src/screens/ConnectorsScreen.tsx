import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { C } from '../constants/theme';

type ConnectorStatus = 'connected' | 'available';

type Connector = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: ConnectorStatus;
  iconLetter: string;
  iconColor: string;
  iconBg: string;
};

const WEB_INTEGRATIONS_URL = 'https://app.tackpilot.com/settings/integrations';

const CONNECTORS: Connector[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    description:
      'Send invoices and accept payments. Funds settle to your bank in 2 days.',
    status: 'connected',
    iconLetter: 'S',
    iconColor: '#635BFF',
    iconBg: '#EDECFE',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'Accounting',
    description:
      'Sync invoices, payments, and customer records to QuickBooks Online.',
    status: 'connected',
    iconLetter: 'Q',
    iconColor: '#2CA01C',
    iconBg: '#E5F4E2',
  },
  {
    id: 'google-cal',
    name: 'Google Calendar',
    category: 'Calendar',
    description:
      'Two-way sync between TackPilot jobs and your Google Calendar.',
    status: 'connected',
    iconLetter: 'G',
    iconColor: '#4285F4',
    iconBg: '#E5EEFD',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    category: 'Calendar',
    description:
      'Two-way sync with Outlook Calendar and Office 365 contacts.',
    status: 'available',
    iconLetter: 'O',
    iconColor: '#0078D4',
    iconBg: '#E1EEFA',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    description: 'Push customer records and deal stages to HubSpot.',
    status: 'available',
    iconLetter: 'H',
    iconColor: '#FF7A59',
    iconBg: '#FFE9E1',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: "Get TackPilot updates in your team's Slack channels.",
    status: 'available',
    iconLetter: 'S',
    iconColor: '#4A154B',
    iconBg: '#EFE3F0',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    category: 'Banking',
    description:
      'Real-time bank transactions and balance in your Money view.',
    status: 'available',
    iconLetter: 'M',
    iconColor: '#5469D4',
    iconBg: '#E8EBFA',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    category: 'Files',
    description:
      'Save photos, signed estimates, and contracts to a Drive folder.',
    status: 'available',
    iconLetter: 'D',
    iconColor: '#1FA463',
    iconBg: '#E2F4EB',
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    category: 'Documents',
    description: 'Send contracts and estimates for e-signature via DocuSign.',
    status: 'available',
    iconLetter: 'D',
    iconColor: '#FFCC22',
    iconBg: '#FFF7DC',
  },
];

export default function ConnectorsScreen() {
  const openOnWeb = () => {
    void Linking.openURL(WEB_INTEGRATIONS_URL);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
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
          TackPilot syncs data from your accounting, calendar, and CRM tools.
          One-click connect via OAuth — no data leaves your account.
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
        {CONNECTORS.map((c, idx) => (
          <ConnectorRow
            key={c.id}
            connector={c}
            isLast={idx === CONNECTORS.length - 1}
            onTap={openOnWeb}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function ConnectorRow({
  connector,
  isLast,
  onTap,
}: {
  connector: Connector;
  isLast: boolean;
  onTap: () => void;
}) {
  const connected = connector.status === 'connected';
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
