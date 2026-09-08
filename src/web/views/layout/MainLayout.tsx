import type { PropsWithChildren } from "react";

interface MainLayoutProps extends PropsWithChildren {
  title: string;
}

export const MainLayout = ({ title, children }: MainLayoutProps) => {
  return (
    <html lang="en" data-bs-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`${title} | Briefing`}</title>
        <link href="/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
        <script type="module" src="/assets/app.js" />
      </head>
      <body>
        <header className="border-bottom">
          <div className="container py-3">
            <h1 className="h3 mb-0">
              <a href="/" className="text-body text-decoration-none">
                Briefing
              </a>
            </h1>
          </div>
        </header>

        <main className="container py-4">{children}</main>
      </body>
    </html>
  );
};
