import { useState } from "react";
import { Star, Minus, Plus, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BookingWidgetProps {
  price: number;
  rating: number;
  listingTitle: string;
  location: string;
}

export const BookingWidget = ({ price, rating, listingTitle, location }: BookingWidgetProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [showGuests, setShowGuests] = useState(false);

  const nights =
    checkIn && checkOut
      ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
      : 1;

  const subtotal = price * nights;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const handleWhatsApp = () => {
    const msg =
      `Përshëndetje! Dua të rezervoj:\n` +
      `🏠 *${listingTitle}*\n` +
      `📍 ${location}\n` +
      `📅 Check-in: ${checkIn ? format(checkIn, "dd MMM yyyy") : "E papërcaktuar"}\n` +
      `📅 Check-out: ${checkOut ? format(checkOut, "dd MMM yyyy") : "E papërcaktuar"}\n` +
      `👤 Mysafirë: ${guests}\n` +
      `💰 Total: €${total}`;
    window.open(`https://wa.me/38349000000?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="sticky top-28 bg-white border border-border rounded-2xl shadow-xl p-6 space-y-4">
      {/* Price */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold">€{price}</span>
          <span className="text-muted-foreground text-sm"> nata</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-foreground text-foreground" />
          <span className="font-semibold">{rating.toFixed(2)}</span>
          <span className="text-muted-foreground">(24)</span>
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
              onSelect={setCheckIn}
              disabled={(date) => date < new Date()}
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
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm w-4 text-center">{guests}</span>
              <button
                onClick={() => setGuests(Math.min(16, guests + 1))}
                className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:border-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reserve Button */}
      <button
        onClick={handleWhatsApp}
        className="w-full py-4 rounded-xl font-semibold text-white text-base transition-opacity hover:opacity-90 active:scale-[0.99]"
        style={{ background: "linear-gradient(to right, #E61E4D 0%, #E31C5F 50%, #D70466 100%)" }}
      >
        Rezervo
      </button>

      <p className="text-center text-sm text-muted-foreground">Nuk do të ngarkohet asgjë ende</p>

      {/* Price Breakdown */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-foreground underline cursor-pointer">
            €{price} × {nights} nata{nights !== 1 ? "" : ""}
          </span>
          <span>€{subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-foreground underline cursor-pointer">Tarifa e shërbimit</span>
          <span>€{serviceFee}</span>
        </div>
        <div className="flex justify-between font-semibold pt-3 border-t border-border">
          <span>Totali</span>
          <span>€{total}</span>
        </div>
      </div>
    </div>
  );
};
