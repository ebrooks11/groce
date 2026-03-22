export type Category =
  | 'Produce'
  | 'Dairy'
  | 'Meat'
  | 'Bakery'
  | 'Frozen'
  | 'Pantry'
  | 'Beverages'
  | 'Other';

export type Unit =
  | 'lbs'
  | 'oz'
  | 'kg'
  | 'g'
  | 'each'
  | 'pack'
  | 'can'
  | 'box'
  | 'bottle'
  | 'bunch'
  | 'bag'
  | '';

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

export interface AppState {
  activeList: GroceryList;
  savedLists: GroceryList[];
}
