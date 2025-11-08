export function formatDurationInDays(days?: number | null): string {
  if (days === undefined || days === null || Number.isNaN(days)) {
    return "N/A";
  }

  const totalDays = Math.max(0, Math.floor(days));

  if (totalDays === 0) {
    return "0 days";
  }

  const MONTH_LENGTH = 30;
  const WEEK_LENGTH = 7;

  let remaining = totalDays;
  const months = Math.floor(remaining / MONTH_LENGTH);
  remaining = remaining % MONTH_LENGTH;

  const weeks = Math.floor(remaining / WEEK_LENGTH);
  remaining = remaining % WEEK_LENGTH;

  const parts: string[] = [];

  if (months > 0) {
    parts.push(months === 1 ? "1 month" : `${months} months`);
  }

  if (weeks > 0) {
    parts.push(weeks === 1 ? "1 week" : `${weeks} weeks`);
  }

  if (remaining > 0 || parts.length === 0) {
    parts.push(remaining === 1 ? "1 day" : `${remaining} days`);
  }

  return parts.join(" ");
}

