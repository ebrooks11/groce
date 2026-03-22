import React, { useMemo, useState } from 'react';
import {
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import AddItemModal from '../components/AddItemModal';
import { CATEGORY_ORDER } from '../constants/categories';
import { CATEGORY_LABELS } from '../constants/categories';
import { Item } from '../types';

export default function ActiveListScreen() {
  const { state, dispatch } = useAppContext();
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>();

  const { activeList, savedLists } = state;

  const hasChecked = activeList.items.some(i => i.checked);

  const sections = useMemo(
    () =>
      CATEGORY_ORDER
        .map(cat => ({
          category: cat,
          title: CATEGORY_LABELS[cat],
          data: activeList.items.filter(i => i.category === cat),
        }))
        .filter(s => s.data.length > 0),
    [activeList.items]
  );

  function openAdd() {
    setEditingItem(undefined);
    setModalVisible(true);
  }

  function openEdit(item: Item) {
    setEditingItem(item);
    setModalVisible(true);
  }

  function handleSave(itemData: Omit<Item, 'id' | 'checked'>) {
    if (editingItem) {
      dispatch({
        type: 'ACTIVE_UPDATE_ITEM',
        payload: { item: { ...editingItem, ...itemData } },
      });
    } else {
      dispatch({ type: 'ACTIVE_ADD_ITEM', payload: { item: itemData } });
    }
  }

  function handleToggle(itemId: string) {
    dispatch({ type: 'ACTIVE_TOGGLE_ITEM', payload: { itemId } });
  }

  function handleClearChecked() {
    Alert.alert('Clear checked items?', 'Items will be unchecked, not deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        onPress: () => dispatch({ type: 'ACTIVE_CLEAR_CHECKED' }),
      },
    ]);
  }

  function handleAddSavedList() {
    if (savedLists.length === 0) {
      Alert.alert(
        'No saved lists',
        'Go to the Lists tab to create a list of items you shop for regularly.'
      );
      return;
    }
    const options = savedLists.map(l => ({
      text: l.name,
      onPress: () => {
        dispatch({ type: 'ADD_SAVED_TO_ACTIVE', payload: { savedListId: l.id } });
        Alert.alert('Added!', `"${l.name}" items have been added to your list.`);
      },
    }));
    Alert.alert('Add a List', 'Choose a list to add to your shopping list', [
      ...options,
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Shopping</Text>
        <View style={styles.headerActions}>
          {hasChecked && (
            <TouchableOpacity onPress={handleClearChecked} hitSlop={8}>
              <Text style={styles.clearText}>Clear Checked</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {activeList.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={48} color="#C6C6C8" />
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptySubtitle}>
            Tap + to add items, or tap the list icon to add a saved list.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                {section.title.toUpperCase()}
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const qtyLabel =
              item.quantity != null
                ? item.unit
                  ? `${item.quantity} ${item.unit}`
                  : `${item.quantity}`
                : item.unit ?? null;

            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => openEdit(item)}
                activeOpacity={0.6}
              >
                <TouchableOpacity
                  style={styles.checkboxHitArea}
                  onPress={() => handleToggle(item.id)}
                  hitSlop={8}
                >
                  <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                    {item.checked && <View style={styles.checkmark} />}
                  </View>
                </TouchableOpacity>
                <View style={styles.rowText}>
                  <Text
                    style={[styles.itemName, item.checked && styles.itemNameChecked]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {qtyLabel && (
                    <Text style={[styles.itemQty, item.checked && styles.itemQtyChecked]}>
                      {qtyLabel}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
          stickySectionHeadersEnabled
        />
      )}

      {/* FABs */}
      <View style={[styles.fabRow, { bottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={styles.fabSecondary}
          onPress={handleAddSavedList}
          activeOpacity={0.8}
        >
          <Ionicons name="bookmark-outline" size={22} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <AddItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        initialValues={editingItem}
        title={editingItem ? 'Edit Item' : 'Add Item'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clearText: {
    fontSize: 15,
    color: '#FF3B30',
    fontWeight: '500',
  },
  sectionHeader: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  checkboxHitArea: {
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C6C6C8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  checkmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  rowText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  itemQty: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  itemQtyChecked: {
    color: '#C6C6C8',
  },
  fabRow: {
    position: 'absolute',
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  fabSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
