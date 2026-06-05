export const areFirst2CharLetters = (input: string): boolean =>
  /^[A-Za-z]{2}/.test(input);

export const isStrictlyAlphanumeric = (value: string): boolean =>
  /^[a-zA-Z0-9]+$/.test(value);

export const isValidString = (str: string | null | undefined): boolean =>
  typeof str === "string" && str.trim() !== "";

export const isValidNumber = (str: string | null | undefined): boolean => {
  if (str == "") return false;
  if (isNaN(Number(str))) return false;
  return true;
};

export const isValidPrice = (str: string | null | undefined): boolean => {
  if (!isValidNumber(str)) return false;
  if (Number(str) === 0) return false;
  return true;
};

export const isValidNotes = (
  sector: string | null | undefined,
  notes: string | null | undefined,
): boolean => {
  if (sector !== "SFR" && (!isValidString(notes) || notes?.trim() === "")) return false;
  return true;
};

export const isValidLoanCategory = (loanCategoryValue: string | null | undefined): boolean => {
  if (loanCategoryValue == "REVIEW") return false;
  return isValidString(loanCategoryValue);
};

export const isValidCallDate = (
  sectorValue: string | null | undefined,
  callableValue: string | null | undefined,
  dateValue: string | null | undefined,
): boolean => {
  if (sectorValue === "RPL") {
    if (isValidString(callableValue) && callableValue !== 'N' && callableValue !== 'Cleanup') {
      return isValidString(dateValue);
    }
    return true;
  }

  if (callableValue === "Y" && !isValidString(dateValue)) return false;
  return true;
};

export const isRPLStringFieldValid = (
  sectorValue: string | null | undefined,
  fieldValue: string | null | undefined,
): boolean => {
  if (sectorValue === "RPL" && !isValidString(fieldValue)) return false;
  return true;
};

export const isRPLNumberFieldValid = (
  sectorValue: string | null | undefined,
  fieldValue: number | null | undefined,
): boolean => {
  if (sectorValue === "RPL" && !isValidNumber(`${fieldValue}`)) return false;
  return true;
};

export const isValidIdentifier = (
  identifierType: string | null | undefined,
  identifierValue: string | null | undefined,
): boolean => {
  if (!identifierValue) return false;

  if (identifierType === "CUSIP" && identifierValue.length !== 9) return false;

  if (identifierType === "FIGI") {
    if (identifierValue.length !== 12) return false;
    if (!identifierValue.toUpperCase().startsWith("BBG")) return false;
  }

  if (identifierType === "ISIN") {
    if (identifierValue.length !== 12) return false;
    if (!areFirst2CharLetters(identifierValue)) return false;
  }

  return isStrictlyAlphanumeric(identifierValue);
};
