import React, { useRef } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { SavedListsStackParamList } from '../navigation';
import { GroceryList } from '../types';

type Nav = NativeStackNavigationProp<SavedListsStackParamList, 'SavedLists'>;

export default function SavedListsScreen() {
  const { state, dispatch } = useAppContext();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  function handleCreate() {
    Alert.prompt(
      'New List',
      'Enter a name for your list',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (name?: string) => {
            if (!name?.trim()) return;
            dispatch({ type: 'CREATE_SAVED_LIST', payload: { name: name.trim() } });
          },
        },
      ],
      'plain-text'
    );
  }

  function handleDelete(list: GroceryList) {
    swipeableRefs.current.get(list.id)?.close();
    Alert.alert(
      `Delete "${list.name}"?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch({ type: 'DELETE_SAVED_LIST', payload: { id: list.id } }),
        },
      ]
    );
  }

  function renderDeleteAction(list: GroceryList) {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(list)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  }

  const sorted = [...state.savedLists].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Lists</Text>
        <TouchableOpacity onPress={handleCreate} style={styles.addBtn} hitSlop={8}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={48} color="#C6C6C8" />
          <Text style={styles.emptyTitle}>No saved lists yet</Text>
          <Text style={styles.emptySubtitle}>
            Create lists for recipes, weekly essentials, and more.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: list }) => (
            <Swipeable
              ref={ref => {
                if (ref) swipeableRefs.current.set(list.id, ref);
                else swipeableRefs.current.delete(list.id);
              }}
              renderRightActions={() => renderDeleteAction(list)}
              overshootRight={false}
            >
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate('SavedListDetail', { listId: list.id })
                }
                activeOpacity={0.7}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{list.name}</Text>
                  <Text style={styles.rowCount}>
                    {list.items.length === 1
                      ? '1 item'
                      : `${list.items.length} items`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C6C6C8" />
              </TouchableOpacity>
            </Swipeable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  addBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  rowCount: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 16,
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
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
