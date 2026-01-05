// Shared Provider type to ensure consistency across all components
export interface Provider {
  id: string;
  name: string;
  display_name: string;
  specialty: string;
  neighborhood: string;
  city: string;
  rating: number;
  review_count: number;
  next_available_date: string | null;
  next_available_time: string | null;
  recommendation_reason: string | null;
  procedures: string[];
  years_experience: number | null;
  image_url: string | null;
  base_price: number | null;
  provider_profile_id: string | null;
  earliest_slot_date?: string | null;
  earliest_slot_time?: string | null;
}

// Minimal provider type for booking flows
export interface ProviderForBooking {
  id: string;
  name: string;
  display_name: string;
  neighborhood: string;
  city: string;
  rating: number;
  next_available_date: string | null;
  next_available_time?: string | null;
  provider_profile_id: string | null;
}
