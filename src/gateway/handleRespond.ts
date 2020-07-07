import * as http from "http";

import { removePrefixFromHeaders } from "../utils/editHeaders";
import { traffickerHeaderKeys } from "../constants";
import useWaitings from "./waitings";

export default function handleRespond(
  req: http.IncomingMessage,
  res: http.ServerResponse
): void {
  if (req.method?.toLowerCase() !== "post") {
    return res.writeHead(404).end();
  }

  const id = req.headers[traffickerHeaderKeys.id] as string;
  const route = req.headers[traffickerHeaderKeys.route] as string;
  const statusCode = req.headers[traffickerHeaderKeys.statusCode] as string;
  console.info(`Respond`, route, id, statusCode);

  const { findWaiting, deleteWaiting } = useWaitings({ route });
  const context = findWaiting(id);
  if (!context) {
    console.info(`No waiting context for`, route, id);
    return res.writeHead(404).end();
  }
  deleteWaiting(id);

  const originalHeaders = removePrefixFromHeaders(req.headers);
  for (const [key, value] of Object.entries(originalHeaders)) {
    if (value !== undefined) {
      console.info(`Set header to origin response`, key, value);
      context.res.setHeader(key, value);
    }
  }

  context.res.writeHead(+statusCode);

  req
    .pipe(context.res)
    .on("error", (error) => {
      console.error(`Cannot redirect`, route, id, error);
      res.writeHead(500).end();
    })
    .on("close", () => res.writeHead(200).end());
  console.info(`Redirect body to origin response`, route, id);
}
