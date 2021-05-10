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

  proxyKnownError: number;
  proxyUnknownError: number;

  agentTooManyToSpawn: number;
  agentSpawnNew: number;
  agentCurrentCount: number;
  agentCompleted: number;
  agentCompletedOK: number;
  agentCompletedNoContext: number;
  agentCompletedError: number;
  agentError: number;
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

    proxyKnownError: 0,
    proxyUnknownError: 0,

    agentTooManyToSpawn: 0,
    agentSpawnNew: 0,
    agentCurrentCount: 0,
    agentCompleted: 0,
    agentCompletedOK: 0,
    agentCompletedNoContext: 0,
    agentCompletedError: 0,
    agentError: 0,
  };
}
