export function getRatingsClassname(ratings: string): string {
    const r = ratings.split('/')[0].trim(); // first agency (Moody's)
    if (r.startsWith('Aaa') || r.startsWith('AAA') || r.startsWith('Aa1'))
        return 'ratingsColValueSuccess';
    if (r.startsWith('Aa') || r.startsWith('AA') || r.startsWith('A')) return 'ratingsColValueInfo';
    if (r.startsWith('Baa') || r.startsWith('BBB')) return 'ratingsColValueWarning';
    if (r.startsWith('Ba') || r.startsWith('BB')) return 'ratingsColValueError';
    if (r === 'WR' || r === 'NR' || r === '-') return 'ratingsColValueTertiary';
    return 'ratingsColValue';
}
