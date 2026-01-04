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

export const getMarketHighestPrice = (procedureSlug: string): number | null => {
  return marketHighestPrices[procedureSlug] ?? null;
};

export const getConciergePrice = (procedureSlug: string): number | null => {
  return conciergePrices[procedureSlug] ?? null;
};

export const calculateSavings = (procedureSlug: string): number => {
  const marketPrice = getMarketHighestPrice(procedureSlug);
  const conciergePrice = getConciergePrice(procedureSlug);
  
  if (marketPrice === null || conciergePrice === null) return 0;
  return Math.max(0, marketPrice - conciergePrice);
};
