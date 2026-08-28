import { Router } from "express";

export const createRouter = (): Router => {
  const router = Router();

  router.get("/", (req, res) => {
    res.send(`<!DOCTYPE html>
    <html>
    <head>
    <title>My Page</title>
    </head>
    <body>
    Hello, world!
    </body>
    </html>`);
  });

  return router;
};
