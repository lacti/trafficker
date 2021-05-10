import ConfigContext from "./models/ConfigContext";

let configContext: ConfigContext = {
  configPath: "config.json",
};

export function updateConfigContext(partialContext: Partial<ConfigContext>) {
  configContext = { ...configContext, ...partialContext };
}

export function getConfigContext(): ConfigContext {
  return configContext;
}
