import * as http from "http";

import BaseStats from "../models/BaseStats";
import HttpHandler from "../../models/HttpHandler";
import { UseStats } from "../useStats";
import responseSimpleAsync from "../../support/responseSimpleAsync";
import statusCodeOnlyHandlers from "../../support/statusCodeOnlyHandlers";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "handleStats" });

export interface HandleStatsEnv<S extends BaseStats<S>> {
  stats: UseStats<S>;
}

export default function handleStatsWith<S extends BaseStats<S>>({
  stats: { getStats, increaseStat, clearStats },
}: HandleStatsEnv<S>): HttpHandler {
  async function handleRespondStats(res: http.ServerResponse) {
    increaseStat("statsAccessed");
    const stats = getStats();

    logger.trace({ stats }, "Get stats");
    await responseSimpleAsync(res, stats);
  }

  async function handleClearStats(res: http.ServerResponse) {
    clearStats({ except: ["statsCleared"] });
    increaseStat("statsCleared");

    logger.trace({}, "Clear stats");
    await responseSimpleAsync(res, true);
  }

  return async function handleStats({
    req,
    res,
  }: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  }): Promise<void> {
    switch (req.method?.toLowerCase()) {
      case "get":
        return await handleRespondStats(res);
      case "delete":
        return await handleClearStats(res);
      default:
        increaseStat("statsInvalidRequest");
        return statusCodeOnlyHandlers.$404({ req, res });
    }
  };
}
