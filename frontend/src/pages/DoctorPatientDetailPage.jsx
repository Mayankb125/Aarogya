import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageShell from '../shared/components/PageShell'
import {
  addConsultation,
  addReminder,
  completeReminder,
  getPatientProfile,
} from '../shared/services/patientService'

const EMPTY_CONSULTATION = {
  date: new Date().toISOString().slice(0, 10),
  reason: '',
  diagnosis: '',
  prescription: '',
  notes: '',
}

const EMPTY_REMINDER = {
  message: '',
  followUpDate: '',
}

function formatDate(value) {
  if (!value) return '-'
  const date = typeof value === 'string' && value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(dateString) {
  if (!dateString) return null
  const target = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(target.getTime())) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.round((target - now) / 86400000)
  return diff
}

function RemindersDueTag({ dateString }) {
  const days = daysUntil(dateString)
  if (days === null) return null
  if (days < 0)
    return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">Overdue {Math.abs(days)}d</span>
  if (days === 0)
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Due today</span>
  if (days <= 3)
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">In {days}d</span>
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">In {days}d</span>
}

function ConsultationForm({ patientId, doctorId, onSaved }) {
  const [form, setForm] = useState(EMPTY_CONSULTATION)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function update(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (!form.diagnosis.trim()) {
      setError('Diagnosis is required')
      return
    }
    setError('')
    setIsSaving(true)
    try {
      await addConsultation(patientId, { ...form, doctorId })
      setForm({ ...EMPTY_CONSULTATION, date: new Date().toISOString().slice(0, 10) })
      onSaved?.()
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600" htmlFor="cons-date">Date</label>
          <input
            id="cons-date"
            type="date"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            value={form.date}
            onChange={update('date')}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600" htmlFor="cons-reason">Reason for visit</label>
          <input
            id="cons-reason"
            type="text"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="Chest pain, follow-up..."
            value={form.reason}
            onChange={update('reason')}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="cons-diagnosis">Diagnosis *</label>
        <input
          id="cons-diagnosis"
          type="text"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          placeholder="Primary diagnosis"
          value={form.diagnosis}
          onChange={update('diagnosis')}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="cons-prescription">Prescription</label>
        <input
          id="cons-prescription"
          type="text"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          placeholder="Drug, dose, duration"
          value={form.prescription}
          onChange={update('prescription')}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="cons-notes">Remarks / notes</label>
        <textarea
          id="cons-notes"
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          placeholder="Observations, advice, next steps..."
          value={form.notes}
          onChange={update('notes')}
        />
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSaving ? 'Saving...' : 'Save consultation'}
      </button>
    </form>
  )
}

function ReminderForm({ patientId, doctorId, onSaved }) {
  const [form, setForm] = useState(EMPTY_REMINDER)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!form.message.trim() || !form.followUpDate) {
      setError('Message and follow-up date are required')
      return
    }
    setError('')
    setIsSaving(true)
    try {
      await addReminder(patientId, { ...form, doctorId })
      setForm(EMPTY_REMINDER)
      onSaved?.()
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  function quickFill(days) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setForm((current) => ({
      ...current,
      followUpDate: date.toISOString().slice(0, 10),
    }))
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="rem-message">Reminder message *</label>
        <textarea
          id="rem-message"
          rows={2}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          placeholder="Repeat lipid profile and review BP diary."
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="block text-xs font-medium text-slate-600" htmlFor="rem-date">Follow-up date *</label>
          <input
            id="rem-date"
            type="date"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            value={form.followUpDate}
            onChange={(event) => setForm((current) => ({ ...current, followUpDate: event.target.value }))}
          />
        </div>
        <div className="flex items-end gap-2 text-xs">
          <button type="button" onClick={() => quickFill(7)} className="rounded-md border border-slate-300 px-2.5 py-1.5 font-medium hover:bg-slate-100">+7d</button>
          <button type="button" onClick={() => quickFill(14)} className="rounded-md border border-slate-300 px-2.5 py-1.5 font-medium hover:bg-slate-100">+14d</button>
          <button type="button" onClick={() => quickFill(30)} className="rounded-md border border-slate-300 px-2.5 py-1.5 font-medium hover:bg-slate-100">+30d</button>
        </div>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSaving ? 'Saving...' : 'Add reminder'}
      </button>
    </form>
  )
}

function DoctorPatientDetailPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  function load() {
    setIsLoading(true)
    setError('')
    getPatientProfile(patientId)
      .then((data) => setPatient(data))
      .catch((loadError) => setError(loadError.response?.data?.message || loadError.message))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await getPatientProfile(patientId)
        if (!cancelled) setPatient(data)
      } catch (loadError) {
        if (!cancelled) setError(loadError.response?.data?.message || loadError.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [patientId])

  const doctorId = useMemo(() => {
    const match = typeof window !== 'undefined' ? window.location.pathname.match(/\/doctor\/([^/]+)\/patient/) : null
    return match ? decodeURIComponent(match[1]) : null
  }, [])

  if (isLoading) {
    return (
      <PageShell eyebrow="Doctor" title="Patient record" description="Loading patient details...">
        <p className="text-slate-600">Loading...</p>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell eyebrow="Doctor" title="Patient record" description="Could not load this patient.">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
        >
          Back
        </button>
      </PageShell>
    )
  }

  if (!patient) return null

  const consultations = patient.consultations || []
  const reports = patient.reports || []
  const reminders = patient.reminders || []

  return (
    <PageShell
      eyebrow="Doctor"
      title={patient.name}
      description={`Patient record · ${patient.id}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
          >
            ← Back to dashboard
          </button>
          <Link
            to={`/doctor/${doctorId || 'dr-priya-sharma'}/dashboard`}
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            Return to queue
          </Link>
        </div>

        {/* Demographics */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Patient profile</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Age</p>
              <p className="font-medium">{patient.age ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Gender</p>
              <p className="font-medium">{patient.gender ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Blood group</p>
              <p className="font-medium">{patient.bloodGroup ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
              <p className="font-medium">{patient.phone ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
              <p className="font-medium">{patient.address ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Total visits</p>
              <p className="font-medium">{consultations.length}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Left column: reports + past consultations */}
          <div className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Reports &amp; scans</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {reports.length}
                </span>
              </div>
              {reports.length === 0 ? (
                <p className="text-sm text-slate-500">No reports uploaded yet for this patient.</p>
              ) : (
                <ul className="space-y-3">
                  {reports.map((report) => (
                    <li key={report.id} className="rounded-md border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{report.title}</p>
                          <p className="text-xs text-slate-500">
                            {report.type} · {formatDate(report.date)}
                          </p>
                        </div>
                        <a
                          href={report.url || '#'}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          onClick={(event) => {
                            if (!report.url || report.url === '#') event.preventDefault()
                          }}
                        >
                          View
                        </a>
                      </div>
                      {report.notes ? (
                        <p className="mt-2 text-sm text-slate-600">{report.notes}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Past consultations</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {consultations.length}
                </span>
              </div>
              {consultations.length === 0 ? (
                <p className="text-sm text-slate-500">No past consultations recorded.</p>
              ) : (
                <ol className="relative space-y-4 border-l border-slate-200 pl-4">
                  {consultations.map((cons) => (
                    <li key={cons.id} className="relative">
                      <span className="absolute -left-[1.15rem] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      <div className="rounded-md border border-slate-200 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{cons.diagnosis}</p>
                            <p className="text-xs text-slate-500">
                              {formatDate(cons.date)} · {cons.reason || 'No reason recorded'}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold uppercase text-emerald-700">
                            {cons.status}
                          </span>
                        </div>
                        {cons.prescription ? (
                          <p className="mt-2 text-sm">
                            <span className="font-medium text-slate-700">Rx:</span>{' '}
                            {cons.prescription}
                          </p>
                        ) : null}
                        {cons.notes ? (
                          <p className="mt-1 text-sm text-slate-600">{cons.notes}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          {/* Right column: add remark + reminders */}
          <div className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Add consultation remark</h2>
              <ConsultationForm
                patientId={patient.id}
                doctorId={doctorId}
                onSaved={load}
              />
            </section>

            <section className="rounded-lg border border-amber-300 bg-amber-50 p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-amber-900">Reminders</h2>
              {reminders.length === 0 ? (
                <p className="mb-4 text-sm text-amber-700">No pending follow-up reminders.</p>
              ) : (
                <ul className="mb-4 space-y-3">
                  {reminders.map((rem) => (
                    <li
                      key={rem.id}
                      className={`rounded-md border p-3 ${
                        rem.status === 'completed'
                          ? 'border-slate-200 bg-white opacity-75'
                          : 'border-amber-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800">{rem.message}</p>
                        {rem.status === 'pending' ? (
                          <RemindersDueTag dateString={rem.followUpDate} />
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Done</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-500">
                          Follow-up: {formatDate(rem.followUpDate)}
                        </p>
                        {rem.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await completeReminder(patient.id, rem.id)
                                load()
                              } catch (completeError) {
                                setError(completeError.response?.data?.message || completeError.message)
                              }
                            }}
                            className="rounded-md border border-emerald-600 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Mark done
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 border-t border-amber-200 pt-4">
                <ReminderForm patientId={patient.id} doctorId={doctorId} onSaved={load} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

export default DoctorPatientDetailPage