import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CheckCircle2, CreditCard, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const CheckoutPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/30");
  const [cvc, setCvc] = useState("123");
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    enabled: !!id && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, listings(title, location, images_url)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setPaying(true);
    setResult(null);
    // CVC nuk dërgohet askund: është vetëm për ta bërë formularin të ngjashëm me një pagesë reale
    const { data, error } = await supabase.rpc("simulate_payment", {
      _booking_id: id,
      _card_number: card,
      _expiry: expiry,
    });
    setPaying(false);
    if (error) {
      setResult({ ok: false, message: error.message });
      return;
    }
    const row = data?.[0];
    setResult({ ok: row?.status === "succeeded", message: row?.message ?? "Pagesa nuk u krye." });
    queryClient.invalidateQueries({ queryKey: ["booking", id] });
    queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
  };

  if (!authLoading && !user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(`/checkout/${id}`)}`} replace />;
  }

  const listing = booking?.listings as { title: string; location: string; images_url: string[] } | null | undefined;
  const confirmed = booking?.status === "confirmed" || result?.ok;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Pagesa | KosovaBnB" description="Përfundoni rezervimin tuaj." canonical="https://kosovabnb.lovable.app/checkout" noindex />
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-28">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{confirmed ? "Rezervimi u konfirmua" : "Konfirmo dhe paguaj"}</h1>

        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}

        {booking && (
          <div className="grid md:grid-cols-[1fr_340px] gap-8">
            <section>
              {confirmed ? (
                <div className="border border-border rounded-2xl p-6 space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
                  <p className="font-semibold">Pagesa (simulim) u krye me sukses.</p>
                  <p className="text-sm text-muted-foreground">
                    Rezervimi juaj te <strong>{listing?.title}</strong> është konfirmuar.
                  </p>
                  <Link to="/bookings" className="inline-block mt-2 gradient-brand text-white font-semibold px-6 py-3 rounded-xl text-sm">
                    Shiko rezervimet e mia
                  </Link>
                </div>
              ) : booking.status !== "pending" ? (
                <div className="border border-border rounded-2xl p-6">
                  <p className="text-sm">Ky rezervim është <strong>{booking.status}</strong> dhe nuk pranon pagesë.</p>
                  <Link to="/bookings" className="underline text-sm">Rezervimet e mia</Link>
                </div>
              ) : (
                <form onSubmit={handlePay} className="border border-border rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 p-3 text-sm">
                    <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>
                      <strong>Mënyrë provë.</strong> Asnjë pagesë reale nuk kryhet. Mos shkruani të dhëna të kartës suaj.
                      Kartë që kalon: 4242 4242 4242 4242 · e refuzuar: 4000 0000 0000 0002.
                    </span>
                  </div>

                  <label className="block text-sm font-medium">
                    Numri i kartës
                    <div className="relative mt-1">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <input
                        value={card}
                        onChange={(e) => setCard(formatCardNumber(e.target.value))}
                        inputMode="numeric"
                        autoComplete="off"
                        className="w-full pl-10 pr-3 py-3 border border-input rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block text-sm font-medium">
                      Skadon (MM/VV)
                      <input
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        inputMode="numeric"
                        autoComplete="off"
                        className="mt-1 w-full px-3 py-3 border border-input rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="MM/VV"
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      CVC
                      <input
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        inputMode="numeric"
                        autoComplete="off"
                        className="mt-1 w-full px-3 py-3 border border-input rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="123"
                      />
                    </label>
                  </div>

                  {result && !result.ok && (
                    <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
                      <XCircle className="h-4 w-4" aria-hidden="true" /> {result.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full py-4 rounded-xl gradient-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {paying && <Loader2 className="h-4 w-4 animate-spin" />}
                    Paguaj €{Number(booking.total_price).toFixed(2)} (provë)
                  </button>
                  <p className="text-xs text-muted-foreground text-center">
                    Rezervimi mbahet 30 minuta. Pas kësaj dhoma lirohet automatikisht.
                  </p>
                </form>
              )}
            </section>

            <aside className="border border-border rounded-2xl p-5 h-fit space-y-3">
              {listing?.images_url?.[0] && (
                <img src={listing.images_url[0]} alt={listing.title} className="w-full h-32 object-cover rounded-xl" />
              )}
              <div>
                <h2 className="font-semibold">{listing?.title}</h2>
                <p className="text-sm text-muted-foreground">{listing?.location}</p>
              </div>
              <div className="text-sm space-y-1 border-t border-border pt-3">
                <div className="flex justify-between"><span>Check-in</span><span>{format(parseISO(booking.check_in), "dd/MM/yyyy")}</span></div>
                <div className="flex justify-between"><span>Check-out</span><span>{format(parseISO(booking.check_out), "dd/MM/yyyy")}</span></div>
                <div className="flex justify-between"><span>Mysafirë</span><span>{booking.guests}</span></div>
              </div>
              <div className="text-sm space-y-1 border-t border-border pt-3">
                <div className="flex justify-between"><span>€{Number(booking.price_per_night).toFixed(0)} × {booking.nights} net</span><span>€{Number(booking.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tarifa e shërbimit</span><span>€{Number(booking.service_fee).toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border"><span>Totali</span><span>€{Number(booking.total_price).toFixed(2)}</span></div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
};

export default CheckoutPage;
