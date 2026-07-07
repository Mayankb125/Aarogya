import { useEffect, useState } from 'react'
import PageShell from '../shared/components/PageShell'
import {
  createHospital,
  createDoctor,
  deleteHospital,
  deleteDoctor,
  listHospitals,
  listDoctors,
  updateHospital,
  updateDoctor,
} from '../shared/services/adminService'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const EMPTY_HOSPITAL_FORM = {
  name: '',
  address: '',
  phone: '',
  open: '09:00',
  close: '21:00',
  specialties: '',
  lat: '',
  lng: '',
  isActive: true,
}

const EMPTY_DOCTOR_FORM = {
  name: '',
  email: '',
  hospitalId: '',
  specialty: '',
  qualification: '',
  experience: '',
  fee: '',
  languages: '',
  bio: '',
  isActive: true,
}

const EMPTY_SCHEDULE = DAYS.reduce((acc, day) => {
  acc[day] = { start: '', end: '', slotsPerHour: '4' }
  return acc
}, {})

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildSchedule(scheduleInput) {
  const schedule = {}
  DAYS.forEach((day) => {
    const { start, end, slotsPerHour } = scheduleInput[day]
    if (start && end) {
      schedule[day] = {
        start,
        end,
        slotsPerHour: Number(slotsPerHour) || 4,
      }
    }
  })
  return schedule
}

function hospitalToForm(hospital) {
  return {
    id: hospital.id,
    name: hospital.name,
    address: hospital.address,
    phone: hospital.phone,
    open: hospital.timings?.open || '09:00',
    close: hospital.timings?.close || '21:00',
    specialties: Array.isArray(hospital.specialties) ? hospital.specialties.join(', ') : '',
    lat: hospital.location?.lat ?? '',
    lng: hospital.location?.lng ?? '',
    isActive: hospital.isActive !== false,
  }
}

function doctorToForm(doctor) {
  const scheduleInput = { ...EMPTY_SCHEDULE }
  if (doctor.schedule) {
    DAYS.forEach((day) => {
      if (doctor.schedule[day]) {
        scheduleInput[day] = {
          start: doctor.schedule[day].start || '',
          end: doctor.schedule[day].end || '',
          slotsPerHour: String(doctor.schedule[day].slotsPerHour || '4'),
        }
      }
    })
  }
  return {
    id: doctor.id,
    name: doctor.name,
    email: doctor.email || '',
    hospitalId: doctor.hospitalId,
    specialty: doctor.specialty,
    qualification: doctor.qualification,
    experience: String(doctor.experience || ''),
    fee: String(doctor.fee || ''),
    languages: Array.isArray(doctor.languages) ? doctor.languages.join(', ') : '',
    bio: doctor.bio,
    isActive: doctor.isActive !== false,
  }
}

function hospitalFormToPayload(form) {
  return {
    name: form.name,
    address: form.address,
    phone: form.phone,
    timings: { open: form.open, close: form.close },
    specialties: splitList(form.specialties),
    location: {
      lat: form.lat === '' ? 0 : Number(form.lat),
      lng: form.lng === '' ? 0 : Number(form.lng),
    },
    isActive: form.isActive,
  }
}

function doctorFormToPayload(form, scheduleInput) {
  return {
    name: form.name,
    email: form.email,
    hospitalId: form.hospitalId,
    specialty: form.specialty,
    qualification: form.qualification,
    experience: form.experience === '' ? 0 : Number(form.experience),
    fee: form.fee === '' ? 0 : Number(form.fee),
    languages: splitList(form.languages),
    bio: form.bio,
    schedule: buildSchedule(scheduleInput),
    isActive: form.isActive,
  }
}

function HospitalForm({ form, setForm, onSubmit, onCancel, isEditing }) {
  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <form
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={onSubmit}
    >
      <h2 className="text-lg font-semibold">
        {isEditing ? 'Edit hospital' : 'Add hospital'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="h-name">
          Name
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
          id="h-name"
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. City Care Clinic"
          value={form.name}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="h-address">
          Address
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
          id="h-address"
          onChange={(e) => update('address', e.target.value)}
          placeholder="Street, area, city"
          value={form.address}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="h-phone">
          Phone
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
          id="h-phone"
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+91 ..."
          value={form.phone}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="h-open">
            Opens
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
            id="h-open"
            onChange={(e) => update('open', e.target.value)}
            type="time"
            value={form.open}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="h-close">
            Closes
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
            id="h-close"
            onChange={(e) => update('close', e.target.value)}
            type="time"
            value={form.close}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="h-specialties">
          Specialties (comma separated)
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
          id="h-specialties"
          onChange={(e) => update('specialties', e.target.value)}
          placeholder="general, cardiology, dermatology"
          value={form.specialties}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="h-lat">
            Latitude
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
            id="h-lat"
            inputMode="decimal"
            onChange={(e) => update('lat', e.target.value)}
            placeholder="19.1234"
            value={form.lat}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="h-lng">
            Longitude
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
            id="h-lng"
            inputMode="decimal"
            onChange={(e) => update('lng', e.target.value)}
            placeholder="72.8567"
            value={form.lng}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          checked={form.isActive}
          onChange={(e) => update('isActive', e.target.checked)}
          type="checkbox"
        />
        Active
      </label>

      <div className="flex gap-3">
        <button
          className="flex-1 rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!form.name.trim() || !form.specialties.trim()}
          type="submit"
        >
          {isEditing ? 'Save changes' : 'Add hospital'}
        </button>
        {isEditing ? (
          <button
            className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}

function DoctorForm({
  form,
  setForm,
  scheduleInput,
  setScheduleInput,
  hospitals,
  onSubmit,
  onCancel,
  isEditing,
}) {
  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateSchedule(day, field, value) {
    setScheduleInput((current) => ({
      ...current,
      [day]: { ...current[day], [field]: value },
    }))
  }

  const selectedHospital = hospitals.find(h => h.id === form.hospitalId);
  const domainSuffix = selectedHospital
    ? `@${selectedHospital.name.toLowerCase().replace(/[^a-z]/g, '')}.com`
    : '';

  function handleHospitalChange(newHospitalId) {
    update('hospitalId', newHospitalId);
    const newHospital = hospitals.find(h => h.id === newHospitalId);
    const newSuffix = newHospital
      ? `@${newHospital.name.toLowerCase().replace(/[^a-z]/g, '')}.com`
      : '';
    const prefix = form.email.split('@')[0] || '';
    update('email', prefix + newSuffix);
  }

  function handleEmailPrefixChange(prefix) {
    const cleanPrefix = prefix.replace(/[^a-zA-Z0-9.-]/g, '').toLowerCase();
    update('email', cleanPrefix + domainSuffix);
  }

  return (
    <form
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={onSubmit}
    >
      <h2 className="text-lg font-semibold">
        {isEditing ? 'Edit doctor' : 'Add doctor'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="d-name">
          Name
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
          id="d-name"
          onChange={(e) => update('name', e.target.value)}
          placeholder="Dr. Priya Sharma"
          value={form.name}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="d-hospital">
          Hospital
        </label>
        <select
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
          id="d-hospital"
          onChange={(e) => handleHospitalChange(e.target.value)}
          value={form.hospitalId}
        >
          <option value="">Select hospital</option>
          {hospitals.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="d-email-prefix">
          Email Address Prefix
        </label>
        <div className="flex mt-1 rounded-md shadow-sm">
          <input
            id="d-email-prefix"
            type="text"
            required
            placeholder="e.g. priyasharma"
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-r-0 border-slate-300 outline-none focus:border-emerald-500 text-sm"
            value={form.email.split('@')[0] || ''}
            onChange={(e) => handleEmailPrefixChange(e.target.value)}
          />
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-medium">
            {domainSuffix || '@select-hospital.com'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="d-specialty">
            Specialty
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
            id="d-specialty"
            onChange={(e) => update('specialty', e.target.value)}
            placeholder="cardiology"
            value={form.specialty}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="d-fee">
            Fee (₹)
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
            id="d-fee"
            inputMode="numeric"
            onChange={(e) => update('fee', e.target.value)}
            placeholder="500"
            value={form.fee}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="d-qualification">
          Qualification
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
          id="d-qualification"
          onChange={(e) => update('qualification', e.target.value)}
          placeholder="MBBS, MD Cardiology"
          value={form.qualification}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="d-experience">
            Experience (years)
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
            id="d-experience"
            inputMode="numeric"
            onChange={(e) => update('experience', e.target.value)}
            placeholder="12"
            value={form.experience}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="d-languages">
            Languages (comma separated)
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
            id="d-languages"
            onChange={(e) => update('languages', e.target.value)}
            placeholder="Hindi, English"
            value={form.languages}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="d-bio">
          Bio
        </label>
        <textarea
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
          id="d-bio"
          onChange={(e) => update('bio', e.target.value)}
          placeholder="Short description of practice"
          rows={2}
          value={form.bio}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">Weekly schedule</p>
        <p className="mt-1 text-xs text-slate-500">
          Leave a day blank to mark it as off. Slots are generated from these hours.
        </p>
        <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-slate-50 text-xs font-semibold text-slate-600">
            <span className="px-2 py-2">Day</span>
            <span className="px-2 py-2">Start</span>
            <span className="px-2 py-2">End</span>
            <span className="px-2 py-2">Slots/hr</span>
          </div>
          {DAYS.map((day) => (
            <div
              className="grid grid-cols-[1fr_1fr_1fr_1fr] border-t border-slate-100 text-sm"
              key={day}
            >
              <span className="px-2 py-2 capitalize text-slate-700">{day}</span>
              <input
                aria-label={`${day} start`}
                className="border-x border-slate-100 px-2 py-1 outline-none focus:bg-emerald-50"
                onChange={(e) => updateSchedule(day, 'start', e.target.value)}
                type="time"
                value={scheduleInput[day].start}
              />
              <input
                aria-label={`${day} end`}
                className="border-x border-slate-100 px-2 py-1 outline-none focus:bg-emerald-50"
                onChange={(e) => updateSchedule(day, 'end', e.target.value)}
                type="time"
                value={scheduleInput[day].end}
              />
              <input
                aria-label={`${day} slots per hour`}
                className="px-2 py-1 outline-none focus:bg-emerald-50"
                inputMode="numeric"
                onChange={(e) => updateSchedule(day, 'slotsPerHour', e.target.value)}
                type="number"
                value={scheduleInput[day].slotsPerHour}
              />
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          checked={form.isActive}
          onChange={(e) => update('isActive', e.target.checked)}
          type="checkbox"
        />
        Active
      </label>

      <div className="flex gap-3">
        <button
          className="flex-1 rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!form.name.trim() || !form.email.trim() || !form.hospitalId || !form.specialty.trim()}
          type="submit"
        >
          {isEditing ? 'Save changes' : 'Add doctor'}
        </button>
        {isEditing ? (
          <button
            className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}

function AdminOnboardingPage() {
  const [tab, setTab] = useState('hospitals')
  const [hospitalList, setHospitalList] = useState([])
  const [doctorList, setDoctorList] = useState([])
  const [hospitalForm, setHospitalForm] = useState(EMPTY_HOSPITAL_FORM)
  const [doctorForm, setDoctorForm] = useState(EMPTY_DOCTOR_FORM)
  const [scheduleInput, setScheduleInput] = useState(EMPTY_SCHEDULE)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadLists() {
    setLoading(true)
    setError('')
    try {
      const [hospitals, doctors] = await Promise.all([listHospitals(), listDoctors()])
      setHospitalList(hospitals)
      setDoctorList(doctors)
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [hospitals, doctors] = await Promise.all([listHospitals(), listDoctors()])
        if (cancelled) return
        setHospitalList(hospitals)
        setDoctorList(doctors)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.response?.data?.message || loadError.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function resetHospitalForm() {
    setHospitalForm(EMPTY_HOSPITAL_FORM)
  }

  function resetDoctorForm() {
    setDoctorForm(EMPTY_DOCTOR_FORM)
    setScheduleInput(EMPTY_SCHEDULE)
  }

  async function submitHospital(event) {
    event.preventDefault()
    setError('')
    const payload = hospitalFormToPayload(hospitalForm)
    try {
      if (hospitalForm.id) {
        await updateHospital(hospitalForm.id, payload)
      } else {
        await createHospital(payload)
      }
      resetHospitalForm()
      await loadLists()
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message)
    }
  }

  async function submitDoctor(event) {
    event.preventDefault()
    setError('')
    const payload = doctorFormToPayload(doctorForm, scheduleInput)
    try {
      if (doctorForm.id) {
        await updateDoctor(doctorForm.id, payload)
      } else {
        await createDoctor(payload)
      }
      resetDoctorForm()
      await loadLists()
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message)
    }
  }

  async function removeHospital(id) {
    if (!window.confirm('Delete this hospital? Its doctors will also be removed.')) return
    setError('')
    try {
      await deleteHospital(id)
      if (hospitalForm.id === id) resetHospitalForm()
      await loadLists()
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || deleteError.message)
    }
  }

  async function removeDoctor(id) {
    if (!window.confirm('Delete this doctor?')) return
    setError('')
    try {
      await deleteDoctor(id)
      if (doctorForm.id === id) resetDoctorForm()
      await loadLists()
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || deleteError.message)
    }
  }

  function editHospital(hospital) {
    setHospitalForm(hospitalToForm(hospital))
    setTab('hospitals')
  }

  function editDoctor(doctor) {
    setDoctorForm(doctorToForm(doctor))
    const restoredSchedule = DAYS.reduce((acc, day) => {
      const daySchedule = doctor.schedule?.[day]
      acc[day] = {
        start: daySchedule?.start || '',
        end: daySchedule?.end || '',
        slotsPerHour: String(daySchedule?.slotsPerHour || '4'),
      }
      return acc
    }, {})
    setScheduleInput(restoredSchedule)
    setTab('doctors')
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Hospital & doctor onboarding"
      description="Add, edit, and remove hospitals and doctors. Seeded clinics appear here and can be modified."
    >
      <div className="space-y-5">
        <div className="flex gap-2">
          <button
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              tab === 'hospitals'
                ? 'bg-emerald-700 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setTab('hospitals')}
            type="button"
          >
            Hospitals ({hospitalList.length})
          </button>
          <button
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              tab === 'doctors'
                ? 'bg-emerald-700 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setTab('doctors')}
            type="button"
          >
            Doctors ({doctorList.length})
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {tab === 'hospitals' ? (
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <HospitalForm
              form={hospitalForm}
              isEditing={Boolean(hospitalForm.id)}
              onCancel={resetHospitalForm}
              onSubmit={submitHospital}
              setForm={setHospitalForm}
            />
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="font-semibold">Onboarded hospitals</h2>
              </div>
              {loading ? (
                <p className="p-4 text-slate-600">Loading...</p>
              ) : hospitalList.length === 0 ? (
                <p className="p-4 text-slate-600">No hospitals yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {hospitalList.map((hospital) => (
                    <div className="p-4" key={hospital.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{hospital.name}</p>
                          <p className="text-sm text-slate-500">{hospital.address}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {hospital.timings?.open}–{hospital.timings?.close} ·{' '}
                            {Array.isArray(hospital.specialties)
                              ? hospital.specialties.join(', ')
                              : ''}
                          </p>
                          <span
                            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                              hospital.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {hospital.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => editHospital(hospital)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-md border border-rose-300 px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                            onClick={() => removeHospital(hospital.id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
            <DoctorForm
              form={doctorForm}
              hospitals={hospitalList}
              isEditing={Boolean(doctorForm.id)}
              onCancel={resetDoctorForm}
              onSubmit={submitDoctor}
              scheduleInput={scheduleInput}
              setForm={setDoctorForm}
              setScheduleInput={setScheduleInput}
            />
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="font-semibold">Onboarded doctors</h2>
              </div>
              {loading ? (
                <p className="p-4 text-slate-600">Loading...</p>
              ) : doctorList.length === 0 ? (
                <p className="p-4 text-slate-600">No doctors yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {doctorList.map((doctor) => {
                    const hospital = hospitalList.find((item) => item.id === doctor.hospitalId)
                    return (
                      <div className="p-4" key={doctor.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{doctor.name}</p>
                            <p className="text-sm text-slate-500">
                              {doctor.specialty} · ₹{doctor.fee}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {hospital ? hospital.name : 'Unknown hospital'}
                            </p>
                            <span
                              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                                doctor.isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {doctor.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              onClick={() => editDoctor(doctor)}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-md border border-rose-300 px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                              onClick={() => removeDoctor(doctor.id)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </PageShell>
  )
}

export default AdminOnboardingPage
