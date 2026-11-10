import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const statusLabel: Record<string, { text: string; cls: string }> = {
  pending: { text: "Në pritje të pagesës", cls: "bg-amber-100 text-amber-800" },
  confirmed: { text: "E konfirmuar", cls: "bg-green-100 text-green-800" },
  cancelled: { text: "E anuluar", cls: "bg-secondary text-muted-foreground" },
  completed: { text: "E përfunduar", cls: "bg-blue-100 text-blue-800" },
};

const MyBookingsPage = () => {
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, listings(id, title, location, images_url)")
        .eq("guest_id", user!.id)
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast({ title: "Rezervimi u anulua" });
    },
    onError: (e: Error) => toast({ title: "Anulimi dështoi", description: e.message, variant: "destructive" }),
  });

  if (!authLoading && !user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent("/bookings")}`} replace />;
  }

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Rezervimet e mia | KosovaBnB" description="Shikoni dhe menaxhoni rezervimet tuaja." canonical="https://kosovabnb.lovable.app/bookings" noindex />
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-28">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Rezervimet e mia</h1>
        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
        {bookings && bookings.length === 0 && (
          <p className="text-muted-foreground">
            Nuk keni rezervime ende. <Link to="/" className="underline">Gjeni një vend</Link>.
          </p>
        )}
        <ul className="space-y-4">
          {bookings?.map((b) => {
            const l = b.listings as { id: string; title: string; location: string; images_url: string[] } | null;
            const st = statusLabel[b.status] ?? statusLabel.pending;
            const canCancel = (b.status === "pending" || b.status === "confirmed") && b.check_in > today;
            return (
              <li key={b.id} className="flex gap-4 border border-border rounded-2xl p-4">
                {l?.images_url?.[0] && <img src={l.images_url[0]} alt="" className="h-24 w-32 object-cover rounded-xl flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/listing/${l?.id}`} className="font-semibold hover:underline truncate">{l?.title}</Link>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${st.cls}`}>{st.text}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{l?.location}</p>
                  <p className="text-sm mt-1">
                    {format(parseISO(b.check_in), "dd/MM/yyyy")} → {format(parseISO(b.check_out), "dd/MM/yyyy")} · {b.nights} net · {b.guests} mysafirë
                  </p>
                  <p className="text-sm font-semibold mt-1">€{Number(b.total_price).toFixed(2)}</p>
                  <div className="flex gap-3 mt-2">
                    {b.status === "pending" && (
                      <Link to={`/checkout/${b.id}`} className="text-sm font-semibold gradient-brand text-white px-4 py-1.5 rounded-lg">
                        Paguaj
                      </Link>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => { if (window.confirm("Të anulohet ky rezervim?")) cancel.mutate(b.id); }}
                        className="text-sm underline text-muted-foreground hover:text-destructive"
                      >
                        Anulo
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
      <MobileNav />
    </div>
  );
};

export default MyBookingsPage;
