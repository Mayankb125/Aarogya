import Header from './Header'
import Footer from './Footer'

function PageShell({ eyebrow, title, description, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/40 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 animate-slide-up">
        <section className="flex flex-col gap-6">
          <header className="space-y-2 border-b border-slate-150/60 pb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{title}</h1>
            {description && (
              <p className="max-w-3xl text-sm leading-relaxed text-slate-500">{description}</p>
            )}
          </header>

          <div className="animate-fade-in">
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default PageShell
