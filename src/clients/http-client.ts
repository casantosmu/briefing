export type QueryParameterValue = string | number | boolean | Date | null | undefined;

export type QueryParameters = Record<string, QueryParameterValue | QueryParameterValue[]>;

export interface RequestOptions {
  params?: QueryParameters;
  signal?: AbortSignal;
}

export interface HttpResponse<T> {
  data: T;
  headers: Headers;
  status: number;
  statusText: string;
}

export interface HttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>>;
  post<T>(path: string, body: unknown, options?: RequestOptions): Promise<HttpResponse<T>>;
}

export const createHttpClient = (baseUrl: string): HttpClient => {
  return {
    async get<T>(path: string, options: RequestOptions = {}) {
      const { params, ...init } = options;
      return request<T>(
        baseUrl,
        path,
        {
          method: "GET",
          ...init,
        },
        params,
      );
    },

    async post<TResponse>(path: string, body: unknown, options: RequestOptions = {}) {
      const { params, ...init } = options;
      return request<TResponse>(
        baseUrl,
        path,
        {
          method: "POST",
          body: JSON.stringify(body),
          ...init,
        },
        params,
      );
    },
  };
};

const buildUrl = (baseUrl: string, path: string, params?: QueryParameters): string => {
  const url = new URL(path, baseUrl);
  if (!params) {
    return url.toString();
  }

  for (const [name, value] of Object.entries(params)) {
    if (value == null) {
      continue;
    }

    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item == null) {
        continue;
      }

      const value = item instanceof Date ? item.toISOString() : String(item);
      url.searchParams.append(name, value);
    }
  }

  return url.toString();
};

const request = async <T>(
  baseUrl: string,
  path: string,
  init: RequestInit,
  params?: QueryParameters,
): Promise<HttpResponse<T>> => {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(baseUrl, path, params), { ...init, headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as T;

  return {
    data,
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  };
};
