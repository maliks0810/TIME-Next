import { getNextAvailableLetter } from "./common";

export const getNextOrderId = (
    baseOrderId: string,
    existingOrderIds: string[]
) => {
    const usedLetters = existingOrderIds.map(
        (id) => id.replace(baseOrderId, "")
    );

    const letter =
        getNextAvailableLetter(usedLetters);

    return `${baseOrderId}${letter}`;
};