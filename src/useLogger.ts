type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

export type Logger = ReturnType<typeof useLogger>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useLogger({
  name,
  level: filteredLevel = (process.env.LOGGER?.toLowerCase() ??
    "info") as LogLevel,
}: {
  name: string;
  level?: LogLevel;
}) {
  function logger(level: LogLevel) {
    return (...args: unknown[]) => {
      if (logLevelToSeverity(level) >= logLevelToSeverity(filteredLevel)) {
        const now = new Date().toISOString();
        const upLevel = level.toUpperCase();
        console[level](`[${now}][${upLevel}][${name}]`, ...args);
      }
    };
  }
  return {
    trace: logger("trace"),
    debug: logger("debug"),
    info: logger("info"),
    warn: logger("warn"),
    error: logger("error"),
  };
}

function logLevelToSeverity(level: LogLevel): number {
  switch (level) {
    case "trace":
      return 0;
    case "debug":
      return 10;
    case "info":
      return 20;
    case "warn":
      return 30;
    case "error":
      return 40;
  }
  return 99;
}
