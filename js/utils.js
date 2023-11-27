function getISOWeekNumber(date) {
    const startDate = new Date('2025-01-01T00:00:00');
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil(days / 7);
}