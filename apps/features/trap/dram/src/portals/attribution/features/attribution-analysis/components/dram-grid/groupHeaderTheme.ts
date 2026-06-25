/* =========================================================
   Types
   ========================================================= */

export interface GroupHeaderStyleToken {
  textColor: string;
  backgroundColor: string;
  borderColor: string;
}

/**
 * Allowed token keys (extend as needed)
 */
export type GroupHeaderTokenKey =
  | "default"
  | "neutral"
  | "portfolio"
  | "bench"
  | "attribution"
  | "em"
  | "eq";

/* =========================================================
   Central Design Tokens
   ========================================================= */

/**
 *  Single source of truth for all group header styles
 *  Keep this DRAM-wide (EQ + EM + FI reuse)
 */
export const GROUP_HEADER_TOKENS: Record<
  GroupHeaderTokenKey,
  GroupHeaderStyleToken
> = {
  default: {
    textColor: "#1f1f1f",
    backgroundColor: "#fafafa",
    borderColor: "#d9d9d9",
  },

  neutral: {
    textColor: "#1f1f1f",
    backgroundColor: "#fafafa",
    borderColor: "#d9d9d9",
  },

  portfolio: {
    textColor: "#0958d9",
    backgroundColor: "#e6f4ff",
    borderColor: "#91caff",
  },

  bench: {
    textColor: "#531dab",
    backgroundColor: "#f9f0ff",
    borderColor: "#d3adf7",
  },

  attribution: {
    textColor: "#ad4e00",
    backgroundColor: "#fff7e6",
    borderColor: "#ffd591",
  },

  em: {
    textColor: "#1677ff",
    backgroundColor: "#e6f4ff",
    borderColor: "#91caff",
  },

  eq: {
    textColor: "#237804",
    backgroundColor: "#f6ffed",
    borderColor: "#b7eb8f",
  },
};

/* =========================================================
   Resolver (safe)
   ========================================================= */

/**
 *  Resolves backend token → style object
 *  Never breaks UI (always returns a valid token)
 */
export const resolveGroupHeaderToken = (
  token?: string | null
): GroupHeaderStyleToken => {
  if (typeof token !== "string") {
    return GROUP_HEADER_TOKENS.default;
  }

  const normalized = token.trim().toLowerCase();

  if (normalized in GROUP_HEADER_TOKENS) {
    return GROUP_HEADER_TOKENS[normalized as GroupHeaderTokenKey];
  }

  return GROUP_HEADER_TOKENS.default;
};