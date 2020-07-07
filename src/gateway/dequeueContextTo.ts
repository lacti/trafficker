import * as http from "http";

import HttpContext from "./httpContext";
import { addPrefixToHeaders } from "../utils/editHeaders";
import { traffickerHeaderKeys } from "../constants";

export default function dequeueContextTo(
  route: string,
  context: HttpContext,
  { res }: { res: http.ServerResponse }
): void {
  context.processing = true;

  res.setHeader(traffickerHeaderKeys.id, context.id);
  res.setHeader(traffickerHeaderKeys.url, context.req.url!);
  res.setHeader(traffickerHeaderKeys.method, context.req.method ?? "get");
  const prefixedHeaders = addPrefixToHeaders(context.req.headers);
  for (const [key, value] of Object.entries(prefixedHeaders)) {
    if (value !== undefined) {
      console.info(
        `Set header to trafficker header`,
        route,
        context.id,
        key,
        value
      );
      res.setHeader(key.toLowerCase(), value);
    }
  }
  console.info(
    `Redirect context`,
    route,
    context.id,
    context.req.url,
    context.req.method,
    context.req.headers
  );
  context.req.pipe(res);
  console.info(`Redirect body from origin request`, route, context.id);
}
