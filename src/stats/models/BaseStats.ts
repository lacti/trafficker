import StatStats from "./StatStats";

type BaseStats<S extends { [Key in keyof S]: number }> = {
  [Key in keyof S]: number;
} &
  StatStats;

export default BaseStats;
