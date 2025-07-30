export type Snapshot = {
  [key: string]: SnapshotValue;
};

export type SnapshotValue =
  | string
  | number
  | boolean
  | undefined
  | Snapshot
  | ReadonlyArray<SnapshotValue>;
