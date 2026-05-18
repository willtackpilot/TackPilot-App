import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../constants/theme';

export type ActionSheetItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
};

export default function ActionSheet({
  visible,
  onClose,
  title,
  items,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  items: ActionSheetItem[];
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.card,
            { paddingBottom: insets.bottom + 12 },
          ]}
        >
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {items.map((it, i) => (
            <TouchableOpacity
              key={it.key}
              onPress={() => {
                onClose();
                it.onPress();
              }}
              activeOpacity={0.6}
              style={[styles.row, i === items.length - 1 && styles.rowLast]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={it.icon} size={18} color={C.ink} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.label}>{it.label}</Text>
                {it.subtitle ? (
                  <Text style={styles.subtitle}>{it.subtitle}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.faded} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.6}
            style={styles.cancelRow}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10,15,30,0.32)',
  },
  card: {
    backgroundColor: C.canvas,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.sep,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.inset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  subtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  cancelRow: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: C.inset,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.muted,
  },
});
