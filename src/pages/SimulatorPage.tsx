import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, Play } from "lucide-react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { SEOHead } from "@/components/SEOHead";
import { DEFAULT_CONFIG, Strategy } from "@/lib/simulation/engine";
import { MonteCarloResult, STRATEGIES, monteCarlo } from "@/lib/simulation/montecarlo";

const LABEL: Record<Strategy, string> = { static: "Çmim fiks", rules: "Rregulla sezonale", ai: "AI dinamik" };
const COLOR: Record<Strategy, string> = { static: "#9ca3af", rules: "#3b82f6", ai: "#E61E4D" };
const MONTHS = ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gus", "Sht", "Tet", "Nën", "Dhj"];
const eur = (x: number) => `€${Math.round(x).toLocaleString("en-US")}`;

const SimulatorPage = () => {
  const [rooms, setRooms] = useState(DEFAULT_CONFIG.rooms);
  const [basePrice, setBasePrice] = useState(DEFAULT_CONFIG.basePrice);
  const [demand, setDemand] = useState(DEFAULT_CONFIG.demandPerDay);
  const [seedCount, setSeedCount] = useState(30);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [sweep, setSweep] = useState<{ demand: number; occ: number; aiVsStatic: number; aiVsRules: number }[] | null>(null);

  const run = () => {
    setRunning(true);
    // lejo UI-n të vizatojë "duke ekzekutuar" para llogaritjes (e shpejtë, por sinkrone)
    setTimeout(() => {
      const cfg = { ...DEFAULT_CONFIG, rooms, basePrice, demandPerDay: demand };
      const seeds = Array.from({ length: seedCount }, (_, i) => i + 1);
      setResult(monteCarlo(cfg, seeds));
      setSweep(
        [6, 8, 10, 12, 14, 18, 24].map((d) => {
          const r = monteCarlo({ ...cfg, demandPerDay: d }, seeds.slice(0, 20));
          const pick = (b: Strategy) => r.comparisons.find((c) => c.strategy === "ai" && c.baseline === b)?.pctMean ?? 0;
          return { demand: d, occ: Math.round(r.summary.static.occupancy.mean * 100), aiVsStatic: +pick("static").toFixed(2), aiVsRules: +pick("rules").toFixed(2) };
        }),
      );
      setRunning(false);
    }, 30);
  };

  const monthly = useMemo(() => {
    if (!result) return [];
    return MONTHS.map((m, i) => {
      const row: Record<string, number | string> = { month: m };
      for (const s of STRATEGIES) row[s] = Math.round(result.runs[s].reduce((a, r) => a + r.monthlyRevenue[i], 0) / result.runs[s].length);
      return row;
    });
  }, [result]);

  const bars = result ? STRATEGIES.map((s) => ({ name: LABEL[s], revenue: Math.round(result.summary[s].revenue.mean), fill: COLOR[s] })) : [];
  const aiVsStatic = result?.comparisons.find((c) => c.strategy === "ai" && c.baseline === "static");
  const aiVsRules = result?.comparisons.find((c) => c.strategy === "ai" && c.baseline === "rules");

  const input = "w-full border border-input rounded-xl px-3 py-2 text-sm bg-background";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Simulatori i çmimeve me AI | KosovaBnB" description="Simulim Monte Carlo i një viti hoteli: çmim fiks kundrejt çmimit dinamik." canonical="https://kosovabnb.lovable.app/simulator" noindex />
      <Header />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-28 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Simulatori i çmimeve</h1>
          <p className="text-muted-foreground max-w-3xl">
            Mijëra mysafirë sintetikë (me buxhet, data dhe kohë rezervimi të rastësishme) rezervojnë një hotel për një vit të tërë. Të njëjtët mysafirë provohen me tri strategji çmimi, kështu që diferenca vjen vetëm nga çmimi.
          </p>
        </header>

        <section className="border border-border rounded-2xl p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <label className="text-sm font-medium">Dhoma<input type="number" min={2} max={60} className={input} value={rooms} onChange={(e) => setRooms(Math.max(2, Math.min(60, Number(e.target.value))))} /></label>
          <label className="text-sm font-medium">Çmimi bazë (€)<input type="number" min={20} max={500} className={input} value={basePrice} onChange={(e) => setBasePrice(Math.max(20, Math.min(500, Number(e.target.value))))} /></label>
          <label className="text-sm font-medium">Kërkesa: {demand} kërkesa/ditë
            <input type="range" min={4} max={26} value={demand} onChange={(e) => setDemand(Number(e.target.value))} className="w-full" />
          </label>
          <label className="text-sm font-medium">Përsëritje: {seedCount}
            <input type="range" min={5} max={100} step={5} value={seedCount} onChange={(e) => setSeedCount(Number(e.target.value))} className="w-full" />
          </label>
          <button onClick={run} disabled={running} className="sm:col-span-2 lg:col-span-4 gradient-brand text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Ekzekuto simulimin
          </button>
        </section>

        {result && aiVsStatic && aiVsRules && (
          <>
            <section className="grid sm:grid-cols-3 gap-4">
              {STRATEGIES.map((s) => {
                const x = result.summary[s];
                return (
                  <div key={s} className="border border-border rounded-2xl p-4 space-y-1" style={{ borderTopColor: COLOR[s], borderTopWidth: 4 }}>
                    <h2 className="font-semibold">{LABEL[s]}</h2>
                    <p className="text-2xl font-bold">{eur(x.revenue.mean)}</p>
                    <p className="text-xs text-muted-foreground">±{eur(x.revenue.ci)} (95%) · zënia {(x.occupancy.mean * 100).toFixed(0)}% · ADR €{x.adr.mean.toFixed(0)}</p>
                  </div>
                );
              })}
            </section>

            <section className="border border-border rounded-2xl p-5 space-y-2" aria-live="polite">
              <h2 className="font-semibold">Rezultati</h2>
              <p className="text-sm">
                AI dinamik kundrejt çmimit fiks: <strong>{aiVsStatic.pctMean >= 0 ? "+" : ""}{aiVsStatic.pctMean.toFixed(1)}%</strong> ({eur(aiVsStatic.diffMean)} ± {eur(aiVsStatic.diffCi)} në vit), fiton në {aiVsStatic.wins} nga {seedCount} simulime — {aiVsStatic.significant ? "diferencë statistikisht domethënëse" : "diferencë jo domethënëse statistikisht"}.
              </p>
              <p className="text-sm text-muted-foreground">
                Pjesa që i shton vetë shtresa AI mbi rregullat sezonale: {aiVsRules.pctMean >= 0 ? "+" : ""}{aiVsRules.pctMean.toFixed(1)}% ({aiVsRules.significant ? "domethënëse" : "jo domethënëse"}).
              </p>
            </section>

            <section className="grid lg:grid-cols-2 gap-6">
              <div className="border border-border rounded-2xl p-4">
                <h2 className="font-semibold mb-3">Të ardhurat vjetore (mesatare)</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bars}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `€${Math.round(v / 1000)}k`} domain={["dataMin - 5000", "auto"]} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => eur(v)} />
                      <Bar dataKey="revenue" name="Të ardhura" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="border border-border rounded-2xl p-4">
                <h2 className="font-semibold mb-3">Të ardhurat sipas muajit</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `€${Math.round(v / 1000)}k`} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => eur(v)} />
                      <Legend />
                      {STRATEGIES.map((s) => <Line key={s} type="monotone" dataKey={s} name={LABEL[s]} stroke={COLOR[s]} strokeWidth={2} dot={false} />)}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {sweep && (
              <section className="border border-border rounded-2xl p-4 space-y-3">
                <h2 className="font-semibold">Kur ndihmon AI-ja? Ndjeshmëria ndaj kërkesës</h2>
                <p className="text-sm text-muted-foreground">
                  Përfitimi ndryshon me ngarkesën e hotelit (zënia me çmim fiks, në boshtin X). Kur hoteli mbushet, rregullat sezonale bëjnë pjesën më të madhe; kur kërkesa është e dobët, çmimi dinamik humb më pak.
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sweep}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="occ" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => `${v}%`} labelFormatter={(l) => `Zënia me çmim fiks: ${l}%`} />
                      <Legend />
                      <Bar dataKey="aiVsStatic" name="AI vs çmim fiks" fill={COLOR.ai} />
                      <Bar dataKey="aiVsRules" name="AI vs rregulla" fill={COLOR.rules} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </>
        )}

        <section className="border border-amber-200 bg-amber-50 text-amber-950 rounded-2xl p-5 space-y-2 text-sm">
          <h2 className="font-semibold">Si ta lexosh këtë rezultat (kufizime)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kërkesa është <strong>sintetike</strong>: sezonaliteti i tregut dhe ngjarjet e papritura (koncert, festival) janë supozime të modelit, jo të dhëna reale. Rezultati është demonstrim i mekanizmit, jo premtim përfitimi.</li>
            <li>Kërkesa kalibrohet që çmimi fiks të japë ~65% zënie vjetore; ndryshoje rrëshqitësin për të parë se si ndryshon përfitimi.</li>
            <li>Dhomat konsiderohen identike dhe mysafirët mund të rirenditen; elasticiteti i kërkesës del nga gatishmëria e mysafirëve për të paguar (shpërndarje lognormale).</li>
            <li>Të gjitha strategjitë shohin <strong>të njëjtën kërkesë</strong> (të njëjtat seed-e), dhe diferenca raportohet me interval besimi 95%.</li>
          </ul>
        </section>
      </main>
      <MobileNav />
    </div>
  );
};

export default SimulatorPage;
