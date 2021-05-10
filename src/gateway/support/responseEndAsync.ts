import * as http from "http";

export default function responseEndAsync(
  res: http.ServerResponse
): Promise<void> {
  return new Promise<void>((resolve) => res.end(resolve));
}
