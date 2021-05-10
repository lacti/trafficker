import Stats from "../models/Stats";
import { newStats } from "../models/Stats";

type StatKey = keyof Stats;

export type IncreaseStat = (key: StatKey) => void;

export interface UseStats {
  getStats: () => Stats;
  increaseStat: IncreaseStat;
  clearStats: (args: { except: StatKey[] }) => void;
}

export default function useStats(): UseStats {
  const stats = newStats();

  function getStats() {
    return stats;
  }

  function increaseStat(key: StatKey) {
    ++stats[key];
  }

  function clearStats({ except }: { except: StatKey[] }) {
    for (const key of Object.keys(stats) as StatKey[]) {
      if (!except.includes(key)) {
        stats[key] = 0;
      }
    }
  }

  return { getStats, increaseStat, clearStats };
}
