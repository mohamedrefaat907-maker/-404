import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, LogOut, Package, Calendar, Settings,
  Plus, Pencil, Trash2, ChefHat, Image, Check, X, ToggleLeft, ToggleRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  available: number;
};

type GalleryImage = {
  id: number;
  image: string;
  title: string | null;
  description: string | null;
};

const CATEGORIES = [
  { id: "appetizers", label: "مقبلات" },
  { id: "main",       label: "أطباق رئيسية" },
  { id: "desserts",   label: "حلويات" },
  { id: "drinks",     label: "مشروبات" },
];

const STATUS_LABELS: Record<string, string> = {
  pending:   "معلق",
  confirmed: "مؤكد",
  cancelled: "ملغى",
  completed: "مكتمل",
  preparing: "قيد الإعداد",
  ready:     "جاهز",
  delivered: "تم التوصيل",
};

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  preparing: "bg-purple-100 text-purple-800",
  ready:     "bg-teal-100 text-teal-800",
  delivered: "bg-green-100 text-green-800",
};

// ─── Empty form state ─────────────────────────────────────────────────────────
const emptyItem = () => ({
  name: "", description: "", price: "", category: "main", image: "",
});
const emptyImg = () => ({ image: "", title: "", description: "" });

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Menu state
  const [showMenuForm, setShowMenuForm]   = useState(false);
  const [editingItem, setEditingItem]     = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm]           = useState(emptyItem());
  const [menuFilter, setMenuFilter]       = useState("all");

  // Gallery state
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [galleryForm, setGalleryForm]         = useState(emptyImg());

  // Settings state (local mirror of DB)
  const [settingsForm, setSettingsForm] = useState({
    name: "", phone: "", email: "", address: "",
    deliveryFeeBase: "", minOrderAmount: "",
    deliveryEnabled: true, latitude: "", longitude: "",
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const isAdmin = isAuthenticated && user?.role === "admin";

  const { data: reservations = [] } = trpc.reservations.list.useQuery(undefined, { enabled: isAdmin });
  const { data: orders = []       } = trpc.orders.list.useQuery(undefined,       { enabled: isAdmin });
  const { data: menuItems = [], refetch: refetchMenu } =
    trpc.menu.list.useQuery(undefined, { enabled: isAdmin });
  const { data: galleryImages = [], refetch: refetchGallery } =
    trpc.gallery.list.useQuery(undefined, { enabled: isAdmin });
  const { data: settings } = trpc.settings.get.useQuery(undefined, {
    enabled: isAdmin,
    onSuccess: (s) => {
      if (s && !settingsLoaded) {
        setSettingsForm({
          name:            s.name            ?? "",
          phone:           s.phone           ?? "",
          email:           s.email           ?? "",
          address:         s.address         ?? "",
          deliveryFeeBase: String((s.deliveryFeeBase ?? 500) / 100),
          minOrderAmount:  String((s.minOrderAmount  ?? 2000) / 100),
          deliveryEnabled: s.deliveryEnabled === 1,
          latitude:        s.latitude        ?? "",
          longitude:       s.longitude       ?? "",
        });
        setSettingsLoaded(true);
      }
    },
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const createMenuItem  = trpc.menu.create.useMutation({ onSuccess: () => { refetchMenu(); toast.success("تم إضافة الطبق"); resetMenuForm(); } });
  const updateMenuItem  = trpc.menu.update.useMutation({ onSuccess: () => { refetchMenu(); toast.success("تم تعديل الطبق"); resetMenuForm(); } });
  const deleteMenuItem  = trpc.menu.delete.useMutation({ onSuccess: () => { refetchMenu(); toast.success("تم حذف الطبق"); } });
  const toggleAvailable = trpc.menu.toggleAvailable.useMutation({ onSuccess: () => refetchMenu() });

  const createGalleryImg = trpc.gallery.create.useMutation({ onSuccess: () => { refetchGallery(); toast.success("تمت إضافة الصورة"); resetGalleryForm(); } });
  const deleteGalleryImg = trpc.gallery.delete.useMutation({ onSuccess: () => { refetchGallery(); toast.success("تم حذف الصورة"); } });

  const updateSettings   = trpc.settings.update.useMutation({ onSuccess: () => toast.success("تم حفظ الإعدادات") });

  const updateReservationStatus = trpc.reservations.updateStatus.useMutation({ onSuccess: () => trpc.useUtils().reservations.list.invalidate() });
  const updateOrderStatus       = trpc.orders.updateStatus.useMutation({       onSuccess: () => trpc.useUtils().orders.list.invalidate() });

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const resetMenuForm = () => { setMenuForm(emptyItem()); setEditingItem(null); setShowMenuForm(false); };
  const resetGalleryForm = () => { setGalleryForm(emptyImg()); setShowGalleryForm(false); };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm({
      name:        item.name,
      description: item.description ?? "",
      price:       String(item.price / 100),
      category:    item.category,
      image:       item.image ?? "",
    });
    setShowMenuForm(true);
  };

  const handleMenuSubmit = () => {
    if (!menuForm.name || !menuForm.price) { toast.error("يرجى ملء الحقول المطلوبة"); return; }
    const payload = {
      name:        menuForm.name,
      description: menuForm.description || undefined,
      price:       Math.round(parseFloat(menuForm.price) * 100),
      category:    menuForm.category,
      image:       menuForm.image || undefined,
    };
    if (editingItem) {
      updateMenuItem.mutate({ id: editingItem.id, ...payload });
    } else {
      createMenuItem.mutate(payload);
    }
  };

  const handleGallerySubmit = () => {
    if (!galleryForm.image) { toast.error("يرجى إدخال رابط الصورة"); return; }
    createGalleryImg.mutate({
      image:       galleryForm.image,
      title:       galleryForm.title       || undefined,
      description: galleryForm.description || undefined,
    });
  };

  const handleSaveSettings = () => {
    updateSettings.mutate({
      name:            settingsForm.name,
      phone:           settingsForm.phone      || undefined,
      email:           settingsForm.email      || undefined,
      address:         settingsForm.address    || undefined,
      latitude:        settingsForm.latitude   || undefined,
      longitude:       settingsForm.longitude  || undefined,
      deliveryEnabled: settingsForm.deliveryEnabled ? 1 : 0,
      deliveryFeeBase: Math.round(parseFloat(settingsForm.deliveryFeeBase || "5") * 100),
      minOrderAmount:  Math.round(parseFloat(settingsForm.minOrderAmount  || "20") * 100),
    });
  };

  const filteredMenuItems = menuFilter === "all"
    ? menuItems
    : menuItems.filter(i => i.category === menuFilter);

  // ── Access guard ──────────────────────────────────────────────────────────────
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <Card className="border-0 shadow-lg w-full max-w-md">
          <CardHeader><CardTitle>الوصول مرفوض</CardTitle></CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">أنت لا تملك صلاحيات الوصول إلى لوحة التحكم.</p>
            <Button onClick={() => setLocation("/")} className="w-full bg-amber-600 hover:bg-amber-700">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-amber-600" />
            <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={async () => { await logout(); setLocation("/"); }} className="gap-2">
              <LogOut className="w-4 h-4" />تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview"     className="gap-1"><BarChart3 className="w-4 h-4" />نظرة عامة</TabsTrigger>
            <TabsTrigger value="menu"         className="gap-1"><ChefHat  className="w-4 h-4" />المنيو</TabsTrigger>
            <TabsTrigger value="gallery"      className="gap-1"><Image    className="w-4 h-4" />الصور</TabsTrigger>
            <TabsTrigger value="reservations" className="gap-1"><Calendar className="w-4 h-4" />الحجوزات</TabsTrigger>
            <TabsTrigger value="orders"       className="gap-1"><Package  className="w-4 h-4" />الطلبات</TabsTrigger>
            <TabsTrigger value="settings"     className="gap-1"><Settings className="w-4 h-4" />الإعدادات</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "إجمالي الحجوزات",   value: reservations.length,                                          color: "text-amber-600" },
                { label: "الحجوزات المعلقة",  value: reservations.filter(r => r.status === "pending").length,      color: "text-yellow-600" },
                { label: "إجمالي الطلبات",    value: orders.length,                                                color: "text-amber-600" },
                { label: "الطلبات المعلقة",   value: orders.filter(o => o.status === "pending").length,            color: "text-yellow-600" },
              ].map(stat => (
                <Card key={stat.label} className="border-0 shadow-lg">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle></CardHeader>
                  <CardContent><div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div></CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Latest reservations */}
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle className="text-base">آخر الحجوزات</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {reservations.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{r.customerName}</p>
                        <p className="text-xs text-slate-600">{r.numberOfGuests} أشخاص · {new Date(r.reservationDate).toLocaleDateString("ar-SA")}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? ""}`}>{STATUS_LABELS[r.status]}</span>
                    </div>
                  ))}
                  {reservations.length === 0 && <p className="text-slate-500 text-sm">لا توجد حجوزات</p>}
                </CardContent>
              </Card>

              {/* Latest orders */}
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle className="text-base">آخر الطلبات</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{o.customerName}</p>
                        <p className="text-xs text-slate-600">{(o.totalPrice / 100).toFixed(2)} ر.س</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] ?? ""}`}>{STATUS_LABELS[o.status]}</span>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-slate-500 text-sm">لا توجد طلبات</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Menu Management ── */}
          <TabsContent value="menu" className="space-y-6">
            {/* Category filter + Add button */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={menuFilter === "all" ? "default" : "outline"}
                  onClick={() => setMenuFilter("all")}
                  className={menuFilter === "all" ? "bg-amber-600 hover:bg-amber-700" : ""}>
                  الكل ({menuItems.length})
                </Button>
                {CATEGORIES.map(cat => (
                  <Button key={cat.id} size="sm" variant={menuFilter === cat.id ? "default" : "outline"}
                    onClick={() => setMenuFilter(cat.id)}
                    className={menuFilter === cat.id ? "bg-amber-600 hover:bg-amber-700" : ""}>
                    {cat.label} ({menuItems.filter(i => i.category === cat.id).length})
                  </Button>
                ))}
              </div>
              <Button onClick={() => { resetMenuForm(); setShowMenuForm(true); }}
                className="bg-amber-600 hover:bg-amber-700 gap-2">
                <Plus className="w-4 h-4" />إضافة طبق
              </Button>
            </div>

            {/* Add / Edit Form */}
            {showMenuForm && (
              <Card className="border-2 border-amber-200 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">{editingItem ? "تعديل الطبق" : "إضافة طبق جديد"}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetMenuForm}><X className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>اسم الطبق *</Label>
                      <Input value={menuForm.name} onChange={e => setMenuForm(p => ({ ...p, name: e.target.value }))} placeholder="مثال: كباب مشوي" />
                    </div>
                    <div className="space-y-2">
                      <Label>السعر (ر.س) *</Label>
                      <Input type="number" step="0.01" value={menuForm.price} onChange={e => setMenuForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>الفئة</Label>
                      <select
                        value={menuForm.category}
                        onChange={e => setMenuForm(p => ({ ...p, category: e.target.value }))}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>رابط الصورة</Label>
                      <Input value={menuForm.image} onChange={e => setMenuForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <textarea
                      value={menuForm.description}
                      onChange={e => setMenuForm(p => ({ ...p, description: e.target.value }))}
                      rows={3}
                      placeholder="وصف مختصر للطبق..."
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={resetMenuForm}>إلغاء</Button>
                    <Button onClick={handleMenuSubmit} className="bg-amber-600 hover:bg-amber-700 gap-2"
                      disabled={createMenuItem.isLoading || updateMenuItem.isLoading}>
                      <Check className="w-4 h-4" />{editingItem ? "حفظ التعديلات" : "إضافة الطبق"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items Grid */}
            {filteredMenuItems.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center text-slate-500">لا توجد أطباق في هذه الفئة</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenuItems.map(item => (
                  <Card key={item.id} className={`border-0 shadow-lg overflow-hidden transition-opacity ${item.available ? "" : "opacity-60"}`}>
                    <div className="h-40 bg-amber-50 flex items-center justify-center overflow-hidden">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <span className="text-4xl">🍽️</span>}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500 truncate">{item.description}</p>
                        </div>
                        <p className="text-amber-600 font-bold text-sm whitespace-nowrap">{(item.price / 100).toFixed(2)} ر.س</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIES.find(c => c.id === item.category) ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                          {CATEGORIES.find(c => c.id === item.category)?.label ?? item.category}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {item.available ? "متاح" : "غير متاح"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs"
                          onClick={() => toggleAvailable.mutate({ id: item.id, available: item.available ? 0 : 1 })}>
                          {item.available ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                          {item.available ? "تعطيل" : "تفعيل"}
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleEditItem(item)}>
                          <Pencil className="w-3 h-3" />تعديل
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-red-600 hover:bg-red-50"
                          onClick={() => { if (confirm(`حذف "${item.name}"؟`)) deleteMenuItem.mutate({ id: item.id }); }}>
                          <Trash2 className="w-3 h-3" />حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Gallery Management ── */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => { resetGalleryForm(); setShowGalleryForm(true); }}
                className="bg-amber-600 hover:bg-amber-700 gap-2">
                <Plus className="w-4 h-4" />إضافة صورة
              </Button>
            </div>

            {showGalleryForm && (
              <Card className="border-2 border-amber-200 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">إضافة صورة جديدة</CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetGalleryForm}><X className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>رابط الصورة *</Label>
                    <Input value={galleryForm.image} onChange={e => setGalleryForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>العنوان</Label>
                      <Input value={galleryForm.title} onChange={e => setGalleryForm(p => ({ ...p, title: e.target.value }))} placeholder="وصف مختصر" />
                    </div>
                    <div className="space-y-2">
                      <Label>الوصف</Label>
                      <Input value={galleryForm.description} onChange={e => setGalleryForm(p => ({ ...p, description: e.target.value }))} placeholder="تفاصيل إضافية" />
                    </div>
                  </div>
                  {galleryForm.image && (
                    <div className="h-40 rounded-lg overflow-hidden border border-slate-200">
                      <img src={galleryForm.image} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                    </div>
                  )}
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={resetGalleryForm}>إلغاء</Button>
                    <Button onClick={handleGallerySubmit} className="bg-amber-600 hover:bg-amber-700 gap-2"
                      disabled={createGalleryImg.isLoading}>
                      <Check className="w-4 h-4" />إضافة الصورة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {galleryImages.length === 0 ? (
              <Card className="border-0 shadow-lg"><CardContent className="py-12 text-center text-slate-500">لا توجد صور في المعرض</CardContent></Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((img: GalleryImage) => (
                  <Card key={img.id} className="border-0 shadow-lg overflow-hidden group">
                    <div className="relative h-48">
                      <img src={img.image} alt={img.title ?? ""} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm("حذف هذه الصورة؟")) deleteGalleryImg.mutate({ id: img.id }); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {img.title && (
                      <CardContent className="p-3">
                        <p className="text-sm font-medium text-slate-800 truncate">{img.title}</p>
                        {img.description && <p className="text-xs text-slate-500 truncate">{img.description}</p>}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Reservations ── */}
          <TabsContent value="reservations" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader><CardTitle>جميع الحجوزات ({reservations.length})</CardTitle></CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <p className="text-slate-500 text-sm">لا توجد حجوزات</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600">
                          {["الاسم","الهاتف","البريد","التاريخ","الأشخاص","ملاحظات","الحالة","إجراء"].map(h => (
                            <th key={h} className="text-right py-3 px-3 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map(r => (
                          <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-3 font-medium">{r.customerName}</td>
                            <td className="py-3 px-3">{r.customerPhone}</td>
                            <td className="py-3 px-3 text-xs text-slate-500">{r.customerEmail ?? "—"}</td>
                            <td className="py-3 px-3">{new Date(r.reservationDate).toLocaleDateString("ar-SA")}</td>
                            <td className="py-3 px-3 text-center">{r.numberOfGuests}</td>
                            <td className="py-3 px-3 max-w-[150px] truncate text-slate-500 text-xs">{r.specialRequests ?? "—"}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? ""}`}>{STATUS_LABELS[r.status]}</span>
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={r.status}
                                onChange={e => updateReservationStatus.mutate({ id: r.id, status: e.target.value as any })}
                                className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              >
                                {["pending","confirmed","completed","cancelled"].map(s => (
                                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Orders ── */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader><CardTitle>جميع الطلبات ({orders.length})</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-slate-500 text-sm">لا توجد طلبات</p>
                ) : orders.map(o => {
                  let parsedItems: Array<{ name?: string; quantity: number; price: number }> = [];
                  try { parsedItems = JSON.parse(o.items); } catch {}
                  return (
                    <div key={o.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-900">{o.customerName}</p>
                          <p className="text-sm text-slate-600">{o.customerPhone}</p>
                          {o.customerEmail && <p className="text-xs text-slate-500">{o.customerEmail}</p>}
                        </div>
                        <div className="text-left">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] ?? ""}`}>{STATUS_LABELS[o.status]}</span>
                          <p className="text-xs text-slate-500 mt-1">{new Date(o.createdAt).toLocaleDateString("ar-SA")}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700"><strong>العنوان:</strong> {o.deliveryAddress}</p>
                      {parsedItems.length > 0 && (
                        <div className="text-xs text-slate-600 space-y-1">
                          {parsedItems.map((it, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{it.name ?? `صنف ${i+1}`} × {it.quantity}</span>
                              <span>{((it.price * it.quantity) / 100).toFixed(2)} ر.س</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                        <div className="text-sm">
                          <span className="text-slate-600">توصيل: {(o.deliveryFee / 100).toFixed(2)} ر.س · </span>
                          <span className="font-bold text-amber-600">الإجمالي: {(o.totalPrice / 100).toFixed(2)} ر.س</span>
                        </div>
                        <select
                          value={o.status}
                          onChange={e => updateOrderStatus.mutate({ id: o.id, status: e.target.value as any })}
                          className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {["pending","confirmed","preparing","ready","delivered","cancelled"].map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </div>
                      {o.notes && <p className="text-xs text-slate-500 italic">ملاحظة: {o.notes}</p>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Settings ── */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader><CardTitle>إعدادات المطعم</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>اسم المطعم *</Label>
                    <Input value={settingsForm.name} onChange={e => setSettingsForm(p => ({ ...p, name: e.target.value }))} placeholder="اسم المطعم" />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    <Input value={settingsForm.phone} onChange={e => setSettingsForm(p => ({ ...p, phone: e.target.value }))} placeholder="+966 50 000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input type="email" value={settingsForm.email} onChange={e => setSettingsForm(p => ({ ...p, email: e.target.value }))} placeholder="info@restaurant.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان</Label>
                    <Input value={settingsForm.address} onChange={e => setSettingsForm(p => ({ ...p, address: e.target.value }))} placeholder="المدينة، المملكة العربية السعودية" />
                  </div>
                  <div className="space-y-2">
                    <Label>رسوم التوصيل (ر.س)</Label>
                    <Input type="number" step="0.5" value={settingsForm.deliveryFeeBase} onChange={e => setSettingsForm(p => ({ ...p, deliveryFeeBase: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>الحد الأدنى للطلب (ر.س)</Label>
                    <Input type="number" step="1" value={settingsForm.minOrderAmount} onChange={e => setSettingsForm(p => ({ ...p, minOrderAmount: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>خط العرض (Latitude)</Label>
                    <Input value={settingsForm.latitude} onChange={e => setSettingsForm(p => ({ ...p, latitude: e.target.value }))} placeholder="24.7136" />
                  </div>
                  <div className="space-y-2">
                    <Label>خط الطول (Longitude)</Label>
                    <Input value={settingsForm.longitude} onChange={e => setSettingsForm(p => ({ ...p, longitude: e.target.value }))} placeholder="46.6753" />
                  </div>
                </div>
                <Button onClick={handleSaveSettings} disabled={updateSettings.isLoading} className="w-full bg-amber-600 hover:bg-amber-700">
                  {updateSettings.isLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader><CardTitle>تفعيل / تعطيل الخدمات</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">خدمة التوصيل</p>
                    <p className="text-sm text-slate-600">تفعيل أو تعطيل استقبال طلبات التوصيل</p>
                  </div>
                  <button
                    onClick={() => setSettingsForm(p => ({ ...p, deliveryEnabled: !p.deliveryEnabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settingsForm.deliveryEnabled ? "bg-amber-500" : "bg-slate-300"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${settingsForm.deliveryEnabled ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
