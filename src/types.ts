export interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  badge: string;
  description: string;
  details: string[];
  price: number;
  image: string;
  bgClass: string; // background and border classes
  isNew?: boolean;
  reviews?: {
    count: number;
    notation: number;
  };
  sizes?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selected?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface SearchSuggestion {
  text: string;
  type: "product" | "category" | "general";
  item?: Product;
}

export interface TranslationDict {
  logoTitle: string;
  heritageSub: string;
  heritageTitle: string;
  searchPlaceholder: string;
  sportsMenu: string;
  myCart: string;
  freeShipping: string;
  cartEmpty: string;
  total: string;
  checkoutBtn: string;
  addCartBtn: string;
  selectSize: string;
  newBadge: string;
  reviewsLabel: string;
  botWelcome: string;
  botPlaceholder: string;
  detailsTitle: string;
  banner1Title: string;
  banner1Label: string;
  banner2Title: string;
  banner2Label: string;
  banner3Title: string;
  banner3Label: string;
  showMore: string;
  showLess: string;
  hideFilters: string;
  showFilters: string;
  filterBySize: string;
  reset: string;
  popularSizes: string;
  allOtherSizes: string;
  noSizesAvailable: string;
  sizeTagLabel: string;
  oneSize: string;
  compareFourDesktop: string;
  ourHistoryTitle: string;
  historyTitle: string;
  historyText: string;
  foundation: string;
  manpower: string;
  alpsOrigin: string;
  workshopsLabel: string;
  brandDescription: string;
  ateliersSalons: string;
  assistance: string;
  contactAdvisor: string;
  privacyPolicies: string;
  acquisitionAgreements: string;
  ourGazette: string;
  gazetteSub: string;
  allRightsReserved: string;
  slogan: string;
  virtualAdvisorBtn: string;
  authenticAssurance: string;
  coordinates: string;
  centennialCraftsmanship: string;
  yearLabel: string;
  calibrationLive: string;
  orientationMaisonAtlis: string;
}
