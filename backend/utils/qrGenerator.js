function generateQrCode(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
      <rect width="220" height="220" fill="#ffffff"/>
      <rect x="18" y="18" width="54" height="54" fill="#047857"/>
      <rect x="148" y="18" width="54" height="54" fill="#047857"/>
      <rect x="18" y="148" width="54" height="54" fill="#047857"/>
      <rect x="86" y="86" width="18" height="18" fill="#0f172a"/>
      <rect x="112" y="86" width="18" height="18" fill="#0f172a"/>
      <rect x="138" y="112" width="18" height="18" fill="#0f172a"/>
      <rect x="86" y="138" width="18" height="18" fill="#0f172a"/>
      <rect x="112" y="164" width="18" height="18" fill="#0f172a"/>
      <rect x="164" y="138" width="18" height="18" fill="#0f172a"/>
      <text x="110" y="214" text-anchor="middle" font-family="Arial" font-size="10" fill="#334155">${encodedPayload.slice(0, 24)}</text>
    </svg>
  `;

  // Demo QR is a deterministic SVG data URL. Swap this utility for a real QR lib later.
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

module.exports = {
  generateQrCode,
};
