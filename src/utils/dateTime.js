export const formatDate = (dateStr) => {
    if (!dateStr) { return 'N/A' }
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) { return dateStr }
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' });
};

export const formatTime = (isoString) => {
    if (!isoString) { return '' }
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};
