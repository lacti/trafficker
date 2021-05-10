import * as http from "http";

import responseEndAsync from "./responseEndAsync";
import responseWriteJsonAsync from "./responseWriteJsonAsync";
import useLogger from "../useLogger";

const logger = useLogger({ name: "responseSimpleAsync" });

export default async function responseSimpleAsync<V>(
  res: http.ServerResponse,
  value: V
): Promise<void> {
  try {
    res.writeHead(200);
    await responseWriteJsonAsync(res, value);
    await responseEndAsync(res);
  } catch (error) {
    logger.warn({ error }, "Cannot respond simple");
  }
}
