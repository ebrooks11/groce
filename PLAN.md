# Groce — React Native Grocery List App
## Implementation Plan

---

## 1. Project Overview

Groce is an iOS-only grocery list app built with Expo (managed workflow). It has one **Active List** (your current shopping trip) and a library of **Saved Lists** — reusable named lists that can be recipes, weekly essentials, or anything else. You can add items to the active list individually or by merging in any saved list. All data is stored locally on the device using AsyncStorage. No authentication, no backend.

---

## 2. Core Concept

There is only one `GroceryList` type. The distinction is:

- **Active List** — a single, persistent shopping list. Items can be checked off. There is always exactly one.
- **Saved Lists** — a library of reusable lists (e.g. "Pasta Bolognese", "Weekly Essentials", "Trader Joe's Staples"). Items are never checked off here. Tapping "Add to Active List" merges a saved list's items into the active list.

---

## 3. Tech Stack

| Concern | Package |
|---|---|
| Framework | React Native via Expo (managed, SDK 51+) |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation v6 (`@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`) |
| Persistence | `@react-native-async-storage/async-storage` |
| State | React Context + `useReducer` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Status Bar | `expo-status-bar` |

---

## 4. File Structure

```
groce/
├── App.tsx
├── app.json
├── tsconfig.json
└── src/
    ├── context/
    │   └── AppContext.tsx          # Global state, useReducer, context provider
    ├── navigation/
    │   └── index.tsx               # Tab navigator + stack navigators
    ├── screens/
    │   ├── ActiveListScreen.tsx    # Tab 1: current shopping list
    │   ├── SavedListsScreen.tsx    # Tab 2: library of saved lists
    │   └── SavedListDetailScreen.tsx
    ├── components/
    │   ├── AddItemModal.tsx        # Shared add/edit item modal
    │   ├── CategorySection.tsx
    │   └── ItemRow.tsx
    ├── storage/
    │   └── storage.ts
    ├── types/
    │   └── index.ts
    └── constants/
        ├── categories.ts
        └── units.ts
```

---

## 5. Data Model

```typescript
export type Category =
  | 'Produce' | 'Dairy' | 'Meat' | 'Bakery'
  | 'Frozen' | 'Pantry' | 'Beverages' | 'Other';

export type Unit =
  | 'lbs' | 'oz' | 'kg' | 'g'
  | 'each' | 'pack' | 'can' | 'box'
  | 'bottle' | 'bunch' | 'bag' | '';

export interface Item {
  id: string;
  name: string;
  category: Category;
  quantity?: number;
  unit?: Unit;
  checked: boolean;   // only meaningful on the active list
}

export interface GroceryList {
  id: string;
  name: string;
  items: Item[];
  createdAt: number;
}

export interface AppState {
  activeList: GroceryList;       // always exactly one
  savedLists: GroceryList[];     // user's library of reusable lists
}
```

---

## 6. State Actions

```typescript
type Action =
  // Active list items
  | { type: 'ACTIVE_ADD_ITEM';    payload: { item: Omit<Item, 'id' | 'checked'> } }
  | { type: 'ACTIVE_UPDATE_ITEM'; payload: { item: Item } }
  | { type: 'ACTIVE_DELETE_ITEM'; payload: { itemId: string } }
  | { type: 'ACTIVE_TOGGLE_ITEM'; payload: { itemId: string } }
  | { type: 'ACTIVE_CLEAR_CHECKED' }
  | { type: 'ACTIVE_CLEAR_ALL' }
  // Merge a saved list into the active list
  | { type: 'ADD_SAVED_TO_ACTIVE'; payload: { savedListId: string } }
  // Saved lists
  | { type: 'CREATE_SAVED_LIST';  payload: { name: string } }
  | { type: 'RENAME_SAVED_LIST';  payload: { id: string; name: string } }
  | { type: 'DELETE_SAVED_LIST';  payload: { id: string } }
  // Items within a saved list
  | { type: 'SAVED_ADD_ITEM';     payload: { listId: string; item: Omit<Item, 'id' | 'checked'> } }
  | { type: 'SAVED_UPDATE_ITEM';  payload: { listId: string; item: Item } }
  | { type: 'SAVED_DELETE_ITEM';  payload: { listId: string; itemId: string } }
  // Persistence bootstrap
  | { type: 'LOAD_STATE';         payload: AppState };
```

**`ADD_SAVED_TO_ACTIVE` merge logic:** For each item in the saved list, check if the active list already has an item with the same `name` (case-insensitive) + `category`. If yes and both have numeric quantities, sum them. If yes but quantities are missing/mixed, leave the existing item unchanged. If no match, append a copy with a new `id` and `checked: false`.

**`ACTIVE_CLEAR_CHECKED`:** Sets `checked: false` on all items (does NOT delete — enables list reuse after a shopping trip).

**`ACTIVE_CLEAR_ALL`:** Removes all items from the active list (full reset).

---

## 7. Navigation Structure

```
App.tsx
└── NavigationContainer
    └── BottomTabNavigator
        ├── Tab: Active  (shopping cart icon)
        │   └── ActiveListScreen              (no stack needed)
        └── Tab: Lists   (bookmark/list icon)
            └── NativeStackNavigator
                ├── SavedListsScreen
                └── SavedListDetailScreen  (param: listId)
```

Modals (`AddItemModal`) use React Native's `Modal` component — not navigation screens.

---

## 8. Screen Specs

### ActiveListScreen (Tab 1)

The primary shopping view.

- `SectionList` of active list items grouped by category (only non-empty categories shown, in fixed order)
- Tap item → toggle checked (strikethrough + muted opacity)
- Header right: "Clear Checked" button (visible only when ≥1 item is checked)
- FAB (bottom-right) opens `AddItemModal` to add an item manually
- Tap existing item → `AddItemModal` in edit mode
- Long-press item → delete confirmation
- Below FAB or in a bottom action bar: "Add a List" button → `ActionSheet` showing all saved list names → dispatch `ADD_SAVED_TO_ACTIVE` → brief confirmation
- Empty state: "Your list is empty. Tap + to add items or add a saved list."

### SavedListsScreen (Tab 2)

The library of reusable lists.

- `FlatList` of saved lists sorted by name (or `createdAt`)
- Each row: list name + item count (e.g. "8 items")
- Header "+" → `Alert.prompt` for name → dispatch `CREATE_SAVED_LIST` → navigate to `SavedListDetailScreen`
- Tap row → navigate to `SavedListDetailScreen`
- Swipe-to-delete (with confirmation)
- Empty state: "No saved lists yet. Tap + to create one."

### SavedListDetailScreen

View/edit a saved list. No checkboxes — items are never checked here.

- Header title = list name, with rename button (pencil icon)
- "Add to Active List" button in header right → dispatch `ADD_SAVED_TO_ACTIVE` → confirmation alert → optionally navigate to the Active tab
- `FlatList` of items (no category grouping needed, but category is stored per item)
- FAB opens `AddItemModal` in add mode
- Tap item → `AddItemModal` in edit mode
- Long-press item → delete confirmation
- Empty state: "No items yet. Tap + to add one."

### AddItemModal (shared)

Used by both active list and saved list detail screens.

- Fields:
  1. **Name** — `TextInput`, auto-focused, required
  2. **Category** — horizontal scrollable pill selector, default `'Other'`
  3. **Quantity** — numeric `TextInput`, `keyboardType="decimal-pad"`, optional
  4. **Unit** — horizontal scrollable pill selector, optional (first option = no unit)
- Save button disabled while name is empty
- Presented as a bottom-sheet style modal (`animationType="slide"`)

---

## 9. Key Components

### ItemRow

```
[ Checkbox? ]  [ Name         qty unit ]
```
- `onToggle` is optional — when omitted (saved list view), no checkbox is rendered
- Checked state: strikethrough text + reduced opacity
- Qty + unit shown in secondary muted color

### CategorySection

- All-caps section header (small, muted, gray background)
- Lists `ItemRow` components beneath it
- Used as `renderSectionHeader` + `renderItem` in `SectionList`

---

## 10. Styling

No third-party UI library. All `StyleSheet.create`.

- Background: `#FFFFFF` / `#F2F2F7` (iOS grouped)
- Accent: `#007AFF` (iOS blue)
- Destructive: `#FF3B30` (iOS red)
- Secondary text: `#8E8E93`
- 8pt spacing grid
- FAB: 56×56 circle, `position: 'absolute'`, `bottom: 32`, `right: 24`, shadow
- Modals: `KeyboardAvoidingView` + `behavior="padding"`, `animationType="slide"`
- Safe area: `useSafeAreaInsets()` to offset FAB above tab bar

---

## 11. AsyncStorage Persistence

```typescript
const STORAGE_KEY = '@groce/appState';
export async function loadState(): Promise<AppState | null>
export async function saveState(state: AppState): Promise<void>
```

- On boot: `loadState()` in `useEffect` → dispatch `LOAD_STATE`. Show minimal loading state while hydrating.
- On state change: debounced `saveState` (300 ms) via `useRef` + `setTimeout`.
- Initial `activeList` (before any persisted state loads): `{ id: 'active', name: 'My List', items: [], createdAt: Date.now() }`.

---

## 12. Implementation Order

1. `npx create-expo-app groce --template expo-template-blank-typescript`
2. Install dependencies (React Navigation, AsyncStorage, gesture-handler, safe-area-context)
3. `src/types/index.ts` + constants files
4. `src/storage/storage.ts`
5. `src/context/AppContext.tsx` (reducer + provider + persistence)
6. `src/navigation/index.tsx` (two tabs + saved lists stack)
7. `SavedListsScreen` + swipe-to-delete
8. `SavedListDetailScreen`
9. `AddItemModal` with pill selectors
10. `ActiveListScreen` with SectionList + toggle + "Add a List" action
11. Polish: empty states, rename flows, safe area, merge confirmation

---

## 13. QA Checklist

- [ ] Active list: add items manually, verify category grouping
- [ ] Active list: check/uncheck items → strikethrough
- [ ] Active list: "Clear Checked" → items remain, unchecked
- [ ] Create a saved list, add items
- [ ] "Add to Active List" from saved list → items appear in active list grouped by category
- [ ] Merge saved list with overlapping items → quantities summed correctly
- [ ] Swipe-delete a saved list
- [ ] Rename a saved list
- [ ] Kill + reopen app → all data persisted (active list + saved lists)
- [ ] Active list empty state visible when no items
- [ ] Saved lists empty state visible when no saved lists
