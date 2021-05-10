import * as http from "http";

import HttpHandler from "../models/HttpHandler";
import { UseStats } from "../context/useStats";
import { UseWaitings } from "../context/useWaitings";
import responseSafeWriteHead from "../support/responseSafeWriteHead";
import { traffickerHeaderKeys } from "../../constants";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "handleRespond" });

export interface HandleRespondEnv {
  waitings: UseWaitings;
  stats: UseStats;
}

export default function handleRespondWith({
  waitings: { findWaiting, deleteWaiting },
  stats: { increaseStat },
}: HandleRespondEnv): HttpHandler {
  return function handleRespond({
    req,
    res,
  }: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  }): void {
    if (req.method?.toLowerCase() !== "post") {
      increaseStat("respondInvalidRequest");
      return responseSafeWriteHead({
        res,
        statusCode: 404,
        logContext: { url: req.url },
      });
    }

    increaseStat("respondStart");

    const id = req.headers[traffickerHeaderKeys.id] as string;
    const route = req.headers[traffickerHeaderKeys.route] as string;
    const statusCode = req.headers[traffickerHeaderKeys.statusCode] as string;
    logger.debug({ route, id, statusCode }, "Respond");

    const context = findWaiting(route, id);
    if (!context) {
      increaseStat("respondNoWaitingContext");
      logger.debug({ route, id }, "No waiting context for");
      return responseSafeWriteHead({
        res,
        statusCode: 404,
        logContext: { url: req.url },
      });
    }
    increaseStat("respondGetWaitingContext");
    deleteWaiting(route, id);

    const originalHeaders = JSON.parse(
      (req.headers[traffickerHeaderKeys.header] as string) ?? "{}"
    ) as { [key: string]: string | string[] | undefined };

    for (const [key, value] of Object.entries(originalHeaders)) {
      if (value !== undefined) {
        logger.trace({ key, value }, "Set header to origin response");
        context.res.setHeader(key, value);
      }
    }

    context.res.writeHead(+statusCode);

    increaseStat("respondPipeWaitingContext");
    req
      .pipe(context.res)
      .on("error", (error) => {
        increaseStat("respondPipeError");
        logger.error({ route, id, error }, "Cannot redirect");
        return responseSafeWriteHead({
          res,
          statusCode: 500,
          logContext: { url: req.url },
        });
      })
      .on("close", () => {
        increaseStat("respondPipeClose");
        return responseSafeWriteHead({
          res,
          statusCode: 200,
          logContext: { url: req.url },
        });
      });
    logger.info(
      { route, id, url: context.req.url },
      "Redirect body to origin response"
    );
  };
}
