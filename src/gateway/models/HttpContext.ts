import * as http from "http";

export default interface HttpContext {
  id: string;
  req: http.IncomingMessage;
  res: http.ServerResponse;
  processing: boolean;
}
