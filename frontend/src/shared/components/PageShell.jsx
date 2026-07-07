import Header from './Header'
import Footer from './Footer'

function PageShell({ eyebrow, title, description, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <section className="flex flex-col gap-6">
          <header className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="max-w-2xl text-slate-600">{description}</p>
          </header>

          {children}
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default PageShell
