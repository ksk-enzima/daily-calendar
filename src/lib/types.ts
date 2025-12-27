export type CarCategory = 'jp_passenger' | 'special' | 'luxury';
export type CarUsage = 'ambulance' | 'fire_engine' | 'police' | 'bus' | 'truck' | 'mail' | 'carrier' | 'construction' | 'other';

export interface Car {
  id: string;
  maker: string;
  model: string;
  category: CarCategory;
  usage?: CarUsage; // Only for special/freight
  price_yen_estimate: number;
  country: 'jp' | 'overseas';
  allowed_colors: string[]; // English color names for Prompt
}
