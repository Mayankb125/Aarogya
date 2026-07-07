import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../shared/components/PageShell'
import { useAuth } from '../shared/context/AuthContext'
import {
  getMyPatientProfile,
  updateMyPatientProfile,
} from '../shared/services/patientService'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']

function DetailCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-semibold">{value || '-'}</p>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '-'
  const date = typeof value === 'string' && value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function PatientProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await getMyPatientProfile()
        if (!cancelled) setProfile(data)
      } catch (loadError) {
        if (cancelled) return
        const status = loadError.response?.status
        if (status === 404) {
          navigate('/patient/onboarding', { replace: true })
          return
        }
        setError(loadError.response?.data?.message || loadError.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEditing() {
    setForm({
      name: profile.name || '',
      age: profile.age || '',
      phone: profile.phone || '',
      bloodGroup: profile.bloodGroup || '',
      gender: profile.gender || '',
      address: profile.address || '',
      emergencyContact: profile.emergencyContact || '',
      allergies: profile.allergies || '',
      chronicConditions: profile.chronicConditions || '',
    })
    setIsEditing(true)
  }

  async function saveEdit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      const updated = await updateMyPatientProfile(form)
      setProfile(updated)
      setIsEditing(false)
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <PageShell eyebrow="Patient" title="My profile" description="Loading...">
        <div className="space-y-4">
          <p className="text-slate-600">Loading your profile...</p>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            Sign out
          </button>
        </div>
      </PageShell>
    )
  }

  if (error && !profile) {
    return (
      <PageShell eyebrow="Patient" title="My profile" description="Could not load profile.">
        <div className="space-y-4">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            Sign out
          </button>
        </div>
      </PageShell>
    )
  }

  if (!profile) return null

  const consultations = profile.consultations || []
  const reminders = profile.reminders || []
  const reports = profile.reports || []
  const pendingReminders = reminders.filter((item) => item.status === 'pending')

  return (
    <PageShell
      eyebrow="Patient"
      title={profile.name}
      description={`Signed in as ${user?.email || 'patient'} · Profile ID ${profile.uid || profile.id || '-'}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            ← Back to home
          </Link>
          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
            >
              Edit profile
            </button>
          ) : null}
          {!isEditing ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              Sign out
            </button>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {isEditing ? (
          <form
            onSubmit={saveEdit}
            className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full name</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Age</label>
                <input
                  type="number"
                  min="1"
                  max="130"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                  value={form.age}
                  onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Blood group</label>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                  value={form.bloodGroup}
                  onChange={(event) => setForm((current) => ({ ...current, bloodGroup: event.target.value }))}
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Gender</label>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                  value={form.gender}
                  onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}
                >
                  <option value="">Not specified</option>
                  {GENDERS.map((gender) => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Emergency contact</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                  value={form.emergencyContact}
                  onChange={(event) => setForm((current) => ({ ...current, emergencyContact: event.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <textarea
                rows={2}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Allergies</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                  value={form.allergies}
                  onChange={(event) => setForm((current) => ({ ...current, allergies: event.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Chronic conditions</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                  value={form.chronicConditions}
                  onChange={(event) => setForm((current) => ({ ...current, chronicConditions: event.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <section>
              <h2 className="mb-3 text-lg font-semibold">Basic details</h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <DetailCard label="Age" value={profile.age} />
                <DetailCard label="Gender" value={profile.gender} />
                <DetailCard label="Blood group" value={profile.bloodGroup} />
                <DetailCard label="Phone" value={profile.phone} />
                <DetailCard label="Emergency contact" value={profile.emergencyContact} />
                <DetailCard label="Address" value={profile.address} />
                <DetailCard label="Known allergies" value={profile.allergies} />
                <DetailCard label="Chronic conditions" value={profile.chronicConditions} />
                <DetailCard label="Onboarded on" value={formatDate(profile.onboardedAt)} />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">My reports ({reports.length})</h2>
              {reports.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No reports linked to your profile yet. Ask the clinic to attach them
                  during your next visit.
                </p>
              ) : (
                <ul className="space-y-3">
                  {reports.map((report) => (
                    <li key={report.id} className="rounded-md border border-slate-200 p-4">
                      <p className="font-semibold">{report.title}</p>
                      <p className="text-xs text-slate-500">
                        {report.type} · {formatDate(report.date)}
                      </p>
                      {report.notes ? <p className="mt-2 text-sm text-slate-600">{report.notes}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">My consultation history ({consultations.length})</h2>
              {consultations.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No past consultations recorded on your profile.
                </p>
              ) : (
                <ol className="space-y-4 border-l border-slate-200 pl-4">
                  {consultations.map((cons) => (
                    <li key={cons.id} className="relative">
                      <span className="absolute -left-[1.15rem] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      <p className="font-semibold">{cons.diagnosis}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(cons.date)} · {cons.reason || 'No reason recorded'}
                      </p>
                      {cons.prescription ? (
                        <p className="mt-1 text-sm">
                          <span className="font-medium text-slate-700">Rx:</span> {cons.prescription}
                        </p>
                      ) : null}
                      {cons.notes ? <p className="mt-1 text-sm text-slate-600">{cons.notes}</p> : null}
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {pendingReminders.length > 0 ? (
              <section className="rounded-lg border border-amber-300 bg-amber-50 p-5 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-amber-900">
                  Pending follow-up reminders ({pendingReminders.length})
                </h2>
                <ul className="space-y-3">
                  {pendingReminders.map((rem) => (
                    <li key={rem.id} className="rounded-md border border-amber-200 bg-white p-3">
                      <p className="text-sm font-medium text-slate-800">{rem.message}</p>
                      <p className="text-xs text-slate-500">
                        Follow-up: {formatDate(rem.followUpDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>
    </PageShell>
  )
}

export default PatientProfilePage