export default interface GatewayConfig {
  port: number;
  defaultWaitingTimeout: number;
  defaultWaiterTimeout: number;
  knownRoutes?: string[];
  stat?: boolean;
}
