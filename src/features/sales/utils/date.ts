import { formatInTimeZone } from "date-fns-tz"

const CR_TZ = "America/Costa_Rica"

/**
 * "YYYY-MM-DD" + hora actual CR => ISO con offset (ej: 2026-02-20T21:37:05-06:00)
 */
export function buildCRZonedISOFromDateValueWithNowTime(dateValue: string) {
  const now = new Date()
  const timePart = formatInTimeZone(now, CR_TZ, "HH:mm:ss")
  const offset = formatInTimeZone(now, CR_TZ, "xxx") // "-06:00"
  return `${dateValue}T${timePart}${offset}`
}

export function toInputDateValue(d: Date) {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return x.toISOString().slice(0, 10)
}

export function fromInputDateValue(value: string) {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}
export function formatCRC(n: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(n)
}