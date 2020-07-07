import * as http from "http";

import { GatewayConfig } from "../config";
import handleDequeue from "./handleDequeue";
import handlePend from "./handlePend";
import handleRespond from "./handleRespond";
import parsePathname from "./parsePathname";
import useLogger from "../useLogger";

const logger = useLogger({ name: "newServer" });

export default function newServer({
  config,
}: {
  config: GatewayConfig;
}): http.Server {
  return http.createServer(async (req, res) => {
    const pathname = parsePathname(req.url) ?? "";
    logger.trace({ pathname }, `pathname`);

    if (pathname.startsWith("_")) {
      switch (pathname) {
        case "_dequeue":
          return handleDequeue({ config, req, res });
        case "_respond":
          return handleRespond({ req, res });
        default:
          logger.debug({ pathname }, "No admin route for");
          return res.writeHead(404).end();
      }
    } else {
      return handlePend({ config, req, res });
    }
  });
}
