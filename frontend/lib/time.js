export const formatIST = (date) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    }).format(d);
};

export const formatISTDate = (date) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(d).toUpperCase();
};

export const formatISTDateTime = (date) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(d).toUpperCase();
};
