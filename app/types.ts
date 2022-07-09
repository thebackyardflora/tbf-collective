export type SerializedEntity<T> = {
  [k in keyof T]: T[k] extends Date ? string : T[k];
};
