const symptomRules = [
  { keyword: 'fever', specialty: 'general', relatedKeywords: ['temperature', 'cold', 'chills', 'body ache'] },
  { keyword: 'cough', specialty: 'general', relatedKeywords: ['cold', 'throat', 'flu'] },
  { keyword: 'chest pain', specialty: 'cardiology', relatedKeywords: ['breathlessness', 'heartbeat', 'heart'] },
  { keyword: 'skin rash', specialty: 'dermatology', relatedKeywords: ['acne', 'itching', 'hair fall'] },
  { keyword: 'knee pain', specialty: 'orthopedics', relatedKeywords: ['back pain', 'fracture', 'joint pain'] },
  { keyword: 'child fever', specialty: 'pediatrics', relatedKeywords: ['vaccination', 'child nutrition'] },
  { keyword: 'eye pain', specialty: 'ophthalmology', relatedKeywords: ['blurry vision', 'redness'] },
  { keyword: 'tooth pain', specialty: 'dentistry', relatedKeywords: ['gum bleeding', 'cavity'] },
  { keyword: 'anxiety', specialty: 'psychiatry', relatedKeywords: ['depression', 'sleep'] },
  { keyword: 'stomach pain', specialty: 'gastroenterology', relatedKeywords: ['acidity', 'indigestion'] },
  { keyword: 'pregnancy', specialty: 'gynecology', relatedKeywords: ['periods', 'pcos'] },
]

const SPECIALTIES = [
  { id: 'general', label: 'General Physician' },
  { id: 'cardiology', label: 'Cardiologist' },
  { id: 'dermatology', label: 'Dermatologist' },
  { id: 'orthopedics', label: 'Orthopedic' },
  { id: 'pediatrics', label: 'Pediatrician' },
  { id: 'dentistry', label: 'Dentist' },
  { id: 'gynecology', label: 'Gynecologist' },
  { id: 'ophthalmology', label: 'Ophthalmologist' },
  { id: 'psychiatry', label: 'Psychiatrist' },
  { id: 'gastroenterology', label: 'Gastroenterologist' },
]

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function matchSymptom(query) {
  const cleanQuery = normalizeText(query)
  if (!cleanQuery) {
    return { specialty: 'general', matchedKeyword: null }
  }
  const match = symptomRules.find((rule) => {
    const terms = [rule.keyword, ...rule.relatedKeywords].map(normalizeText)
    return terms.some((term) => cleanQuery.includes(term) || term.includes(cleanQuery))
  })
  return {
    specialty: match?.specialty || cleanQuery,
    matchedKeyword: match?.keyword || null,
  }
}

function getSpecialtyLabel(id) {
  return SPECIALTIES.find((item) => item.id === id)?.label || id
}

export { matchSymptom, getSpecialtyLabel, SPECIALTIES, symptomRules }
