export function getISOWeekNumber(date) {
    const startDate = new Date('2025-01-01T00:00:00');
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    const x = Math.floor(days / 7);
    if ([0, 1, 2].includes(date.getDay())) {
        return x + 1
    }
    return x
}