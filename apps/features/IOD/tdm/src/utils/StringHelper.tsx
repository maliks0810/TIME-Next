export const isNullOrEmpty = (inputString: string | null | undefined) : boolean =>
{
    return inputString === null || inputString === undefined || inputString.trim().length === 0;
}