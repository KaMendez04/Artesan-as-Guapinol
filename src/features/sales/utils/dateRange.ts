function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0)
}

// Semana inicia LUNES
function startOfWeekMonday(d: Date) {
  const x = startOfDay(d)
  const day = x.getDay() // 0 domingo ... 6 sábado
  const diff = (day === 0 ? -6 : 1) - day
  x.setDate(x.getDate() + diff)
  return x
}

export function getRange(mode: "day" | "week" | "month" | "year", anchorDate: Date) {
  if (mode === "day") {
    const start = startOfDay(anchorDate)
    const end = addDays(start, 1)
    return { start, end }
  }

  if (mode === "week") {
    const start = startOfWeekMonday(anchorDate)
    const end = addDays(start, 7)
    return { start, end }
  }

  if (mode === "month") {
    const start = startOfMonth(anchorDate)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1, 0, 0, 0, 0)
    return { start, end }
  }

  const start = startOfYear(anchorDate)
  const end = new Date(start.getFullYear() + 1, 0, 1, 0, 0, 0, 0)
  return { start, end }
}