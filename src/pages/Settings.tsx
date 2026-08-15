export function Settings() {
  return (
    <div className="max-w-3xl space-y-4 pb-16">
      <div>
        <div className="text-[11px] font-bold tracking-[0.14em] text-ready uppercase">Property</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Settings</h1>
      </div>
      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">Hotel</h2>
        <p className="mt-1 text-sm text-muted">The Hoxton Shoreditch · 15 August · Front office + housekeeping + maintenance traces.</p>
      </section>
      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">Autonomy band</h2>
        <p className="mt-1 text-sm text-muted">
          Recommendation + approved write. Same-category inspected room moves require a duty-manager click. No silent execution. VIP, accessibility, payments and guest-ready claims are hard-gated.
        </p>
      </section>
      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">Guest messaging policy</h2>
        <p className="mt-1 text-sm text-muted">
          Never enable a “room ready” message unless all required room-readiness checks are complete. Holding messages may go out earlier and must not claim readiness.
        </p>
      </section>
    </div>
  )
}
