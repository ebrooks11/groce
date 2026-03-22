import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Category, Item, Unit } from '../types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../constants/categories';
import { UNIT_LABELS, UNITS } from '../constants/units';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<Item, 'id' | 'checked'>) => void;
  initialValues?: Partial<Item>;
  title?: string;
}

const DEFAULT_CATEGORY: Category = 'Other';

export default function AddItemModal({
  visible,
  onClose,
  onSave,
  initialValues,
  title = 'Add Item',
}: AddItemModalProps) {
  const insets = useSafeAreaInsets();
  const nameRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<Unit>('');

  // Populate form when opening in edit mode
  useEffect(() => {
    if (visible) {
      setName(initialValues?.name ?? '');
      setCategory(initialValues?.category ?? DEFAULT_CATEGORY);
      setQuantity(initialValues?.quantity != null ? String(initialValues.quantity) : '');
      setUnit(initialValues?.unit ?? '');
      // Small delay so the modal animation finishes before focusing
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [visible]);

  function handleSave() {
    if (!name.trim()) return;
    const qty = parseFloat(quantity);
    onSave({
      name: name.trim(),
      category,
      quantity: !isNaN(qty) && quantity !== '' ? qty : undefined,
      unit: unit || undefined,
    });
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.headerBtn}
              disabled={!name.trim()}
            >
              <Text style={[styles.saveText, !name.trim() && styles.saveDisabled]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View style={styles.section}>
              <Text style={styles.label}>NAME</Text>
              <TextInput
                ref={nameRef}
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Item name"
                placeholderTextColor="#C6C6C8"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            {/* Quantity */}
            <View style={styles.section}>
              <Text style={styles.label}>QUANTITY</Text>
              <TextInput
                style={styles.qtyInput}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Optional"
                placeholderTextColor="#C6C6C8"
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>

            {/* Unit */}
            <View style={styles.section}>
              <Text style={styles.label}>UNIT</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pills}
              >
                {UNITS.map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.pill, unit === u && styles.pillSelected]}
                    onPress={() => setUnit(u)}
                  >
                    <Text
                      style={[styles.pillText, unit === u && styles.pillTextSelected]}
                    >
                      {UNIT_LABELS[u]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.label}>CATEGORY</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pills}
              >
                {CATEGORY_ORDER.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.pill, category === c && styles.pillSelected]}
                    onPress={() => setCategory(c)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        category === c && styles.pillTextSelected,
                      ]}
                    >
                      {CATEGORY_LABELS[c]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  headerBtn: {
    minWidth: 60,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'right',
  },
  saveDisabled: {
    color: '#C6C6C8',
  },
  scroll: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  qtyInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    width: 120,
  },
  pills: {
    paddingBottom: 4,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C6C6C8',
  },
  pillSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pillText: {
    fontSize: 14,
    color: '#000000',
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
