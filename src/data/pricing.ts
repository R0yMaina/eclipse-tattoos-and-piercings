export interface Package {
  title: string;
  description: string;
  price_from_usd: number;
  notes: string;
  popular?: boolean;
}

export interface PiercingFee {
  area: string;
  price_kes: number;
}

export const piercingFees: PiercingFee[] = [
  { area: "Earlobe", price_kes: 500 },
  { area: "Nose", price_kes: 500 },
  { area: "Septum", price_kes: 500 },
  { area: "Smiley", price_kes: 500 },
  { area: "Helix", price_kes: 500 },
  { area: "Tragus", price_kes: 500 },
  { area: "Rook", price_kes: 1000 },
  { area: "Medusa", price_kes: 800 },
  { area: "Conch", price_kes: 500 },
  { area: "Flat", price_kes: 500 },
  { area: "Industrial", price_kes: 1500 },
  { area: "Tongue", price_kes: 1000 },
  { area: "Frog Eyes", price_kes: 1500 },
  { area: "Navel (Belly)", price_kes: 1000 },
  { area: "Nipple", price_kes: 2000 },
  { area: "Dermals", price_kes: 4000 },
  { area: "Surface Dermals", price_kes: 6000 },
  { area: "Surface Tragus", price_kes: 1000 },
];

export const packages: Package[] = [
  {
    title: "Small Tattoo Bundle",
    description: "3 fine-line pieces up to 2 inches each.",
    price_from_usd: 500,
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
