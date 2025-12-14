// Tattoo images
import customImg from '@/assets/tattoos/custom.jpg';
import fineLineImg from '@/assets/tattoos/fine-line.jpg';
import blackGreyImg from '@/assets/tattoos/black-grey.jpg';
import colorRealismImg from '@/assets/tattoos/color-realism.jpg';
import neoTraditionalImg from '@/assets/tattoos/neo-traditional.jpg';
import geometricImg from '@/assets/tattoos/geometric.jpg';
import flashImg from '@/assets/tattoos/flash.jpg';
import coverupImg from '@/assets/tattoos/coverup.jpg';
import touchupImg from '@/assets/tattoos/touchup.jpg';

export interface Service {
  title: string;
  description: string;
  duration_estimate?: string;
  price_from_kes?: number;
  price_note?: string;
  notes?: string;
  portfolio_route?: string;
  image?: string;
}

export const tattooServices: Service[] = [
  {
    title: "Custom Tattoo",
    description: "Concept to completion—designed specifically for your body and story.",
    duration_estimate: "2-6h",
    price_from_kes: 15000,
    notes: "Final quote after consultation based on size, placement, and complexity.",
    portfolio_route: "/portfolio/tattoos/custom",
    image: customImg
  },
  {
    title: "Fine Line",
    description: "Crisp, minimal linework with meticulous detail and placement.",
    duration_estimate: "1-3h",
    price_from_kes: 8000,
    portfolio_route: "/portfolio/tattoos/fine-line",
    image: fineLineImg
  },
  {
    title: "Black & Grey",
    description: "Smooth gradients and timeless contrast for refined depth.",
    duration_estimate: "2-6h",
    price_from_kes: 12000,
    portfolio_route: "/portfolio/tattoos/black-and-grey",
    image: blackGreyImg
  },
  {
    title: "Color Realism",
    description: "High-fidelity color with lifelike shading and saturation.",
    duration_estimate: "3-8h",
    price_from_kes: 18000,
    portfolio_route: "/portfolio/tattoos/color-realism",
    image: colorRealismImg
  },
  {
    title: "Neo-traditional",
    description: "Bold lines, modern palettes, and illustrative flair.",
    duration_estimate: "2-6h",
    price_from_kes: 14000,
    portfolio_route: "/portfolio/tattoos/neo-traditional",
    image: neoTraditionalImg
  },
  {
    title: "Ornamental & Geometric",
    description: "Symmetry, pattern, and precision that flatter the body.",
    duration_estimate: "2-6h",
    price_from_kes: 14000,
    portfolio_route: "/portfolio/tattoos/ornamental",
    image: geometricImg
  },
  {
    title: "Flash",
    description: "Curated designs ready to go—limited runs, premium execution.",
    duration_estimate: "45-120m",
    price_from_kes: 5000,
    portfolio_route: "/portfolio/tattoos/flash",
    image: flashImg
  },
  {
    title: "Cover-up & Restoration",
    description: "Strategic design to conceal or revive older work.",
    duration_estimate: "3-8h",
    price_note: "Quote after consult",
    portfolio_route: "/portfolio/tattoos/cover-up",
    image: coverupImg
  },
  {
    title: "Touch-ups",
    description: "Complimentary within studio policy window for eligible pieces.",
    duration_estimate: "30-60m",
    price_note: "Policy dependent",
    image: touchupImg
  }
];

export const piercingServices: Service[] = [
  {
    title: "Ear Lobe (single/pair)",
    description: "Classic lobe piercings with careful marking and jewelry sizing.",
    price_from_kes: 500,
    notes: "Jewelry included."
  },
  {
    title: "Helix/Forward Helix/Tragus/Conch/Rook/Daith",
    description: "Cartilage placements with comfort-focused technique.",
    price_from_kes: 500,
    notes: "Rook KES 1,000. Jewelry included."
  },
  {
    title: "Nostril/Septum",
    description: "Balanced facial symmetry with flexible jewelry options.",
    price_from_kes: 500,
    notes: "Jewelry included."
  },
  {
    title: "Smiley/Medusa",
    description: "Precision placement for comfort and longevity.",
    price_from_kes: 500,
    notes: "Medusa KES 800. Jewelry included."
  },
  {
    title: "Navel (Belly)",
    description: "Anatomy-considered placement for a clean, comfortable heal.",
    price_from_kes: 1000,
    notes: "Jewelry included."
  },
  {
    title: "Nipple (single)",
    description: "Expert technique with privacy and care.",
    price_from_kes: 2000,
    notes: "Jewelry included."
  },
  {
    title: "Industrial",
    description: "Connected ear piercings with a single barbell.",
    price_from_kes: 1500,
    notes: "Jewelry included."
  },
  {
    title: "Tongue/Frog Eyes",
    description: "Oral piercings with careful placement.",
    price_from_kes: 1000,
    notes: "Frog Eyes KES 1,500. Jewelry included."
  },
  {
    title: "Dermals/Surface",
    description: "Single-point and surface piercings.",
    price_from_kes: 4000,
    notes: "Surface Dermals KES 6,000. Surface Tragus KES 1,000."
  }
];

export const jewelryOptions = [
  { title: "Titanium (ASTM F-136)", price_from_kes: 500, notes: "Polished or PVD gold tones." },
  { title: "14k/18k Solid Gold", price_from_kes: 3000, notes: "Yellow, white, or rose gold options." },
  { title: "Gems & Diamonds", price_from_kes: 2000, notes: "Ethically sourced stones." }
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