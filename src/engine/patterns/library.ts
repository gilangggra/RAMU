import { OpportunityPatternDef, TitleContext } from '../types';

export const OPPORTUNITY_PATTERNS: OpportunityPatternDef[] = [
  {
    code: 'FASHION_CAPSULE',
    name: 'Koleksi Kapsul Kriya Busana',
    description:
      'Membentuk lini koleksi eksklusif terbatas dengan memadukan kain wastra, komponen kulit/kriya, serta perhiasan dan dokumentasi visual komersial.',
    category: 'PRODUCT_DEVELOPMENT',
    version: 1,
    minParticipants: 2,
    maxParticipants: 4,
    requiredRoles: [
      {
        code: 'TEXTILE_MATERIAL',
        label: 'Material Wastra / Tekstil',
        required: true,
        minCount: 1,
        acceptedCategories: ['MATERIAL', 'PRODUCT'],
        acceptedRoles: ['INPUT', 'COMPONENT', 'CREATIVE_ELEMENT'],
      },
      {
        code: 'CRAFT_COMPONENT',
        label: 'Komponen Kriya / Kulit',
        required: true,
        minCount: 1,
        acceptedCategories: ['MATERIAL', 'PRODUCT', 'PRODUCTION'],
        acceptedRoles: ['COMPONENT', 'CAPABILITY', 'CREATIVE_ELEMENT'],
      },
    ],
    optionalRoles: [
      {
        code: 'ACCESSORY_ACCENT',
        label: 'Aksen Perak / Perhiasan',
        required: false,
        minCount: 0,
        acceptedCategories: ['PRODUCT', 'CREATIVE_ASSET'],
        acceptedRoles: ['COMPONENT', 'CREATIVE_ELEMENT'],
      },
      {
        code: 'VISUAL_PRODUCTION',
        label: 'Fotografi & Dokumentasi Visual',
        required: false,
        minCount: 0,
        acceptedCategories: ['CAPABILITY', 'RESOURCE'],
        acceptedRoles: ['CAPABILITY', 'ENABLER'],
      },
    ],
    expectedOutputs: [
      'Koleksi Kapsul Terbatas (Limited Edition)',
      'Lookbook & Katalog Foto Komersial',
      'Pemasaran Bersama Lintas Segmen',
    ],
    allowedRelationships: [
      'PRODUCT_COMBINATION',
      'PRODUCTION_CHAIN',
      'CREATIVE_COMBINATION',
      'DIRECT_NEED_MATCH',
    ],
    preferredGoals: [
      'PRODUCT_DEVELOPMENT',
      'MARKET_EXPANSION',
      'BRAND_GROWTH',
      'CREATIVE_EXPERIMENTATION',
    ],
    generateTitle: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name.replace(/^(Sanggar|Kriya|Studio)\s+/i, '')).slice(0, 2);
      return `Koleksi Kapsul Warisan Nusantara: ${names.join(' × ')}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const actorNames = ctx.actors.map((a) => a.name).join(', ');
      return `Kolaborasi penciptaan lini produk terpadu antara ${actorNames}. Menyatukan keunggulan material wastra dan ketrampilan kriya menjadi koleksi bernilai tambah tinggi yang siap dipasarkan ke segmen urban premium.`;
    },
  },

  // --------------------------------------------------------------------------
  // PATTERN 2: PREMIUM GIFT SET
  // --------------------------------------------------------------------------
  {
    code: 'PREMIUM_GIFT_SET',
    name: 'Paket Suvenir & Bingkisan Premium',
    description:
      'Menggabungkan produk-produk kriya unggulan menjadi paket cenderamata eksklusif untuk korporasi, pariwisata, atau momentum istimewa.',
    category: 'PRODUCT_DEVELOPMENT',
    version: 1,
    minParticipants: 2,
    maxParticipants: 4,
    requiredRoles: [
      {
        code: 'CORE_CRAFT',
        label: 'Produk Kriya Utama',
        required: true,
        minCount: 1,
        acceptedCategories: ['PRODUCT', 'MATERIAL'],
        acceptedRoles: ['OUTPUT', 'COMPONENT', 'CREATIVE_ELEMENT'],
      },
      {
        code: 'COMPLEMENTARY_ITEM',
        label: 'Produk Pendamping / Aksesoris',
        required: true,
        minCount: 1,
        acceptedCategories: ['PRODUCT', 'CREATIVE_ASSET', 'MATERIAL'],
        acceptedRoles: ['COMPONENT', 'CREATIVE_ELEMENT'],
      },
    ],
    optionalRoles: [
      {
        code: 'VISUAL_STYLING',
        label: 'Katalog & Penataan Visual',
        required: false,
        minCount: 0,
        acceptedCategories: ['CAPABILITY', 'RESOURCE'],
        acceptedRoles: ['CAPABILITY', 'ENABLER'],
      },
    ],
    expectedOutputs: [
      'Bingkisan Eksklusif Kotak Hadiah (Gift Box)',
      'Paket Suvenir Korporat Berkelanjutan',
      'Katalog Presentasi Penawaran B2B',
    ],
    allowedRelationships: [
      'PRODUCT_COMBINATION',
      'RESOURCE_COMBINATION',
      'DIRECT_NEED_MATCH',
    ],
    preferredGoals: [
      'REVENUE_GROWTH',
      'MARKET_EXPANSION',
      'PRODUCT_DEVELOPMENT',
    ],
    generateTitle: (ctx: TitleContext) => {
      return `Exclusive Heritage Hamper & Souvenir Set`;
    },
    generateDescription: (ctx: TitleContext) => {
      const actorNames = ctx.actors.map((a) => a.name).join(' dan ');
      return `Kombinasi produk kriya pilihan dari ${actorNames} yang dikurasi dalam satu paket hadiah bernilai estetik tinggi, menyasar pasar korporat, cinderamata resmi pemerintahan, dan momen perayaan.`;
    },
  },

  // --------------------------------------------------------------------------
  // PATTERN 3: CREATIVE CAMPAIGN & VISUAL STORYTELLING
  // --------------------------------------------------------------------------
  {
    code: 'CREATIVE_CAMPAIGN',
    name: 'Kampanye Visual & Rebranding Kriya',
    description:
      'Meningkatkan daya tarik pasar dan citra brand kriya tradisional melalui kampanye visual profesional, foto editorial, dan video narasi budaya.',
    category: 'MARKETING',
    version: 1,
    minParticipants: 2,
    maxParticipants: 3,
    requiredRoles: [
      {
        code: 'PRODUCT_BRAND',
        label: 'Produk Kriya / Brand',
        required: true,
        minCount: 1,
        acceptedCategories: ['PRODUCT', 'MATERIAL', 'CREATIVE_ASSET'],
        acceptedRoles: ['OUTPUT', 'CREATIVE_ELEMENT'],
      },
      {
        code: 'VISUAL_CREATIVE',
        label: 'Fotografi / Rumah Produksi Visual',
        required: true,
        minCount: 1,
        acceptedCategories: ['CAPABILITY', 'RESOURCE'],
        acceptedRoles: ['CAPABILITY', 'ENABLER'],
      },
    ],
    optionalRoles: [
      {
        code: 'COMPLEMENTARY_SUBJECT',
        label: 'Produk Aksesori Pelengkap',
        required: false,
        minCount: 0,
        acceptedCategories: ['PRODUCT', 'MATERIAL'],
        acceptedRoles: ['COMPONENT', 'CREATIVE_ELEMENT'],
      },
    ],
    expectedOutputs: [
      'Aset Foto Katalog Resolusi Tinggi',
      'Video Narasi Kerajinan (Behind the Scenes)',
      'Aset Kampanye Media Sosial Siap Publikasi',
    ],
    allowedRelationships: [
      'DIRECT_NEED_MATCH',
      'CREATIVE_COMBINATION',
      'CAPABILITY_GAP',
    ],
    preferredGoals: [
      'BRAND_GROWTH',
      'MARKET_EXPANSION',
      'CREATIVE_EXPERIMENTATION',
    ],
    generateTitle: (ctx: TitleContext) => {
      const craftActor = ctx.actors.find((a) => a.assets.some((as) => as.category === 'PRODUCT' || as.category === 'MATERIAL')) || ctx.actors[0];
      return `Kampanye Narasi Visual & Katalog: ${craftActor.name}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const visualActor = ctx.actors.find((a) => a.assets.some((as) => as.category === 'CAPABILITY')) || ctx.actors[1];
      const craftActors = ctx.actors.filter((a) => a.id !== visualActor?.id).map((a) => a.name).join(', ');
      return `Pemberdayaan aset visual untuk ${craftActors} melalui keahlian fotografi komersial dan penataan artistik ${visualActor ? visualActor.name : 'studio visual'} guna memperluas jangkauan pasar ke generasi muda dan kanal daring modern.`;
    },
  },

  // --------------------------------------------------------------------------
  // PATTERN 4: PRODUCT PHOTOSHOOT DIRECT MATCH
  // --------------------------------------------------------------------------
  {
    code: 'PRODUCT_PHOTOSHOOT',
    name: 'Sesi Pemotretan & Katalog Produk',
    description:
      'Menghubungkan langsung perajin kriya yang membutuhkan dokumentasi komersial dengan fotografer produk profesional.',
    category: 'CREATIVE_PRODUCTION',
    version: 1,
    minParticipants: 2,
    maxParticipants: 2,
    requiredRoles: [
      {
        code: 'PRODUCT_OWNER',
        label: 'Pemilik Produk Kriya',
        required: true,
        minCount: 1,
        acceptedCategories: ['PRODUCT', 'MATERIAL'],
        acceptedRoles: ['OUTPUT', 'COMPONENT'],
      },
      {
        code: 'PHOTOGRAPHER',
        label: 'Fotografer Komersial',
        required: true,
        minCount: 1,
        acceptedCategories: ['CAPABILITY', 'RESOURCE'],
        acceptedRoles: ['CAPABILITY', 'ENABLER'],
      },
    ],
    optionalRoles: [],
    expectedOutputs: [
      'Paket Foto Produk White-Background (E-Commerce)',
      'Foto Lifestyle & Aplikasi Penggunaan',
      'Materi Pemasaran Siap Pakai',
    ],
    allowedRelationships: ['DIRECT_NEED_MATCH', 'CAPABILITY_GAP'],
    preferredGoals: ['BRAND_GROWTH', 'MARKET_EXPANSION', 'REVENUE_GROWTH'],
    generateTitle: (ctx: TitleContext) => {
      const maker = ctx.actors[0];
      const studio = ctx.actors[1];
      return `Sesi Katalog Komersial: ${maker.name} × ${studio ? studio.name : 'Studio'}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const maker = ctx.actors[0];
      const studio = ctx.actors[1];
      return `Penyelesaian kebutuhan langsung pemotretan produk ${maker.name} oleh ${studio ? studio.name : 'studio fotografi'}. Menghasilkan aset visual standar industri untuk menunjang penjualan e-commerce dan materi penawaran klien.`;
    },
  },

  // --------------------------------------------------------------------------
  // PATTERN 5: DESIGN TO PRODUCTION (Hilirisasi Desain ke Perajin)
  // --------------------------------------------------------------------------
  {
    code: 'DESIGN_TO_PRODUCTION',
    name: 'Hilirisasi Desain ke Sentra Produksi',
    description:
      'Menghubungkan perancang/kreator dengan sentra perajin untuk mewujudkan rancangan desain baru menjadi produk fisik bernilai jual tinggi.',
    category: 'CREATIVE_PRODUCTION',
    version: 1,
    minParticipants: 2,
    maxParticipants: 3,
    requiredRoles: [
      {
        code: 'MAKER_CRAFT',
        label: 'Sentra Produksi / Kriya',
        required: true,
        minCount: 1,
        acceptedCategories: ['MATERIAL', 'PRODUCTION', 'CAPABILITY'],
        acceptedRoles: ['CAPABILITY', 'COMPONENT', 'INPUT'],
      },
      {
        code: 'DESIGN_OR_COMPONENT',
        label: 'Elemen Desain / Komponen Pelengkap',
        required: true,
        minCount: 1,
        acceptedCategories: ['CREATIVE_ASSET', 'PRODUCT', 'MATERIAL'],
        acceptedRoles: ['CREATIVE_ELEMENT', 'COMPONENT'],
      },
    ],
    optionalRoles: [],
    expectedOutputs: [
      'Prototipe & Sampel Produk Baru',
      'Standardisasi Mutu & Produksi Batch Kecil',
      'Kemitraan Jangka Panjang Rantai Pasok',
    ],
    allowedRelationships: ['PRODUCTION_CHAIN', 'CAPABILITY_GAP', 'PRODUCT_COMBINATION'],
    preferredGoals: ['PRODUCT_DEVELOPMENT', 'CAPABILITY_EXPANSION', 'REVENUE_GROWTH'],
    generateTitle: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name).join(' & ');
      return `Pengembangan Lini Kriya Kolaboratif: ${names}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name).join(' dan ');
      return `Sinergi kemampuan manufaktur kriya dan rancang bangun antara ${names} untuk memproduksi varian produk kontemporer tanpa meninggalkan keaslian teknik tradisional.`;
    },
  },

  // --------------------------------------------------------------------------
  // PATTERN 6: PRODUCT LAUNCH & CROSS MARKET ACCESS
  // --------------------------------------------------------------------------
  {
    code: 'PRODUCT_LAUNCH',
    name: 'Peluncuran Kolaboratif & Akses Lintas Pasar',
    description:
      'Dua atau lebih pelaku kriya menggabungkan basis pelanggan dan jaringan distribusi masing-masing dalam sebuah momentum peluncuran bersama.',
    category: 'MARKET_ACCESS',
    version: 1,
    minParticipants: 2,
    maxParticipants: 4,
    requiredRoles: [
      {
        code: 'PRIMARY_PARTICIPANT',
        label: 'Pelaku Kriya 1',
        required: true,
        minCount: 1,
        acceptedCategories: ['PRODUCT', 'MATERIAL'],
        acceptedRoles: ['OUTPUT', 'COMPONENT'],
      },
      {
        code: 'CROSS_PARTICIPANT',
        label: 'Pelaku Kriya 2',
        required: true,
        minCount: 1,
        acceptedCategories: ['PRODUCT', 'MATERIAL', 'CREATIVE_ASSET'],
        acceptedRoles: ['OUTPUT', 'COMPONENT', 'MARKET_ACCESS'],
      },
    ],
    optionalRoles: [
      {
        code: 'VISUAL_ENABLER',
        label: 'Dukungan Visual',
        required: false,
        minCount: 0,
        acceptedCategories: ['CAPABILITY'],
        acceptedRoles: ['CAPABILITY', 'ENABLER'],
      },
    ],
    expectedOutputs: [
      'Event Peluncuran Bersama',
      'Kampanye Cross-Promotion di Media Sosial',
      'Paket Bundling Produk Lintas Brand',
    ],
    allowedRelationships: ['MARKET_ACCESS', 'PRODUCT_COMBINATION', 'CREATIVE_COMBINATION'],
    preferredGoals: ['MARKET_EXPANSION', 'REVENUE_GROWTH', 'NETWORK_EXPANSION'],
    generateTitle: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name).join(' × ');
      return `Peluncuran Bersama Pasar Premium: ${names}`;
    },
    generateDescription: (ctx: TitleContext) => {
      const names = ctx.actors.map((a) => a.name).join(', ');
      return `Inisiatif perluasan pasar bersama antara ${names} untuk saling membuka akses ke audiens masing-masing melalui penawaran bundling dan kolaborasi kampanye.`;
    },
  },
];
