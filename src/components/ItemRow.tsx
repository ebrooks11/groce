import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Item } from '../types';
import { UNIT_LABELS } from '../constants/units';

interface ItemRowProps {
  item: Item;
  onPress: () => void;
  onToggle?: () => void;
}

export default function ItemRow({ item, onPress, onToggle }: ItemRowProps) {
  const qtyLabel =
    item.quantity != null
      ? item.unit
        ? `${item.quantity} ${UNIT_LABELS[item.unit]}`
        : `${item.quantity}`
      : item.unit
      ? UNIT_LABELS[item.unit]
      : null;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      {onToggle != null && (
        <TouchableOpacity style={styles.checkboxHitArea} onPress={onToggle} hitSlop={8}>
          <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
            {item.checked && <View style={styles.checkmark} />}
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.textContainer}>
        <Text
          style={[styles.name, item.checked && styles.nameChecked]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        {qtyLabel && (
          <Text style={[styles.qty, item.checked && styles.qtyChecked]}>
            {qtyLabel}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  nameChecked: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  qty: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  qtyChecked: {
    color: '#C6C6C8',
  },
});
