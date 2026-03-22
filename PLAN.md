# Groce — React Native Grocery List App
## Implementation Plan

---

## 1. Project Overview

Groce is an iOS-only grocery list app built with Expo (managed workflow). It supports multiple grocery lists, a recipe library that can push ingredients into grocery lists, per-item categories and quantities, and an active shopping mode. All data is stored locally on the device using AsyncStorage. No authentication, no backend.

---

## 2. Tech Stack

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

## 3. File Structure

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
    │   ├── ListsScreen.tsx
    │   ├── GroceryListScreen.tsx
    │   ├── RecipesScreen.tsx
    │   └── RecipeDetailScreen.tsx
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

## 4. Data Model

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
  checked: boolean;
}

export interface GroceryList {
  id: string;
  name: string;
  items: Item[];
  createdAt: number;
}

export interface RecipeList {
  id: string;
  name: string;
  items: Item[];
  createdAt: number;
}

export interface AppState {
  groceryLists: GroceryList[];
  recipeLists: RecipeList[];
}
```

---

## 5. State Actions

```typescript
type Action =
  | { type: 'ADD_LIST';           payload: { name: string } }
  | { type: 'RENAME_LIST';        payload: { id: string; name: string } }
  | { type: 'DELETE_LIST';        payload: { id: string } }
  | { type: 'ADD_ITEM';           payload: { listId: string; item: Omit<Item, 'id' | 'checked'> } }
  | { type: 'UPDATE_ITEM';        payload: { listId: string; item: Item } }
  | { type: 'DELETE_ITEM';        payload: { listId: string; itemId: string } }
  | { type: 'TOGGLE_ITEM';        payload: { listId: string; itemId: string } }
  | { type: 'CLEAR_CHECKED';      payload: { listId: string } }
  | { type: 'ADD_RECIPE';         payload: { name: string } }
  | { type: 'RENAME_RECIPE';      payload: { id: string; name: string } }
  | { type: 'DELETE_RECIPE';      payload: { id: string } }
  | { type: 'ADD_RECIPE_ITEM';    payload: { recipeId: string; item: Omit<Item, 'id' | 'checked'> } }
  | { type: 'UPDATE_RECIPE_ITEM'; payload: { recipeId: string; item: Item } }
  | { type: 'DELETE_RECIPE_ITEM'; payload: { recipeId: string; itemId: string } }
  | { type: 'ADD_RECIPE_TO_LIST'; payload: { recipeId: string; listId: string } }
  | { type: 'LOAD_STATE';         payload: AppState };
```

**`ADD_RECIPE_TO_LIST` merge logic:** For each recipe item, check if target list already has an item with the same name (case-insensitive) + category. If yes and both have numeric quantities, sum them. If yes but quantities differ, leave existing unchanged. If no match, append a copy with a new id and `checked: false`.

**`CLEAR_CHECKED`:** Sets `checked: false` on all items (does NOT delete them — enables list reuse).

---

## 6. Navigation Structure

```
App.tsx
└── NavigationContainer
    └── BottomTabNavigator
        ├── Tab: Lists
        │   └── NativeStackNavigator
        │       ├── ListsScreen
        │       └── GroceryListScreen  (param: listId)
        └── Tab: Recipes
            └── NativeStackNavigator
                ├── RecipesScreen
                └── RecipeDetailScreen  (param: recipeId)
```

Modals (`AddItemModal`) use React Native's `Modal` component — not navigation screens — to keep the nav graph simple.

---

## 7. Screen Specs

### ListsScreen
- `FlatList` of grocery lists sorted by `createdAt` desc
- Each row: list name + item count
- Swipe-to-delete via `Swipeable` (react-native-gesture-handler)
- Header "+" → `Alert.prompt` to name the new list → dispatch `ADD_LIST`
- Tap row → navigate to `GroceryListScreen`
- Empty state: "No lists yet. Tap + to create one."

### GroceryListScreen
- `SectionList` grouped by category (only categories with items shown, in fixed order)
- Tap item → toggle checked (strikethrough + opacity)
- Header right: rename (pencil) + "Clear Checked" (shown only when items are checked)
- FAB (bottom-right) opens `AddItemModal` to add a new item
- Tap existing item opens `AddItemModal` in edit mode

### AddItemModal (shared)
- Fields: Name (TextInput, required, auto-focused), Category (horizontal pill selector, default "Other"), Quantity (numeric TextInput, optional), Unit (horizontal pill selector, optional)
- Save disabled while name is empty
- Used by both grocery lists and recipe detail screens

### RecipesScreen
- Mirrors ListsScreen but for recipes
- "+" → prompt for name → dispatch `ADD_RECIPE` → navigate to `RecipeDetailScreen`

### RecipeDetailScreen
- Flat `FlatList` of ingredients (no checkboxes — recipes have no shopping mode)
- Header "Add to List" button → `Alert` with all grocery list names as options → dispatch `ADD_RECIPE_TO_LIST` → confirmation alert
- If no grocery lists exist: alert "Create a grocery list first"
- FAB opens `AddItemModal` in add mode; tap ingredient opens in edit mode

---

## 8. Key Components

### ItemRow
```
[ Circle checkbox? ] [ Name   qty unit ]
```
- Strikethrough + muted opacity when `checked`
- `onToggle` is optional (undefined = recipe view, no checkbox)

### CategorySection
- All-caps section header in muted color
- Lists `ItemRow` components beneath it

---

## 9. Styling

No third-party UI library. All `StyleSheet.create`.

- Background: `#FFFFFF` / `#F2F2F7` (iOS grouped)
- Accent: `#007AFF` (iOS blue)
- Destructive: `#FF3B30` (iOS red)
- Secondary text: `#8E8E93`
- 8pt spacing grid
- FAB: 56×56 circle, position `absolute`, `bottom: 32`, `right: 24`, shadow
- Modals: `KeyboardAvoidingView` + `behavior="padding"`, `animationType="slide"` (slide up)
- Safe area: use `useSafeAreaInsets()` to offset FAB above tab bar

---

## 10. AsyncStorage Persistence

```typescript
// src/storage/storage.ts
const STORAGE_KEY = '@groce/appState';
export async function loadState(): Promise<AppState | null>
export async function saveState(state: AppState): Promise<void>
```

- On boot: `loadState()` in `useEffect` → dispatch `LOAD_STATE`
- On every state change: debounced `saveState` (300 ms) to avoid thrashing

---

## 11. Implementation Order

1. `npx create-expo-app groce --template expo-template-blank-typescript`
2. Install dependencies (React Navigation, AsyncStorage, gesture-handler, safe-area-context)
3. `src/types/index.ts` + constants files
4. `src/storage/storage.ts`
5. `src/context/AppContext.tsx` (full reducer + provider + persistence hooks)
6. `src/navigation/index.tsx` (tabs + stacks)
7. `ListsScreen` + swipe-to-delete
8. `GroceryListScreen` + SectionList
9. `AddItemModal` with pill selectors
10. `RecipesScreen`
11. `RecipeDetailScreen` + "Add to List" flow
12. Polish: empty states, rename flows, safe area, keyboard handling

---

## 12. QA Checklist

- [ ] Create list, add items in multiple categories → verify grouping
- [ ] Check/uncheck items → strikethrough visible
- [ ] Clear checked → all items remain, unchecked
- [ ] Swipe-delete a list → gone
- [ ] Rename list
- [ ] Create recipe, add ingredients
- [ ] Add recipe to list → items appear correctly grouped
- [ ] Add recipe to list with overlapping items → quantities summed
- [ ] Kill + reopen app → all data persisted
- [ ] "Add to List" with no grocery lists → alert shown
