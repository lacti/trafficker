import StatStats from "../../stats/models/StatStats";

export default interface ProxyStats extends StatStats {
  dequeueStart: number;
  dequeue200: number;
  dequeue404: number;
  dequeueOthers: number;
  dequeueError: number;
  dequeueNoContext: number;

  requestHttpStart: number;
  requestHttpReceived: number;
  requestHttpBodyPipeError: number;
  requestHttpBodyPipeClose: number;
  requestHttpNoBody: number;

  respondStart: number;
  respond200: number;
  respondOthers: number;
  respondError: number;
  respondBodyPipeError: number;
  respondBodyPipeClose: number;
  respondNoBody: number;

  proxyError: number;
}

export function newProxyStats(): ProxyStats {
  return {
    statsAccessed: 0,
    statsCleared: 0,
    statsInvalidRequest: 0,

    dequeueStart: 0,
    dequeue200: 0,
    dequeue404: 0,
    dequeueOthers: 0,
    dequeueError: 0,
    dequeueNoContext: 0,

    requestHttpStart: 0,
    requestHttpReceived: 0,
    requestHttpBodyPipeError: 0,
    requestHttpBodyPipeClose: 0,
    requestHttpNoBody: 0,

    respondStart: 0,
    respond200: 0,
    respondOthers: 0,
    respondError: 0,
    respondBodyPipeError: 0,
    respondBodyPipeClose: 0,
    respondNoBody: 0,

    proxyError: 0,
  };
}
