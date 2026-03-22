import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { SavedListsStackParamList } from '../navigation';
import AddItemModal from '../components/AddItemModal';
import CategorySection from '../components/CategorySection';
import { CATEGORY_ORDER } from '../constants/categories';
import { Item } from '../types';

type Route = RouteProp<SavedListsStackParamList, 'SavedListDetail'>;
type Nav = NativeStackNavigationProp<SavedListsStackParamList, 'SavedListDetail'>;

export default function SavedListDetailScreen() {
  const { state, dispatch } = useAppContext();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>();

  const list = state.savedLists.find(l => l.id === route.params.listId);

  // Navigate back if list was deleted
  useLayoutEffect(() => {
    if (!list) {
      navigation.goBack();
      return;
    }
    navigation.setOptions({
      title: list.name,
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={handleAddToActive} hitSlop={8}>
            <Ionicons name="cart-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRename} hitSlop={8}>
            <Ionicons name="pencil-outline" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [list]);

  if (!list) return null;

  function handleRename() {
    Alert.prompt(
      'Rename List',
      undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (name?: string) => {
            if (!name?.trim()) return;
            dispatch({
              type: 'RENAME_SAVED_LIST',
              payload: { id: list!.id, name: name.trim() },
            });
          },
        },
      ],
      'plain-text',
      list!.name
    );
  }

  function handleAddToActive() {
    dispatch({ type: 'ADD_SAVED_TO_ACTIVE', payload: { savedListId: list!.id } });
    Alert.alert('Added!', `"${list!.name}" items have been added to your shopping list.`);
  }

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
        type: 'SAVED_UPDATE_ITEM',
        payload: { listId: list!.id, item: { ...editingItem, ...itemData } },
      });
    } else {
      dispatch({
        type: 'SAVED_ADD_ITEM',
        payload: { listId: list!.id, item: itemData },
      });
    }
  }

  function handleDeleteItem(itemId: string) {
    Alert.alert('Delete item?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          dispatch({
            type: 'SAVED_DELETE_ITEM',
            payload: { listId: list!.id, itemId },
          }),
      },
    ]);
  }

  // Group items by category
  const sections = useMemo(
    () =>
      CATEGORY_ORDER
        .map(cat => ({ category: cat, items: list.items.filter(i => i.category === cat) }))
        .filter(s => s.items.length > 0),
    [list.items]
  );

  return (
    <View style={styles.container}>
      {list.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={48} color="#C6C6C8" />
          <Text style={styles.emptyTitle}>No items yet</Text>
          <Text style={styles.emptySubtitle}>Tap + to add ingredients or items.</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={s => s.category}
          renderItem={({ item: section }) => (
            <CategorySection
              category={section.category}
              items={section.items}
              onPressItem={item => openEdit(item)}
              // no onToggleItem — saved lists have no checkboxes
            />
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={openAdd}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

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
  },
  fab: {
    position: 'absolute',
    right: 24,
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
});
