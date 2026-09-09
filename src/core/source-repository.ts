import type { Source } from "./source.js";

export type UpdateSourceInput = Partial<Pick<Source, "name" | "baseUrl" | "lastSyncedAt">>;

export interface SourceRepository {
  findById(sourceId: string): Promise<Source | null>;
  updateById(sourceId: string, input: UpdateSourceInput): Promise<Source | null>;
}
