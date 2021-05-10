import HttpHandler from "../models/HttpHandler";
import responseSafeWriteHead from "./responseSafeWriteHead";

export default function newStatusCodeOnlyHttpHandler(
  statusCode: number
): HttpHandler {
  return function delegate({ req, res }) {
    return responseSafeWriteHead({
      res,
      statusCode,
      logContext: { url: req.url },
    });
  };
}
