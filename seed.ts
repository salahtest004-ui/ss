import { sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, settings, wilayas } from "@/db/schema";
import { WILAYAS } from "@/lib/wilayas-data";

const IMG = {
  caftan: "https://images.pexels.com/photos/33846700/pexels-photo-33846700.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=800",
  caftan2: "https://images.pexels.com/photos/33743289/pexels-photo-33743289.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=800",
  karakou: "https://images.pexels.com/photos/19588680/pexels-photo-19588680.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=800",
  gandoura: "https://images.pexels.com/photos/34033763/pexels-photo-34033763.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=800",
  burnous: "https://images.pexels.com/photos/38257670/pexels-photo-38257670.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=800",
  textile: "https://images.pexels.com/photos/38257675/pexels-photo-38257675.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=800",
  honey: "https://images.pexels.com/photos/27433887/pexels-photo-27433887.png?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  dates: "https://images.pexels.com/photos/30709483/pexels-photo-30709483.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  jars: "https://images.pexels.com/photos/13661817/pexels-photo-13661817.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  soap: "https://images.pexels.com/photos/17596996/pexels-photo-17596996.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  perfume1: "https://images.pexels.com/photos/16722501/pexels-photo-16722501.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  perfume2: "https://images.pexels.com/photos/16722499/pexels-photo-16722499.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  cosmetics: "https://images.pexels.com/photos/3750640/pexels-photo-3750640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  oud: "https://images.pexels.com/photos/16125095/pexels-photo-16125095.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  giftbox: "https://images.pexels.com/photos/30999129/pexels-photo-30999129.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  rug: "https://images.pexels.com/photos/38317548/pexels-photo-38317548.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  ceramics: "https://images.pexels.com/photos/18635387/pexels-photo-18635387.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  vases: "https://images.pexels.com/photos/18635395/pexels-photo-18635395.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  artisan: "https://images.pexels.com/photos/29038452/pexels-photo-29038452.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  watch: "https://images.pexels.com/photos/31541678/pexels-photo-31541678.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  watch2: "https://images.pexels.com/photos/12564670/pexels-photo-12564670.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  earbuds: "https://images.pexels.com/photos/3756985/pexels-photo-3756985.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
  gadgets: "https://images.pexels.com/photos/3568521/pexels-photo-3568521.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=800",
};

export const DEFAULT_SETTINGS: Record<string, string> = {
  store_name: "سوق الجزائر",
  store_tagline: "منتجات جزائرية أصيلة بين يديك",
  phone: "0555 12 34 56",
  email: "contact@souk-dz.dz",
  address: "حي بن عكنون، الجزائر العاصمة",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  announcement: "🚚 توصيل إلى 58 ولاية • الدفع عند الاستلام • شحن مجاني للطلبات فوق 15.000 دج",
  free_shipping_threshold: "15000",
  currency: "دج",
};

const CATEGORIES = [
  {
    name: "أزياء تقليدية",
    slug: "azyaa-taklidia",
    description: "قفطان، كاراكو، برنوس وملابس جزائرية أصيلة",
    image: IMG.caftan,
  },
  {
    name: "عطور ومستحضرات",
    slug: "otour",
    description: "عطور شرقية، زيوت طبيعية ومستحضرات تجميل",
    image: IMG.perfume1,
  },
  {
    name: "منتجات طبيعية",
    slug: "mountajat-tabiiya",
    description: "عسل، تمر دقلة نور، زيت زيتون وصابون طبيعي",
    image: IMG.honey,
  },
  {
    name: "صناعة تقليدية وديكور",
    slug: "sinaa-taklidia",
    description: "فخار، زرابي أمازيغية ولمسات ديكور يدوية",
    image: IMG.rug,
  },
  {
    name: "إلكترونيات وإكسسوارات",
    slug: "electroniques",
    description: "ساعات ذكية، سماعات وملحقات الهاتف",
    image: IMG.watch,
  },
];

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  images: string[];
  categorySlug: string;
  featured?: boolean;
  sold: number;
  rating: string;
};

const PRODUCTS: ProductSeed[] = [
  {
    name: "قفطان جزائري مطرز بالذهب",
    slug: "caftan-dahabi",
    description:
      "قفطان نسائي فاخر مصنوع يدوياً من قماش المخمل مع تطريز ذهبي تقليدي، مثالي للأعراس والمناسبات. متوفر بعدة مقاسات.",
    price: 18500,
    oldPrice: 23000,
    stock: 14,
    images: [IMG.caftan, IMG.caftan2, IMG.textile],
    categorySlug: "azyaa-taklidia",
    featured: true,
    sold: 142,
    rating: "4.90",
  },
  {
    name: "كاراكو عاصمي مخمل",
    slug: "karakou-assimi",
    description:
      "الكاراكو العاصمي بتطريز المجبود على المخمل، قطعة أنيقة تعكس التراث الجزائري العريق.",
    price: 26000,
    oldPrice: 31000,
    stock: 7,
    images: [IMG.karakou, IMG.caftan],
    categorySlug: "azyaa-taklidia",
    featured: true,
    sold: 68,
    rating: "4.80",
  },
  {
    name: "برنوس صوف رجالي",
    slug: "burnous-souf",
    description: "برنوس جزائري من صوف الأغنام الطبيعي، دافئ ومتين، صناعة حرفية من الجنوب.",
    price: 12500,
    stock: 20,
    images: [IMG.burnous, IMG.gandoura],
    categorySlug: "azyaa-taklidia",
    sold: 54,
    rating: "4.60",
  },
  {
    name: "قندورة رجالية صيفية",
    slug: "gandoura-sayfia",
    description: "قندورة قطنية خفيفة بتطريز يدوي، مريحة لأيام الصيف والمناسبات العائلية.",
    price: 6800,
    oldPrice: 8200,
    stock: 32,
    images: [IMG.gandoura],
    categorySlug: "azyaa-taklidia",
    sold: 97,
    rating: "4.50",
  },
  {
    name: "عطر عود شرقي 100 مل",
    slug: "atr-oud",
    description: "عطر عود فاخر بثبات يدوم أكثر من 12 ساعة، تركيبة شرقية دافئة مع لمسة مسك.",
    price: 5400,
    oldPrice: 6900,
    stock: 45,
    images: [IMG.oud, IMG.perfume1],
    categorySlug: "otour",
    featured: true,
    sold: 310,
    rating: "4.70",
  },
  {
    name: "عطر مسك الطهارة",
    slug: "misk-tahara",
    description: "مسك أبيض نقي برائحة ناعمة تدوم طويلاً، مناسب للاستعمال اليومي.",
    price: 2900,
    stock: 60,
    images: [IMG.perfume2, IMG.giftbox],
    categorySlug: "otour",
    sold: 188,
    rating: "4.40",
  },
  {
    name: "علبة هدايا عطور مصغرة",
    slug: "coffret-parfums",
    description: "علبة أنيقة تحتوي على 4 عطور مصغرة، هدية مثالية للمناسبات.",
    price: 4300,
    stock: 25,
    images: [IMG.giftbox, IMG.cosmetics],
    categorySlug: "otour",
    sold: 76,
    rating: "4.60",
  },
  {
    name: "عسل السدر الجبلي 1 كغ",
    slug: "assal-sidr",
    description: "عسل طبيعي 100% من جبال الأوراس، غير معالج ومعبأ يدوياً في برطمان زجاجي.",
    price: 7200,
    oldPrice: 8500,
    stock: 18,
    images: [IMG.honey, IMG.jars],
    categorySlug: "mountajat-tabiiya",
    featured: true,
    sold: 221,
    rating: "4.95",
  },
  {
    name: "تمر دقلة نور فاخر 1 كغ",
    slug: "degla-nour",
    description: "تمر دقلة نور من بسكرة، حبات كبيرة طرية ومنتقاة بعناية.",
    price: 1500,
    stock: 120,
    images: [IMG.dates],
    categorySlug: "mountajat-tabiiya",
    sold: 540,
    rating: "4.80",
  },
  {
    name: "صابون طبيعي بزيت الزيتون",
    slug: "saboun-zitoun",
    description: "صابون حرفي بزيت الزيتون والطين الأحمر، ينظف البشرة بلطف دون مواد كيميائية.",
    price: 900,
    stock: 200,
    images: [IMG.soap],
    categorySlug: "mountajat-tabiiya",
    sold: 430,
    rating: "4.50",
  },
  {
    name: "زربية أمازيغية مصنوعة يدوياً",
    slug: "zarbia-amazighia",
    description: "زربية صوفية منسوجة يدوياً بنقوش أمازيغية أصيلة، مقاس 200×140 سم.",
    price: 34000,
    oldPrice: 39000,
    stock: 5,
    images: [IMG.rug, IMG.artisan],
    categorySlug: "sinaa-taklidia",
    featured: true,
    sold: 23,
    rating: "4.90",
  },
  {
    name: "طقم فخار القبائل",
    slug: "fakhar-kabyle",
    description: "طقم من 5 قطع فخارية مزخرفة يدوياً بنقوش تقليدية من منطقة القبائل.",
    price: 8900,
    stock: 11,
    images: [IMG.ceramics, IMG.vases],
    categorySlug: "sinaa-taklidia",
    sold: 61,
    rating: "4.70",
  },
  {
    name: "مزهرية خزفية مزخرفة",
    slug: "mazharia-khazaf",
    description: "مزهرية خزفية مرسومة يدوياً، لمسة فنية تزين صالونك.",
    price: 4600,
    stock: 16,
    images: [IMG.vases],
    categorySlug: "sinaa-taklidia",
    sold: 38,
    rating: "4.40",
  },
  {
    name: "ساعة ذكية Smart Watch Pro",
    slug: "smart-watch-pro",
    description: "ساعة ذكية بشاشة AMOLED، قياس نبض القلب والأكسجين، مقاومة للماء وبطارية 7 أيام.",
    price: 9900,
    oldPrice: 13500,
    stock: 40,
    images: [IMG.watch, IMG.watch2],
    categorySlug: "electroniques",
    featured: true,
    sold: 265,
    rating: "4.60",
  },
  {
    name: "سماعات لاسلكية TWS",
    slug: "ecouteurs-tws",
    description: "سماعات بلوتوث 5.3 مع علبة شحن، عزل للضوضاء وجودة صوت ممتازة.",
    price: 4200,
    oldPrice: 5500,
    stock: 75,
    images: [IMG.earbuds, IMG.gadgets],
    categorySlug: "electroniques",
    sold: 389,
    rating: "4.30",
  },
  {
    name: "حقيبة إكسسوارات رقمية",
    slug: "accessoires-pack",
    description: "حزمة ملحقات تشمل كابلات شحن سريع، شاحن 20W ومنظم كابلات.",
    price: 3200,
    stock: 55,
    images: [IMG.gadgets],
    categorySlug: "electroniques",
    sold: 142,
    rating: "4.20",
  },
];

let seedPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  // Wilayas
  const wilayaCount = await db.select({ c: sql<number>`count(*)::int` }).from(wilayas);
  if ((wilayaCount[0]?.c ?? 0) === 0) {
    await db.insert(wilayas).values(
      WILAYAS.map((w) => ({
        code: w.code,
        name: w.name,
        homeFee: w.home,
        deskFee: w.desk,
        active: true,
      })),
    );
  }

  // Settings
  await db
    .insert(settings)
    .values(Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value })))
    .onConflictDoNothing();

  // Categories + products
  const productCount = await db.select({ c: sql<number>`count(*)::int` }).from(products);
  if ((productCount[0]?.c ?? 0) > 0) return;

  const insertedCats = await db
    .insert(categories)
    .values(CATEGORIES.map((c) => ({ ...c, active: true })))
    .onConflictDoNothing()
    .returning();

  const allCats = insertedCats.length
    ? insertedCats
    : await db.select().from(categories);
  const catBySlug = new Map(allCats.map((c) => [c.slug, c.id]));

  await db.insert(products).values(
    PRODUCTS.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : null,
      stock: p.stock,
      images: p.images,
      categoryId: catBySlug.get(p.categorySlug) ?? null,
      featured: Boolean(p.featured),
      active: true,
      rating: p.rating,
      sold: p.sold,
    })),
  );
}

export function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      console.error("seed failed", error);
    });
  }
  return seedPromise;
}
