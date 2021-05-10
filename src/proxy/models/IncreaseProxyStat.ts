import ProxyStats from "./ProxyStats";

type IncreaseProxyStat = (key: keyof ProxyStats) => void;

export default IncreaseProxyStat;
