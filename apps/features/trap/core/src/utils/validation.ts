export type ValidationErrors = {
    extId?: string;
    prepayment?: string;
    default?: string;
};

/**
 * CUSIP check-digit (Luhn-variant for alphanumeric identifiers).
 * Accepts 9-char CUSIP — first 8 are payload, 9th is the check digit.
 */
export function isValidCusip(cusip: string): boolean {
    if (cusip.length !== 9) return false;

    let sum = 0;

    for (let i = 0; i < 8; i++) {
        const c = cusip.charAt(i).toUpperCase();
        let val: number;

        if (c >= "0" && c <= "9") {
            val = parseInt(c, 10);
        } else if (c >= "A" && c <= "Z") {
            val = c.charCodeAt(0) - 55; // A=10 … Z=35
        } else if (c === "*") {
            val = 36;
        } else if (c === "@") {
            val = 37;
        } else if (c === "#") {
            val = 38;
        } else {
            return false; // invalid character
        }

        if (i % 2 === 1) {
            val *= 2;
        }

        sum += Math.floor(val / 10) + (val % 10);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return parseInt(cusip.charAt(8), 10) === checkDigit;
}

export function validateStagingForm(params: {
    extId: string;
    prepaymentType?: string;
    prepaymentValue: number | null;
    defaultType?: string;
    defaultValue: number | null;
}): ValidationErrors {
    const errors: ValidationErrors = {};

    // CUSIP / BDL checksum
    const id = params.extId.trim().toUpperCase();

    if (id) {
        if (id.length !== 9) {
            errors.extId = "CUSIP must be exactly 9 characters";
        } else if (!isValidCusip(id)) {
            errors.extId = "Invalid CUSIP — check digit does not match";
        }
    }

    // Prepayment: type selected → value required
    if (params.prepaymentType && params.prepaymentValue == null) {
        errors.prepayment = "Value is required when a prepayment type is selected";
    }

    // Default: type selected → value required
    if (params.defaultType && params.defaultValue == null) {
        errors.default = "Value is required when a default type is selected";
    }

    return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
    return Object.keys(errors).length > 0;
}