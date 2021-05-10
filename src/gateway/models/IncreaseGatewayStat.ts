import GatewayStats from "./GatewayStats";

type IncreaseGatewayStat = (key: keyof GatewayStats) => void;

export default IncreaseGatewayStat;
