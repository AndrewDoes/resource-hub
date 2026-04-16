export const getInitials = (name?: string | null): string => {
  if (!name || name.trim() === '') return '??';
  
  return name
    .trim()
    .split(/\s+/) // Splits by one or more spaces to avoid empty strings
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const normalizeStatus = (status?: string | null): string => {
  if (!status) return "";
  return status
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
};
