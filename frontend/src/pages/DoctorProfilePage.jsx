import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import PageShell from '../shared/components/PageShell'
import { useAuth } from '../shared/context/AuthContext'
import { getDoctorProfile, updateDoctorProfile } from '../shared/services/doctorService'

const SPECIALTIES = [
  { value: 'general', label: 'General Medicine' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'gynecology', label: 'Gynecology' },
  { value: 'dentistry', label: 'Dentistry' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'psychiatry', label: 'Psychiatry' },
]

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function DetailCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-900">{value || '-'}</p>
    </div>
  )
}

function DoctorProfilePage() {
  const { id } = useParams()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(null)
  const [schedule, setSchedule] = useState(null)

  // Ensure doctors can only access their own profile (or admin can view it)
  useEffect(() => {
    if (user && user.role !== 'admin' && user.doctorId !== id) {
      navigate(`/doctor/${user.doctorId || 'dr-priya-sharma'}/dashboard`, { replace: true })
    }
  }, [user, id, navigate])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await getDoctorProfile(id)
        if (!cancelled) {
          setProfile(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.response?.data?.message || loadError.message)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  function startEditing() {
    setForm({
      specialty: profile.specialty || 'general',
      qualification: profile.qualification || '',
      experience: profile.experience || 0,
      fee: profile.fee || 0,
      languages: Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages || '',
      bio: profile.bio || '',
      isActive: profile.isActive !== false,
    })

    // Parse existing schedule
    const defaultSchedule = DAYS.reduce((acc, day) => {
      const match = profile.schedule && profile.schedule[day]
      acc[day] = {
        active: !!match,
        start: match?.start || '09:00',
        end: match?.end || '17:00',
        slotsPerHour: match?.slotsPerHour || 4,
      }
      return acc
    }, {})
    setSchedule(defaultSchedule)
    setIsEditing(true)
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateSchedule(day, field, value) {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  async function saveEdit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      // Build schedule object for active days
      const formattedSchedule = {}
      DAYS.forEach((day) => {
        if (schedule[day].active) {
          formattedSchedule[day] = {
            start: schedule[day].start,
            end: schedule[day].end,
            slotsPerHour: Number(schedule[day].slotsPerHour) || 4,
          }
        }
      })

      const payload = {
        ...form,
        schedule: formattedSchedule,
      }

      const updated = await updateDoctorProfile(id, payload)
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
      <PageShell eyebrow="Clinician" title="Doctor Profile" description="Loading profile...">
        <div className="space-y-4">
          <p className="text-slate-600">Loading your profile details...</p>
        </div>
      </PageShell>
    )
  }

  if (error && !profile) {
    return (
      <PageShell eyebrow="Clinician" title="Error" description="Profile error">
        <div className="space-y-4 text-center">
          <p className="text-rose-600 font-medium">{error}</p>
          <Link to={`/doctor/${id}/dashboard`} className="text-emerald-700 font-semibold hover:underline">
            &larr; Back to dashboard
          </Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Clinician Profile"
      title={profile.name}
      description={`${profile.qualification || 'Clinician'} • ${profile.hospital?.name || 'Clinic Partner'}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            to={`/doctor/${id}/dashboard`}
          >
            &larr; Back to dashboard
          </Link>
          {!isEditing ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={startEditing}
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 shadow"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => signOut().then(() => navigate('/'))}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {!isEditing ? (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailCard label="Specialty" value={SPECIALTIES.find(s => s.value === profile.specialty)?.label || profile.specialty} />
              <DetailCard label="Consultation Fee" value={`₹${profile.fee}`} />
              <DetailCard label="Years of Experience" value={`${profile.experience} years`} />
              <DetailCard label="Languages" value={Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages} />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Contact Details & Status</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">Email Address</p>
                  <p className="font-semibold text-slate-900 mt-1">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Profile Visibility</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold mt-1 ${
                    profile.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${profile.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                    {profile.isActive ? 'Active & Visible' : 'Hidden / Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Average Rating</p>
                  <p className="font-semibold text-slate-900 mt-1">⭐ {profile.rating || '5.0'} / 5</p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Doctor Biography</h3>
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                {profile.bio || 'No biography written yet.'}
              </p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Weekly Practice Schedule</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {DAYS.map((day) => {
                  const daySched = profile.schedule && profile.schedule[day]
                  return (
                    <div key={day} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm">
                      <span className="capitalize font-semibold text-slate-700">{day}</span>
                      {daySched ? (
                        <span className="text-slate-900 font-medium">
                          🕒 {daySched.start}–{daySched.end} <span className="text-xs text-slate-500">({daySched.slotsPerHour} slots/hr)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Off Duty</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        ) : (
          <form onSubmit={saveEdit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Edit Profile Details</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="specialty">
                  Specialty
                </label>
                <select
                  id="specialty"
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 text-sm"
                  value={form.specialty}
                  onChange={(e) => updateForm('specialty', e.target.value)}
                >
                  {SPECIALTIES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="qualification">
                  Qualification
                </label>
                <input
                  id="qualification"
                  type="text"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 text-sm"
                  value={form.qualification}
                  onChange={(e) => updateForm('qualification', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="experience">
                  Years of Experience
                </label>
                <input
                  id="experience"
                  type="number"
                  required
                  min="0"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 text-sm"
                  value={form.experience}
                  onChange={(e) => updateForm('experience', Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="fee">
                  Consultation Fee (₹)
                </label>
                <input
                  id="fee"
                  type="number"
                  required
                  min="0"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 text-sm"
                  value={form.fee}
                  onChange={(e) => updateForm('fee', Number(e.target.value) || 0)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="languages">
                  Languages Spoken (comma-separated)
                </label>
                <input
                  id="languages"
                  type="text"
                  required
                  placeholder="e.g. English, Hindi, Marathi"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 text-sm"
                  value={form.languages}
                  onChange={(e) => updateForm('languages', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="bio">
                  Doctor Biography
                </label>
                <textarea
                  id="bio"
                  rows="3"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 text-sm"
                  value={form.bio}
                  onChange={(e) => updateForm('bio', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Practice Timings & Slots</h3>
              <div className="space-y-3">
                {DAYS.map((day) => (
                  <div key={day} className="grid grid-cols-2 items-center gap-2 rounded-lg border border-slate-100 p-2 sm:grid-cols-4">
                    <label className="flex items-center gap-2 font-semibold capitalize text-slate-700 text-sm">
                      <input
                        type="checkbox"
                        checked={schedule[day].active}
                        onChange={(e) => updateSchedule(day, 'active', e.target.checked)}
                      />
                      {day}
                    </label>
                    <input
                      aria-label={`${day} start`}
                      disabled={!schedule[day].active}
                      className="rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50"
                      onChange={(e) => updateSchedule(day, 'start', e.target.value)}
                      type="time"
                      value={schedule[day].start}
                    />
                    <input
                      aria-label={`${day} end`}
                      disabled={!schedule[day].active}
                      className="rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50"
                      onChange={(e) => updateSchedule(day, 'end', e.target.value)}
                      type="time"
                      value={schedule[day].end}
                    />
                    <div className="flex items-center gap-1">
                      <input
                        aria-label={`${day} slots per hour`}
                        disabled={!schedule[day].active}
                        className="w-16 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50"
                        inputMode="numeric"
                        onChange={(e) => updateSchedule(day, 'slotsPerHour', Number(e.target.value) || 4)}
                        type="number"
                        min="1"
                        value={schedule[day].slotsPerHour}
                      />
                      <span className="text-xs text-slate-500">slots/hr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateForm('isActive', e.target.checked)}
                />
                Profile Active & visible for booking
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:bg-slate-300"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PageShell>
  )
}

export default DoctorProfilePage
