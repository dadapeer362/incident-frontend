export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatTime(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
