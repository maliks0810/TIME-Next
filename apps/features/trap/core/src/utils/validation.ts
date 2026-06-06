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

/**
 * ISIN check-digit (ISO 6166 — double-add-double Luhn on expanded digit string).
 * Format: 2-letter country code + 9-char NSIN + 1 check digit = 12 chars.
 */
export function isValidIsin(isin: string): boolean {
    if (isin.length !== 12) return false;
    if (!/^[A-Z]{2}/.test(isin)) return false;

    let digitString = "";

    for (let i = 0; i < 12; i++) {
        const c = isin.charAt(i);

        if (c >= "A" && c <= "Z") {
            digitString += (c.charCodeAt(0) - 55).toString();
        } else if (c >= "0" && c <= "9") {
            digitString += c;
        } else {
            return false;
        }
    }

    let sum = 0;
    let alt = false;

    for (let i = digitString.length - 1; i >= 0; i--) {
        let n = parseInt(digitString.charAt(i), 10);

        if (alt) {
            n *= 2;
            if (n > 9) n -= 9;
        }

        sum += n;
        alt = !alt;
    }

    return sum % 10 === 0;
}

/**
 * FIGI check-digit (Modulus 10 Double Add Double).
 * Format: 2-char provider + 'G' + 8 alphanumeric (no vowels) + 1 check digit = 12 chars.
 * Letters: A=10, B=11, …, Z=35. Vowels excluded from chars 4–11.
 * Doubles every second value from the right (starting at position 10, 1-indexed).
 */
export function isValidFigi(figi: string): boolean {
    if (figi.length !== 12) return false;
    if (figi.charAt(2) !== "G") return false;

    const vowels = new Set(["A", "E", "I", "O", "U"]);

    // Validate chars 4–11 (index 3–10): alphanumeric, no vowels
    for (let i = 3; i < 11; i++) {
        const c = figi.charAt(i);

        if (vowels.has(c)) return false;
        if (!/[A-Z0-9]/.test(c)) return false;
    }

    // Check digit (char 12) must be numeric
    const checkChar = figi.charAt(11);
    if (!/[0-9]/.test(checkChar)) return false;

    // Modulus 10 Double Add Double on first 11 chars
    // Working right to left, double every second value
    const values: number[] = [];

    for (let i = 0; i < 11; i++) {
        const c = figi.charAt(i);

        if (c >= "0" && c <= "9") {
            values.push(parseInt(c, 10));
        } else if (c >= "A" && c <= "Z") {
            values.push(c.charCodeAt(0) - 55);
        } else {
            return false;
        }
    }

    let sum = 0;
    let doubleIt = true; // start doubling from rightmost (index 10)

    for (let i = values.length - 1; i >= 0; i--) {
        let val = values[i];

        if (doubleIt) {
            val *= 2;
        }

        // Split digits and sum
        sum += Math.floor(val / 10) + (val % 10);
        doubleIt = !doubleIt;
    }

    const expected = (10 - (sum % 10)) % 10;
    return parseInt(checkChar, 10) === expected;
}

export function validateStagingForm(params: {
    extId: string;
    prepaymentType?: string;
    prepaymentValue: number | null;
    defaultType?: string;
    defaultValue: number | null;
}): ValidationErrors {
    const errors: ValidationErrors = {};

    const id = params.extId.trim().toUpperCase();

    if (id) {
        if (id.length !== 9) {
            errors.extId = "CUSIP must be exactly 9 characters";
        } else if (!isValidCusip(id)) {
            errors.extId = "Invalid CUSIP — check digit does not match";
        }
    }

    if (params.prepaymentType && params.prepaymentValue == null) {
        errors.prepayment = "Value is required when a prepayment type is selected";
    }

    if (params.defaultType && params.defaultValue == null) {
        errors.default = "Value is required when a default type is selected";
    }

    return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
    return Object.keys(errors).length > 0;
}