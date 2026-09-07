export interface Config {
  postgresUrl: string;
}

export const loadConfig = (): Config => {
  const postgresUrl = process.env.DATABASE_URL;

  if (!postgresUrl) {
    throw new Error("DATABASE_URL is required");
  }

  return { postgresUrl };
};
