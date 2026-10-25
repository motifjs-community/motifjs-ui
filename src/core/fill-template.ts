/** `fillTemplate('At least {min}', { min: 3 })` → `At least 3` */
export function fillTemplate(template: string, values: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (all, name: string) => (name in values ? String(values[name]) : all));
}
