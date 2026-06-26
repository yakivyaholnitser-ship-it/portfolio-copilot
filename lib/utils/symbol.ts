const symbolPattern = /^[A-Z][A-Z0-9.-]{0,14}$/;

export function normalizeSymbol(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const symbol = value.trim().toUpperCase();

  return symbolPattern.test(symbol) ? symbol : null;
}
