import { Router } from "express";

export const createRouter = (): Router => {
  const router = Router();

  router.get("/", (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="/assets/styles.css">
    <script src="/assets/app.js" defer></script>
  </head>
  <body>
    <h1>Hello</h1>
    <button>Test JS</button>
  </body>
</html>`);
  });

  return router;
};
