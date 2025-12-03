export const getRelativeTime = (utcDateString) => {
    const now = new Date();
    const date = new Date(utcDateString);

    // Adjust UTC time to local time (e.g., Myanmar is UTC+6:30)
    const myanmarOffset = 6.5 * 60; // minutes
    const localDate = new Date(date.getTime() + myanmarOffset * 60 * 1000);

    const diffMs = now - localDate;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 10) return "just now";
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    // For older dates, return full date
    return `on ${localDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })} at ${localDate.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })}`;
}
