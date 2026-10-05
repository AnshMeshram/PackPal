// ─── Member ──────────────────────────────────────────────
export type Member = {
  id: string;
  name: string;
  preferences?: {
    dietary?: string[];
    clothing?: string[];
    notes?: string;
  };
};

// ─── Luggage Configuration ──────────────────────────────
export type BagType = 'cabin' | 'backpack' | 'trolley' | 'checkin' | 'custom';

export type LuggageConfig = {
  id: string;
  bagType: BagType;
  bagName: string;
  maxWeightKg: number;
  pieces: number;
  dimensions?: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  volumeLiters?: number;
  notes?: string;
};

// ─── Activity ────────────────────────────────────────────
export type Activity = {
  id: string;
  name: string;
  day?: number;
  date?: string;
  time?: string;
  notes?: string;
  category?: string;
  location?: string;
  requiredGear?: string[];
};

// ─── Itinerary Item ──────────────────────────────────────
export type ItineraryItem = {
  id: string;
  day: number;
  date: string;
  activities: Activity[];
};

// ─── Weather ─────────────────────────────────────────────
export type WeatherSummary = {
  condition: string;
  temperatureRange: string;
  precipitationProbability?: string;
  dailyContext?: string;
  packingImplications?: string[];
  source: 'live' | 'fallback';
};

// ─── Packing Item ────────────────────────────────────────
export type PackingCategory =
  | 'clothing'
  | 'toiletries'
  | 'electronics'
  | 'documents'
  | 'beach'
  | 'hiking'
  | 'health'
  | 'accessories'
  | 'gear'
  | 'miscellaneous'
  | (string & {});

export type PackingPriority = 'essential' | 'recommended' | 'optional';

export type PackingItem = {
  id: string;
  name: string;
  category: PackingCategory;
  quantity: number;
  packed: boolean;
  essential: boolean;
  priority: PackingPriority;
  weightEstimateKg: number;
  notes?: string;
  reason?: string;
  source: 'ai' | 'manual' | 'weather' | 'activity';
  owner?: string;
};

// ─── Expense ─────────────────────────────────────────────
export type SplitMethod = 'equal' | 'custom';

export type Expense = {
  id: string;
  description: string;
  amountPaise: number;
  paidBy: string;
  participants: string[];
  category: string;
  splitMethod: SplitMethod;
  customSharesPaise?: Record<string, number>;
  timestamp: string;
};

// ─── Balance ─────────────────────────────────────────────
export type Balance = {
  memberId: string;
  memberName: string;
  balancePaise: number;
};

// ─── Settlement ──────────────────────────────────────────
export type Settlement = {
  from: string;
  to: string;
  amountPaise: number;
};

// ─── Trip Details (used by API/Ollama) ───────────────────
export type TripDetails = {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  tripType: string;
  weather?: WeatherSummary;
  activities: string[];
};

// ─── Trip ────────────────────────────────────────────────
export type Trip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  tripType: string;
  baggageLimitKg: number;
  coverImage?: string;
  coverImageTitle?: string;
  coverImageSource?: string;
  luggage?: LuggageConfig;
  customCategories?: string[];
  preferences?: {
    travelStyle?: string;
    preferredCurrency?: string;
    packingStyle?: 'minimalist' | 'prepared' | 'comprehensive';
  };
  members: Member[];
  activities: Activity[];
  itinerary: ItineraryItem[];
  packingItems: PackingItem[];
  expenses: Expense[];
  weather?: WeatherSummary;
  createdAt: string;
  updatedAt: string;
};

// ─── AI Response Types ───────────────────────────────────
export type AIPackingItemRaw = {
  name: string;
  category: string;
  quantity: number;
  essential: boolean;
  priority?: string;
  weightEstimateKg?: number;
  notes?: string;
  reason?: string;
};

export type AIExpenseExtraction = {
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
  splitMethod: SplitMethod;
  missingInfo?: string[];
};

export type AITripChangeAction =
  | 'extend_trip'
  | 'shorten_trip'
  | 'add_activity'
  | 'remove_activity'
  | 'modify_activity';

export type AITripChange = {
  action: AITripChangeAction;
  days?: number;
  activity?: string;
  date?: string;
  details?: string;
};

export type AIOptimizeDecision = 'keep' | 'remove' | 'optional' | 'replace';

export type AIOptimizeRecommendation = {
  itemId: string;
  decision: AIOptimizeDecision;
  reason: string;
  replacementSuggestion?: string;
};

// ─── API Request/Response Types ──────────────────────────
export type PackAPIRequest = {
  trip: TripDetails;
  includeAudio?: boolean;
};

export type PackAPIResponse = {
  items: PackingItem[];
  destinationInfo?: {
    title: string;
    snippet: string;
    weatherForecast?: string;
    recommendedPlaces?: string[];
  };
  audioBase64?: string | null;
  status: 'success' | 'partial_success' | 'error';
  source: 'ai' | 'fallback';
  note?: string;
};
