import { useState } from 'react'

function SlotPicker({ slotDays, selectedSlot, onSelect }) {
  const [selectedDate, setSelectedDate] = useState(slotDays[0]?.date || '')

  const activeDay = slotDays.find((day) => day.date === selectedDate)
  const slots = activeDay?.slots || []

  const availableCount = slots.filter((slot) => slot.status === 'available').length

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700">Pick a date</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
          {slotDays.map((day) => {
            const dayDate = new Date(`${day.date}T00:00:00`)
            const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short' })
            const dateLabel = dayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
            const daySlots = day.slots || []
            const hasOpen = daySlots.some((slot) => slot.status === 'available')
            return (
              <button
                className={`shrink-0 rounded-md border px-3 py-2 text-center text-sm ${
                  selectedDate === day.date
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-300 text-slate-700 hover:border-emerald-400'
                } ${!hasOpen ? 'opacity-40' : ''}`}
                disabled={!hasOpen}
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                type="button"
              >
                <p className="font-semibold">{dayLabel}</p>
                <p className="text-xs text-slate-500">{dateLabel}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Available slots</p>
          <span className="text-xs text-slate-500">{availableCount} open</span>
        </div>
        {slots.length === 0 ? (
          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No slots on this day. The doctor is not scheduled. Try another date.
          </p>
        ) : (
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id
              const isAvailable = slot.status === 'available'
              return (
                <button
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    !isAvailable
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400 line-through'
                      : isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                  disabled={!isAvailable}
                  key={slot.id}
                  onClick={() => onSelect(slot)}
                  type="button"
                >
                  {slot.time}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SlotPicker
