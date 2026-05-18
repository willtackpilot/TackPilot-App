import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  createNavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';
import ActionSheet, { type ActionSheetItem } from '../components/ActionSheet';
import type { RootStackParamList } from '../navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function navigate(name: keyof RootStackParamList) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(CommonActions.navigate({ name }));
}

type Ctx = {
  open: (items?: ActionSheetItem[]) => void;
};

const CreateMenuContext = createContext<Ctx>({ open: () => {} });

export function CreateMenuProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<ActionSheetItem[]>([]);

  const close = useCallback(() => setVisible(false), []);

  const defaults: ActionSheetItem[] = [
    {
      key: 'job',
      icon: 'hammer-outline',
      label: 'New job',
      subtitle: 'Title, address, schedule',
      onPress: () => navigate('NewJob'),
    },
    {
      key: 'event',
      icon: 'calendar-outline',
      label: 'New calendar event',
      subtitle: 'One-off meetings, site visits',
      onPress: () => navigate('NewEvent'),
    },
    {
      key: 'crew',
      icon: 'person-add-outline',
      label: 'Add crew',
      subtitle: 'Sub or contact',
      onPress: () => navigate('NewCrew'),
    },
    {
      key: 'invoice',
      icon: 'document-text-outline',
      label: 'New invoice',
      subtitle: 'Bill a customer',
      onPress: () => navigate('NewInvoice'),
    },
  ];

  const open = useCallback((custom?: ActionSheetItem[]) => {
    setItems(custom && custom.length > 0 ? custom : defaults);
    setVisible(true);
    // defaults references the stable navigationRef helper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CreateMenuContext.Provider value={{ open }}>
      {children}
      <ActionSheet
        visible={visible}
        onClose={close}
        title="Create"
        items={items}
      />
    </CreateMenuContext.Provider>
  );
}

export function useCreateMenu() {
  return useContext(CreateMenuContext);
}
