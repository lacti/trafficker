export default interface GatewayConfig {
  port: number;
  defaultWaitingTimeout: number;
  defaultWaiterTimeout: number;
  serverName?: string;
  knownRoutes?: string[];
}
