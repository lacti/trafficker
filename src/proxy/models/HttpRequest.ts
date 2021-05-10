import HttpPayload from "./HttpPayload";

export default interface HttpRequest extends HttpPayload {
  url: string;
  method: string;
}
