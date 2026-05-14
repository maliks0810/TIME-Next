import { DateFormatEnum } from "./constants";

export function getDateFormat(period:string) {
    if(['5Y', 'MAX'].includes(period)) {
        return DateFormatEnum.MONTH;
    }
    return DateFormatEnum.DAY;
}

export const formatNegativeNumber = (value: number) => {
    const number = Number(value);
    if (number < 0) {
        return `(${Math.abs(number).toFixed(2)})`;
    }
    return number.toFixed(2);
};
