export function generateOrderNumber() {
  // Matches the frontend style: JJ########
  const digits = Math.floor(Math.random() * 1e8)
    .toString()
    .padStart(8, '0');
  return `JJ${digits}`;
}
