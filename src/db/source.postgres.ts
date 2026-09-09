import type { Pool } from "pg";

import type { Source } from "../core/source.js";
import type { SourceRepository } from "../core/source-repository.js";
import { toDate } from "./helpers.js";

interface SourceRow {
  source_id: string;
  name: string;
  base_url: string;
  last_synced_at: Date | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface SourcePostgresDependencies {
  pool: Pool;
}

export const createSourcePostgres = ({ pool }: SourcePostgresDependencies): SourceRepository => ({
  async findById(sourceId) {
    const result = await pool.query<SourceRow>(
      `
        SELECT
          source_id,
          name,
          base_url,
          last_synced_at,
          created_at,
          updated_at
        FROM source
        WHERE source_id = $1
      `,
      [sourceId],
    );

    const row = result.rows[0];
    if (row === undefined) {
      return null;
    }

    return mapToSource(row);
  },

  async updateById(sourceId, input) {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      values.push(input.name);
      updates.push(`name = $${values.length}`);
    }

    if (input.baseUrl !== undefined) {
      values.push(input.baseUrl);
      updates.push(`base_url = $${values.length}`);
    }

    if (input.lastSyncedAt !== undefined) {
      values.push(input.lastSyncedAt);
      updates.push(`last_synced_at = $${values.length}`);
    }

    if (updates.length === 0) {
      throw new Error("Source update must include at least one field");
    }

    updates.push("updated_at = NOW()");

    values.push(sourceId);
    const result = await pool.query<SourceRow>(
      `
        UPDATE source
        SET ${updates.join(", ")}
        WHERE source_id = $${values.length}
        RETURNING *
      `,
      values,
    );

    const row = result.rows[0];
    return row === undefined ? null : mapToSource(row);
  },
});

const mapToSource = (row: SourceRow): Source => ({
  id: row.source_id,
  name: row.name,
  baseUrl: row.base_url,
  lastSyncedAt: row.last_synced_at === null ? null : toDate(row.last_synced_at),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});
