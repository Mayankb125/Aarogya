const ALLOWED_RECEPTIONISTS = new Set([
  'receptionist@aarogya.in',
  'reception@aarogya.in',
  'staff@aarogya.in',
  'clinicreception@aarogya.in',
  'dev-receptionist@clinicreception.in' // Dev fallback receptionist
]);

function getRoleFromEmail(email) {
  if (!email || typeof email !== 'string') return 'patient';
  
  const cleanEmail = email.trim().toLowerCase();
  
  // 1. Strict admin check
  if (cleanEmail === 'admin@aarogya.in') {
    return 'admin';
  }

  // 2. Strict receptionist check
  if (ALLOWED_RECEPTIONISTS.has(cleanEmail)) {
    return 'receptionist';
  }

  return 'patient';
}

module.exports = {
  getRoleFromEmail,
};
