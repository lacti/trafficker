import * as stream from "stream";

export default interface HttpPayload {
  headers: { [key: string]: string | string[] | undefined };
  body: stream.Readable;
}
