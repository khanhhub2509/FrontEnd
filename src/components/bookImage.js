const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const getBookImageUrl = (image) => {
  if (!image) return '';
  if (/^(https?:|blob:|data:)/i.test(image)) return image;
  return `${API_BASE_URL}/uploads/${encodeURIComponent(image)}`;
};
