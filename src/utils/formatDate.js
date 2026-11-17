export const formatOrderDate = (value) => {
  if (!value) return '—';

  let year;
  let month;
  let day;

  if (Array.isArray(value) && value.length >= 3) {
    [year, month, day] = value.map(Number);
  } else if (typeof value === 'string') {
    const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    const vietnameseMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

    if (isoMatch) [, year, month, day] = isoMatch.map(Number);
    else if (vietnameseMatch) [, day, month, year] = vietnameseMatch.map(Number);
  }

  if (year && month && day) {
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('vi-VN');
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? 'Chưa cập nhật' : parsedDate.toLocaleDateString('vi-VN');
};
