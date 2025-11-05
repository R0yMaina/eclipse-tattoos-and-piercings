export interface Package {
  title: string;
  description: string;
  price_from_usd: number;
  notes: string;
  popular?: boolean;
}

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
  tattoo_hourly_usd_range: [200, 300],
  day_session_usd_range: [1200, 1800],
  piercing_service_fee_usd: [40, 80],
  jewelry_price_usd: [40, 600],
  deposit_policy: "A non-refundable deposit secures your appointment and is applied to the final cost. Reschedule with minimum 48 hours' notice to retain your deposit.",
  disclaimer: "Final pricing provided after consultation; complexity, size, placement, and artist affect total."
};
