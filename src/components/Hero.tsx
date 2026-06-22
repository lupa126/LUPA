import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { TRANSLATIONS } from "../data/translations";

interface HeroProps {
  currentLang: string;
  onSelectCategory: (sport: string) => void;
}

export default function Hero({ currentLang, onSelectCategory }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.FR;

  const slides = [
    {
      title: t.banner1Title,
      label: t.banner1Label,
      image: "https://contents.mediadecathlon.com/p2833332/k$59cd136a58efffe050be170c2b7f0cf5/picture.jpg",
      category: "aerodynamisme",
      cta: currentLang === "FR" ? "L'Aéro d'Exception" : "Aerodynamic Line",
      color: "from-emerald-950/80"
    },
    {
      title: t.banner2Title,
      label: t.banner2Label,
      image: "https://contents.mediadecathlon.com/p2500724/k$12e175a896fb0390b6a21d0ddef5c821/picture.jpg",
      category: "resistance-active",
      cta: currentLang === "FR" ? "PRODUITS DE MAISON" : "HOME PRODUCTS",
      color: "from-amber-950/80"
    },
    {
      title: t.banner3Title,
      label: t.banner3Label,
      image: "https://contents.mediadecathlon.com/p3100647/k$27fae6bc01fae013b03df9fc665513c3/picture.jpg",
      category: "exploration-sauvage",
      cta: currentLang === "FR" ? "Conquérir les Sommets" : "Explore Wild summits",
      color: "from-stone-900/80"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleCtaClick = (category: string) => {
    onSelectCategory(category);
  };

  return (
    <section className="relative h-[80vh] min-h-[500px] w-full bg-[#121212] overflow-hidden select-none">
      {/* Background Images */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? "opacity-100 scale-102" : "opacity-0"
          } transform transition-transform duration-[6000ms]`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover filter brightness-[0.4]"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${slide.color} via-black/30 to-black/40`} />
        </div>
      ))}

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 md:px-12 z-10 text-[#FAF9F4]">
        <div className="max-w-4xl space-y-6 animate-fade-in-up">
          <p className="text-xs uppercase tracking-[0.4em] text-[#A37E2C] font-semibold">
            {slides[currentSlide].label}
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7.5xl font-serif font-semibold tracking-wide leading-tight drop-shadow-md">
            {slides[currentSlide].title}
          </h1>
          <div className="h-[1px] bg-[#A37E2C]/50 w-24 mx-auto" />
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={() => handleCtaClick(slides[currentSlide].category)}
              className="px-8 py-3.5 bg-[#A37E2C] hover:bg-[#BC9C52] text-[#FAF9F4] font-medium tracking-widest text-[10px] uppercase transition-all duration-300 shadow-xl flex items-center gap-2 hover:scale-102 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{slides[currentSlide].cta}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nav Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/10 bg-black/20 hover:bg-[#A37E2C] hover:text-[#FAF9F4] text-white/70 transition-all z-20 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/10 bg-black/20 hover:bg-[#A37E2C] hover:text-[#FAF9F4] text-white/70 transition-all z-20 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "bg-[#A37E2C] w-6" : "bg-white/40"
            } cursor-pointer`}
          />
        ))}
      </div>
    </section>
  );
}
