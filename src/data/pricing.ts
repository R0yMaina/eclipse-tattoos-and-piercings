export interface Package {
  title: string;
  description: string;
  price_from_usd: number;
  notes: string;
  popular?: boolean;
}

export interface ArtistTier {
  tier: string;
  hourly_usd: [number, number];
  half_day_usd: [number, number];
  day_session_usd: [number, number];
  notes: string;
}

export interface TattooExample {
  name: string;
  estimated_hours: [number, number];
  estimated_usd: [number, number];
  notes: string;
}

export interface PiercingFee {
  area: string;
  fee_from: number;
  notes: string;
}

export interface JewelryRange {
  material: string;
  price_from_usd: number;
  notes: string;
}

export const artistTiers: ArtistTier[] = [
  {
    tier: "Standard",
    hourly_usd: [200, 240],
    half_day_usd: [650, 800],
    day_session_usd: [1200, 1400],
    notes: "Ideal for fine line, script, and small-to-medium pieces."
  },
  {
    tier: "Senior",
    hourly_usd: [240, 280],
    half_day_usd: [800, 1000],
    day_session_usd: [1400, 1650],
    notes: "Advanced techniques, complex black & grey, and medium-to-large pieces."
  },
  {
    tier: "Lead",
    hourly_usd: [280, 320],
    half_day_usd: [950, 1150],
    day_session_usd: [1600, 1900],
    notes: "Specialty work, color realism, cover-ups, and large-scale projects."
  }
];

export const tattooExamples: TattooExample[] = [
  {
    name: "Fine-line wrist (≈2\")",
    estimated_hours: [1.0, 1.5],
    estimated_usd: [180, 240],
    notes: "Simple linework; placement and detail can affect time."
  },
  {
    name: "Script forearm (≈4\")",
    estimated_hours: [1.5, 2.0],
    estimated_usd: [220, 320],
    notes: "Custom lettering and spacing."
  },
  {
    name: "Palm-size B&G (≈6\")",
    estimated_hours: [2.0, 4.0],
    estimated_usd: [400, 700],
    notes: "Soft shading; skin and reference quality matter."
  },
  {
    name: "Color floral (≈8\")",
    estimated_hours: [4.0, 6.0],
    estimated_usd: [700, 1200],
    notes: "Multi-color layering and saturation."
  },
  {
    name: "Neo-traditional calf (≈10\")",
    estimated_hours: [5.0, 8.0],
    estimated_usd: [900, 1600],
    notes: "Bold lines, saturated color, larger coverage."
  }
];

export const piercingFees: PiercingFee[] = [
  { area: "Lobe (single/pair)", fee_from: 40, notes: "Fee per piercing; jewelry separate." },
  { area: "Cartilage (helix/tragus/conch/rook/daith)", fee_from: 55, notes: "Jewelry separate." },
  { area: "Nostril/Septum", fee_from: 60, notes: "Jewelry separate." },
  { area: "Eyebrow/Lip", fee_from: 60, notes: "Jewelry separate." },
  { area: "Navel", fee_from: 65, notes: "Jewelry separate." },
  { area: "Nipple (single/pair)", fee_from: 70, notes: "Jewelry separate." },
  { area: "Jewelry Change/Downsize", fee_from: 15, notes: "Complimentary with jewelry purchase (policy dependent)." }
];

export const jewelryRanges: JewelryRange[] = [
  { material: "Titanium (ASTM F-136)", price_from_usd: 40, notes: "Polished or PVD gold tones." },
  { material: "14k/18k Solid Gold", price_from_usd: 120, notes: "Yellow, white, or rose." },
  { material: "Gems & Diamonds", price_from_usd: 90, notes: "Ethically sourced stones." }
];

export const packages: Package[] = [
  {
    title: "Small Tattoo Bundle",
    description: "3 fine-line pieces up to 2 inches each.",
    price_from_usd: 450,
    notes: "Single session; design approval required."
  },
  {
    title: "Curated Ear Package",
    description: "Plan, 2-4 piercings, and jewelry credit.",
    price_from_usd: 280,
    notes: "Anatomy dependent; jewelry selection varies.",
    popular: true
  },
  {
    title: "Day Session",
    description: "Extended tattoo session for larger work.",
    price_from_usd: 1200,
    notes: "Includes breaks and aftercare kit."
  }
];

export const pricingInfo = {
  shop_minimum_usd: 120,
  tattoo_hourly_usd_range: [200, 320],
  day_session_usd_range: [1200, 1900],
  piercing_service_fee_usd: [40, 80],
  jewelry_price_usd: [40, 600],
  deposit_percent: 0.2,
  deposit_min_usd: 50,
  deposit_policy: "A non-refundable deposit secures your appointment and is applied to the final cost. Reschedule with minimum 48 hours' notice to retain your deposit.",
  disclaimer: "Final pricing provided after consultation; complexity, size, placement, and artist affect total."
};
