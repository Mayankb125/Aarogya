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
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400" htmlFor="cons-date">Date</label>
          <input
            id="cons-date"
            type="date"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
            value={form.date}
            onChange={update('date')}
          />
        </div>
        <div>
          <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400" htmlFor="cons-reason">Reason for visit</label>
          <input
            id="cons-reason"
            type="text"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
            placeholder="Chest pain, follow-up..."
            value={form.reason}
            onChange={update('reason')}
          />
        </div>
      </div>
      <div>
        <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400" htmlFor="cons-diagnosis">Diagnosis *</label>
        <input
          id="cons-diagnosis"
          type="text"
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
          placeholder="Primary diagnosis"
          value={form.diagnosis}
          onChange={update('diagnosis')}
        />
      </div>
      <div>
        <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400" htmlFor="cons-prescription">Prescription</label>
        <input
          id="cons-prescription"
          type="text"
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
          placeholder="Drug, dose, duration"
          value={form.prescription}
          onChange={update('prescription')}
        />
      </div>
      <div>
        <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400" htmlFor="cons-notes">Remarks / notes</label>
        <textarea
          id="cons-notes"
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
          placeholder="Observations, advice, next steps..."
          value={form.notes}
          onChange={update('notes')}
        />
      </div>
      {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer uppercase tracking-wider"
      >
        {isSaving ? 'Saving...' : 'Save Consultation'}
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
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500" htmlFor="rem-message">Reminder message *</label>
        <textarea
          id="rem-message"
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
          placeholder="Repeat lipid profile and review BP diary."
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500" htmlFor="rem-date">Follow-up date *</label>
          <input
            id="rem-date"
            type="date"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
            value={form.followUpDate}
            onChange={(event) => setForm((current) => ({ ...current, followUpDate: event.target.value }))}
          />
        </div>
        <div className="flex items-end gap-2 text-2xs font-bold">
          <button type="button" onClick={() => quickFill(7)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:border-slate-350 cursor-pointer transition">+7d</button>
          <button type="button" onClick={() => quickFill(14)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:border-slate-350 cursor-pointer transition">+14d</button>
          <button type="button" onClick={() => quickFill(30)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:border-slate-350 cursor-pointer transition">+30d</button>
        </div>
      </div>
      {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:bg-slate-200 cursor-pointer uppercase tracking-wider"
      >
        {isSaving ? 'Saving...' : 'Add Reminder'}
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
      description={`Patient record · ID: ${patient.id}`}
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 shadow-premium-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:border-slate-350 shadow-premium-sm transition cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <Link
            to={`/doctor/${doctorId || 'dr-priya-sharma'}/dashboard`}
            className="text-xs font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-800 transition mr-2"
          >
            Return to Queue
          </Link>
        </div>

        {/* Demographics */}
        <section className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-premium-md">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="bg-slate-50/50 border border-slate-100/40 rounded-xl p-3.5">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Age</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">{patient.age ?? '-'}</p>
            </div>
            <div className="bg-slate-50/50 border border-slate-100/40 rounded-xl p-3.5">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Gender</p>
              <p className="font-bold text-slate-800 mt-0.5">{patient.gender ?? '-'}</p>
            </div>
            <div className="bg-slate-50/50 border border-slate-100/40 rounded-xl p-3.5">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Blood group</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">{patient.bloodGroup ?? '-'}</p>
            </div>
            <div className="bg-slate-50/50 border border-slate-100/40 rounded-xl p-3.5">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Phone</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">{patient.phone ?? '-'}</p>
            </div>
            <div className="bg-slate-50/50 border border-slate-100/40 rounded-xl p-3.5">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Address</p>
              <p className="font-bold text-slate-800 mt-0.5 truncate" title={patient.address}>{patient.address ?? '-'}</p>
            </div>
            <div className="bg-slate-50/50 border border-slate-100/40 rounded-xl p-3.5">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Total visits</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">{consultations.length}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Left column: reports + past consultations */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-premium-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Reports &amp; Scans</h2>
                <span className="rounded-xl bg-slate-100 px-3 py-1 text-2xs font-bold text-slate-600 font-mono">
                  {reports.length}
                </span>
              </div>
              {reports.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium">No reports uploaded yet for this patient.</p>
              ) : (
                <ul className="space-y-3">
                  {reports.map((report) => (
                    <li key={report.id} className="rounded-xl border border-slate-150 p-4 hover:bg-slate-50/10 transition">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{report.title}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {report.type} · {formatDate(report.date)}
                          </p>
                        </div>
                        <a
                          href={report.url || '#'}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-350 cursor-pointer shadow-premium-sm transition"
                          onClick={(event) => {
                            if (!report.url || report.url === '#') event.preventDefault()
                          }}
                        >
                          View
                        </a>
                      </div>
                      {report.notes ? (
                        <p className="mt-2 text-xs text-slate-550 leading-relaxed font-medium">{report.notes}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-premium-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Past Consultations</h2>
                <span className="rounded-xl bg-slate-100 px-3 py-1 text-2xs font-bold text-slate-600 font-mono">
                  {consultations.length}
                </span>
              </div>
              {consultations.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium">No past consultations recorded.</p>
              ) : (
                <ol className="relative space-y-4 border-l border-slate-200/80 pl-4 ml-1">
                  {consultations.map((cons) => (
                    <li key={cons.id} className="relative">
                      <span className="absolute -left-[1.28rem] top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-600 shadow-premium-sm" />
                      <div className="rounded-xl border border-slate-150 p-4 hover:bg-slate-50/10 transition">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{cons.diagnosis}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                              {formatDate(cons.date)} · {cons.reason || 'No reason recorded'}
                            </p>
                          </div>
                          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-emerald-700">
                            {cons.status}
                          </span>
                        </div>
                        {cons.prescription ? (
                          <p className="mt-2 text-xs text-slate-700">
                            <span className="font-bold text-slate-900">Rx:</span>{' '}
                            {cons.prescription}
                          </p>
                        ) : null}
                        {cons.notes ? (
                          <p className="mt-1.5 text-xs text-slate-550 leading-relaxed font-medium">{cons.notes}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          {/* Right column: add remark + reminders */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-premium-md">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Add Consultation Remark</h2>
              <ConsultationForm
                patientId={patient.id}
                doctorId={doctorId}
                onSaved={load}
              />
            </section>

            <section className="rounded-2xl border border-amber-100 bg-amber-50/20 p-6 shadow-premium-md">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-800">Active Reminders</h2>
              {reminders.length === 0 ? (
                <p className="mb-4 text-xs text-amber-700 font-semibold">No pending follow-up reminders.</p>
              ) : (
                <ul className="mb-4 space-y-3">
                  {reminders.map((rem) => (
                    <li
                      key={rem.id}
                      className={`rounded-xl border p-4 shadow-premium-sm transition ${
                        rem.status === 'completed'
                          ? 'border-slate-200 bg-white/60 opacity-60'
                          : 'border-amber-150 bg-white hover:border-amber-250'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">{rem.message}</p>
                        {rem.status === 'pending' ? (
                          <RemindersDueTag dateString={rem.followUpDate} />
                        ) : (
                          <span className="rounded-xl bg-emerald-100 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-emerald-700">Done</span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100/50 pt-2.5">
                        <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                          Follow-up: <span className="font-semibold text-slate-600">{formatDate(rem.followUpDate)}</span>
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
                            className="rounded-xl border border-emerald-600 bg-white px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-emerald-700 hover:bg-emerald-50/50 cursor-pointer transition duration-200"
                          >
                            Mark Done
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 border-t border-amber-200/50 pt-5">
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