import * as http from "http";

import HttpContext from "../models/HttpContext";
import IncreaseGatewayStat from "../models/IncreaseGatewayStat";
import { traffickerHeaderKeys } from "../../constants";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "dequeueContextTo" });

export default function dequeueContextTo({
  route,
  context,
  res,
  increaseStat,
}: {
  route: string;
  context: HttpContext;
  res: http.ServerResponse;
  increaseStat: IncreaseGatewayStat;
}): void {
  context.processing = true;

  res.setHeader(traffickerHeaderKeys.id, context.id);
  res.setHeader(traffickerHeaderKeys.route, route);
  res.setHeader(traffickerHeaderKeys.url, context.req.url!);
  res.setHeader(traffickerHeaderKeys.method, context.req.method ?? "get");

  const headerJSON = JSON.stringify(context.req.headers);
  res.setHeader(traffickerHeaderKeys.header, headerJSON);
  logger.trace(
    { route, id: context.id, header: context.req.headers, headerJSON },
    "Set header to trafficker header"
  );

  increaseStat("dequeueContextRedirectStart");
  logger.debug(
    {
      route,
      id: context.id,
      url: context.req.url,
      method: context.req.method,
      headers: context.req.headers,
    },
    "Redirect context"
  );
  context.req
    .pipe(res)
    .on("error", (error) => {
      increaseStat("dequeueContextRedirectError");
      logger.error(
        { route, id: context.id, url: context.req.url, error },
        "Error while redirect body to waiter"
      );
    })
    .on("close", () => {
      increaseStat("dequeueContextRedirectClose");
    });
  logger.info(
    { route, id: context.id, url: context.req.url },
    "Redirect body from origin request"
  );
}
