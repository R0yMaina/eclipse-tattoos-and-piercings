export interface Service {
  title: string;
  description: string;
  duration_estimate?: string;
  price_from_usd?: number;
  price_note?: string;
  notes?: string;
  portfolio_route?: string;
}

export const tattooServices: Service[] = [
  {
    title: "Custom Tattoo",
    description: "Concept to completion—designed specifically for your body and story.",
    duration_estimate: "2-6h",
    price_from_usd: 250,
    notes: "Final quote after consultation based on size, placement, and complexity.",
    portfolio_route: "/portfolio/tattoos/custom"
  },
  {
    title: "Fine Line",
    description: "Crisp, minimal linework with meticulous detail and placement.",
    duration_estimate: "1-3h",
    price_from_usd: 180,
    portfolio_route: "/portfolio/tattoos/fine-line"
  },
  {
    title: "Black & Grey",
    description: "Smooth gradients and timeless contrast for refined depth.",
    duration_estimate: "2-6h",
    price_from_usd: 220,
    portfolio_route: "/portfolio/tattoos/black-and-grey"
  },
  {
    title: "Color Realism",
    description: "High-fidelity color with lifelike shading and saturation.",
    duration_estimate: "3-8h",
    price_from_usd: 300,
    portfolio_route: "/portfolio/tattoos/color-realism"
  },
  {
    title: "Neo-traditional",
    description: "Bold lines, modern palettes, and illustrative flair.",
    duration_estimate: "2-6h",
    price_from_usd: 240,
    portfolio_route: "/portfolio/tattoos/neo-traditional"
  },
  {
    title: "Ornamental & Geometric",
    description: "Symmetry, pattern, and precision that flatter the body.",
    duration_estimate: "2-6h",
    price_from_usd: 240,
    portfolio_route: "/portfolio/tattoos/ornamental"
  },
  {
    title: "Flash",
    description: "Curated designs ready to go—limited runs, premium execution.",
    duration_estimate: "45-120m",
    price_from_usd: 150,
    portfolio_route: "/portfolio/tattoos/flash"
  },
  {
    title: "Cover-up & Restoration",
    description: "Strategic design to conceal or revive older work.",
    duration_estimate: "3-8h",
    price_note: "Quote after consult",
    portfolio_route: "/portfolio/tattoos/cover-up"
  },
  {
    title: "Touch-ups",
    description: "Complimentary within studio policy window for eligible pieces.",
    duration_estimate: "30-60m",
    price_note: "Policy dependent"
  }
];

export const piercingServices: Service[] = [
  {
    title: "Ear Lobe (single/pair)",
    description: "Classic lobe piercings with careful marking and jewelry sizing.",
    price_from_usd: 40,
    notes: "Service fee; jewelry priced separately."
  },
  {
    title: "Helix/Forward Helix/Tragus/Conch/Rook/Daith",
    description: "Cartilage placements with comfort-focused technique.",
    price_from_usd: 55,
    notes: "Service fee per piercing; jewelry priced separately."
  },
  {
    title: "Nostril/Septum",
    description: "Balanced facial symmetry with flexible jewelry options.",
    price_from_usd: 60,
    notes: "Jewelry priced separately."
  },
  {
    title: "Eyebrow/Lip",
    description: "Precision placement for comfort and longevity.",
    price_from_usd: 60,
    notes: "Jewelry priced separately."
  },
  {
    title: "Navel",
    description: "Anatomy-considered placement for a clean, comfortable heal.",
    price_from_usd: 65,
    notes: "Jewelry priced separately."
  },
  {
    title: "Nipple (single/pair)",
    description: "Expert technique with privacy and care.",
    price_from_usd: 70,
    notes: "Jewelry priced separately."
  },
  {
    title: "Curated Ear Session",
    description: "Personalized ear map and jewelry selection to fit your anatomy.",
    price_from_usd: 120,
    notes: "Consultation and plan; piercings and jewelry priced separately."
  },
  {
    title: "Jewelry Change/Downsize",
    description: "Professional jewelry swaps and downsizing for comfort.",
    price_from_usd: 15,
    notes: "Free with jewelry purchase (policy dependent)."
  }
];

export const jewelryOptions = [
  { title: "Titanium (ASTM F-136)", price_from_usd: 40, notes: "Polished or PVD gold tones." },
  { title: "14k/18k Solid Gold", price_from_usd: 120, notes: "Yellow, white, or rose gold options." },
  { title: "Gems & Diamonds", price_from_usd: 90, notes: "Ethically sourced stones." }
];

export const aftercareInfo = {
  tattoo: [
    "Remove wrap as directed; wash gently with fragrance-free soap.",
    "Pat dry; apply thin layer of recommended ointment.",
    "Avoid soaking, sun, and friction until healed."
  ],
  piercing: [
    "Saline soak or spray twice daily; avoid harsh cleansers.",
    "Do not rotate jewelry; avoid sleeping on new piercings.",
    "Return for downsizing when advised."
  ],
  download_link: "/docs/aftercare.pdf"
};
