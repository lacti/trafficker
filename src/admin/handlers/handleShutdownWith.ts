import * as http from "http";

import AdminConfig from "../models/AdminConfig";
import HttpHandler from "../../models/HttpHandler";
import responseSimpleAsync from "../../support/responseSimpleAsync";
import statusCodeOnlyHandlers from "../../support/statusCodeOnlyHandlers";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "handleStats" });

export interface HandleShutdownEnv {
  config: AdminConfig;
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
      await responseSimpleAsync(res, true);

      process.exit(0);
    } else {
      return statusCodeOnlyHandlers.$404({ req, res });
    }
  };
}
