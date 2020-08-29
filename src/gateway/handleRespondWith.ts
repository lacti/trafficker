import * as http from "http";

import HttpHandler from "./httpHandler";
import { Waitings } from "./useWaitings";
import safeWriteHead from "./safeWriteHead";
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
      return safeWriteHead({
        res,
        statusCode: 404,
        logContext: { url: req.url },
      });
    }

    const id = req.headers[traffickerHeaderKeys.id] as string;
    const route = req.headers[traffickerHeaderKeys.route] as string;
    const statusCode = req.headers[traffickerHeaderKeys.statusCode] as string;
    logger.debug({ route, id, statusCode }, `Respond`);

    const context = findWaiting(route, id);
    if (!context) {
      logger.debug({ route, id }, `No waiting context for`);
      return safeWriteHead({
        res,
        statusCode: 404,
        logContext: { url: req.url },
      });
    }
    deleteWaiting(route, id);

    const originalHeaders = JSON.parse(
      (req.headers[traffickerHeaderKeys.header] as string) ?? "{}"
    ) as { [key: string]: string | string[] | undefined };

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
        safeWriteHead({ res, statusCode: 500, logContext: { url: req.url } });
      })
      .on("close", () =>
        safeWriteHead({ res, statusCode: 200, logContext: { url: req.url } })
      );
    logger.info(
      { route, id, url: context.req.url },
      `Redirect body to origin response`
    );
  };
}
