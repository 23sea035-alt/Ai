export type ModerationAction = "allow" | "block" | "crisis";

export interface CategoryScore {
  category: string;
  score: number;
}

export interface InputVerdict {
  action: ModerationAction;
  categories: CategoryScore[];
  escalated: boolean;
  layer: string;
  policyVersion: string;
  crisisResources?: string[];
  reason?: string;
}

export interface OutputVerdict {
  action: ModerationAction;
  categories: CategoryScore[];
  escalated: boolean;
  layer: string;
  policyVersion: string;
  safeFallback?: string;
}

export interface UserContext {
  userId: string;
  isMinor: boolean;
  recentSafetyEvents?: number;
}

export interface Moderator {
  screenInput(text: string, ctx: UserContext): Promise<InputVerdict>;
  screenOutput(text: string): Promise<OutputVerdict>;
}
