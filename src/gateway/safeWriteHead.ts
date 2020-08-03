import * as http from "http";

import useLogger from "../useLogger";

const logger = useLogger({ name: "safeWriteHead" });

export default function safeWriteHead({
  statusCode,
  res,
  logContext,
}: {
  statusCode: number;
  res: http.ServerResponse;
  logContext?: { [key: string]: unknown };
}): void {
  try {
    res.writeHead(statusCode).end();
  } catch (error) {
    logger.warn({ ...(logContext ?? {}), error }, "Cannot response due to");
    try {
      res.end();
    } catch (errorFromEnd) {
      logger.warn(
        { ...(logContext ?? {}), error: errorFromEnd },
        "Cannot end of response due to"
      );
    }
  }
}
