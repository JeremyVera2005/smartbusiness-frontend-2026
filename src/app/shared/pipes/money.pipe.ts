import { Pipe, PipeTransform } from '@angular/core';

/** Formatea un número como moneda en soles: 1234.5 -> "S/ 1,234.50". */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  private readonly fmt = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  transform(value: number | string | null | undefined): string {
    const n = typeof value === 'string' ? Number(value) : value;
    if (n == null || Number.isNaN(n)) {
      return 'S/ 0.00';
    }
    return `S/ ${this.fmt.format(n)}`;
  }
}
