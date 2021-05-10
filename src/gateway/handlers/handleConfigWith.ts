import * as http from "http";

import HttpHandler from "../models/HttpHandler";
import { UseStats } from "../context/useStats";
import getStream from "get-stream";
import loadConfig from "../../config/loadConfig";
import responseSafeWriteHead from "../support/responseSafeWriteHead";
import responseSimpleAsync from "../support/responseSimpleAsync";
import updateConfig from "../../config/updateConfig";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "handleConfig" });

export interface HandleConfigEnv {
  stats: UseStats;
}

export default function handleConfigWith({
  stats: { increaseStat },
}: HandleConfigEnv): HttpHandler {
  async function handleRespondConfig(res: http.ServerResponse) {
    increaseStat("configAccessed");
    const config = loadConfig();
    logger.info({ config }, "Get config");
    await responseSimpleAsync(res, config);
  }

  async function handleUpdateConfig(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) {
    increaseStat("configUpdated");

    try {
      const body = await getStream(req);
      const newConfig = JSON.parse(body);
      logger.info({ body, newConfig }, "Update config");
      updateConfig(newConfig);

      await responseSimpleAsync(res, true);
    } catch (error) {
      logger.error({ error }, "Cannot update config");
      await responseSimpleAsync(res, false);
    }
  }

  return async function handleConfig({
    req,
    res,
  }: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  }): Promise<void> {
    switch (req.method?.toLowerCase()) {
      case "get":
        return await handleRespondConfig(res);
      case "put":
        return await handleUpdateConfig(req, res);
      default:
        increaseStat("statsInvalidRequest");
        return responseSafeWriteHead({
          res,
          statusCode: 404,
          logContext: { url: req.url },
        });
    }
  };
}
