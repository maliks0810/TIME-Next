export const getStatusColor = (status: string) => {
    switch (status) {
        case "DRAFT":
            return "warning";     // Yellow (work in progress)
        
        case "SUBMITTED":
            return "info";        // Blue (submitted, waiting)

        case "PROCESSING":
            return "primary";     // Blue/Purple (in progress)

        case "FILE_GENERATED":
            return "success";   // Purple (system stage)

        case "TRANSFERRED":
            return "success";     // Green (successful step)

        case "COMPLETED":
            return "success";     // Green (final success)

        case "FAILED":
            return "error";       // Red (failure)

        default:
            return "default";    // Grey fallback
    }
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const getNextAvailableLetter = (
    usedLetters: string[]
): string => {
    return (
        LETTERS
            .split("")
            .find(
                (letter) =>
                    !usedLetters.includes(letter)
            ) ?? ""
    );
};