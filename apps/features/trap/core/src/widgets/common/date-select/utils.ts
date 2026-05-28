export const getMonthEnd = (date: Date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};
export const isMonthEnd = (date: Date) => {
    const d = new Date(date);
    return d.getDate() === getMonthEnd(d).getDate();
};
