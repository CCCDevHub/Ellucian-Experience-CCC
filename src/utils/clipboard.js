export const getPreferredEmail = (emails) => {
    if (!emails?.length) return '';
    const preferred = emails.find(e => e.type?.emailType === 'school' || e.type?.emailType === 'hr');
    return (preferred ?? emails[0])?.address ?? '';
};

export const copyToClipboard = (text) => navigator.clipboard.writeText(text);
