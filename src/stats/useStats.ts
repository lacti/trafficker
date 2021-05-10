import BaseStats from "./models/BaseStats";

export interface UseStats<S extends BaseStats<S>> {
  getStats: () => S;
  increaseStat: (key: keyof S) => void;
  clearStats: (args: { except: (keyof S)[] }) => void;
}

export default function useStats<S extends BaseStats<S>>({
  newStats,
}: {
  newStats: () => S;
}): UseStats<S> {
  type StatKey = keyof S;
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
        Object.assign(stats, { [key]: 0 });
      }
    }
  }

  return { getStats, increaseStat, clearStats };
}
