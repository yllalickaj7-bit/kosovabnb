import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, Minus, Plus, ChevronDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface BookingWidgetProps {
  listingId: string;
  price: number;
  rating: number;
  listingTitle: string;
  location: string;
}

const iso = (d: Date) => format(d, "yyyy-MM-dd");

const roomTypeLabel: Record<string, string> = {
  standard: "Standarde",
  deluxe: "Deluxe",
  suite: "Suite",
  family: "Familjare",
  entire_place: "Gjithë vendi",
};

export const BookingWidget = ({ listingId, price, rating, listingTitle, location }: BookingWidgetProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [showGuests, setShowGuests] = useState(false);
  const [roomId, setRoomId] = useState<string>();
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const datesReady = !!checkIn && !!checkOut;

  // Dhomat e lira për datat dhe numrin e mysafirëve (llogaritet në bazë, jo në klient)
  const availability = useQuery({
    queryKey: ["availability", listingId, checkIn && iso(checkIn), checkOut && iso(checkOut), guests],
    enabled: datesReady,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("check_availability", {
        _listing_id: listingId,
        _check_in: iso(checkIn!),
        _check_out: iso(checkOut!),
        _guests: guests,
      });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rooms = availability.data ?? [];

  // Zgjidh dhomën e parë të lirë kur ndryshon lista
  useEffect(() => {
    if (rooms.length === 0) setRoomId(undefined);
    else if (!rooms.some((r) => r.room_id === roomId)) setRoomId(rooms[0].room_id);
  }, [rooms, roomId]);

  // Çmimi përfundimtar nga serveri (sezoni, fundjava, çmimet e miratuara)
  const quote = useQuery({
    queryKey: ["quote", roomId, checkIn && iso(checkIn), checkOut && iso(checkOut)],
    enabled: datesReady && !!roomId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("quote_stay", {
        _room_id: roomId!,
        _check_in: iso(checkIn!),
        _check_out: iso(checkOut!),
      });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

  const q = quote.data;
  const noRooms = datesReady && !availability.isLoading && !availability.isError && rooms.length === 0;

  const handleReserve = async () => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/listing/${listingId}`)}`);
      return;
    }
    if (!checkIn || !checkOut || !roomId) {
      toast({ title: "Zgjidhni datat", description: "Zgjidhni check-in dhe check-out për të vazhduar." });
      return;
    }
    const name = guestName.trim() || (user.user_metadata?.full_name as string | undefined) || user.email?.split("@")[0] || "";
    setSubmitting(true);
    const { data, error } = await supabase.rpc("create_booking", {
      _room_id: roomId,
      _check_in: iso(checkIn),
      _check_out: iso(checkOut),
      _guests: guests,
      _guest_name: name,
      _guest_email: user.email ?? "",
      _guest_phone: guestPhone.trim() || undefined,
      _source: "web",
    });
    setSubmitting(false);
    if (error || !data) {
      toast({ title: "Rezervimi dështoi", description: error?.message ?? "Provoni përsëri.", variant: "destructive" });
      availability.refetch();
      return;
    }
    navigate(`/checkout/${data}`);
  };

  const handleWhatsApp = () => {
    const msg =
      `Përshëndetje! Dua të pyes për:\n` +
      `🏠 *${listingTitle}*\n` +
      `📍 ${location}\n` +
      `📅 Check-in: ${checkIn ? format(checkIn, "dd MMM yyyy") : "E papërcaktuar"}\n` +
      `📅 Check-out: ${checkOut ? format(checkOut, "dd MMM yyyy") : "E papërcaktuar"}\n` +
      `👤 Mysafirë: ${guests}`;
    window.open(`https://wa.me/38349000000?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="sticky top-28 bg-white border border-border rounded-2xl shadow-xl p-6 space-y-4">
      {/* Price */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold">€{q ? Math.round(q.subtotal / q.nights) : price}</span>
          <span className="text-muted-foreground text-sm"> nata{q ? " (mesatarisht)" : ""}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-foreground text-foreground" />
          <span className="font-semibold">{rating.toFixed(2)}</span>
        </div>
      </div>

      {/* Date Picker */}
      <div className="grid grid-cols-2 border border-border rounded-xl overflow-hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex flex-col items-start px-3 py-2 border-r border-border hover:bg-secondary transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Check-in</span>
              <span className={cn("text-sm", checkIn ? "text-foreground" : "text-muted-foreground")}>
                {checkIn ? format(checkIn, "dd/MM/yyyy") : "Shto datën"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={(d) => {
                setCheckIn(d);
                if (d && checkOut && checkOut <= d) setCheckOut(undefined);
              }}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex flex-col items-start px-3 py-2 hover:bg-secondary transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Check-out</span>
              <span className={cn("text-sm", checkOut ? "text-foreground" : "text-muted-foreground")}>
                {checkOut ? format(checkOut, "dd/MM/yyyy") : "Shto datën"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) => date <= (checkIn || new Date())}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Guests */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowGuests(!showGuests)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary transition-colors"
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Mysafirë</span>
            <span className="text-sm text-foreground">{guests} mysafir{guests !== 1 ? "ë" : ""}</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${showGuests ? "rotate-180" : ""}`} />
        </button>
        {showGuests && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-sm font-medium">Të rritur</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:border-foreground transition-colors disabled:opacity-40"
                disabled={guests <= 1}
                aria-label="Hiq mysafir"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm w-4 text-center">{guests}</span>
              <button
                onClick={() => setGuests(Math.min(16, guests + 1))}
                className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:border-foreground transition-colors"
                aria-label="Shto mysafir"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dhoma të lira (kur prona ka më shumë se një) */}
      {datesReady && rooms.length > 1 && (
        <div className="border border-border rounded-xl p-3 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Zgjidh dhomën</span>
          {rooms.map((r) => (
            <label key={r.room_id} className="flex items-center justify-between text-sm cursor-pointer">
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="room"
                  checked={roomId === r.room_id}
                  onChange={() => setRoomId(r.room_id)}
                />
                {r.room_name} <span className="text-muted-foreground">· {roomTypeLabel[r.room_type] ?? r.room_type} · {r.capacity} mysafirë</span>
              </span>
              <span className="text-muted-foreground">nga €{Math.round(r.base_price)}</span>
            </label>
          ))}
        </div>
      )}

      {/* Të dhënat e mysafirit (vetëm kur përdoruesi është i kyçur dhe ka dhomë të lirë) */}
      {user && datesReady && rooms.length > 0 && (
        <div className="space-y-2">
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Emri dhe mbiemri"
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-foreground"
            maxLength={100}
          />
          <input
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="Telefoni (opsional)"
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-foreground"
            maxLength={30}
          />
        </div>
      )}

      {/* Reserve Button */}
      <button
        onClick={handleReserve}
        disabled={submitting || noRooms || (datesReady && availability.isLoading)}
        className="w-full py-4 rounded-xl font-semibold text-white text-base transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(to right, #2D5BE3 0%, #1B3FB5 50%, #12297A 100%)" }}
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {user ? "Rezervo" : "Hyr për të rezervuar"}
      </button>

      {noRooms && (
        <p className="text-center text-sm text-destructive">
          Nuk ka dhomë të lirë për këto data ose këtë numër mysafirësh.
        </p>
      )}
      {availability.isError && (
        <p className="text-center text-sm text-destructive">Nuk u kontrollua disponueshmëria. Provoni përsëri.</p>
      )}
      {!noRooms && <p className="text-center text-sm text-muted-foreground">Pagesa bëhet në hapin tjetër (mënyrë provë)</p>}

      {/* Price Breakdown */}
      {q && (
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">€{Math.round(q.subtotal / q.nights)} × {q.nights} net{q.nights !== 1 ? "ë" : ""}</span>
            <span>€{q.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Tarifa e shërbimit</span>
            <span>€{q.service_fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-3 border-t border-border">
            <span>Totali</span>
            <span>€{q.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button onClick={handleWhatsApp} className="w-full text-center text-sm text-muted-foreground underline hover:text-foreground">
        Keni pyetje? Shkruani në WhatsApp
      </button>
    </div>
  );
};
