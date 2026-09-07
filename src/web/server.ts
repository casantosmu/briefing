import { once } from "node:events";
import { createServer as createHttpServer } from "node:http";

import type { Express } from "express";

interface CreateServerOptions {
  app: Express;
  port: number;
}

export const createServer = ({ app, port }: CreateServerOptions) => {
  const server = createHttpServer(app);

  return {
    start: async () => {
      const listening = once(server, "listening");
      server.listen(port);
      await listening;
    },
    close: async () => {
      if (!server.listening) {
        return;
      }

      const closed = once(server, "close");
      server.close();
      await closed;
    },
  };
};
