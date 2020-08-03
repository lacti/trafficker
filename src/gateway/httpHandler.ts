import * as http from "http";

type HttpHandler = (inout: {
  req: http.IncomingMessage;
  res: http.ServerResponse;
}) => void;

export default HttpHandler;
