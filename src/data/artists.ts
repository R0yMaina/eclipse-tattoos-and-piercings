export interface Artist {
  name: string;
  pronouns: string;
  role: string;
  styles: string[];
  experienceYears: number;
  availability: string;
  instagram: string;
  portfolioRoute: string;
  headshot: string;
}

export const artists: Artist[] = [
  {
    name: "Nova Reyes",
    pronouns: "she/her",
    role: "Lead Tattoo Artist",
    styles: ["Fine line", "Black & grey", "Ornamental"],
    experienceYears: 9,
    availability: "Books open",
    instagram: "https://instagram.com/nova.eclipse",
    portfolioRoute: "/artists/nova-reyes",
    headshot: "nova"
  },
  {
    name: "Orion Kade",
    pronouns: "he/they",
    role: "Tattoo Artist",
    styles: ["Neo-traditional", "Color realism"],
    experienceYears: 7,
    availability: "Waitlist",
    instagram: "https://instagram.com/orion.eclipse",
    portfolioRoute: "/artists/orion-kade",
    headshot: "orion"
  },
  {
    name: "Vega Liu",
    pronouns: "they/them",
    role: "Piercing Specialist",
    styles: ["Precision piercing", "Curation", "Minimalist"],
    experienceYears: 6,
    availability: "Books open",
    instagram: "https://instagram.com/vega.eclipse",
    portfolioRoute: "/artists/vega-liu",
    headshot: "vega"
  }
];
