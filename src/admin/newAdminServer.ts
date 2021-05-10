import * as http from "http";

import AdminConfig from "./models/AdminConfig";
import HttpHandler from "../models/HttpHandler";
import handleConfigWith from "./handlers/handleConfigWith";
import handleShutdownWith from "../admin/handlers/handleShutdownWith";
import parsePathname from "../support/parsePathname";
import statusCodeOnlyHandlers from "../support/statusCodeOnlyHandlers";
import useLogger from "../useLogger";

const logger = useLogger({ name: "newAdminServer" });

export default function newAdminServer({
  config,
}: {
  config: AdminConfig;
}): http.Server {
  const env = {
    config,
  };

  const predefinedHandlers: { [route: string]: HttpHandler } = {
    shutdown: handleShutdownWith(env),
    config: handleConfigWith(env),
  };

  function route(pathname: string): HttpHandler {
    logger.trace({ pathname }, "Start routing");
    if (pathname in predefinedHandlers) {
      return predefinedHandlers[pathname];
    }
    return statusCodeOnlyHandlers.$404;
  }

  return http.createServer(async (req, res) => {
    try {
      route(parsePathname(req.url) ?? "")({ req, res });
    } catch (error) {
      logger.warn({ req, error }, "Error in http handler");
      return statusCodeOnlyHandlers.$500({ req, res });
    }
  });
}
