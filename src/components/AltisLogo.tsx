export default function AltisLogo({ className = "w-8 h-8 text-brand-gold" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="currentColor"
    >
      {/* Exquisite hand-crafted athlete-tree logo matches the brand perfectly */}
      
      {/* Roots / Stand */}
      <path d="M50,91 L70,91" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      
      {/* Back leg connecting trunk */}
      <path d="M60,91 C60,82 65,78 63,65 C61,54 55,45 52,38 C50,34 52,32 54,34 C57,36 61,44 65,55 C69,66 68,78 68,91" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      
      {/* Front running/jumping leg */}
      <path d="M44,88 C48,84 52,78 57,75 L62,58" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M44,88 L34,70 C36,65 42,60 48,65 L57,75" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Torso / Dynamic central branch */}
      <path d="M54,62 C57,55 60,48 58,40" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      
      {/* Head */}
      <circle cx="64" cy="38" r="4.5" />
      
      {/* Upper Tree Branches / Outstretched arms */}
      {/* Left arms/branches */}
      <path d="M55,48 C48,45 42,48 37,53" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M48,46 C42,38 34,35 28,38" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M53,40 C47,32 40,24 33,26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M51,33 C48,25 43,18 37,21" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      
      {/* Center Crown branches */}
      <path d="M58,35 C58,26 55,18 51,14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M61,34 C63,25 62,17 60,11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M64,35 C68,26 70,18 69,12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Right arms/branches */}
      <path d="M66,45 C73,43 79,45 84,49" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M64,41 C71,34 77,29 82,31" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M65,37 C72,29 78,21 82,23" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M66,33 C70,26 73,18 73,12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
