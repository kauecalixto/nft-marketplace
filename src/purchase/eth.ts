// Aritmética de ETH em wei (BigInt). Valores trafegam como strings decimais.
const DECIMALS = 18
const UNIT = 10n ** BigInt(DECIMALS)

export function parseEth(value: string): bigint {
  const m = /^(\d+)(?:\.(\d{1,18}))?$/.exec(value.trim())
  if (!m) throw new Error(`valor ETH inválido: ${value}`)
  return BigInt(m[1]) * UNIT + BigInt((m[2] ?? '').padEnd(DECIMALS, '0'))
}

// Formata com no mínimo 2 casas e sem zeros à direita além disso (0.50, 12.00, 3.333).
export function formatEth(wei: bigint): string {
  const int = wei / UNIT
  const frac = (wei % UNIT).toString().padStart(DECIMALS, '0').replace(/0+$/, '').padEnd(2, '0')
  return `${int}.${frac}`
}

export const mulInt = (wei: bigint, qty: number): bigint => wei * BigInt(qty)
export const percentOf = (wei: bigint, pct: number): bigint => (wei * BigInt(pct)) / 100n
