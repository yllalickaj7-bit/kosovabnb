import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Loader2, TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { addDays, formatYmd } from "@/lib/dates";
import { BookingLite, alerts as makeAlerts, bestPriceChange, forecast, summarize, whatIf } from "@/lib/forecast";
import { DEFAULT_RULES, PricingRule, RuleKind } from "@/lib/pricing";
import { DEFAULT_CONFIG, generateScenario, simulate } from "@/lib/simulation/engine";

const eur = (x: number) => `€${Math.round(x).toLocaleString("en-US")}`;
const pct = (x: number) => `${Math.round(x * 100)}%`;
const DEMO_DAY = 120;

const RevenueManagerPage = () => {
  const { user } = useAuth();
  const [listingId, setListingId] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [change, setChange] = useState(0);
  const [elasticity, setElasticity] = useState(1.3);
  const [selected, setSelected] = useState(30);

  const listings = useQuery({
    queryKey: ["rm-listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("id, title").eq("owner_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
  const activeId = listingId ?? listings.data?.[0]?.id ?? null;
  const useDemo = demo || !activeId;

  const real = useQuery({
    queryKey: ["rm-data", activeId],
    enabled: !!activeId && !demo,
    queryFn: async () => {
      const [rooms, bookings, rules] = await Promise.all([
        supabase.from("rooms").select("id, base_price, min_price, max_price").eq("listing_id", activeId!).eq("is_active", true),
        supabase.from("bookings").select("check_in, check_out, status").eq("listing_id", activeId!).in("status", ["pending", "confirmed", "completed"]),
        supabase.from("pricing_rules").select("kind, start_date, end_date, multiplier").eq("is_active", true).or(`listing_id.is.null,listing_id.eq.${activeId}`),
      ]);
      if (rooms.error) throw rooms.error;
      if (bookings.error) throw bookings.error;
      if (rules.error) throw rules.error;
      return { rooms: rooms.data ?? [], bookings: bookings.data ?? [], rules: rules.data ?? [] };
    },
  });

  const model = useMemo(() => {
    if (useDemo) {
      const cfg = DEFAULT_CONFIG;
      const r = simulate(cfg, "static", 7, generateScenario(cfg, 7));
      const known: BookingLite[] = r.bookingList
        .filter((b) => b.bookDay < DEMO_DAY)
        .map((b) => ({ checkIn: addDays(cfg.startDate, b.stayStart), checkOut: addDays(cfg.startDate, b.stayStart + b.nights) }));
      const today = addDays(cfg.startDate, DEMO_DAY);
      const room = { basePrice: cfg.basePrice, minPrice: cfg.basePrice * cfg.minFactor, maxPrice: cfg.basePrice * cfg.maxFactor };
      return { days: forecast(known, { rooms: cfg.rooms, today, days: 90, rules: DEFAULT_RULES, room }), rooms: cfg.rooms, room, rules: DEFAULT_RULES, label: "Të dhëna demo nga simulatori" };
    }
    if (!real.data || real.data.rooms.length === 0) return null;
    const rooms = real.data.rooms.length;
    const base = real.data.rooms.reduce((a, r) => a + Number(r.base_price), 0) / rooms;
    const room = {
      basePrice: base,
      minPrice: real.data.rooms[0].min_price != null ? Number(real.data.rooms[0].min_price) : null,
      maxPrice: real.data.rooms[0].max_price != null ? Number(real.data.rooms[0].max_price) : null,
    };
    const rules: PricingRule[] = real.data.rules.map((r) => ({ kind: r.kind as RuleKind, start: r.start_date ?? undefined, end: r.end_date ?? undefined, multiplier: Number(r.multiplier) }));
    const bookings = real.data.bookings.map((b) => ({ checkIn: b.check_in, checkOut: b.check_out }));
    return { days: forecast(bookings, { rooms, today: formatYmd(Date.now()), days: 90, rules: rules.length ? rules : DEFAULT_RULES, room }), rooms, room, rules: rules.length ? rules : DEFAULT_RULES, label: "Rezervimet reale të pronës" };
  }, [useDemo, real.data]);

  const chart = useMemo(
    () => model?.days.map((d) => ({ date: d.date.slice(5), otb: +(d.otbOcc * 100).toFixed(1), forecast: +(d.forecastOcc * 100).toFixed(1), band: [+(d.low * 100).toFixed(1), +(d.high * 100).toFixed(1)] })) ?? [],
    [model],
  );
  const sum = model ? summarize(model.days) : null;
  const alertList = model ? makeAlerts(model.days, model.rules).slice(0, 8) : [];
  const day = model?.days[Math.min(selected, (model?.days.length ?? 1) - 1)];
  const wi = model && day ? whatIf(day, model.rooms, model.room, change, -elasticity) : null;
  const base = model && day ? whatIf(day, model.rooms, model.room, 0, -elasticity) : null;
  const best = model && day ? bestPriceChange(day, model.rooms, model.room, -elasticity) : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Revenue Manager | KosovaBnB" description="Parashikim zënieje dhe të ardhurash për 90 ditët e ardhshme." canonical="https://kosovabnb.lovable.app/host/revenue" noindex />
      <Header />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-28 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary" /> Revenue Manager</h1>
          <p className="text-muted-foreground max-w-3xl">
            Parashikim 90-ditor: afër datës mbështetet te rezervimet reale, larg datës te sezonaliteti. Intervali tregon pasigurinë (90%).
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {!useDemo && listings.data && listings.data.length > 1 && (
              <select className="border border-input rounded-xl px-3 py-2 bg-background" value={activeId ?? ""} onChange={(e) => setListingId(e.target.value)}>
                {listings.data.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            )}
            <label className="flex items-center gap-2"><input type="checkbox" checked={useDemo} disabled={!activeId} onChange={(e) => setDemo(e.target.checked)} /> Modaliteti demo</label>
            {!user && <span className="text-muted-foreground">Nuk je i kyçur: po shfaqet demo. <Link to="/auth?redirect=/host/revenue" className="underline">Hyr</Link></span>}
            {user && listings.data?.length === 0 && <span className="text-muted-foreground">Nuk ke prona si host: po shfaqet demo.</span>}
          </div>
        </header>

        {!useDemo && real.isLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
        {!useDemo && real.isError && <p role="alert" className="text-destructive text-sm">Të dhënat nuk u ngarkuan.</p>}
        {!useDemo && !real.isLoading && real.data && real.data.rooms.length === 0 && <p className="text-sm text-muted-foreground">Kjo pronë nuk ka dhoma aktive; shto një dhomë te paneli i host-it.</p>}

        {model && sum && day && wi && base && best && (
          <>
            <p className="text-xs text-muted-foreground">Burimi: {model.label}</p>
            <section className="grid sm:grid-cols-3 gap-4">
              <div className="border border-border rounded-2xl p-4"><p className="text-sm text-muted-foreground">Të ardhura të pritura (90 ditë)</p><p className="text-2xl font-bold">{eur(sum.expectedRevenue)}</p></div>
              <div className="border border-border rounded-2xl p-4"><p className="text-sm text-muted-foreground">Zënia e parashikuar</p><p className="text-2xl font-bold">{pct(sum.avgOccupancy)}</p></div>
              <div className="border border-border rounded-2xl p-4"><p className="text-sm text-muted-foreground">Tashmë e rezervuar</p><p className="text-2xl font-bold">{pct(sum.avgOtbOccupancy)}</p></div>
            </section>

            <section className="border border-border rounded-2xl p-4">
              <h2 className="font-semibold mb-3">Zënia: e rezervuar dhe e parashikuar (%)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chart} onClick={(s) => { const i = (s as { activeTooltipIndex?: number } | null)?.activeTooltipIndex; if (typeof i === "number") setSelected(i); }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={9} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area dataKey="band" name="Interval 90%" stroke="none" fill="#2D5BE3" fillOpacity={0.15} />
                    <Line dataKey="forecast" name="Parashikim" stroke="#2D5BE3" strokeWidth={2} dot={false} />
                    <Line dataKey="otb" name="E rezervuar" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Kliko mbi grafik për të zgjedhur një datë për skenarin "po sikur".</p>
            </section>

            <section className="border border-border rounded-2xl p-5 space-y-4">
              <h2 className="font-semibold">Po sikur… {day.date} (pas {day.leadDays} ditësh)</h2>
              <label className="block text-sm font-medium">Ndrysho çmimin: {change > 0 ? "+" : ""}{change}%
                <input type="range" min={-30} max={30} value={change} onChange={(e) => setChange(Number(e.target.value))} className="w-full" />
              </label>
              <label className="block text-sm font-medium">Ndjeshmëria e kërkesës ndaj çmimit (elasticitet): {elasticity.toFixed(1)}
                <input type="range" min={0.3} max={3} step={0.1} value={elasticity} onChange={(e) => setElasticity(Number(e.target.value))} className="w-full" />
              </label>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-secondary rounded-xl p-3"><p className="text-muted-foreground">Tani</p><p className="font-semibold">€{base.price.toFixed(0)} · {pct(base.occupancy)} · {eur(base.revenue)}</p></div>
                <div className="bg-secondary rounded-xl p-3"><p className="text-muted-foreground">Me ndryshimin</p><p className="font-semibold">€{wi.price.toFixed(0)} · {pct(wi.occupancy)} · {eur(wi.revenue)}</p></div>
                <div className="bg-secondary rounded-xl p-3"><p className="text-muted-foreground">Optimumi i modelit</p><p className="font-semibold">{best.changePct >= 0 ? "+" : ""}{best.changePct.toFixed(0)}% → {eur(best.revenue)}</p></div>
              </div>
              <p className="text-xs text-muted-foreground">Elasticiteti është supozim i rregullueshëm, jo i matur nga të dhënat tuaja; vetëm kërkesa e mbetur (ende e parezervuar) reagon ndaj çmimit.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Sinjalizime</h2>
              {alertList.length === 0 && <p className="text-sm text-muted-foreground">Asnjë sinjalizim për momentin.</p>}
              <ul className="space-y-2">
                {alertList.map((a) => (
                  <li key={a.date + a.kind} className="border border-border rounded-xl p-3 text-sm"><strong>{a.date}</strong> · zënia {pct(a.forecastOcc)} — {a.message}</li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
      <MobileNav />
    </div>
  );
};

export default RevenueManagerPage;
