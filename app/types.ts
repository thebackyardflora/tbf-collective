export type SerializedEntity<T> = {
  [k in keyof T]: T[k] extends Date ? string : SerializedEntity<T[k]>;
};

export enum UnitOfMeasure {
  STEM = 'STEM',
  BUNCH = 'BUNCH',
}
