import { Link } from "react-router-dom";

export const SiteFooter = () => (
  <footer className="mt-16 border-t border-border bg-secondary/50">
    <div className="max-w-[1760px] mx-auto px-6 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm">
      <div>
        <p className="font-bold text-lg mb-2" style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>KosovaBnB</p>
        <p className="text-muted-foreground max-w-xs">Vendbanime, eksperienca dhe shërbime në Kosovë, me asistent AI që të ndihmon të gjesh dhe rezervosh.</p>
      </div>
      <nav aria-label="Eksploro" className="space-y-2">
        <p className="font-semibold">Eksploro</p>
        <Link to="/" className="block text-muted-foreground hover:text-foreground">Vendbanime</Link>
        <Link to="/experiences" className="block text-muted-foreground hover:text-foreground">Eksperienca</Link>
        <Link to="/services" className="block text-muted-foreground hover:text-foreground">Shërbime</Link>
      </nav>
      <nav aria-label="Mjete AI" className="space-y-2">
        <p className="font-semibold">Mjete me AI</p>
        <Link to="/planner" className="block text-muted-foreground hover:text-foreground">Planifikuesi i udhëtimit</Link>
        <Link to="/simulator" className="block text-muted-foreground hover:text-foreground">Simulatori i çmimeve</Link>
        <Link to="/host/revenue" className="block text-muted-foreground hover:text-foreground">Revenue Manager</Link>
      </nav>
      <nav aria-label="Host" className="space-y-2">
        <p className="font-semibold">Për pronarët</p>
        <Link to="/become-host" className="block text-muted-foreground hover:text-foreground">Bëhu host</Link>
        <Link to="/host" className="block text-muted-foreground hover:text-foreground">Paneli i host-it</Link>
        <Link to="/bookings" className="block text-muted-foreground hover:text-foreground">Rezervimet e mia</Link>
      </nav>
    </div>
    <p className="text-center text-xs text-muted-foreground pb-6">© {new Date().getFullYear()} KosovaBnB · Pagesat janë simulim (mënyrë provë)</p>
  </footer>
);
