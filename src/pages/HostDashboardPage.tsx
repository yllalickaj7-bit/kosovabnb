import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Check, Loader2, Plus, Sparkles, X } from "lucide-react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const typeOptions = ["Apartamente", "Vila", "Hotele", "Motele", "Kamping", "Dizajn"];

const emptyForm = {
  title: "",
  type: "Hotele",
  price: 50,
  location: "",
  description: "",
  guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  image: "",
};

const HostDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const roles = useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role);
    },
  });
  const isHost = roles.data?.includes("host") || roles.data?.includes("admin");

  const becomeHost = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("become_host");
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-roles"] }),
    onError: (e: Error) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
  });

  const listings = useQuery({
    queryKey: ["host-listings", user?.id],
    enabled: !!isHost,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, location, type, price, owner_id")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const activeListing = selectedListing ?? listings.data?.[0]?.id;

  const bookings = useQuery({
    queryKey: ["host-bookings", activeListing],
    enabled: !!activeListing,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, guest_name, guest_email, check_in, check_out, guests, total_price, status, rooms(name)")
        .eq("listing_id", activeListing!)
        .order("check_in", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const recommendations = useQuery({
    queryKey: ["recommendations", activeListing],
    enabled: !!activeListing,
    queryFn: async () => {
      const { data: rooms, error: re } = await supabase.from("rooms").select("id, name").eq("listing_id", activeListing!);
      if (re) throw re;
      const ids = (rooms ?? []).map((r) => r.id);
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from("price_recommendations")
        .select("*")
        .in("room_id", ids)
        .eq("status", "suggested")
        .order("stay_date", { ascending: true })
        .limit(60);
      if (error) throw error;
      const names = new Map((rooms ?? []).map((r) => [r.id, r.name]));
      return (data ?? []).map((r) => ({ ...r, room_name: names.get(r.room_id) ?? "" }));
    },
  });

  const generate = useMutation({
    mutationFn: async () => {
      // Funksioni "price-recommend" (Edge Function) shton shpjegim me AI; nëse nuk është i vendosur, përdorim SQL direkt.
      const { error: fnError } = await supabase.functions.invoke("price-recommend", { body: { listing_id: activeListing } });
      if (fnError) {
        const { error } = await supabase.rpc("generate_price_recommendations", { _listing_id: activeListing!, _days: 30 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      toast({ title: "Rekomandimet u gjeneruan" });
    },
    onError: (e: Error) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
  });

  const decide = useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const { error } = await supabase.rpc("decide_price_recommendation", { _id: id, _accept: accept });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recommendations"] }),
    onError: (e: Error) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
  });

  const createListing = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .insert({
          title: form.title.trim(),
          type: form.type,
          price: Number(form.price),
          location: form.location.trim(),
          description: form.description.trim() || null,
          guests: Number(form.guests),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          images_url: form.image.trim() ? [form.image.trim()] : [],
          host_name: user?.email?.split("@")[0] ?? "Host",
          owner_id: user!.id,
          lat: 42.6629,
          lng: 21.1655,
        })
        .select("id")
        .single();
      if (error) throw error;
      // dhoma e parë (çmimi bazë = çmimi i pronës; kufijtë 70%–180%)
      const price = Number(form.price);
      const { error: re } = await supabase.from("rooms").insert({
        listing_id: data.id,
        name: form.type === "Hotele" ? "Dhomë standarde" : form.title.trim(),
        room_type: form.type === "Hotele" ? "standard" : "entire_place",
        capacity: Number(form.guests),
        base_price: price,
        min_price: Math.round(price * 0.7 * 100) / 100,
        max_price: Math.round(price * 1.8 * 100) / 100,
      });
      if (re) throw re;
      return data.id;
    },
    onSuccess: (id) => {
      setShowForm(false);
      setForm(emptyForm);
      setSelectedListing(id);
      queryClient.invalidateQueries({ queryKey: ["host-listings"] });
      toast({ title: "Prona u krijua" });
    },
    onError: (e: Error) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
  });

  if (!authLoading && !user) return <Navigate to={`/auth?redirect=${encodeURIComponent("/host")}`} replace />;

  const inputCls = "w-full border border-input rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Paneli i host-it | KosovaBnB" description="Menaxhoni pronat, rezervimet dhe çmimet." canonical="https://kosovabnb.lovable.app/host" noindex />
      <Header />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-28 space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold">Paneli i host-it</h1>

        {roles.isLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}

        {roles.data && !isHost && (
          <div className="border border-border rounded-2xl p-6 space-y-3">
            <p>Për të menaxhuar prona dhe çmime duhet të jeni host.</p>
            <button
              onClick={() => becomeHost.mutate()}
              disabled={becomeHost.isPending}
              className="gradient-brand text-white font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-50"
            >
              Bëhu host
            </button>
          </div>
        )}

        {isHost && (
          <>
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Pronat e mia</h2>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-sm font-semibold border border-border rounded-xl px-4 py-2 hover:bg-secondary">
                  <Plus className="h-4 w-4" /> Shto pronë
                </button>
              </div>

              {showForm && (
                <form
                  onSubmit={(e) => { e.preventDefault(); createListing.mutate(); }}
                  className="border border-border rounded-2xl p-5 grid sm:grid-cols-2 gap-3"
                >
                  <input required className={inputCls} placeholder="Emri i pronës" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} />
                  <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {typeOptions.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <input required className={inputCls} placeholder="Vendndodhja (p.sh. Prizren, Kosovë)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={120} />
                  <input required type="number" min={1} className={inputCls} placeholder="Çmimi për natë (€)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                  <input type="number" min={1} className={inputCls} placeholder="Mysafirë" value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" min={0} className={inputCls} placeholder="Dhoma gjumi" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })} />
                    <input type="number" min={0} className={inputCls} placeholder="Banjo" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })} />
                  </div>
                  <input className={`${inputCls} sm:col-span-2`} placeholder="URL e fotos kryesore (opsionale)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                  <textarea className={`${inputCls} sm:col-span-2`} rows={3} placeholder="Përshkrimi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <button type="submit" disabled={createListing.isPending} className="sm:col-span-2 gradient-brand text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50">
                    Ruaj pronën
                  </button>
                </form>
              )}

              {listings.data && listings.data.length === 0 && !showForm && (
                <p className="text-muted-foreground text-sm">Nuk keni prona ende. Shtoni të parën me butonin lart.</p>
              )}

              <div className="flex flex-wrap gap-2">
                {listings.data?.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedListing(l.id)}
                    className={`px-4 py-2 rounded-full text-sm border ${activeListing === l.id ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}
                  >
                    {l.title}
                  </button>
                ))}
              </div>
            </section>

            {activeListing && (
              <>
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Çmimet e sugjeruara nga AI</h2>
                    <button
                      onClick={() => generate.mutate()}
                      disabled={generate.isPending}
                      className="flex items-center gap-2 text-sm font-semibold gradient-brand text-white px-4 py-2 rounded-xl disabled:opacity-50"
                    >
                      {generate.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Gjenero për 30 ditët e ardhshme
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sugjerimet bazohen në sezonin, fundjavën, zënien e dritares 14-ditore dhe ditët deri në qëndrim, brenda çmimit minimal dhe maksimal të dhomës. Vendimi është i juaji.
                  </p>
                  {recommendations.data && recommendations.data.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nuk ka sugjerime. Shtypni "Gjenero".</p>
                  )}
                  <ul className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
                    {recommendations.data?.map((r) => {
                      const up = r.recommended_price > r.current_price;
                      return (
                        <li key={r.id} className="flex items-center gap-4 px-4 py-3">
                          <div className="w-24 text-sm font-medium">{format(parseISO(r.stay_date), "dd/MM/yyyy")}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="text-muted-foreground">{r.room_name} · </span>
                              €{Number(r.current_price).toFixed(0)} →{" "}
                              <strong className={up ? "text-green-700" : "text-amber-700"}>€{Number(r.recommended_price).toFixed(0)}</strong>
                            </p>
                            <p className="text-xs text-muted-foreground truncate" title={r.explanation ?? ""}>{r.explanation}</p>
                          </div>
                          <button onClick={() => decide.mutate({ id: r.id, accept: true })} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-green-50" aria-label="Prano">
                            <Check className="h-4 w-4 text-green-700" />
                          </button>
                          <button onClick={() => decide.mutate({ id: r.id, accept: false })} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-red-50" aria-label="Refuzo">
                            <X className="h-4 w-4 text-red-700" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold">Rezervimet e fundit</h2>
                  {bookings.data && bookings.data.length === 0 && <p className="text-sm text-muted-foreground">Nuk ka rezervime ende.</p>}
                  <ul className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
                    {bookings.data?.map((b) => (
                      <li key={b.id} className="px-4 py-3 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                        <strong>{b.guest_name}</strong>
                        <span className="text-muted-foreground">{(b.rooms as { name: string } | null)?.name}</span>
                        <span>{format(parseISO(b.check_in), "dd/MM")} → {format(parseISO(b.check_out), "dd/MM/yyyy")}</span>
                        <span>€{Number(b.total_price).toFixed(2)}</span>
                        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-secondary">{b.status}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
            <p className="text-xs text-muted-foreground">
              Shihni edhe <Link to="/bookings" className="underline">rezervimet tuaja si mysafir</Link>.
            </p>
          </>
        )}
      </main>
      <MobileNav />
    </div>
  );
};

export default HostDashboardPage;
