import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { AppState, GroceryList, Item } from '../types';
import { loadState, saveState } from '../storage/storage';

// ─── Actions ────────────────────────────────────────────────────────────────

type Action =
  // Active list items
  | { type: 'ACTIVE_ADD_ITEM'; payload: { item: Omit<Item, 'id' | 'checked'> } }
  | { type: 'ACTIVE_UPDATE_ITEM'; payload: { item: Item } }
  | { type: 'ACTIVE_DELETE_ITEM'; payload: { itemId: string } }
  | { type: 'ACTIVE_TOGGLE_ITEM'; payload: { itemId: string } }
  | { type: 'ACTIVE_CLEAR_CHECKED' }
  | { type: 'ACTIVE_CLEAR_ALL' }
  // Merge a saved list into the active list
  | { type: 'ADD_SAVED_TO_ACTIVE'; payload: { savedListId: string } }
  // Saved lists
  | { type: 'CREATE_SAVED_LIST'; payload: { name: string } }
  | { type: 'RENAME_SAVED_LIST'; payload: { id: string; name: string } }
  | { type: 'DELETE_SAVED_LIST'; payload: { id: string } }
  // Items within a saved list
  | { type: 'SAVED_ADD_ITEM'; payload: { listId: string; item: Omit<Item, 'id' | 'checked'> } }
  | { type: 'SAVED_UPDATE_ITEM'; payload: { listId: string; item: Item } }
  | { type: 'SAVED_DELETE_ITEM'; payload: { listId: string; itemId: string } }
  // Bootstrap
  | { type: 'LOAD_STATE'; payload: AppState };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Merge srcItems into destItems. Sums quantities for same name+category matches. */
function mergeItems(destItems: Item[], srcItems: Item[]): Item[] {
  const result = [...destItems];
  for (const src of srcItems) {
    const matchIdx = result.findIndex(
      d =>
        d.name.toLowerCase() === src.name.toLowerCase() &&
        d.category === src.category
    );
    if (matchIdx >= 0) {
      const match = result[matchIdx];
      if (
        typeof match.quantity === 'number' &&
        typeof src.quantity === 'number'
      ) {
        result[matchIdx] = { ...match, quantity: match.quantity + src.quantity };
      }
      // if quantities are missing/mixed, leave existing item unchanged
    } else {
      result.push({ ...src, id: newId(), checked: false });
    }
  }
  return result;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    // Active list ─────────────────────────────────────────────────────────────

    case 'ACTIVE_ADD_ITEM':
      return {
        ...state,
        activeList: {
          ...state.activeList,
          items: [
            ...state.activeList.items,
            { ...action.payload.item, id: newId(), checked: false },
          ],
        },
      };

    case 'ACTIVE_UPDATE_ITEM':
      return {
        ...state,
        activeList: {
          ...state.activeList,
          items: state.activeList.items.map(i =>
            i.id === action.payload.item.id ? action.payload.item : i
          ),
        },
      };

    case 'ACTIVE_DELETE_ITEM':
      return {
        ...state,
        activeList: {
          ...state.activeList,
          items: state.activeList.items.filter(i => i.id !== action.payload.itemId),
        },
      };

    case 'ACTIVE_TOGGLE_ITEM':
      return {
        ...state,
        activeList: {
          ...state.activeList,
          items: state.activeList.items.map(i =>
            i.id === action.payload.itemId ? { ...i, checked: !i.checked } : i
          ),
        },
      };

    case 'ACTIVE_CLEAR_CHECKED':
      return {
        ...state,
        activeList: {
          ...state.activeList,
          items: state.activeList.items.map(i => ({ ...i, checked: false })),
        },
      };

    case 'ACTIVE_CLEAR_ALL':
      return {
        ...state,
        activeList: { ...state.activeList, items: [] },
      };

    case 'ADD_SAVED_TO_ACTIVE': {
      const saved = state.savedLists.find(l => l.id === action.payload.savedListId);
      if (!saved) return state;
      return {
        ...state,
        activeList: {
          ...state.activeList,
          items: mergeItems(state.activeList.items, saved.items),
        },
      };
    }

    // Saved lists ─────────────────────────────────────────────────────────────

    case 'CREATE_SAVED_LIST': {
      const newList: GroceryList = {
        id: newId(),
        name: action.payload.name,
        items: [],
        createdAt: Date.now(),
      };
      return { ...state, savedLists: [...state.savedLists, newList] };
    }

    case 'RENAME_SAVED_LIST':
      return {
        ...state,
        savedLists: state.savedLists.map(l =>
          l.id === action.payload.id ? { ...l, name: action.payload.name } : l
        ),
      };

    case 'DELETE_SAVED_LIST':
      return {
        ...state,
        savedLists: state.savedLists.filter(l => l.id !== action.payload.id),
      };

    case 'SAVED_ADD_ITEM':
      return {
        ...state,
        savedLists: state.savedLists.map(l =>
          l.id === action.payload.listId
            ? {
                ...l,
                items: [
                  ...l.items,
                  { ...action.payload.item, id: newId(), checked: false },
                ],
              }
            : l
        ),
      };

    case 'SAVED_UPDATE_ITEM':
      return {
        ...state,
        savedLists: state.savedLists.map(l =>
          l.id === action.payload.listId
            ? {
                ...l,
                items: l.items.map(i =>
                  i.id === action.payload.item.id ? action.payload.item : i
                ),
              }
            : l
        ),
      };

    case 'SAVED_DELETE_ITEM':
      return {
        ...state,
        savedLists: state.savedLists.map(l =>
          l.id === action.payload.listId
            ? { ...l, items: l.items.filter(i => i.id !== action.payload.itemId) }
            : l
        ),
      };

    default:
      return state;
  }
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  activeList: {
    id: 'active',
    name: 'My List',
    items: [],
    createdAt: Date.now(),
  },
  savedLists: [],
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydrated = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load persisted state on mount
  useEffect(() => {
    loadState().then(persisted => {
      if (persisted) dispatch({ type: 'LOAD_STATE', payload: persisted });
      hydrated.current = true;
    });
  }, []);

  // Debounced save on every state change (skip initial render before hydration)
  useEffect(() => {
    if (!hydrated.current) return;
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveState(state);
    }, 300);
    return () => clearTimeout(saveTimeout.current);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
