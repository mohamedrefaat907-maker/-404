import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Clock, MapPin, Phone, Star, Utensils } from "lucide-react";
import { Link } from "wouter";

// ─── Social Media Brand Icons (SVG inline — no external deps) ─────────────────
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  );
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C8.396 0 6.87 1.68 6.87 3.899c0 .308.028.607.056.87-.28-.028-.56-.056-.84-.056-.924 0-1.652.56-1.652 1.26 0 .616.448 1.12 1.092 1.26-.196.14-.308.364-.308.588 0 .28.14.532.364.7a5.04 5.04 0 01-2.1 3.5c-.392.28-.588.728-.504 1.176.14.7.924 1.176 2.324 1.4.14.504.42.952.84 1.288-.42.14-.672.448-.672.812 0 .532.504.952 1.148.952.168 0 .336-.028.504-.084.308-.112.588-.168.868-.168.308 0 .588.056.868.168.448.168.924.252 1.428.252.504 0 .98-.084 1.428-.252.28-.112.56-.168.868-.168.28 0 .56.056.868.168.168.056.336.084.504.084.644 0 1.148-.42 1.148-.952 0-.364-.252-.672-.672-.812.42-.336.7-.784.84-1.288 1.4-.224 2.184-.7 2.324-1.4.084-.448-.112-.896-.504-1.176a5.04 5.04 0 01-2.1-3.5c.224-.168.364-.42.364-.7 0-.224-.112-.448-.308-.588.644-.14 1.092-.644 1.092-1.26 0-.7-.728-1.26-1.652-1.26-.28 0-.56.028-.84.056.028-.263.056-.562.056-.87C17.164 1.68 15.638 0 12.017 0z"/>
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

// ─── Social links config — غيّر الـ href لروابطك الحقيقية ──────────────────
const SOCIAL_LINKS = [
  {
    name:    "Facebook",
    href:    "https://facebook.com/yourpage",
    Icon:    FacebookIcon,
    bg:      "bg-[#1877F2]",
    hover:   "hover:bg-[#166FE5]",
    label:   "فيسبوك",
  },
  {
    name:    "Instagram",
    href:    "https://instagram.com/yourpage",
    Icon:    InstagramIcon,
    bg:      "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    hover:   "hover:opacity-90",
    label:   "إنستغرام",
  },
  {
    name:    "TikTok",
    href:    "https://tiktok.com/@yourpage",
    Icon:    TikTokIcon,
    bg:      "bg-black",
    hover:   "hover:bg-zinc-800",
    label:   "تيك توك",
  },
  {
    name:    "Snapchat",
    href:    "https://snapchat.com/add/yourpage",
    Icon:    SnapchatIcon,
    bg:      "bg-[#FFFC00]",
    hover:   "hover:bg-yellow-300",
    label:   "سناب شات",
    dark:    true,  // الشعار داكن على الخلفية الصفراء
  },
  {
    name:    "YouTube",
    href:    "https://youtube.com/@yourpage",
    Icon:    YouTubeIcon,
    bg:      "bg-[#FF0000]",
    hover:   "hover:bg-red-700",
    label:   "يوتيوب",
  },
  {
    name:    "X",
    href:    "https://x.com/yourpage",
    Icon:    XTwitterIcon,
    bg:      "bg-black",
    hover:   "hover:bg-zinc-800",
    label:   "إكس",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-amber-600" />
            <span className="text-xl font-bold text-slate-900">مطعمي</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/menu" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">المنيو</Link>
            <Link href="/gallery" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">الصور</Link>
            <Link href="/reservations" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">احجز</Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition">لوحة التحكم</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  تجربة طعام <span className="text-amber-600">فريدة</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  اكتشف أطباقنا الشهية المعدة بعناية من أفضل المكونات الطازة، مع خدمة توصيل سريعة وحجز طاولات سهل.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/menu">
                  <Button size="lg" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white">استكشف المنيو</Button>
                </Link>
                <Link href="/delivery">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-amber-600 text-amber-600 hover:bg-amber-50">اطلب الآن</Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200">
                <div className="space-y-1"><div className="text-2xl font-bold text-amber-600">500+</div><p className="text-sm text-slate-600">طبق شهي</p></div>
                <div className="space-y-1"><div className="text-2xl font-bold text-amber-600">4.8★</div><p className="text-sm text-slate-600">التقييم</p></div>
                <div className="space-y-1"><div className="text-2xl font-bold text-amber-600">30 دقيقة</div><p className="text-sm text-slate-600">التوصيل</p></div>
              </div>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
              <Utensils className="w-32 h-32 text-amber-200 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">لماذا تختار مطعمنا؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { Icon: Clock,   title: "توصيل سريع",    desc: "توصيل سريع وآمن إلى باب منزلك في غضون 30 دقيقة" },
              { Icon: ChefHat, title: "طهاة محترفون",  desc: "فريق من الطهاة المحترفين يعدون أطباقك بعناية فائقة" },
              { Icon: Star,    title: "جودة عالية",    desc: "مكونات طازة وعالية الجودة في كل طبق" },
            ].map(({ Icon, title, desc }) => (
              <Card key={title} className="border-0 shadow-lg hover:shadow-xl transition">
                <CardHeader><Icon className="w-10 h-10 text-amber-600 mb-4" /><CardTitle>{title}</CardTitle></CardHeader>
                <CardContent><p className="text-slate-600">{desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">هل أنت جاهز للاستمتاع بتجربة طعام رائعة؟</h2>
          <p className="text-lg text-amber-100">احجز طاولتك أو اطلب توصيلك الآن</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reservations">
              <Button size="lg" className="w-full sm:w-auto bg-white text-amber-600 hover:bg-amber-50">احجز طاولة</Button>
            </Link>
            <Link href="/delivery">
              <Button size="lg" className="w-full sm:w-auto bg-amber-800 hover:bg-amber-900 text-white">اطلب توصيل</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-amber-500" />
                <span className="text-lg font-bold">مطعمي</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">تجربة طعام فريدة وخدمة عالية الجودة في كل لقمة.</p>
            </div>

            {/* Quick links */}
            <div className="space-y-4">
              <h3 className="font-bold text-white">روابط سريعة</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/menu"         className="hover:text-amber-400 transition">المنيو</Link></li>
                <li><Link href="/reservations" className="hover:text-amber-400 transition">احجز طاولة</Link></li>
                <li><Link href="/delivery"     className="hover:text-amber-400 transition">اطلب توصيل</Link></li>
                <li><Link href="/gallery"      className="hover:text-amber-400 transition">معرض الصور</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-bold text-white">تواصل معنا</h3>
              <div className="space-y-3 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <Phone   className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>+966 50 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin  className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>الرياض، المملكة العربية السعودية</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock   className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>11 ص – 11 م يومياً</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Social Media Section ── */}
          <div className="border-t border-slate-700 pt-8">
            <p className="text-center text-slate-400 text-sm mb-5">تابعنا على منصات التواصل الاجتماعي</p>
            <div className="flex flex-wrap justify-center gap-3">
              {SOCIAL_LINKS.map(({ name, href, Icon, bg, hover, label, dark }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`
                    group flex items-center gap-2 px-4 py-2.5 rounded-xl
                    ${bg} ${hover}
                    transition-all duration-200
                    hover:scale-105 hover:shadow-lg hover:shadow-black/30
                  `}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${dark ? "text-black" : "text-white"}`}
                  />
                  <span className={`text-sm font-medium ${dark ? "text-black" : "text-white"}`}>
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 mt-8 pt-6 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} مطعمي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
