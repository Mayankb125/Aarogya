function calculateWaitTime(tokensAhead, avgConsultTime) {
  const safeTokensAhead = Number(tokensAhead)
  const safeAvgConsultTime = Number(avgConsultTime)

  if (
    !Number.isFinite(safeTokensAhead) ||
    !Number.isFinite(safeAvgConsultTime) ||
    safeTokensAhead <= 0 ||
    safeAvgConsultTime <= 0
  ) {
    return 0
  }

  return safeTokensAhead * safeAvgConsultTime
}

export { calculateWaitTime }
