interface HomePageProps {
  count: number;
}

export const HomePage = ({ count }: HomePageProps) => (
  <main
    x-component="counter"
    className="container py-5"
  >
    <h1 className="mb-4">Server action demo</h1>
    <p className="fs-4">
      Clicks: <output>{count}</output>
    </p>
    <form action="/counter" method="post" x-server-action="" className="mt-4">
      <button type="submit" className="btn btn-primary">
        Increment
      </button>
    </form>
  </main>
);
