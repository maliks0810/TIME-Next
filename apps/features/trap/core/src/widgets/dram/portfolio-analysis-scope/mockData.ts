/** Colleagues the workspace can be shared with (everyone on the desk but me). */
const ROLES = ["Portfolio Manager", "Research Analyst", "Risk & Research", "Client Portfolio Mgr", "Quant Strategist"];
export interface Colleague {
  name: string;
  role: string;
  initials: string;
}

/** Managers who should not appear in the share recipient list. */
const NOT_SHAREABLE = new Set(["S. Kim", "D. Ross"]);

const MANAGERS = [
  "M. Chahal", "R. Barriger", "J. Lopez", "O. Mirzayev", "B. Bailey", "P. Gonzales",
  "M. Chahal", "M. Chahal", "J. Smith", "S. Kim", "D. Ross", "L. Wu", "T. Nguyen",
  "F. Alvarez", "G. Okoro",
];

/** The current signed-in user. */
export const ME = "M. Chahal";

export const COLLEAGUES: Colleague[] = MANAGERS.filter((m) => m !== ME)
  .map((name, i) => ({
    name,
    role: ROLES[i % ROLES.length],
    initials: name
      .replace(/[.]/g, "")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase(),
  }))
  .filter((c) => !NOT_SHAREABLE.has(c.name));

export const sampleGroups = [
  {"id":"1","name":"Health group","portfolioSelectionIds":["4601T","6430T"]},
  {"id":"2","name":"EM group","portfolioSelectionIds":["4226T","4227T","4782T"]},
  {"id":"3","name":"Asset group","portfolioSelectionIds":["6717T"]}
];