import HttpPayload from "./HttpPayload";

export default interface HttpResponse extends HttpPayload {
  statusCode: number;
}
