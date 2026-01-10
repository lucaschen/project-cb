export type OmitFromUnion<T, K extends string> = T extends unknown
  ? Omit<T, K>
  : never;
