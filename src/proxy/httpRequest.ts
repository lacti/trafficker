import HttpPayload from "./httpPayload";

export default interface HttpRequest extends HttpPayload {
  url: string;
  method: string;
}
