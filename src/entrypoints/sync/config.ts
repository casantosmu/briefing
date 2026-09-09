export interface Config {
  sourceId: string;
  postgresUrl: string;
}

export const loadConfig = (): Config => {
  const sourceId = process.env.SOURCE_ID;
  const postgresUrl = process.env.DATABASE_URL;

  if (!postgresUrl) {
    throw new Error("DATABASE_URL is required");
  }

  if (!sourceId) {
    throw new Error("SOURCE_ID is required");
  }

  return { sourceId, postgresUrl };
};
