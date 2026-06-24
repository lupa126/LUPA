import { useState } from "react";
import { X, Shield, Mail, MapPin, Phone, ShoppingBag, LogOut, Lock, ArrowRight, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatPrice } from "../utils/translator";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
}

const LOGIN_TEXTS: Record<string, any> = {
  FR: {
    signIn: "S'authentifier",
    subtitle: "Maison Atlis — Espace Membre",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "exemple@mail.com",
    phoneLabel: "Numéro de téléphone mobile",
    phonePlaceholder: "+33 6 12 34 56 78",
    submitBtn: "SE CONNECTER",
    socialGoogle: "Continuer avec Google",
    socialApple: "Continuer avec Apple",
    rememberMe: "Se souvenir de moi",
    benefitsTitle: "Privilèges Membre Atlis",
    benefitsDesc: "En rejoignant notre cercle d'initiés, suivez vos créations sport couture en temps réel, réservez vos essayages en salon privé à Chamonix, et accédez à l'entretien à vie de vos équipements de précision.",
    requiredFields: "Veuillez saisir votre e-mail et votre numéro de téléphone.",
    invalidEmail: "Veuillez saisir une adresse e-mail valide.",
    profileTitle: "Espace Membre Personnel",
    profileSubtitle: "Maison Atlis — Compte Individuel",
    personalInfo: "Vos Coordonnées de Livraison",
    shippingAddress: "Adresse de livraison",
    defaultAddress: "74 Rue du Faubourg Saint-Honoré, 75008 Paris, France",
    tabOrders: "Historique des Commandes",
    orderId: "Commande n°",
    orderStatus: "Statut : Livré",
    ordersList: [
      { id: "ATL-8729", date: "15/06/2026", item: "Vélo tout chemin électrique cadre haut, E-EXPL 100 LTD", price: 1499 },
      { id: "ATL-5412", date: "28/05/2026", item: "Gourde 900 isotherme inox — Teinte Granite", price: 25 }
    ],
    logout: "Se déconnecter du compte",
    closeArea: "Fermer l'espace"
  },
  EN: {
    signIn: "Sign In",
    subtitle: "Maison Atlis — Member Area",
    emailLabel: "Email address",
    emailPlaceholder: "example@mail.com",
    phoneLabel: "Mobile phone number",
    phonePlaceholder: "+1 (555) 123-4567",
    submitBtn: "SIGN IN",
    socialGoogle: "Continue with Google",
    socialApple: "Continue with Apple",
    rememberMe: "Remember me",
    benefitsTitle: "Atlis Member Privileges",
    benefitsDesc: "By joining our inner circle, track your sport couture designs in real time, reserve bespoke fittings at our private Chamonix salon, and receive lifetime maintenance for your precision garments.",
    requiredFields: "Please enter both your email and phone number.",
    invalidEmail: "Please enter a valid email address.",
    profileTitle: "Personal Member Space",
    profileSubtitle: "Maison Atlis — Individual Account",
    personalInfo: "Your Shipping Coordinates",
    shippingAddress: "Shipping Address",
    defaultAddress: "74 Rue du Faubourg Saint-Honoré, 75008 Paris, France",
    tabOrders: "Recent Orders History",
    orderId: "Order No. ",
    orderStatus: "Status: Delivered",
    ordersList: [
      { id: "ATL-8729", date: "06/15/2026", item: "High-frame Electric Hybrid Bike, E-EXPL 100 LTD", price: 1499 },
      { id: "ATL-5412", date: "05/28/2026", item: "Insulated Stainless Steel Water Bottle 900 — Granite", price: 25 }
    ],
    logout: "Log out of account",
    closeArea: "Close area"
  },
  DE: {
    signIn: "Anmelden",
    subtitle: "Maison Atlis — Mitgliederbereich",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "beispiel@mail.com",
    phoneLabel: "Mobiltelefonnummer",
    phonePlaceholder: "+49 170 1234567",
    submitBtn: "ANMELDEN",
    socialGoogle: "Mit Google fortfahren",
    socialApple: "Mit Apple fortfahren",
    rememberMe: "Angemeldet bleiben",
    benefitsTitle: "Ihre Atlis-Mitgliedsprivilegien",
    benefitsDesc: "Verfolgen Sie Ihre Sport-Couture-Kreationen in Echtzeit, buchen Sie private Anproben in unserem Chamonix-Atelier und erhalten Sie eine lebenslange Pflege Ihrer Ausrüstung.",
    requiredFields: "Bitte geben Sie sowohl Ihre E-Mail-Adresse als auch Ihre Telefonnummer ein.",
    invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    profileTitle: "Persönlicher Mitgliederbereich",
    profileSubtitle: "Maison Atlis — Einzelkonto",
    personalInfo: "Ihre Versandkoordinaten",
    shippingAddress: "Lieferadresse",
    defaultAddress: "74 Rue du Faubourg Saint-Honoré, 75008 Paris, France",
    tabOrders: "Bestellverlauf",
    orderId: "Bestellung Nr. ",
    orderStatus: "Status: Geliefert",
    ordersList: [
      { id: "ATL-8729", date: "15.06.2026", item: "Elektro-Hybridrad, E-EXPL 100 LTD", price: 1499 },
      { id: "ATL-5412", date: "28.05.2026", item: "Isolierte Edelstahl-Trinkflasche 900 — Granitgrau", price: 25 }
    ],
    logout: "Vom Konto abmelden",
    closeArea: "Bereich schließen"
  },
  CH: {
    signIn: "S'authentifier",
    subtitle: "Maison Atlis — Espace Membre Suisse",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "exemple@mail.ch",
    phoneLabel: "Numéro de téléphone mobile",
    phonePlaceholder: "+41 79 123 45 67",
    submitBtn: "SE CONNECTER",
    socialGoogle: "Continuer avec Google",
    socialApple: "Continuer avec Apple",
    rememberMe: "Se souvenir de moi",
    benefitsTitle: "Privilèges Atlis Suisse",
    benefitsDesc: "Suivez vos créations en temps réel, réservez vos essayages en salon privé à Chamonix ou Zurich, et accédez à l'entretien à vie de vos équipements de précision.",
    requiredFields: "Veuillez saisir votre e-mail et votre numéro de téléphone.",
    invalidEmail: "Veuillez saisir une adresse e-mail valide.",
    profileTitle: "Espace Membre Personnel",
    profileSubtitle: "Maison Atlis — Compte Individuel",
    personalInfo: "Vos Coordonnées de Livraison",
    shippingAddress: "Adresse de livraison",
    defaultAddress: "Bahnhofstrasse 45, 8001 Zürich, Suisse",
    tabOrders: "Historique des Commandes",
    orderId: "Commande n°",
    orderStatus: "Statut : Livré",
    ordersList: [
      { id: "ATL-8729", date: "15/06/2026", item: "Vélo tout chemin électrique cadre haut, E-EXPL 100 LTD", price: 1499 },
      { id: "ATL-5412", date: "28/05/2026", item: "Gourde 900 isotherme inox — Teinte Granite", price: 25 }
    ],
    logout: "Se déconnecter du compte",
    closeArea: "Fermer l'espace"
  }
};

export default function AccountModal({ isOpen, onClose, currentLang }: AccountModalProps) {
  const t = LOGIN_TEXTS[currentLang] || LOGIN_TEXTS.FR;

  // Local persistence states
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("atlis_is_logged_in") === "true";
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("atlis_user_email") || "";
  });
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem("atlis_user_phone") || "";
  });

  const [inputEmail, setInputEmail] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inputEmail.trim() || !inputPhone.trim()) {
      setError(t.requiredFields);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail)) {
      setError(t.invalidEmail);
      return;
    }

    // Success login
    localStorage.setItem("atlis_is_logged_in", "true");
    localStorage.setItem("atlis_user_email", inputEmail);
    localStorage.setItem("atlis_user_phone", inputPhone);
    setEmail(inputEmail);
    setPhone(inputPhone);
    setIsLoggedIn(true);
    setInputEmail("");
    setInputPhone("");
  };

  const handleLogout = () => {
    localStorage.removeItem("atlis_is_logged_in");
    localStorage.removeItem("atlis_user_email");
    localStorage.removeItem("atlis_user_phone");
    setEmail("");
    setPhone("");
    setIsLoggedIn(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop lock */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#131211]/85 backdrop-blur-sm touch-none"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-xl bg-[#FAF9F4] border border-[#A37E2C]/30 text-[#131211] rounded-lg shadow-2xl overflow-hidden z-10 font-sans"
          >
            {/* Header / Accent Top */}
            <div className="bg-[#2E2218] p-5 text-white border-b border-[#A37E2C]/30 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#A37E2C]/15 border border-[#A37E2C]/40 rounded-full text-[#A37E2C]">
                  {isLoggedIn ? <User className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#A37E2C] block">
                    {isLoggedIn ? t.profileSubtitle : t.subtitle}
                  </span>
                  <h2 className="text-lg sm:text-xl font-serif font-semibold tracking-wide mt-0.5">
                    {isLoggedIn ? t.profileTitle : t.signIn}
                  </h2>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto max-h-[75vh] overscroll-contain">
              {!isLoggedIn ? (
                /* ================= SIGN IN SCREEN ================= */
                <div className="space-y-6 animate-fade-in">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-700 text-xs font-medium">
                        {error}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs uppercase tracking-widest text-[#A37E2C] font-extrabold block">
                        {t.emailLabel}
                      </label>
                      <input
                        type="email"
                        required
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className="w-full bg-white border border-neutral-300 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#A37E2C] transition-colors rounded-sm shadow-inner"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs uppercase tracking-widest text-[#A37E2C] font-extrabold block">
                        {t.phoneLabel}
                      </label>
                      <input
                        type="tel"
                        required
                        value={inputPhone}
                        onChange={(e) => setInputPhone(e.target.value)}
                        placeholder={t.phonePlaceholder}
                        className="w-full bg-white border border-neutral-300 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#A37E2C] transition-colors rounded-sm shadow-inner"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="remember-me"
                        defaultChecked
                        className="rounded border-neutral-300 text-[#A37E2C] focus:ring-[#A37E2C]"
                      />
                      <label htmlFor="remember-me" className="text-[10px] sm:text-xs text-neutral-500 font-medium">
                        {t.rememberMe}
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3.5 bg-[#2E2218] hover:bg-[#A37E2C] text-white text-[10px] sm:text-xs font-black tracking-widest uppercase transition-all duration-300 cursor-pointer rounded flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>{t.submitBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Social Dividers */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-neutral-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                      <span className="bg-[#FAF9F4] px-3 text-[10px] font-semibold text-neutral-400">
                        OU
                      </span>
                    </div>
                  </div>

                  {/* Social Buttons Stack */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        // Simulated google authentication flow
                        setInputEmail("google.atlis@gmail.com");
                        setInputPhone("+33 6 99 99 99 99");
                        setError("Cliquez de nouveau sur le bouton SE CONNECTER pour finaliser l'inscription avec Google");
                      }}
                      className="flex items-center justify-center gap-2 border border-neutral-300 bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-700 cursor-pointer rounded transition-all"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="truncate">{t.socialGoogle}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInputEmail("apple.atlis@icloud.com");
                        setInputPhone("+33 7 88 88 88 88");
                        setError("Cliquez de nouveau sur le bouton SE CONNECTER pour finaliser l'inscription avec Apple");
                      }}
                      className="flex items-center justify-center gap-2 border border-neutral-300 bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-700 cursor-pointer rounded transition-all"
                    >
                      <svg className="w-4 h-4 shrink-0 fill-current text-black" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.11.67-2.82 1.49-.6.69-1.13 1.83-.99 2.94 1.1.09 2.16-.56 2.82-1.37z" />
                      </svg>
                      <span className="truncate">{t.socialApple}</span>
                    </button>
                  </div>

                  {/* Brand Perks Banner */}
                  <div className="p-4 bg-white border border-[#A37E2C]/20 rounded shadow-sm text-xs space-y-2">
                    <h4 className="font-bold text-[#A37E2C] uppercase tracking-wider text-[10px]">
                      {t.benefitsTitle}
                    </h4>
                    <p className="text-neutral-600 leading-relaxed font-light">
                      {t.benefitsDesc}
                    </p>
                  </div>
                </div>
              ) : (
                /* ================= PROFILE VIEW (No premium/gold stuff) ================= */
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Shipping coordinates Card */}
                  <div className="p-5 bg-white border border-neutral-200 rounded shadow-xs space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2E2218] border-b border-neutral-100 pb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#A37E2C]" />
                      {t.personalInfo}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Email</span>
                        <div className="flex items-center gap-2 text-neutral-700 bg-neutral-50 px-3 py-2 rounded border border-neutral-100 truncate">
                          <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate font-medium">{email}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Téléphone</span>
                        <div className="flex items-center gap-2 text-neutral-700 bg-neutral-50 px-3 py-2 rounded border border-neutral-100">
                          <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="font-medium">{phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 text-xs">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">{t.shippingAddress}</span>
                      <div className="flex items-start gap-2 text-neutral-700 bg-neutral-50 px-3 py-2 rounded border border-neutral-100 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span>{t.defaultAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Orders List history */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2E2218] flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#A37E2C]" />
                      {t.tabOrders}
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                      {t.ordersList.map((ord: any) => (
                        <div key={ord.id} className="p-4 bg-white border border-neutral-200 rounded text-xs hover:border-[#A37E2C]/35 transition-colors">
                          <div className="flex justify-between font-mono text-[10px] text-neutral-400 mb-1.5">
                            <span>{t.orderId}{ord.id}</span>
                            <span>{ord.date}</span>
                          </div>
                          <p className="font-semibold text-neutral-800 line-clamp-1">{ord.item}</p>
                          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-dashed border-neutral-100">
                            <span className="text-[10px] text-[#1E2E24] font-bold">{t.orderStatus}</span>
                            <span className="font-extrabold text-[#A37E2C]">{formatPrice(ord.price, currentLang)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-neutral-100 p-4 border-t border-neutral-200 flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#2E2218] hover:bg-[#A37E2C] text-white text-[10px] font-extrabold tracking-widest uppercase transition-all duration-300 cursor-pointer rounded-sm shadow-sm"
              >
                {t.closeArea}
              </button>
              
              {isLoggedIn && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t.logout}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
