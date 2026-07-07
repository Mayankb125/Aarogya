const { symptomRules } = require("../data/phase2Seed");

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function matchSymptom(query) {
  const cleanQuery = normalizeText(query);

  if (!cleanQuery) {
    return {
      query: "",
      specialty: "general",
      matchedKeyword: null,
      suggestions: symptomRules,
    };
  }

  const match = symptomRules.find((rule) => {
    const terms = [rule.keyword, ...rule.relatedKeywords].map(normalizeText);
    return terms.some((term) => cleanQuery.includes(term) || term.includes(cleanQuery));
  });

  return {
    query: cleanQuery,
    specialty: match?.specialty || cleanQuery,
    matchedKeyword: match?.keyword || null,
    suggestions: symptomRules,
  };
}

module.exports = {
  matchSymptom,
};
