import * as http from "http";

import BaseStats from "./models/BaseStats";
import HttpHandler from "../models/HttpHandler";
import { UseStats } from "./useStats";
import handleStatsWith from "./handlers/handleStatsWith";
import parsePathname from "../support/parsePathname";
import statusCodeOnlyHandlers from "../support/statusCodeOnlyHandlers";
import useLogger from "../useLogger";

const logger = useLogger({ name: "newStatServer" });

export default function newStatServer<S extends BaseStats<S>>({
  stats,
}: {
  stats: UseStats<S>;
}): http.Server {
  const env = {
    stats,
  };

  const predefinedHandlers: { [route: string]: HttpHandler } = {
    stat: handleStatsWith<S>(env),
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
