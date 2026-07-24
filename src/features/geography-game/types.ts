export type GamePhase = "idle" | "playing" | "finished";

export type CountryStatus = "pending" | "correct" | "skipped";

export type WrongAttempt = {
  code: string;
  sequence: number;
};

