import type { Place } from "../services/place.service"

type Props = {
  places: Place[]
  value: number | ""
  onChange: (value: number | "") => void
}

export function PlacePicker({ places, value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
           Lugar
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        className="w-full rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#708C3E]/30"
      >
        <option value="">Seleccioná un lugar</option>

        {places.map((p: Place) => (
          <option key={p.idPlace} value={p.idPlace}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}