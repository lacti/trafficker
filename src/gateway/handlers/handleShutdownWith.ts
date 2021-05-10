import * as http from "http";

import GatewayConfig from "../models/GatewayConfig";
import HttpHandler from "../models/HttpHandler";
import { UseStats } from "../context/useStats";
import responseSafeWriteHead from "../support/responseSafeWriteHead";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "handleStats" });

export interface HandleShutdownEnv {
  config: GatewayConfig;
  stats: UseStats;
}

export default function handleShutdownWith({
  config: { shutdownSecret },
}: HandleShutdownEnv): HttpHandler {
  return async function handleShutdown({
    req,
    res,
  }: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  }): Promise<void> {
    if (
      req.method?.toLowerCase() === "post" &&
      shutdownSecret !== undefined &&
      req.headers["x-secret"] === shutdownSecret
    ) {
      logger.info({}, "Shutdown server");
      process.exit(0);
    } else {
      return responseSafeWriteHead({
        res,
        statusCode: 404,
        logContext: { url: req.url },
      });
    }
  };
}
