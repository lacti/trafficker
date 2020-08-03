import * as http from "http";

import processOrPendContextWith, {
  ProcessOrPendContextEnv,
} from "./processOrPendContextWith";

import GatewayConfig from "./gatewayConfig";
import HttpContext from "./httpContext";
import HttpHandler from "./httpHandler";
import { nanoid } from "nanoid";
import parsePathname from "./parsePathname";
import useLogger from "../useLogger";
import useRoutes from "./useRoutes";

const logger = useLogger({ name: "handlePend" });

export interface HandlePendEnv extends ProcessOrPendContextEnv {
  config: GatewayConfig;
}

export default function handlePendWith(env: HandlePendEnv): HttpHandler {
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
    const route = pathname.split(/\//)[0] ?? "";
    logger.trace({ pathname, route }, `pathname`);

    const { hasRoute } = useRoutes();
    if (hasRoute(route)) {
      processOrPendContext({ route, context });
    } else {
      processOrPendContext({ route: "*", context });
    }
  };
}
