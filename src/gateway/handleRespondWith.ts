import * as http from "http";

import HttpHandler from "./httpHandler";
import { Waitings } from "./useWaitings";
import { removePrefixFromHeaders } from "../utils/editHeaders";
import { traffickerHeaderKeys } from "../constants";
import useLogger from "../useLogger";

const logger = useLogger({ name: "handleRespond" });

export interface HandleRespondEnv {
  waitings: Waitings;
}

export default function handleRespondWith({
  waitings: { findWaiting, deleteWaiting },
}: HandleRespondEnv): HttpHandler {
  return function handleRespond({
    req,
    res,
  }: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  }): void {
    if (req.method?.toLowerCase() !== "post") {
      return res.writeHead(404).end();
    }

    const id = req.headers[traffickerHeaderKeys.id] as string;
    const route = req.headers[traffickerHeaderKeys.route] as string;
    const statusCode = req.headers[traffickerHeaderKeys.statusCode] as string;
    logger.debug({ route, id, statusCode }, `Respond`);

    const context = findWaiting(route, id);
    if (!context) {
      logger.debug({ route, id }, `No waiting context for`);
      return res.writeHead(404).end();
    }
    deleteWaiting(route, id);

    const originalHeaders = removePrefixFromHeaders(req.headers);
    for (const [key, value] of Object.entries(originalHeaders)) {
      if (value !== undefined) {
        logger.trace({ key, value }, `Set header to origin response`);
        context.res.setHeader(key, value);
      }
    }

    context.res.writeHead(+statusCode);

    req
      .pipe(context.res)
      .on("error", (error) => {
        logger.error({ route, id, error }, `Cannot redirect`);
        res.writeHead(500).end();
      })
      .on("close", () => res.writeHead(200).end());
    logger.info({ route, id }, `Redirect body to origin response`);
  };
}
