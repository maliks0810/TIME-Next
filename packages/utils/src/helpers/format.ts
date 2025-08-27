export const convertToMillions = (num: number): number | string => {
    if (typeof num !== 'number' || isNaN(num)) {
        console.error('Invalid Input');
    }

    return num / 1000000;
}