type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

interface LogTuple {
  timestamp: string;
  level: string;
  name: string;
  context: unknown;
  message: string;
}

export type Logger = ReturnType<typeof useLogger>;

const lastLogs: LogTuple[] = [];
const countToKeepLastLogs = +(process.env.LAST_LOGS ?? "3000");

export function getLastLogs(count: number): LogTuple[] {
  return lastLogs.slice(0, count);
}

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
    return (context: unknown, message: string) => {
      if (logLevelToSeverity(level) >= logLevelToSeverity(filteredLevel)) {
        const now = new Date().toISOString();
        const upLevel = level.toUpperCase();
        console[level](`[${now}][${upLevel}][${name}]`, context, message);

        // Keep last logs to debugging.
        lastLogs.unshift({
          timestamp: now,
          level: upLevel,
          name,
          context,
          message,
        });
        while (lastLogs.length > countToKeepLastLogs) {
          lastLogs.pop();
        }
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
