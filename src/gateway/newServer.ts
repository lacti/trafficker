import * as http from "http";

import handleDequeue from "./handleDequeue";
import handlePend from "./handlePend";
import handleRespond from "./handleRespond";
import parsePathname from "./parsePathname";

export default function newServer(): http.Server {
  return http.createServer(async (req, res) => {
    const pathname = parsePathname(req.url) ?? "";
    console.info(`pathname`, pathname);

    if (pathname.startsWith("_")) {
      switch (pathname) {
        case "_dequeue":
          return handleDequeue(req, res);
        case "_respond":
          return handleRespond(req, res);
        default:
          console.info("No admin route for", pathname);
          return res.writeHead(404).end();
      }
    } else {
      return handlePend(req, res);
    }
  });
}
