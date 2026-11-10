import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { addDays } from "@/lib/dates";
import { DEFAULT_RULES, nightlyPrice } from "@/lib/pricing";

const MONTHS = ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gus", "Sht", "Tet", "Nën", "Dhj"];
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; };

/** Çmimi i drejtë + kur është më lirë: vetëm nga të dhënat reale (pronat e ngjashme dhe rregullat sezonale). */
export const PriceInsight = ({ id, type, price }: { id: string; type: string; price: number }) => {
  const { data: peers } = useQuery({
    queryKey: ["peers", type],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("id,price").eq("type", type).limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const months = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const base = Number(price);
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today + "T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + i, 15);
      const ymd = d.toISOString().slice(0, 10);
      // e mërkura më e afërt pas mesit të muajit (ditë pune, pa shtesë fundjave)
      const weekday = nightlyPrice({ basePrice: base }, DEFAULT_RULES, addDays(ymd, (3 - d.getUTCDay() + 7) % 7), 60);
      return { m: MONTHS[d.getUTCMonth()], price: Math.round(weekday) };
    });
  }, [price]);

  const others = (peers ?? []).filter((p) => p.id !== id).map((p) => Number(p.price));
  const med = median(others);
  const diff = med > 0 ? ((Number(price) - med) / med) * 100 : null;
  const min = Math.min(...months.map((x) => x.price));
  const max = Math.max(...months.map((x) => x.price));

  return (
    <section className="border border-border rounded-2xl p-5 space-y-4" aria-label="Analiza e çmimit">
      <h2 className="text-lg font-semibold">Çmimi i kësaj prone</h2>
      {diff !== null && others.length >= 3 && (
        <p className="text-sm">
          {Math.abs(diff) < 5 ? "Çmim në nivelin e ngjashmëve" : diff < 0 ? `${Math.abs(diff).toFixed(0)}% më lirë` : `${diff.toFixed(0)}% më shtrenjtë`}
          <span className="text-muted-foreground"> se mediana e {others.length} pronave të llojit "{type}" (€{Math.round(med)}/natë).</span>
        </p>
      )}
      <div>
        <p className="text-sm font-medium mb-1">Kur është më lirë? Çmimi i pritur për natë, 12 muajt e ardhshëm</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months}>
              <XAxis dataKey="m" tick={{ fontSize: 11 }} />
              <YAxis hide domain={[0, "dataMax + 10"]} />
              <Tooltip formatter={(v: number) => `€${v}`} />
              <Bar dataKey="price" name="Çmimi/natë" radius={[6, 6, 0, 0]}>
                {months.map((x, i) => <Cell key={i} fill={x.price === min ? "#16a34a" : x.price === max ? "#E8A700" : "#2D5BE3"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Sipas rregullave sezonale të sistemit (sezoni, festat). Çmimi real për datat tuaja shfaqet te rezervimi; ai varet edhe nga zënia.</p>
      </div>
    </section>
  );
};
