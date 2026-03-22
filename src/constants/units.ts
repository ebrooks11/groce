import { Unit } from '../types';

export const UNITS: Unit[] = [
  '',
  'each',
  'lbs',
  'oz',
  'kg',
  'g',
  'pack',
  'can',
  'box',
  'bottle',
  'bunch',
  'bag',
];

export const UNIT_LABELS: Record<Unit, string> = {
  '': 'None',
  each: 'each',
  lbs: 'lbs',
  oz: 'oz',
  kg: 'kg',
  g: 'g',
  pack: 'pack',
  can: 'can',
  box: 'box',
  bottle: 'bottle',
  bunch: 'bunch',
  bag: 'bag',
};
