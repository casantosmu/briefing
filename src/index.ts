import { createApp } from "./app";
import { loadConfig } from "./config";
import { createRouter } from "./router";
import { createServer } from "./server";

const config = loadConfig();

const { port } = config;
const router = createRouter();
const app = createApp({ router });
const server = createServer({ app, port });

try {
  await server.start();
  console.log(`Server started on port ${port}`);
} catch (error) {
  console.log("Server start error", error);
  process.exit(1);
}
