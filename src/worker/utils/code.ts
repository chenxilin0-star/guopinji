export function generateCode(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GP-${prefix}-${random}`;
}

export function isValidCodeFormat(code: string): boolean {
  return /^GP-(7D|15D|30D)-[A-HJ-NP-Z2-9]{8}$/.test(code);
}

export function parseCodePlan(code: string): string | null {
  const match = code.match(/^GP-(7D|15D|30D)-/);
  return match ? match[1] : null;
}
