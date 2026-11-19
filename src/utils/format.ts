export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${String(d).padStart(2, '0')} ${MONTHS_SHORT[m - 1]}`;
}

export function formatFullDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

export function getDayOfWeekFromISO(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function generateTimeSlots(startHour: string, endHour: string, intervalMinutes = 30): string[] {
  const [sh, sm] = startHour.split(':').map(Number);
  const [eh, em] = endHour.split(':').map(Number);
  if (Number.isNaN(sh) || Number.isNaN(eh)) return [];
  const startTotal = sh * 60 + (sm || 0);
  const endTotal = eh * 60 + (em || 0);
  const slots: string[] = [];
  for (let mins = startTotal; mins < endTotal; mins += intervalMinutes) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

export function maskPhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function maskExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function detectCardBrand(number: string): 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX' | 'CARTÃO' {
  const d = number.replace(/\D/g, '');
  if (/^4/.test(d)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'MASTERCARD';
  if (/^(4011|4312|4389|5041|5066|509|6277|6362|6363|650)/.test(d)) return 'ELO';
  if (/^3[47]/.test(d)) return 'AMEX';
  return 'CARTÃO';
}

export function buildPixPayload(amount: number, referenceId: string): string {
  const amtStr = amount.toFixed(2);
  const txid = referenceId.replace(/[^A-Za-z0-9]/g, '').slice(0, 16).toUpperCase() || 'EDYK0001';
  return `00020126580014BR.GOV.BCB.PIX013611982541469-edyk-barbershop-pix520400005303986540${amtStr.length}${amtStr}5802BR5916EDYK BARBERSHOP6009SAO PAULO62140510${txid}6304E2B7`;
}
