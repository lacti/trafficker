import HttpPayload from "./httpPayload";

export default interface HttpResponse extends HttpPayload {
  statusCode: number;
}
