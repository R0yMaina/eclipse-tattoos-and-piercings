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
  { title: "Earlobe", description: "Classic lobe piercing with careful marking.", price_from_kes: 500 },
  { title: "Nose", description: "Nostril piercing with balanced placement.", price_from_kes: 800 },
  { title: "Septum", description: "Centered septum piercing.", price_from_kes: 800 },
  { title: "Smiley", description: "Upper lip frenulum piercing.", price_from_kes: 500 },
  { title: "Helix", description: "Upper ear cartilage piercing.", price_from_kes: 800 },
  { title: "Daith", description: "Inner ear ridge cartilage piercing.", price_from_kes: 1000 },
  { title: "Tragus", description: "Small cartilage flap piercing.", price_from_kes: 1000 },
  { title: "Rook", description: "Inner ear ridge cartilage piercing.", price_from_kes: 1000 },
  { title: "Medusa", description: "Philtrum/upper lip piercing.", price_from_kes: 800 },
  { title: "Conch", description: "Inner ear cartilage piercing.", price_from_kes: 800 },
  { title: "Flat", description: "Flat area of upper ear cartilage.", price_from_kes: 800 },
  { title: "Industrial", description: "Two connected ear piercings with barbell.", price_from_kes: 1500 },
  { title: "Tongue", description: "Oral tongue piercing.", price_from_kes: 1500 },
  { title: "Frogeyes", description: "Double tongue piercing.", price_from_kes: 1500 },
  { title: "Stingray", description: "Stingray/Under tongue piercing.", price_from_kes: 1500 },
  { title: "Web", description: "Web/Frenulum piercing.", price_from_kes: 1000 },
  { title: "Navel (Belly)", description: "Belly button piercing.", price_from_kes: 1500 },
  { title: "Nipple", description: "Nipple piercing with expert technique.", price_from_kes: 2000 },
  { title: "Dermal Implants", description: "Single-point anchor piercings.", price_from_kes: 4500 },
  { title: "Surface Dermals", description: "Surface anchor piercings.", price_from_kes: 4000 },
  { title: "Surface Tragus", description: "Surface tragus piercing.", price_from_kes: 1500 },
  { title: "Numbing", description: "Pain management available for all piercings.", price_from_kes: 200 }
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