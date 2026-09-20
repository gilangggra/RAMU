import https from "node:https";

const SUPABASE_WORKING_IP = "172.64.150.246";

export function devSupabaseFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const urlStr =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;

  if (process.env.NODE_ENV === "development" && urlStr.includes("supabase.co")) {
    return new Promise((resolve, reject) => {
      const parsed = new URL(urlStr);
      const method =
        init?.method || (input instanceof Request ? input.method : "GET");
      const headers: Record<string, string> = {};

      if (input instanceof Request) {
        input.headers.forEach((v, k) => {
          headers[k] = v;
        });
      }
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((v, k) => {
            headers[k] = v;
          });
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([k, v]) => {
            headers[k] = v;
          });
        } else {
          Object.assign(headers, init.headers);
        }
      }

      headers["host"] = parsed.hostname;

      const req = https.request(
        {
          hostname: SUPABASE_WORKING_IP,
          port: 443,
          path: parsed.pathname + parsed.search,
          method,
          headers,
          servername: parsed.hostname,
          timeout: 15000,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            const body = Buffer.concat(chunks);
            const resHeaders = new Headers();
            for (const [key, value] of Object.entries(res.headers)) {
              if (Array.isArray(value)) {
                value.forEach((v) => resHeaders.append(key, v));
              } else if (value) {
                resHeaders.set(key, value);
              }
            }
            const statusCode = res.statusCode || 200;
            const isNullBodyStatus =
              statusCode === 204 || statusCode === 205 || statusCode === 304;
            const responseBody = isNullBodyStatus ? null : body;

            resolve(
              new Response(responseBody, {
                status: statusCode,
                statusText: res.statusMessage || "OK",
                headers: resHeaders,
              })
            );
          });
        }
      );

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy(new Error("Request to Supabase timed out"));
      });

      const body =
        init?.body || (input instanceof Request ? input.body : undefined);
      if (body) {
        if (typeof body === "string" || Buffer.isBuffer(body)) {
          req.write(body);
        }
      }
      req.end();
    });
  }

  return fetch(input, init);
}
