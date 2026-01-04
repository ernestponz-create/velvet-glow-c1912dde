// Market highest prices for procedures (MVP hardcoded values in GBP)
// These represent the typical highest market prices for each procedure

export const marketHighestPrices: Record<string, number> = {
  "botox": 1200,
  "dermal-fillers": 1500,
  "laser-resurfacing": 2500,
  "morpheus8": 1800,
  "hydrafacial": 800,
  "chemical-peel": 600,
  "microneedling": 900,
  "prp-therapy": 1400,
  "thread-lift": 2200,
  "ultherapy": 3000,
  "lip-enhancement": 1100,
  "ipl-photofacial": 950,
};

// Concierge pricing (exclusive rates for Velvet members)
export const conciergePrices: Record<string, number> = {
  "botox": 750,
  "dermal-fillers": 950,
  "laser-resurfacing": 1650,
  "morpheus8": 1200,
  "hydrafacial": 450,
  "chemical-peel": 350,
  "microneedling": 550,
  "prp-therapy": 900,
  "thread-lift": 1450,
  "ultherapy": 2000,
  "lip-enhancement": 700,
  "ipl-photofacial": 600,
};

// Price ranges for provider cards (min-max in GBP)
export const procedurePriceRanges: Record<string, { min: number; max: number }> = {
  "botox": { min: 400, max: 800 },
  "dermal-fillers": { min: 500, max: 1200 },
  "laser-resurfacing": { min: 1200, max: 2000 },
  "morpheus8": { min: 800, max: 1500 },
  "hydrafacial": { min: 200, max: 500 },
  "chemical-peel": { min: 150, max: 400 },
  "microneedling": { min: 300, max: 650 },
  "prp-therapy": { min: 600, max: 1100 },
  "thread-lift": { min: 1000, max: 1800 },
  "ultherapy": { min: 1500, max: 2500 },
  "lip-enhancement": { min: 400, max: 850 },
  "ipl-photofacial": { min: 350, max: 700 },
};

export const getMarketHighestPrice = (procedureSlug: string): number | null => {
  return marketHighestPrices[procedureSlug] ?? null;
};

export const getConciergePrice = (procedureSlug: string): number | null => {
  return conciergePrices[procedureSlug] ?? null;
};

export const getPriceRange = (procedureSlug: string): { min: number; max: number } | null => {
  return procedurePriceRanges[procedureSlug] ?? null;
};

export const formatPriceRange = (procedureSlug: string): string => {
  const price = getConciergePrice(procedureSlug);
  if (!price) return "Contact for pricing";
  return `£${price.toLocaleString()}`;
};

export const formatPrice = (procedureSlug: string): string => {
  const price = getConciergePrice(procedureSlug);
  if (!price) return "Contact for pricing";
  return `£${price.toLocaleString()}`;
};

export const calculateSavings = (procedureSlug: string): number => {
  const marketPrice = getMarketHighestPrice(procedureSlug);
  const conciergePrice = getConciergePrice(procedureSlug);
  
  if (marketPrice === null || conciergePrice === null) return 0;
  return Math.max(0, marketPrice - conciergePrice);
};
