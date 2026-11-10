import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Trash2, Plus, Pencil, LogOut, Eye, X, Save } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  type: string;
  price: number;
  rating: number;
  location: string;
  distance: string;
  dates: string;
  description: string | null;
  images_url: string[];
  host_name: string | null;
  guests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[] | null;
  lat: number | null;
  lng: number | null;
}

const emptyListing = {
  title: "",
  type: "Apartamente",
  price: 0,
  rating: 4.5,
  location: "",
  distance: "",
  dates: "",
  description: "",
  images_url: [] as string[],
  host_name: "",
  guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  amenities: [] as string[],
  lat: 42.6629,
  lng: 21.1655,
};

const typeOptions = ["Apartamente", "Vila", "Hotele", "Motele", "Kamping", "Dizajn"];

const AdminPage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyListing);
  const [showForm, setShowForm] = useState(false);
  const [imagesInput, setImagesInput] = useState("");
  const [amenitiesInput, setAmenitiesInput] = useState("");

  // Roli "admin" verifikohet në bazë (tabela user_roles); të dhënat mbrohen nga RLS, jo nga fjalëkalimi në klient
  useEffect(() => {
    if (!user) { setIsAdmin(null); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .then(({ data }) => setIsAdmin((data ?? []).length > 0));
  }, [user]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Gabim", description: "Nuk mund të ngarkohen listimet", variant: "destructive" });
    } else {
      setListings((data ?? []) as Listing[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchListings();
  }, [isAdmin, fetchListings]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyListing);
    setImagesInput("");
    setAmenitiesInput("");
    setShowForm(true);
  };

  const openEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setFormData({
      title: listing.title,
      type: listing.type,
      price: listing.price,
      rating: listing.rating,
      location: listing.location,
      distance: listing.distance,
      dates: listing.dates,
      description: listing.description || "",
      images_url: listing.images_url || [],
      host_name: listing.host_name || "",
      guests: listing.guests || 2,
      bedrooms: listing.bedrooms || 1,
      bathrooms: listing.bathrooms || 1,
      amenities: listing.amenities || [],
      lat: listing.lat || 42.6629,
      lng: listing.lng || 21.1655,
    });
    setImagesInput((listing.images_url || []).join("\n"));
    setAmenitiesInput((listing.amenities || []).join(", "));
    setShowForm(true);
  };

  const handleSave = async () => {
    const saveData = {
      ...formData,
      images_url: imagesInput.split("\n").map(s => s.trim()).filter(Boolean),
      amenities: amenitiesInput.split(",").map(s => s.trim()).filter(Boolean),
      price: Number(formData.price),
      rating: Number(formData.rating),
      guests: Number(formData.guests),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      lat: Number(formData.lat),
      lng: Number(formData.lng),
    };

    setLoading(true);
    const { error } = editingId
      ? await supabase.from("listings").update(saveData).eq("id", editingId)
      : await supabase.from("listings").insert(saveData);
    if (error) {
      toast({ title: "Gabim", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sukses", description: editingId ? "Listimi u përditësua" : "Listimi u krijua" });
      setShowForm(false);
      fetchListings();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("A jeni i sigurt që doni ta fshini këtë listim?")) return;
    setLoading(true);
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      toast({ title: "Gabim", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sukses", description: "Listimi u fshi" });
      fetchListings();
    }
    setLoading(false);
  };

  // Qasja: vetëm përdorues i kyçur me rolin "admin"
  if (authLoading || (user && isAdmin === null)) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Duke ngarkuar...</div>;
  }
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-brand mb-4">
            <span className="text-2xl text-white font-bold">K</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            {!user ? "Hyni me llogarinë tuaj për të vazhduar." : "Kjo llogari nuk ka të drejta administratori."}
          </p>
          {!user ? (
            <Link to={`/auth?redirect=${encodeURIComponent("/admin")}`}>
              <Button className="w-full h-12 rounded-xl gradient-brand text-white border-0">Hyr</Button>
            </Link>
          ) : (
            <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => signOut()}>Dil</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")} className="gap-1.5">
              <Eye className="h-4 w-4" /> Shiko Faqen
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1.5 text-destructive">
              <LogOut className="h-4 w-4" /> Dil
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Listimet</h2>
            <p className="text-sm text-muted-foreground">{listings.length} listime gjithsej</p>
          </div>
          <Button onClick={openCreate} className="gradient-brand text-white border-0 gap-1.5">
            <Plus className="h-4 w-4" /> Shto Listim
          </Button>
        </div>

        {/* Listings Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Foto</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Titulli</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipi</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lokacioni</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Çmimi</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vlerësimi</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Veprimet</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => (
                  <tr key={listing.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary">
                        {listing.images_url?.[0] && (
                          <img src={listing.images_url[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{listing.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{listing.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{listing.location}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">€{listing.price}</td>
                    <td className="px-4 py-3 text-muted-foreground">⭐ {Number(listing.rating).toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(listing)} className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(listing.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {listings.length === 0 && !loading && (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Asnjë listim nuk u gjet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit/Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 pt-8">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold">{editingId ? "Ndrysho Listimin" : "Shto Listim të Ri"}</h3>
              <button onClick={() => setShowForm(false)} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-1 block">Titulli *</label>
                  <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Emri i vendbanimit" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Tipi *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Çmimi (€) *</label>
                  <Input type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Lokacioni *</label>
                  <Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="p.sh. Prishtinë, Kosovë" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Distanca</label>
                  <Input value={formData.distance} onChange={e => setFormData(p => ({ ...p, distance: e.target.value }))} placeholder="p.sh. 50 km larg" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Datat</label>
                  <Input value={formData.dates} onChange={e => setFormData(p => ({ ...p, dates: e.target.value }))} placeholder="p.sh. 15-20 Gusht" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Vlerësimi</label>
                  <Input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={e => setFormData(p => ({ ...p, rating: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Emri i Hostit</label>
                  <Input value={formData.host_name || ""} onChange={e => setFormData(p => ({ ...p, host_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Mysafirë</label>
                  <Input type="number" value={formData.guests || 2} onChange={e => setFormData(p => ({ ...p, guests: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Dhoma Gjumi</label>
                  <Input type="number" value={formData.bedrooms || 1} onChange={e => setFormData(p => ({ ...p, bedrooms: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Banjo</label>
                  <Input type="number" value={formData.bathrooms || 1} onChange={e => setFormData(p => ({ ...p, bathrooms: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Latitude</label>
                  <Input type="number" step="0.0001" value={formData.lat} onChange={e => setFormData(p => ({ ...p, lat: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Longitude</label>
                  <Input type="number" step="0.0001" value={formData.lng} onChange={e => setFormData(p => ({ ...p, lng: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Përshkrimi</label>
                <Textarea value={formData.description || ""} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">URL-të e fotove (një për rresht)</label>
                <Textarea value={imagesInput} onChange={e => setImagesInput(e.target.value)} rows={4} placeholder="https://example.com/foto1.jpg&#10;https://example.com/foto2.jpg" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Pajisjet (ndarë me presje)</label>
                <Input value={amenitiesInput} onChange={e => setAmenitiesInput(e.target.value)} placeholder="Wi-Fi, Parking, Kuzhinë" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Anulo</Button>
              <Button onClick={handleSave} className="gradient-brand text-white border-0 gap-1.5" disabled={loading || !formData.title || !formData.location}>
                <Save className="h-4 w-4" /> {editingId ? "Ruaj Ndryshimet" : "Krijo Listimin"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
