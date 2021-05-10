import * as http from "http";

import processOrPendContextWith, {
  ProcessOrPendContextEnv,
} from "../context/processOrPendContextWith";

import GatewayConfig from "../models/GatewayConfig";
import HttpContext from "../models/HttpContext";
import HttpHandler from "../models/HttpHandler";
import { UseKnownRoutes } from "../context/useKnownRoutes";
import { UseStats } from "../context/useStats";
import { nanoid } from "nanoid";
import parsePathname from "../support/parsePathname";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "handlePend" });

export interface HandlePendEnv extends ProcessOrPendContextEnv {
  config: GatewayConfig;
  knownRoutes: UseKnownRoutes;
  stats: UseStats;
}

export default function handlePendWith(env: HandlePendEnv): HttpHandler {
  const {
    knownRoutes: { findRoute },
    stats: { increaseStat },
  } = env;
  const processOrPendContext = processOrPendContextWith(env);
  return function handlePend({
    req,
    res,
  }: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  }): void {
    increaseStat("pendRequest");
    const context: HttpContext = { id: nanoid(), req, res, processing: false };

    const pathname = parsePathname(req.url) ?? "";
    const route = findRoute(pathname);
    logger.debug({ pathname, route }, "findRoute from pathname");

    processOrPendContext({ route, context });
  };
}
