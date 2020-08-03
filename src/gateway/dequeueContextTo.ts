import * as http from "http";

import HttpContext from "./httpContext";
import { addPrefixToHeaders } from "../utils/editHeaders";
import { traffickerHeaderKeys } from "../constants";
import useLogger from "../useLogger";

const logger = useLogger({ name: "dequeueContextTo" });

export default function dequeueContextTo({
  route,
  context,
  res,
}: {
  route: string;
  context: HttpContext;
  res: http.ServerResponse;
}): void {
  context.processing = true;

  res.setHeader(traffickerHeaderKeys.id, context.id);
  res.setHeader(traffickerHeaderKeys.route, route);
  res.setHeader(traffickerHeaderKeys.url, context.req.url!);
  res.setHeader(traffickerHeaderKeys.method, context.req.method ?? "get");
  const prefixedHeaders = addPrefixToHeaders(context.req.headers);
  for (const [key, value] of Object.entries(prefixedHeaders)) {
    if (value !== undefined) {
      logger.trace(
        { route, id: context.id, key, value },
        `Set header to trafficker header`
      );
      res.setHeader(key.toLowerCase(), value);
    }
  }
  logger.debug(
    {
      route,
      id: context.id,
      url: context.req.url,
      method: context.req.method,
      headers: context.req.headers,
    },
    `Redirect context`
  );
  context.req.pipe(res);
  logger.info(
    { route, id: context.id, url: context.req.url },
    `Redirect body from origin request`
  );
}
