import StatStats from "../../stats/models/StatStats";

export default interface GatewayStats extends StatStats {
  dequeueInvalidRequest: number;
  dequeueStart: number;
  dequeueNoRoute: number;
  dequeueImmediately: number;
  dequeuePendWaiter: number;
  dequeueWaiterTimeoutFired: number;
  dequeueWaiterDropped: number;

  logsInvalidRequest: number;
  logsAccessed: number;
  statsInvalidRequest: number;
  statsAccessed: number;
  statsCleared: number;

  pendRequest: number;
  processOrPendAddWaiting: number;
  processOrPendDequeueImmediately: number;

  dropIncompletedContextTimeoutFired: number;
  dropIncompletedContextAlreadyProcessed: number;
  dropIncompletedContextDropped: number;

  respondInvalidRequest: number;
  respondStart: number;
  respondNoWaitingContext: number;
  respondGetWaitingContext: number;
  respondPipeWaitingContext: number;
  respondPipeError: number;
  respondPipeClose: number;

  dequeueContextRedirectStart: number;
  dequeueContextRedirectError: number;
  dequeueContextRedirectClose: number;

  configAccessed: number;
  configUpdated: number;
}

export function newGatewayStats(): GatewayStats {
  return {
    dequeueInvalidRequest: 0,
    dequeueStart: 0,
    dequeueNoRoute: 0,
    dequeueImmediately: 0,
    dequeuePendWaiter: 0,
    dequeueWaiterTimeoutFired: 0,
    dequeueWaiterDropped: 0,

    logsInvalidRequest: 0,
    logsAccessed: 0,
    statsInvalidRequest: 0,
    statsAccessed: 0,
    statsCleared: 0,

    pendRequest: 0,
    processOrPendAddWaiting: 0,
    processOrPendDequeueImmediately: 0,

    dropIncompletedContextTimeoutFired: 0,
    dropIncompletedContextAlreadyProcessed: 0,
    dropIncompletedContextDropped: 0,

    respondInvalidRequest: 0,
    respondStart: 0,
    respondNoWaitingContext: 0,
    respondGetWaitingContext: 0,
    respondPipeWaitingContext: 0,
    respondPipeError: 0,
    respondPipeClose: 0,

    dequeueContextRedirectStart: 0,
    dequeueContextRedirectError: 0,
    dequeueContextRedirectClose: 0,

    configAccessed: 0,
    configUpdated: 0,
  };
}
