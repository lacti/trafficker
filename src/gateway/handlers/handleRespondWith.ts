import * as http from "http";

import HttpHandler from "../../models/HttpHandler";
import UseGatewayStats from "../models/UseGatewayStats";
import { UseWaitings } from "../context/useWaitings";
import statusCodeOnlyHandlers from "../../support/statusCodeOnlyHandlers";
import { traffickerHeaderKeys } from "../../constants";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "handleRespond" });

export interface HandleRespondEnv {
  waitings: UseWaitings;
  stats: UseGatewayStats;
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
      return statusCodeOnlyHandlers.$404({ req, res });
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
      return statusCodeOnlyHandlers.$404({ req, res });
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
        return statusCodeOnlyHandlers.$500({ req, res });
      })
      .on("close", () => {
        increaseStat("respondPipeClose");
        return statusCodeOnlyHandlers.$200({ req, res });
      });
    logger.info(
      { route, id, url: context.req.url },
      "Redirect body to origin response"
    );
  };
}
