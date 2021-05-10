import * as http from "http";

import HttpHandler from "../models/HttpHandler";
import { URL } from "url";
import { UseStats } from "../context/useStats";
import { getLastLogs } from "../../useLogger";
import responseEndAsync from "../support/responseEndAsync";
import responseSafeWriteHead from "../support/responseSafeWriteHead";
import responseWriteJsonAsync from "../support/responseWriteJsonAsync";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "handleLogs" });

export interface HandleLogsEnv {
  stats: UseStats;
}

export default function handleLogsWith({
  stats: { increaseStat },
}: HandleLogsEnv): HttpHandler {
  return async function handleLogs({
    req,
    res,
  }: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  }): Promise<void> {
    if (req.method?.toLowerCase() !== "get") {
      increaseStat("logsInvalidRequest");
      return responseSafeWriteHead({
        res,
        statusCode: 404,
        logContext: { url: req.url },
      });
    }
    increaseStat("logsAccessed");
    const count = +(
      new URL(req.url ?? "", "resolve://").searchParams.get("count") ?? "100"
    );
    const lastLogs = getLastLogs(count);
    logger.trace({ count }, "Get last logs");
    try {
      res.writeHead(200);
      await responseWriteJsonAsync(res, lastLogs);
      await responseEndAsync(res);
    } catch (error) {
      logger.warn({ count, error }, "Cannot respond last logs");
    }
  };
}
