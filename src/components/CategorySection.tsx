import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Category, Item } from '../types';
import { CATEGORY_LABELS } from '../constants/categories';
import ItemRow from './ItemRow';

interface CategorySectionProps {
  category: Category;
  items: Item[];
  onPressItem: (item: Item) => void;
  onToggleItem?: (itemId: string) => void;
}

export default function CategorySection({
  category,
  items,
  onPressItem,
  onToggleItem,
}: CategorySectionProps) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerText}>{CATEGORY_LABELS[category].toUpperCase()}</Text>
      </View>
      {items.map(item => (
        <ItemRow
          key={item.id}
          item={item}
          onPress={() => onPressItem(item)}
          onToggle={onToggleItem ? () => onToggleItem(item.id) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
});
