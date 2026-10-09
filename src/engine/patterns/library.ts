import { OpportunityPatternDef, TitleContext } from '../types';

export const OPPORTUNITY_PATTERNS: OpportunityPatternDef[] = [
  {
    code: 'FASHION_CAPSULE',
    name: 'Kampanye Koleksi Kapsul & Editorial Lookbook',
    description:
      'Membentuk lini koleksi eksklusif terbatas dengan memadukan koleksi busana brand, penata gaya (stylist), fotografer editorial, dan talenta model.',
    category: 'COMMERCIAL_CAMPAIGN',
    version: 1,
    minParticipants: 2,
    maxParticipants: 4,
    requiredRoles: [
      {
        code: 'TEXTILE_MATERIAL',
        label: 'Koleksi Sampel Busana Brand',
        required: true,
        minCount: 1,
        acceptedCategories: ['WARDROBE_PROP', 'PORTFOLIO_WORK'],
        acceptedRoles: ['INPUT', 'COMPONENT', 'CREATIVE_ELEMENT'],
      },
      {
        code: 'STYLING_COMPONENT',
        label: 'Stylist & Wardrobe / Aksesori',
        required: true,
        minCount: 1,
        acceptedCategories: ['WARDROBE_PROP', 'PORTFOLIO_WORK', 'STUDIO_SPACE', 'SKILL_TALENT'],
        acceptedRoles: ['COMPONENT', 'SKILL_TALENT', 'CREATIVE_ELEMENT'],
      },
    ],
    optionalRoles: [
      {
        code: 'ACCESSORY_ACCENT',
        label: 'Aksen Perhiasan & Detail',
        required: false,
        minCount: 0,
        acceptedCategories: ['WARDROBE_PROP'],
        acceptedRoles: ['COMPONENT', 'CREATIVE_ELEMENT'],
      },
      {
        code: 'VISUAL_PRODUCTION',
        label: 'Fotografi Editorial & Model',
        required: false,
        minCount: 0,
        acceptedCategories: ['SKILL_TALENT', 'EQUIPMENT'],
        acceptedRoles: ['SKILL_TALENT', 'ENABLER'],
      },
    ],
    expectedOutputs: [
      'Koleksi Kapsul Editorial Terbatas',
      'Lookbook & Katalog Foto High-Res',
      'Hak Komersial & Kredit Publikasi Jelas',
    ],
    allowedRelationships: [
      'PRODUCT_COMBINATION',
      'PRODUCTION_CHAIN',
      'CREATIVE_COMBINATION',
      'DIRECT_NEED_MATCH',
    ],
    preferredGoals: [
      'COMMERCIAL_CAMPAIGN',
      'BRAND_AWARENESS',
      'BRAND_AWARENESS',
      'SKILL_DEVELOPMENT',
    ],
    generateTitle: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name.replace(/^(Maison|Studio|Label)\s+/i, '')).slice(0, 2);
      return `Kampanye Koleksi Kapsul Editorial: ${names.join(' × ')}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const actorNames = ctx.actors.map((a) => a.name).join(', ');
      return `Kolaborasi penciptaan kampanye lookbook terpadu antara ${actorNames}. Menyatukan koleksi busana brand dan kapabilitas visual editorial menjadi rilis berkelas internasional.`;
    },
  },

  {
    code: 'PREMIUM_GIFT_SET',
    name: 'Produksi Lookbook & E-Commerce Studio',
    description:
      'Menghubungkan label busana dengan fasilitas studio daylight profesional, fotografer komersial, dan tim penata gaya untuk katalog e-commerce.',
    category: 'COMMERCIAL_CAMPAIGN',
    version: 1,
    minParticipants: 2,
    maxParticipants: 4,
    requiredRoles: [
      {
        code: 'CORE_COLLECTION',
        label: 'Koleksi Busana Musim Terbaru',
        required: true,
        minCount: 1,
        acceptedCategories: ['PORTFOLIO_WORK', 'WARDROBE_PROP'],
        acceptedRoles: ['OUTPUT', 'COMPONENT', 'CREATIVE_ELEMENT'],
      },
      {
        code: 'COMPLEMENTARY_ITEM',
        label: 'Fasilitas Studio & Lighting Kit',
        required: true,
        minCount: 1,
        acceptedCategories: ['STUDIO_SPACE', 'EQUIPMENT'],
        acceptedRoles: ['COMPONENT', 'CREATIVE_ELEMENT', 'ENABLER'],
      },
    ],
    optionalRoles: [
      {
        code: 'VISUAL_STYLING',
        label: 'Pengarah Gaya & Model',
        required: false,
        minCount: 0,
        acceptedCategories: ['SKILL_TALENT', 'EQUIPMENT'],
        acceptedRoles: ['SKILL_TALENT', 'ENABLER'],
      },
    ],
    expectedOutputs: [
      'Paket Foto E-Commerce White-Background',
      'Lookbook Editorial Daylight Studio',
      'Video Gerak Media Sosial Siap Rilis',
    ],
    allowedRelationships: [
      'PRODUCT_COMBINATION',
      'RESOURCE_COMBINATION',
      'DIRECT_NEED_MATCH',
    ],
    preferredGoals: [
      'REVENUE_GENERATION',
      'BRAND_AWARENESS',
      'COMMERCIAL_CAMPAIGN',
    ],
    generateTitle: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name).slice(0, 2).join(' × ');
      return `Sesi Studio Lookbook & E-Commerce: ${names}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const actorNames = ctx.actors.map((a) => a.name).join(' dan ');
      return `Integrasi fasilitas daylight studio dan tim produksi visual untuk katalog komersial ${actorNames}. Menghasilkan materi promosi e-commerce standar industri.`;
    },
  },

  {
    code: 'CREATIVE_CAMPAIGN',
    name: 'Fashion Film & Creative Direction',
    description:
      'Meningkatkan daya tarik dan prestise brand fashion melalui video sinematik naratif, creative direction, dan editorial visual.',
    category: 'MARKETING',
    version: 1,
    minParticipants: 2,
    maxParticipants: 3,
    requiredRoles: [
      {
        code: 'PRODUCT_BRAND',
        label: 'Label Busana / Koleksi',
        required: true,
        minCount: 1,
        acceptedCategories: ['WARDROBE_PROP'],
        acceptedRoles: ['OUTPUT', 'CREATIVE_ELEMENT'],
      },
      {
        code: 'VISUAL_CREATIVE',
        label: 'Creative Director & Videografer',
        required: true,
        minCount: 1,
        acceptedCategories: ['SKILL_TALENT', 'EQUIPMENT'],
        acceptedRoles: ['SKILL_TALENT', 'ENABLER'],
      },
    ],
    optionalRoles: [
      {
        code: 'COMPLEMENTARY_SUBJECT',
        label: 'Aksesori & Wardrobe Pelengkap',
        required: false,
        minCount: 0,
        acceptedCategories: ['WARDROBE_PROP'],
        acceptedRoles: ['COMPONENT', 'CREATIVE_ELEMENT'],
      },
    ],
    expectedOutputs: [
      'Film Pendek Mode (Fashion Film 4K)',
      'Teaser Sinematik Media Sosial',
      'Aset Kampanye Visual Editorial',
    ],
    allowedRelationships: [
      'DIRECT_NEED_MATCH',
      'CREATIVE_COMBINATION',
      'CAPABILITY_GAP',
    ],
    preferredGoals: [
      'BRAND_AWARENESS',
      'BRAND_AWARENESS',
      'SKILL_DEVELOPMENT',
    ],
    generateTitle: (ctx: TitleContext) => {
      const fashionActor = ctx.actors.find((a) => a.assets.some((as) => as.category === 'PORTFOLIO_WORK' || as.category === 'WARDROBE_PROP')) || ctx.actors[0];
      return `Kampanye Fashion Film & Arahan Visual: ${fashionActor.name}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const visualActor = ctx.actors.find((a) => a.assets.some((as) => as.category === 'SKILL_TALENT')) || ctx.actors[1];
      const brandActors = ctx.actors.filter((a) => a.id !== visualActor?.id).map((a) => a.name).join(', ');
      return `Produksi film pendek mode sinematik dan arahan artistik untuk ${brandActors} oleh ${visualActor ? visualActor.name : 'studio kreatif'} guna mengangkat narasi estetika ke panggung festival dan audiens internasional.`;
    },
  },
  {
    code: 'PRODUCT_PHOTOSHOOT',
    name: 'Sesi Foto Editorial & Casting Model',
    description:
      'Menghubungkan langsung fashion brand yang membutuhkan dokumentasi komersial dengan fotografer fashion dan talenta model.',
    category: 'CREATIVE_PRODUCTION',
    version: 1,
    minParticipants: 2,
    maxParticipants: 2,
    requiredRoles: [
      {
        code: 'PRODUCT_OWNER',
        label: 'Fashion Brand / Pemilik Koleksi Busana',
        required: true,
        minCount: 1,
        acceptedCategories: ['PORTFOLIO_WORK', 'WARDROBE_PROP'],
        acceptedRoles: ['OUTPUT', 'COMPONENT'],
      },
      {
        code: 'PHOTOGRAPHER',
        label: 'Fotografer Fashion & Model',
        required: true,
        minCount: 1,
        acceptedCategories: ['SKILL_TALENT', 'EQUIPMENT'],
        acceptedRoles: ['SKILL_TALENT', 'ENABLER'],
      },
    ],
    optionalRoles: [],
    expectedOutputs: [
      'Foto Katalog E-Commerce White-Background',
      'Foto Editorial On-Model Kualitas Majalah',
      'Aset Digital Siap Rilis Kampanye',
    ],
    allowedRelationships: ['DIRECT_NEED_MATCH', 'CAPABILITY_GAP'],
    preferredGoals: ['BRAND_AWARENESS', 'BRAND_AWARENESS', 'REVENUE_GENERATION'],
    generateTitle: (ctx: TitleContext) => {
      const maker = ctx.actors[0];
      const studio = ctx.actors[1];
      return `Sesi Editorial On-Model: ${maker.name} × ${studio ? studio.name : 'Studio'}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const maker = ctx.actors[0];
      const studio = ctx.actors[1];
      return `Penyelesaian kebutuhan langsung pemotretan lookbook ${maker.name} oleh ${studio ? studio.name : 'fotografer fashion'}. Menghasilkan aset visual standar industri untuk menunjang promosi editorial dan penjualan daring.`;
    },
  },
  {
    code: 'DESIGN_TO_PRODUCTION',
    name: 'Kolaborasi Lookbook & Kampanye Wardrobe',
    description:
      'Menghubungkan label busana dengan fotografer dan tim visual untuk memproduksi katalog lookbook editorial berkualitas internasional.',
    category: 'CREATIVE_PRODUCTION',
    version: 1,
    minParticipants: 2,
    maxParticipants: 3,
    requiredRoles: [
      {
        code: 'WARDROBE_BRAND',
        label: 'Koleksi Busana & Wardrobe Brand',
        required: true,
        minCount: 1,
        acceptedCategories: ['WARDROBE_PROP', 'PORTFOLIO_WORK'],
        acceptedRoles: ['COMPONENT', 'INPUT', 'CREATIVE_ELEMENT'],
      },
      {
        code: 'VISUAL_CREATOR',
        label: 'Fotografer & Tim Visual Studio',
        required: true,
        minCount: 1,
        acceptedCategories: ['SKILL_TALENT', 'STUDIO_SPACE', 'EQUIPMENT'],
        acceptedRoles: ['SKILL_TALENT', 'ENABLER'],
      },
    ],
    optionalRoles: [],
    expectedOutputs: [
      'Lookbook Editorial 15-Look Resolusi Penuh',
      'Aset Visual Kampanye Siap Publikasi',
      'Pemberian Co-Credit Resmi Seluruh Tim',
    ],
    allowedRelationships: ['PRODUCTION_CHAIN', 'CAPABILITY_GAP', 'PRODUCT_COMBINATION'],
    preferredGoals: ['COMMERCIAL_CAMPAIGN', 'BRAND_AWARENESS', 'REVENUE_GENERATION'],
    generateTitle: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name).join(' × ');
      return `Lookbook Editorial & Kampanye Mode: ${names}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name).join(' dan ');
      return `Kolaborasi pembuatan materi promosi visual lookbook antara ${names} untuk mengangkat narasi koleksi busana ke standar publikasi komersial.`;
    },
  },
  {
    code: 'PRODUCT_LAUNCH',
    name: 'Runway Showcase & Peluncuran Koleksi Bersama',
    description:
      'Dua atau lebih label fashion dan studio kreatif menggabungkan basis audiens dalam sebuah peragaan busana atau peluncuran koleksi kolaboratif.',
    category: 'EDITORIAL_PUBLICATION',
    version: 1,
    minParticipants: 2,
    maxParticipants: 4,
    requiredRoles: [
      {
        code: 'PRIMARY_PARTICIPANT',
        label: 'Label Fashion Kolaborator 1',
        required: true,
        minCount: 1,
        acceptedCategories: ['PORTFOLIO_WORK', 'WARDROBE_PROP'],
        acceptedRoles: ['OUTPUT', 'COMPONENT'],
      },
      {
        code: 'CROSS_PARTICIPANT',
        label: 'Label Fashion Kolaborator 2',
        required: true,
        minCount: 1,
        acceptedCategories: ['WARDROBE_PROP'],
        acceptedRoles: ['OUTPUT', 'COMPONENT', 'EDITORIAL_PUBLICATION'],
      },
    ],
    optionalRoles: [
      {
        code: 'VISUAL_ENABLER',
        label: 'Dukungan Dokumentasi Runway',
        required: false,
        minCount: 0,
        acceptedCategories: ['SKILL_TALENT'],
        acceptedRoles: ['SKILL_TALENT', 'ENABLER'],
      },
    ],
    expectedOutputs: [
      'Event Runway / Trunk Show Bersama',
      'Kampanye Cross-Promotion di Media Fashion',
      'Rilis Koleksi Kolaboratif Terbatas',
    ],
    allowedRelationships: ['EDITORIAL_PUBLICATION', 'PRODUCT_COMBINATION', 'CREATIVE_COMBINATION'],
    preferredGoals: ['BRAND_AWARENESS', 'REVENUE_GENERATION', 'PORTFOLIO_BUILDING'],
    generateTitle: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name).join(' × ');
      return `Runway Showcase & Peluncuran Bersama: ${names}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name).join(', ');
      return `Inisiatif peragaan busana dan aktivasi media bersama antara ${names} untuk saling membuka akses ke audiens pecinta mode dan pembeli komersial.`;
    },
  },
];
