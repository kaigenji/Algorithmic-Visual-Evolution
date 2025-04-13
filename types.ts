export interface RGB {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HSB {
  h: number;
  s: number;
  b: number;
}

export interface Cell {
  state: number;
  color?: RGB;
  birth?: number;
  prevDir?: { di: number; dj: number };
  decayDelay?: number;
  decaying?: boolean;
}

export interface Config {
  minCellSize: number;
  maxCellSize: number;
  minTickRate: number;
  maxTickRate: number;
  decay: {
    baseDelay: number;
    baseDecayChance: number;
    slowdownFactor: number;
    minDecayChance: number;
    edgeBreakChance: number;
    randomRange: number;
  };
  creepingFig: {
    baseActivations: number;
    neighborRadius: number;
    branchAge: number;
    directionFollowChance: number;
  };
  binaryTransitions: {
    enabled: boolean;
    threshold: number;
  };
  colorSettings: {
    baseH: number;
    baseS: number;
    baseB: number;
  };
  derivedColors?: HSB[];
  _overrides: Record<string, boolean>;
}

export interface ParameterDefinition {
  path: string;
  label: string;
  description: string;
  min?: number;
  max?: number;
  step?: number;
  type: "range" | "checkbox";
}

export type BounceFunction = (newI: number, newJ: number, offset: { di: number; dj: number }) => { newI: number; newJ: number } | null; 