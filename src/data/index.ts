/**
 * Content layer. Every JSON file in ./content is an unchanged copy of the original project's
 * published data (D:\urmpl\src\data\generated). Values the original marks `{ __pending: true }`
 * are unconfirmed: `val()` turns them into `undefined` so they are never shown as facts.
 */
import categoriesRaw from './content/categories.json';
import companyRaw from './content/company.json';
import productsRaw from './content/products.json';
import industriesRaw from './content/industries.json';
import marketsRaw from './content/markets.json';
import regionsRaw from './content/regions.json';
import processRaw from './content/process.json';
import pillarsRaw from './content/pillars.json';
import sectionsRaw from './content/sections.json';
import statementsRaw from './content/statements.json';
import timelineRaw from './content/timeline.json';
import tradeModelsRaw from './content/tradeModels.json';
import principlesRaw from './content/networkPrinciples.json';
import careersRaw from './content/careersThemes.json';
import streamsRaw from './content/insightStreams.json';
import enquiryRaw from './content/enquiryTypes.json';
import rfqGuidanceRaw from './content/rfqGuidance.json';
import rfqTimelinesRaw from './content/rfqTimelines.json';
import socialRaw from './content/social.json';
import seoRaw from './content/seo.json';
import imagesRaw from './images.json';

type Pending = { __pending: true; note: string };
type Maybe<T> = T | Pending;
export const isPending = (v: unknown): v is Pending => typeof v === 'object' && v !== null && '__pending' in v;
export function val<T>(v: Maybe<T> | undefined): T | undefined {
  return v === undefined || isPending(v) ? undefined : v;
}

// ---------- company ----------
const co = companyRaw as Record<string, unknown>;
export const company = {
  legalName: co.legalName as string,
  brandName: co.brandName as string,
  shortName: co.shortName as string,
  uen: co.uen as string,
  phone: co.phone as string,
  phoneHref: `tel:${(co.phone as string).replace(/\s+/g, '')}`,
  incorporatedOn: co.incorporatedOn as string,
  foundedYear: co.foundedYear as number,
  businessModel: co.businessModel as string,
  principalActivity: co.principalActivity as string,
  addressLines: (co.address as { lines: string[] }).lines,
  city: (co.address as { city: string }).city,
  postalCode: (co.address as { postalCode: string }).postalCode,
  coordinates: co.coordinates as string,
  email: val(co.email as Maybe<string>),
};
export const fullAddress = `${company.addressLines.join(', ')}, ${company.city} ${company.postalCode}`;
export const yearsSinceFounding = new Date().getFullYear() - company.foundedYear;
export const incorporatedLabel = new Date(company.incorporatedOn + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// ---------- catalogue ----------
export interface Category { id: string; slug: string; name: string; shortName: string; order: number; availability: 'active' | 'in-preparation'; intro?: string; summary?: string; image: string }
export const categories: Category[] = (categoriesRaw as Array<Record<string, unknown>>)
  .filter((c) => c.status === 'published')
  .map((c) => ({
    id: c.id as string, slug: c.slug as string, name: c.name as string, shortName: c.shortName as string, order: c.order as number,
    availability: c.availability as Category['availability'], intro: val(c.intro as Maybe<string>), summary: val(c.summary as Maybe<string>),
    image: `mat-${c.slug as string}`,
  }))
  .sort((a, b) => a.order - b.order);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export interface Product { id: string; slug: string; name: string; code?: string; category: string; crossListed: string[]; shortDescription: string; aliases: string[]; industries: string[]; featured: boolean; order: number }
export const products: Product[] = (productsRaw as Array<Record<string, unknown>>)
  .filter((p) => p.status === 'published')
  .map((p) => ({
    id: p.id as string, slug: p.slug as string, name: p.name as string, code: p.code as string | undefined, category: p.category as string,
    crossListed: (p.crossListed as string[] | undefined) ?? [], shortDescription: p.shortDescription as string, aliases: (p.aliases as string[]) ?? [],
    industries: (p.industries as string[]) ?? [], featured: Boolean(p.featured), order: p.order as number,
  }))
  .sort((a, b) => a.order - b.order);
export const productsIn = (cat: string) => products.filter((p) => p.category === cat || p.crossListed.includes(cat));
export const getProduct = (cat: string, slug: string) => products.find((p) => p.slug === slug && (p.category === cat || p.crossListed.includes(cat)));
export const productHref = (p: Product) => `/products/${p.category}/${p.slug}`;
/** Monogram shown for products without a trade code: initials of the name. */
export const productMark = (p: Product) => p.code ?? p.name.split(/[\s-]+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 3);

export function searchProducts(q: string): Product[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return products
    .map((p) => {
      const hay = [p.name, p.code ?? '', ...p.aliases, getCategory(p.category)?.name ?? ''].join(' ').toLowerCase();
      const score = (p.code?.toLowerCase() === s ? 10 : 0) + (p.name.toLowerCase().startsWith(s) ? 5 : 0) + (hay.includes(s) ? 2 : 0)
        + s.split(/\s+/).filter((t) => hay.includes(t)).length;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

// ---------- industries / network ----------
export interface Industry { id: string; slug: string; name: string; intro: string; categories: string[]; featured: boolean; order: number }
export const industries: Industry[] = (industriesRaw as Array<Industry & { status: string }>)
  .filter((i) => i.status === 'published').sort((a, b) => a.order - b.order);
export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);
export const productsForIndustry = (slug: string) => products.filter((p) => p.industries.includes(slug));

export interface Market { id: string; slug: string; name: string; region: string; type: 'hub' | 'market'; lat: number; lng: number; countryCode?: string; order: number }
export const markets: Market[] = (marketsRaw as Array<Market & { status: string }>).filter((m) => m.status === 'published').sort((a, b) => a.order - b.order);
export interface Region { id: string; name: string; description: string; order: number }
export const regions: Region[] = (regionsRaw as Region[]).sort((a, b) => a.order - b.order);
export const marketsIn = (region: string) => markets.filter((m) => m.region === region && m.type === 'market');

// ---------- company story ----------
export interface Step { id: string; step: number; title: string; summary: string }
export const process: Step[] = (processRaw as Array<Step & { status: string }>).filter((s) => s.status === 'published').sort((a, b) => a.step - b.step);

export interface Pillar { id: string; title: string; description: string; detail: string; proofLabel: string; proofValue?: string; order: number }
export const pillars: Pillar[] = (pillarsRaw as Array<Record<string, unknown>>)
  .filter((p) => p.status === 'published')
  .map((p) => {
    let proof = val(p.proofValue as Maybe<string>);
    if (proof === '{yearsSinceFounding}') proof = String(yearsSinceFounding);
    return { id: p.id as string, title: p.title as string, description: p.description as string, detail: p.detail as string, proofLabel: p.proofLabel as string, proofValue: proof, order: p.order as number };
  })
  .sort((a, b) => a.order - b.order);

export const statements = statementsRaw as Array<{ id: string; label: string; text: string }>;
export const timeline = timelineRaw as Array<{ id: string; year: string; title: string; description: string; source: string }>;
export const tradeModels = tradeModelsRaw as Array<{ id: string; title: string; summary: string; points: string[] }>;
export const principles = principlesRaw as Array<{ id: string; title: string; text: string; order: number }>;
export const careersThemes = careersRaw as Array<{ id: string; title: string; text: string }>;
export const insightStreams = streamsRaw as Array<{ id: string; title: string; description: string }>;
export const enquiryTypes = enquiryRaw as Array<{ id: string; label: string; description: string; inForm: boolean; action: { href: string; label: string } }>;
export const rfqGuidance = rfqGuidanceRaw as { title: string; items: string[] };
export const rfqTimelines = rfqTimelinesRaw as Array<{ label: string; value: string }>;
export const social = (socialRaw as Array<{ label: string; url: string; showInFooter: boolean }>).filter((s) => s.showInFooter);

// ---------- section copy ----------
export interface Section { id: string; eyebrow?: string; title: string; lead?: string; body?: string[]; image?: string; cta?: { href: string; label: string }; secondaryCta?: { href: string; label: string } }
const sectionMap = new Map((sectionsRaw as Section[]).map((s) => [s.id, s]));
export function section(id: string): Section {
  const s = sectionMap.get(id);
  if (!s) throw new Error(`Missing section copy: ${id}`);
  return s;
}

// ---------- SEO ----------
const seo = seoRaw as Array<{ route: string; title: string; description: string }>;
export const seoFor = (route: string) => seo.find((s) => s.route === route);

// ---------- images ----------
export interface ImageEntry { width: number; height: number; alt: string; srcset: Array<[number, string]> }
export const images = imagesRaw as unknown as Record<string, ImageEntry>;
