import * as http from "http";

import HttpContext from "./httpContext";
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

  const headerJSON = JSON.stringify(context.req.headers);
  res.setHeader(traffickerHeaderKeys.header, headerJSON);
  logger.trace(
    { route, id: context.id, header: context.req.headers, headerJSON },
    `Set header to trafficker header`
  );

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
