function RatingStars({ rating = 0, totalRatings = 0, showNumber = true }) {
  const rounded = Math.round(rating)
  const stars = Array.from({ length: 5 }, (_unused, index) => index < rounded)

  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="flex" aria-label={`Rating: ${rating} out of 5`}>
        {stars.map((filled, index) => (
          <span
            className={filled ? 'text-amber-400' : 'text-slate-300'}
            key={index}
          >
            {'\u2605'}
          </span>
        ))}
      </span>
      {showNumber ? (
        <span className="font-medium text-slate-700">{rating.toFixed(1)}</span>
      ) : null}
      {totalRatings > 0 ? (
        <span className="text-slate-500">({totalRatings})</span>
      ) : null}
    </span>
  )
}

export default RatingStars
