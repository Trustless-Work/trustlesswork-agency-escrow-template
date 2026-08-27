export function shortenAddress(address: string, lead = 6, tail = 4): string {
  if (address.length <= lead + tail + 1) {
    return address;
  }
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

export function formatAmount(amount: number, asset: string): string {
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 7 })} ${asset}`;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatDate(iso?: string): string | null {
  if (!iso) {
    return null;
  }
  const dateOnly = DATE_ONLY_PATTERN.exec(iso);
  let date: Date;
  if (dateOnly) {
    const [year, month, day] = dateOnly.slice(1).map(Number);
    date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
  } else {
    date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
