import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, MapPin, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { SEOHead } from "@/components/SEOHead";
import { TripMap } from "@/components/TripMap";
import { toast } from "@/hooks/use-toast";
import { chooseCities, PlanListing } from "@/lib/local-planner";
import { addDays } from "@/lib/dates";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Stay {
  listing_id: string; title: string; location: string; lat: number | null; lng: number | null;
  room_id: string; room_name: string; check_in: string; check_out: string; nights: number;
  total: number; nightly: number; why: string; activities: string[];
}
interface Plan { title: string; summary: string; guests: number; stays: Stay[]; total: number; nights: number; dropped: string[] }

const EXAMPLES = [
  "5 ditë romantike me gjallëri kulturore dhe natyrë, buxhet mesatar",
  "Udhëtim me miq: qytet i gjallë, pastaj male dhe ajër i pastër",
  "Familje me 2 fëmijë: pak qytet, shumë qetësi, çmim i arsyeshëm",
];

const PlannerPage = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(5);
  const [start, setStart] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);


  // Planifikues pa AI: i njëjti format, nga të dhënat reale; disponueshmëria dhe çmimi verifikohen nga baza
  const localPlan = async (): Promise<Plan | null> => {
    const { data } = await supabase.from("listings").select("id,title,type,price,location,guests,rating,lat,lng").limit(300);
    const all = (data ?? []) as PlanListing[];
    const startDate = start || addDays(new Date().toISOString().slice(0, 10), 14);
    const choice = chooseCities(all, prompt, guests, nights);
    const stays: Stay[] = [];
    const dropped: string[] = [];
    let cursor = startDate;
    for (const c of choice) {
      const out = addDays(cursor, c.nights);
      let done = false;
      for (const l of c.candidates.slice(0, 4)) {
        const { data: rooms } = await supabase.rpc("check_availability", { _listing_id: l.id, _check_in: cursor, _check_out: out, _guests: guests });
        const room = rooms?.[0];
        if (!room) continue;
        const { data: q } = await supabase.rpc("quote_stay", { _room_id: room.room_id, _check_in: cursor, _check_out: out });
        const quote = q?.[0];
        if (!quote) continue;
        stays.push({
          listing_id: l.id, title: l.title, location: l.location, lat: l.lat, lng: l.lng, room_id: room.room_id, room_name: room.room_name,
          check_in: cursor, check_out: out, nights: c.nights, total: Number(quote.total), nightly: Number(quote.subtotal) / c.nights,
          why: `Zgjedhur sepse ka vlerësim ${l.rating ?? "—"} dhe strehon ${guests} mysafirë në ${c.city}.`, activities: [],
        });
        done = true;
        break;
      }
      if (!done) dropped.push(`${c.city}: asnjë dhomë e lirë për ${cursor} → ${out}`);
      cursor = out;
    }
    if (stays.length === 0) return null;
    return { title: "Udhëtimi juaj (planifikim bazë)", summary: "Planifikuar me rregulla nga prona reale, pa AI. Disponueshmëria dhe çmimet janë të verifikuara nga baza.", guests, stays, total: stays.reduce((a, x) => a + x.total, 0), nights: stays.reduce((a, x) => a + x.nights, 0), dropped };
  };

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setPlan(null);
    const { data, error: err } = await supabase.functions.invoke("trip-planner", {
      body: { prompt, guests, nights, start_date: start || undefined, language: lang === "en" ? "en" : "sq" },
    });
    setLoading(false);
    if (err || !data?.stays) {
      // kur funksioni kthen 4xx/5xx, mesazhi i serverit është te err.context
      let msg = "Planifikuesi nuk dha rezultat. Provoni përsëri.";
      try { const body = await (err as { context?: Response })?.context?.json(); if (body?.error) msg = body.error; } catch { /* mbetet mesazhi standard */ }
      if (data?.error) msg = data.error;
      // AI nuk është aktiv: provo planifikuesin bazë nga të dhënat reale
      setLoading(true);
      try {
        const basic = await localPlan();
        if (basic) { setPlan(basic); setError(null); setLoading(false); return; }
      } catch { /* mbetet mesazhi i gabimit */ }
      setLoading(false);
      setError(`${msg} Planifikuesi bazë nuk gjeti dhoma të lira për këto data: provo data të tjera ose më pak net.`);
      return;
    }
    setPlan(data as Plan);
  };

  const bookAll = async () => {
    if (!plan) return;
    if (!user) { navigate(`/auth?redirect=${encodeURIComponent("/planner")}`); return; }
    setBooking(true);
    const created: string[] = [];
    for (const s of plan.stays) {
      const { data, error: err } = await supabase.rpc("create_booking", {
        _room_id: s.room_id, _check_in: s.check_in, _check_out: s.check_out, _guests: plan.guests,
        _guest_name: user.email ?? "Mysafir", _guest_email: user.email ?? "", _source: "web",
      });
      if (err) {
        toast({ title: `Rezervimi te ${s.title} dështoi`, description: `${err.message}. ${created.length} rezervime të mëparshme janë krijuar; i shihni te "Rezervimet e mia".`, variant: "destructive" });
        setBooking(false);
        return;
      }
      created.push(data as string);
    }
    setBooking(false);
    toast({ title: "Rezervimet u krijuan", description: "Paguani secilin brenda 30 minutash." });
    navigate("/bookings");
  };

  const mapStops = plan?.stays.filter((s) => s.lat != null && s.lng != null).map((s) => ({ lat: s.lat as number, lng: s.lng as number, title: s.title })) ?? [];
  const input = "w-full border border-input rounded-xl px-3 py-2 text-sm bg-background";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Planifikuesi i udhëtimit me AI | KosovaBnB" description="Përshkruaj udhëtimin dhe AI ndërton itinerar me prona reale të verifikuara." canonical="https://kosovabnb.lovable.app/planner" noindex />
      <Header />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-28 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> Planifikuesi i udhëtimit</h1>
          <p className="text-muted-foreground max-w-3xl">
            Shkruaj çfarë dëshiron. AI zgjedh qytetet dhe pronat, por <strong>çdo qëndrim verifikohet në server</strong> për disponueshmëri dhe çmim real përpara se ta shohësh.
          </p>
        </header>

        <form onSubmit={generate} className="border border-border rounded-2xl p-5 space-y-4">
          <label className="block text-sm font-medium">Si e imagjinon udhëtimin?
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} maxLength={1500} required minLength={5} className={`${input} mt-1`} placeholder="p.sh. Dua të njoh Kosovën: histori, ushqim dhe natyrë…" />
          </label>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((x) => (
              <button type="button" key={x} onClick={() => setPrompt(x)} className="text-xs border border-border rounded-full px-3 py-1 hover:bg-secondary">{x}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="text-sm font-medium">Mysafirë<input type="number" min={1} max={20} className={input} value={guests} onChange={(e) => setGuests(Math.max(1, Math.min(20, Number(e.target.value))))} /></label>
            <label className="text-sm font-medium">Net<input type="number" min={1} max={21} className={input} value={nights} onChange={(e) => setNights(Math.max(1, Math.min(21, Number(e.target.value))))} /></label>
            <label className="text-sm font-medium">Fillimi (opsional)<input type="date" className={input} value={start} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setStart(e.target.value)} /></label>
          </div>
          <button disabled={loading} className="w-full gradient-brand text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {loading ? "Po planifikoj (mund të zgjasë ~20 s)…" : "Planifiko udhëtimin"}
          </button>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </form>

        {plan && (
          <section className="space-y-6" aria-live="polite">
            <div>
              <h2 className="text-xl font-bold">{plan.title}</h2>
              <p className="text-muted-foreground">{plan.summary}</p>
              <p className="text-sm mt-2"><strong>{plan.nights} net</strong> · {plan.stays.length} qëndrime · totali <strong>€{plan.total.toFixed(2)}</strong> për {plan.guests} mysafirë · çmime dhe disponueshmëri të verifikuara</p>
            </div>
            {mapStops.length > 0 && <TripMap stops={mapStops} />}
            <ol className="space-y-4">
              {plan.stays.map((s, i) => (
                <li key={s.listing_id + s.check_in} className="border border-border rounded-2xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-primary">QËNDRIMI {i + 1} · {s.nights} net · {s.check_in} → {s.check_out}</p>
                      <Link to={`/listing/${s.listing_id}`} className="font-semibold hover:underline">{s.title}</Link>
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.location} · {s.room_name}</p>
                    </div>
                    <p className="font-semibold whitespace-nowrap">€{s.total.toFixed(0)}</p>
                  </div>
                  <p className="text-sm">{s.why}</p>
                  {s.activities.length > 0 && <ul className="list-disc pl-5 text-sm text-muted-foreground">{s.activities.map((a) => <li key={a}>{a}</li>)}</ul>}
                </li>
              ))}
            </ol>
            {plan.dropped.length > 0 && (
              <p className="text-xs text-muted-foreground">Serveri hodhi poshtë {plan.dropped.length} propozim(e) të AI që nuk kaluan verifikimin: {plan.dropped.join("; ")}.</p>
            )}
            <button onClick={bookAll} disabled={booking} className="w-full gradient-brand text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {booking && <Loader2 className="h-4 w-4 animate-spin" />} Rezervo të gjitha qëndrimet (pagesa provë)
            </button>
            <p className="text-xs text-muted-foreground text-center">Çdo qëndrim krijohet si rezervim i veçantë në pritje të pagesës (30 min). Nëse njëri dështon, të mëparshmit mbeten dhe mund të anulohen.</p>
          </section>
        )}
      </main>
      <MobileNav />
    </div>
  );
};

export default PlannerPage;
