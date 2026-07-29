// Self-contained Local State & Firebase Compatibility Abstraction
// No external Google Cloud or Firebase SDK connections required

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: Record<string, any>;
}

export const db = {
  type: "LOCAL_IN_MEMORY_STORE",
  isLocal: true,
};

export const auth = {
  currentUser: null as any,
  signOut: async () => {},
};

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.warn(`Local Operation [${operationType}] on [${path}]:`, error);
}
