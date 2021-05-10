import * as http from "http";

export default function responseWriteJsonAsync<V>(
  res: http.ServerResponse,
  value: V
): Promise<void> {
  return new Promise<void>((resolve, reject) =>
    res.write(JSON.stringify(value), "utf8", (error) =>
      error ? reject(error) : resolve()
    )
  );
}
