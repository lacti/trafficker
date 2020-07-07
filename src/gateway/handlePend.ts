import * as http from "http";

import { GatewayConfig } from "../config";
import HttpContext from "./httpContext";
import { nanoid } from "nanoid";
import parsePathname from "./parsePathname";
import processOrPendContext from "./processOrPendContext";
import useLogger from "../useLogger";
import useRoutes from "./routes";

const logger = useLogger({ name: "handlePend" });

export default function handlePend({
  config,
  req,
  res,
}: {
  config: GatewayConfig;
  req: http.IncomingMessage;
  res: http.ServerResponse;
}): void {
  const context: HttpContext = { id: nanoid(), req, res, processing: false };

  const pathname = parsePathname(req.url) ?? "";
  const route = pathname.split(/\//)[0] ?? "";
  logger.trace({ pathname, route }, `pathname`);

  const { hasRoute } = useRoutes();
  if (hasRoute(route)) {
    processOrPendContext({ config, route, context });
  } else {
    processOrPendContext({ config, route: "*", context });
  }
}
