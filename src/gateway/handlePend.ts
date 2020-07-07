import * as http from "http";

import HttpContext from "./httpContext";
import { nanoid } from "nanoid";
import parsePathname from "./parsePathname";
import processOrPendContext from "./processOrPendContext";
import useRoutes from "./routes";

export default function handlePend(
  req: http.IncomingMessage,
  res: http.ServerResponse
): void {
  const context: HttpContext = { id: nanoid(), req, res, processing: false };

  const pathname = parsePathname(req.url) ?? "";
  const route = pathname.split(/\//)[0] ?? "";
  console.info(`pathname`, pathname, route);

  const { hasRoute } = useRoutes();
  if (hasRoute(route)) {
    processOrPendContext(route, context);
  } else {
    processOrPendContext("*", context);
  }
}
