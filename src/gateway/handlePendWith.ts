import * as http from "http";

import processOrPendContextWith, {
  ProcessOrPendContextEnv,
} from "./processOrPendContextWith";

import GatewayConfig from "./gatewayConfig";
import HttpContext from "./httpContext";
import HttpHandler from "./httpHandler";
import { KnownRoutes } from "./useKnownRoutes";
import { nanoid } from "nanoid";
import parsePathname from "./parsePathname";
import useLogger from "../useLogger";

const logger = useLogger({ name: "handlePend" });

export interface HandlePendEnv extends ProcessOrPendContextEnv {
  config: GatewayConfig;
  knownRoutes: KnownRoutes;
}

export default function handlePendWith(env: HandlePendEnv): HttpHandler {
  const {
    knownRoutes: { findRoute },
  } = env;
  const processOrPendContext = processOrPendContextWith(env);
  return function handlePend({
    req,
    res,
  }: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  }): void {
    const context: HttpContext = { id: nanoid(), req, res, processing: false };

    const pathname = parsePathname(req.url) ?? "";
    const route = findRoute(pathname);
    logger.debug({ pathname, route }, `findRoute from pathname`);

    processOrPendContext({ route, context });
  };
}
