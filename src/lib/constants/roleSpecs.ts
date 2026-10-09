/**
 * Structured Role Specifications Schema & Presets for RAMU Collaborative Ecosystem.
 *
 * Triad Data Taxonomy:
 * 1. Capabilities (Can Do): Kompetensi fungsional & spesialisasi kerja
 * 2. Resources & Equipment (Owns & Brings): Aset fisik, ruang, kamera, gear, sampel
 * 3. Operational Limits & Deliverables (Capacity): Shift, kapasitas kru, output terukur, hak cipta
 */

import { RoleCategory } from "./rolePresets";

// ─────────────────────────────────────────────────────────────────────────────
// 1. PHOTOGRAPHER SPECIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export interface PhotographerSpecs {
  // Capabilities
  specialties: string[];             // e.g. ["Fashion", "Product", "Editorial", "Commercial", "Portrait"]
  capabilities: string[];           // e.g. ["Studio Photography", "Outdoor Photography", "Model & Lookbook", "Campaign Commercial", "Tethered Shooting"]
  // Resources & Equipment
  primary_camera: string;           // e.g. "Sony A7 IV"
  secondary_camera?: string;        // e.g. "Sony A7 III / Canon EOS R6"
  lenses: string[];                 // e.g. ["FE 24-70mm f/2.8 GM", "FE 85mm f/1.4 GM", "50mm f/1.2"]
  lighting_gear: string[];          // e.g. ["Godox AD600 Pro", "Profoto B10X", "Octabox 120cm", "C-Stand Kit"]
  drone_aerial?: boolean;           // Layanan aerial drone bersertifikat
  backdrop_types?: string[];        // e.g. ["Seamless Paper (White, Beige)", "Canvas Painted"]
  tethering_available?: boolean;    // Monitor tethering langsung on-set
  // Operational & Capacity Limits
  shooting_duration_shift?: string; // e.g. "4 Jam (Half-Day) / 8 Jam (Full-Day)"
  max_people_onset?: number;        // e.g. 8
  max_locations_per_day?: number;   // e.g. 2
  // Deliverables
  deliverables: string[];           // e.g. ["Foto Final Retouch Resolusi Tinggi", "Semua RAW File via Drive", "Social Media Crops 9:16", "Color Grading Custom"]
  delivery_time_days?: number;      // e.g. 3-5 hari
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STUDIO SPECIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export interface StudioSpecs {
  // Space & Dimensions
  area_sqm: number;                 // e.g. 80
  ceiling_height_m: number;         // e.g. 4.5
  space_type: string[];             // e.g. ["Indoor Cyclorama", "Natural Light Studio", "Semi-Outdoor"]
  cyclorama_type: string;           // e.g. "3-Wall Seamless Curve (White)"
  // Capacity Limits
  max_people_capacity: number;      // e.g. 10 orang
  max_crew_capacity?: number;       // e.g. 15 orang
  // Resources & Equipment
  electrical_capacity: string;      // e.g. "16.500 Watt (3-Phase)"
  lighting_gear: string[];          // e.g. ["Strobe Flash Godox QT600", "Continuous LED Aputure 300d", "C-Stands & Boom Arm", "Softbox & Beauty Dish"]
  available_setups: string[];       // e.g. ["White Seamless Cyclorama", "Black Velvet Backdrop", "Green Screen Chroma", "Set Ruang Tamu / Lifestyle"]
  props_available?: boolean;        // Properti kursi, stool, podium
  // Facilities
  facilities: string[];             // e.g. ["Makeup Room Ber-AC (3 Cermin LED)", "Ruang Ganti Privat", "Area Tunggu VIP", "AC Central Dingin", "Free Parking Kru", "High-Speed Wi-Fi 200Mbps"]
  // Operational
  operating_hours: string;          // e.g. "08:00 – 22:00 WIB (Setiap Hari)"
  overtime_policy?: string;         // e.g. "Toleransi 30 Menit, Overtime Rp 150.000 / 30 Menit"
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FASHION BRAND / UMKM SPECIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export interface BrandSpecs {
  // Brand Identity & DNA
  brand_category: string[];         // e.g. ["Women's Fashion", "Men's Fashion", "Modest / Hijab", "Accessories & Bags"]
  product_types: string[];          // e.g. ["Ready-to-Wear Clothing", "Outerwear", "Dresses", "Footwear & Bags"]
  target_market: string[];          // e.g. ["Gen Z (18-24)", "Young Adults (25-35)", "Premium Working Class"]
  design_dna: string;               // e.g. "Minimalist Modern Silhouettes dengan Aksen Wastra Kontemporer"
  // Physical Resources & Samples
  sample_sizes_ready: string;       // e.g. "S, M, L (Sampel Terstandar Siap Fitting)"
  sample_skus_count?: number;       // e.g. 15 look busana siap foto
  fabric_materials: string[];       // e.g. ["Linen Organik", "Katun Rayon Twill", "Sutra ATBM Garut", "Tencel Eco-Friendly"]
  capacity_monthly?: string;        // e.g. "500 - 1.000 Pcs / Bulan"
  // Collaboration Needs & Projects
  collaboration_needs: string[];    // e.g. ["Photographer", "Model", "MUA/Stylist", "Studio"]
  campaign_types: string[];         // e.g. ["Product Launch Koleksi Baru", "Lookbook Musiman", "Social Media Viral Campaign", "Editorial Majalah"]
  budget_range: string;             // e.g. "Rp 5.000.000 – Rp 15.000.000 per Kampanye"
  collab_timeline?: string;         // e.g. "2 – 4 Minggu dari Brief hingga Peluncuran"
  creator_requirements?: string;    // e.g. "Fotografer & Model dengan portofolio editorial bersih"
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MODEL / TALENT SPECIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export interface ModelSpecs {
  // Professional & Measurement Attributes (Strictly non-sensitive & professional)
  height_cm: number;                // e.g. 175
  weight_kg?: number;               // e.g. 52
  bust_waist_hips: string;          // e.g. "84-60-89 cm"
  clothing_size: string;            // e.g. "S / 36 EU"
  shoe_size: string;                // e.g. "39 EU"
  experience_years?: number;        // e.g. 4
  // Capabilities
  specialties: string[];             // e.g. ["Fashion Editorial", "Commercial Lookbook", "Runway Catwalk", "Beauty Close-Up"]
  capabilities: string[];           // e.g. ["Runway Catwalk", "Editorial High-Fashion", "Product & E-Commerce", "Lifestyle Motion & Video TVC"]
  // Polaroid & Comp Card Resources
  comp_card: Array<{
    type: string;                   // "Headshot / Close-up" | "Profile 45° Angle" | "Full Body Polaroid"
    url: string;
    caption: string;
  }>;
  // Operational Limits
  wardrobe_restrictions?: string;   // e.g. "Casual, Formal, Modest / Hijab (No Swimwear / No Sheer)"
  chaperone_allowed?: boolean;      // Didampingi 1 orang manajer/pendamping on-set
  travel_radius?: string;           // e.g. "Jabodetabek & Luar Kota dengan Akomodasi"
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MUA / STYLIST SPECIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export interface MuaStylistSpecs {
  // Capabilities & Specialization
  specialties: string[];             // e.g. ["Fashion Editorial", "Commercial Lookbook", "High-Definition Beauty", "Creative Avant-Garde", "Hijab & Hair Styling"]
  services: string[];               // e.g. ["Makeup HD 4K", "Hair Styling & Hijab Do", "Wardrobe Styling & Curating", "Touch-Up On-Set Standby"]
  // Resources & Equipment
  primary_kit_brands: string[];     // e.g. ["Charlotte Tilbury", "MAC Cosmetics", "Dior Backstage", "NARS", "Hypoallergenic Certified"]
  hair_tools: string[];             // e.g. ["Dyson Supersonic Pro", "Hot Tools Curling Iron", "GHD Straightener", "Professional Hairpiece Kit"]
  onset_equipment: string[];        // e.g. ["Garment Steamer Uap Panas", "Gantungan Baju Roll Portable", "Klem Fitting Busana", "Lint Roller & Anti-Static Spray"]
  sanitation_standards: string[];   // e.g. ["Disinfektan Kuas 70% Alkohol", "Spatula & Palette Stainless Steel", "Disposable Mascara Wands"]
  // Operational & Capacity Limits
  max_heads_per_session: number;    // e.g. 2 - 3 Model per Shift
  prep_time_minutes: number;        // e.g. 90 Menit sebelum sesi foto dimulai
  touchup_standby_hours: number;    // e.g. Standby penuh 8 Jam di bawah lampu studio
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE QUICK SUGGESTIONS (Controlled Vocabulary / Chips for High UX)
// ─────────────────────────────────────────────────────────────────────────────
export const ROLE_SPECS_PRESETS = {
  PHOTOGRAPHER: {
    quickSpecialties: ["Fashion", "Product", "Lookbook", "Editorial", "Commercial", "Campaign", "Portrait", "Beauty", "Streetwear"],
    quickCapabilities: ["Studio Photography", "Outdoor Photography", "Model & Lookbook", "Campaign Commercial", "Tethered Shooting", "Drone Aerial"],
    quickCameras: ["Sony A7 IV", "Sony A7R V", "Canon EOS R5", "Canon EOS R6 Mark II", "Fujifilm GFX 100 II", "Nikon Z8", "Hasselblad X2D"],
    quickLenses: ["FE 24-70mm f/2.8 GM II", "FE 85mm f/1.4 GM", "FE 50mm f/1.2 GM", "FE 70-200mm f/2.8 GM", "RF 28-70mm f/2 L", "RF 85mm f/1.2 L"],
    quickLighting: ["Godox AD600 Pro", "Profoto B10X Plus", "Godox AD200 Pro", "Aputure 300d II", "Octabox 120cm", "Beauty Dish 70cm", "C-Stand & Boom Arm"],
    quickDeliverables: ["Foto Final Retouch High-Res", "Semua RAW File via Drive H+1", "Social Media Crops 9:16", "Color Grading Custom", "Master TIF Cetak Majalah"],
  },
  STUDIO: {
    quickSetups: ["White Seamless Cyclorama", "Black Velvet Backdrop", "Green Screen Chroma", "Set Ruang Tamu / Lifestyle", "Rustic Concrete Wall", "Warm Wood Tone"],
    quickFacilities: ["Makeup Room Ber-AC (3 Cermin LED)", "Ruang Ganti Privat", "Area Tunggu VIP", "AC Central Dingin", "Free Parking Kru (4+ Mobil)", "High-Speed Wi-Fi 200Mbps", "Garment Steamer On-Site"],
    quickLighting: ["Strobe Flash Godox QT600 (3x)", "Continuous LED Aputure 300d", "C-Stands (6x) & Heavy Boom Arm", "Octabox 150cm", "Stripbox 30x140cm", "Barndoor & Honeycomb Grid"],
  },
  BRAND: {
    quickCategories: ["Women's Fashion", "Men's Fashion", "Modest / Hijab", "Accessories & Bags", "Footwear", "Jewelry & Gold", "Streetwear & Unisex"],
    quickProductTypes: ["Ready-to-Wear Clothing", "Outerwear & Blazer", "Dresses & Gown", "Bags & Leather Goods", "Footwear", "Scarves & Hijab"],
    quickTargetMarkets: ["Gen Z (18-24)", "Young Adults (25-35)", "Professional Working Class", "Premium & High-End Luxury", "Family & Kids"],
    quickFabrics: ["Linen Organik", "Katun Rayon Twill", "Sutra ATBM Garut", "Tencel Eco-Friendly", "Denim Selvedge", "Tenun Ikat Tradisional", "Wool & Cashmere"],
    quickCollabNeeds: ["Photographer", "Model", "MUA/Stylist", "Studio", "Videographer"],
    quickCampaignTypes: ["Product Launch Koleksi Baru", "Lookbook Musiman (Spring/Summer)", "Social Media Viral Reels", "Editorial Majalah Fesyen", "Katalog Marketplace Bersih"],
  },
  MODEL: {
    quickSpecialties: ["Fashion Editorial", "Commercial Lookbook", "Runway Catwalk", "Beauty Close-Up", "Modest / Hijab Fashion", "Streetwear & Activewear"],
    quickCapabilities: ["Runway Catwalk", "Editorial High-Fashion Pose", "Product & E-Commerce Modeling", "Lifestyle Motion & Video TVC", "Acting & Dialog"],
    quickWardrobePolicies: ["Casual & Modern", "Formal Evening Wear", "Modest / Hijab Only", "High Fashion Avant-Garde", "No Swimwear / Lingerie"],
  },
  MUA_STYLIST: {
    quickSpecialties: ["Fashion Editorial Makeup", "Commercial Lookbook Glow", "High-Definition 4K Beauty", "Creative Avant-Garde Art", "Hijab & Hair Styling", "Wardrobe Styling & Curating"],
    quickServices: ["Makeup HD 4K Tahan Panas", "Hair Styling & Hijab Do Rapi", "Wardrobe Styling Head-to-Toe", "Touch-Up On-Set Standby", "Peminjaman Aksesoris & Fitting"],
    quickKitBrands: ["Charlotte Tilbury", "MAC Cosmetics", "Dior Backstage", "NARS", "Make Up For Ever HD", "Fenty Beauty", "Hypoallergenic Certified"],
    quickOnsetGear: ["Garment Steamer Uap Panas", "Gantungan Baju Roll Portable", "Klem Fitting Busana Studio", "Lint Roller & Anti-Static Spray", "Pita Perekat Busana & Fashion Tape"],
  },
};
