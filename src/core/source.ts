export interface Source {
  id: string;
  name: string;
  baseUrl: string;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
