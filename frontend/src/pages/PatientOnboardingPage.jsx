import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/context/AuthContext'
import { saveMyPatientProfile } from '../shared/services/patientService'
import Header from '../shared/components/Header'
import Footer from '../shared/components/Footer'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-rose-600">*</span> : null}
      </label>
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-xs text-rose-700">{error}</p> : null}
    </div>
  )
}

function PatientOnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user?.displayName || '',
    age: '',
    phone: '',
    bloodGroup: '',
    gender: '',
    address: '',
    emergencyContact: '',
    allergies: '',
    chronicConditions: '',
  })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  function update(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.age || Number(form.age) <= 0) next.age = 'Enter a valid age'
    if (!form.phone.trim()) next.phone = 'Phone is required'
    if (!form.bloodGroup) next.bloodGroup = 'Select a blood group'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function submit(event) {
    event.preventDefault()
    setServerError('')
    if (!validate()) return
    setIsSaving(true)
    try {
      await saveMyPatientProfile(form)
      navigate('/patient/profile', { replace: true })
    } catch (saveError) {
      setServerError(saveError.response?.data?.message || saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <Header />
      <main className="flex-1 px-4 py-10">
      <section className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Patient onboarding
          </p>
          <h1 className="mt-2 text-3xl font-bold">Complete your patient profile</h1>
          <p className="mt-2 text-slate-600">
            We need a few details so the clinic can serve you faster and the doctor
            has your context before you walk in. You can edit these later.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name}>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={form.name}
                onChange={update('name')}
                placeholder="Anita Rao"
              />
            </Field>
            <Field label="Age" required error={errors.age}>
              <input
                type="number"
                min="1"
                max="130"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={form.age}
                onChange={update('age')}
                placeholder="29"
              />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <input
                type="tel"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={form.phone}
                onChange={update('phone')}
                placeholder="+91 98200 11111"
              />
            </Field>
            <Field label="Blood group" required error={errors.bloodGroup}>
              <select
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                value={form.bloodGroup}
                onChange={update('bloodGroup')}
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </Field>
            <Field label="Gender">
              <select
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                value={form.gender}
                onChange={update('gender')}
              >
                <option value="">Not specified</option>
                {GENDERS.map((gender) => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </Field>
            <Field label="Emergency contact">
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={form.emergencyContact}
                onChange={update('emergencyContact')}
                placeholder="Name + phone"
              />
            </Field>
          </div>

          <Field label="Address">
            <textarea
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
              value={form.address}
              onChange={update('address')}
              placeholder="Flat, street, area, city"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Known allergies">
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={form.allergies}
                onChange={update('allergies')}
                placeholder="Penicillin, dust, none..."
              />
            </Field>
            <Field label="Chronic conditions">
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={form.chronicConditions}
                onChange={update('chronicConditions')}
                placeholder="Diabetes, hypertension, none..."
              />
            </Field>
          </div>

          {serverError ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {serverError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSaving ? 'Saving profile...' : 'Save profile'}
            </button>
            <Link
              to="/"
              className="rounded-md border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Later
            </Link>
          </div>
        </form>
      </section>
      </main>
      <Footer />
    </div>
  )
}

export default PatientOnboardingPage