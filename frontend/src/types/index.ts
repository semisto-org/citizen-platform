// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export const SpotType = {
  HaieExistante: "haie_existante",
  HaiePotentielle: "haie_potentielle",
  ArbreIsole: "arbre_isole",
  Bosquet: "bosquet",
  ZonePotentielle: "zone_potentielle",
} as const;
export type SpotType = (typeof SpotType)[keyof typeof SpotType];

export const SpotStatus = {
  Brouillon: "brouillon",
  Soumis: "soumis",
  Valide: "validé",
  Plante: "planté",
} as const;
export type SpotStatus = (typeof SpotStatus)[keyof typeof SpotStatus];

// ──────────────────────────────────────────────
// Label maps
// ──────────────────────────────────────────────

export const SPOT_TYPE_LABELS: Record<SpotType, string> = {
  [SpotType.HaieExistante]: "Haie existante",
  [SpotType.HaiePotentielle]: "Haie potentielle",
  [SpotType.ArbreIsole]: "Arbre isolé",
  [SpotType.Bosquet]: "Bosquet",
  [SpotType.ZonePotentielle]: "Zone potentielle",
};

export const SPOT_STATUS_LABELS: Record<SpotStatus, string> = {
  [SpotStatus.Brouillon]: "Brouillon",
  [SpotStatus.Soumis]: "Soumis",
  [SpotStatus.Valide]: "Validé",
  [SpotStatus.Plante]: "Planté",
};

// ──────────────────────────────────────────────
// Core entities
// ──────────────────────────────────────────────

export interface Badge {
  slug: string;
  name: string;
  icon: string;
  description: string;
}

export interface UserStats {
  points: number;
  spots_created: number;
  validations: number;
  validations_given: number;
  photos: number;
  photos_uploaded: number;
  badges: string[];
  villages_contributed: number;
}

export interface User {
  id: number;
  email: string;
  display_name: string;
  role: string;
  points: number;
  village_id: number | null;
  village_name: string | null;
  badges: Badge[];
  stats: UserStats;
  bio: string | null;
  created_at: string;
}

export interface SpotsByStatus {
  brouillon: number;
  soumis: number;
  validé: number;
  planté: number;
}

export interface SpotsByType {
  haie_existante: number;
  haie_potentielle: number;
  arbre_isole: number;
  bosquet: number;
  zone_potentielle: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  user_name: string;
  created_at: string;
}

export interface Village {
  id: number;
  name: string;
  code_postal: string;
  region: string;
  latitude: number;
  longitude: number;
  level: number;
  level_name: string;
  score: number;
  hectares_potential: number;
  hectares_planted: number;
  population: number;
  active_citizens: number;
  members_count: number;
  spots_total: number;
  spots_by_status: SpotsByStatus;
  spots_by_type: SpotsByType;
  recent_activity: RecentActivity[];
}

export interface Photo {
  id: number;
  url: string;
  caption: string | null;
}

export interface Contribution {
  id: number;
  type: string;
  is_positive: boolean;
  comment: string | null;
  user_name: string;
  created_at: string;
  spot_type: SpotType;
  village: string;
}

export interface SpotConstraint {
  type: string;
  description: string;
}

export interface Spot {
  id: number;
  spot_type: SpotType;
  geometry_type: string;
  latitude: number;
  longitude: number;
  status: SpotStatus;
  species: string[];
  description: string | null;
  estimated_height: number | null;
  is_edible: boolean;
  opportunity_score: number | null;
  source: string;
  positive_validations: number;
  negative_validations: number;
  village_id: number;
  village_name: string;
  creator_name: string;
  photos_count: number;
  created_at: string;
  updated_at: string;
  geometry_coords: number[] | number[][] | number[][][];
  constraints: SpotConstraint[];
  estimated_length: number | null;
  estimated_surface: number | null;
  photos: Photo[];
  contributions: Contribution[];
}

// ──────────────────────────────────────────────
// GeoJSON
// ──────────────────────────────────────────────

export interface GeoJSONGeometry {
  type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";
  coordinates: number[] | number[][] | number[][][] | number[][][][];
}

export interface GeoJSONProperties {
  id: number;
  spot_type: SpotType;
  status: SpotStatus;
  species: string[];
  description: string | null;
  opportunity_score: number | null;
  is_edible: boolean;
  village_name: string;
  creator_name: string;
  [key: string]: unknown;
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: GeoJSONGeometry;
  properties: GeoJSONProperties;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// ──────────────────────────────────────────────
// Dashboard types
// ──────────────────────────────────────────────

export interface DashboardGlobal {
  total_villages: number;
  total_spots: number;
  total_users: number;
  total_hectares_planted: number;
  total_hectares_potential: number;
  spots_by_status: SpotsByStatus;
  spots_by_type: SpotsByType;
  top_villages: {
    id: number;
    name: string;
    score: number;
    level_name: string;
  }[];
  recent_contributions: Contribution[];
}

export interface VillageDashboard {
  village: Village;
  leaderboard: {
    user_id: number;
    display_name: string;
    points: number;
    spots_created: number;
    badges_count: number;
  }[];
  monthly_progress: {
    month: string;
    spots_added: number;
    validations: number;
    hectares_planted: number;
  }[];
  recent_spots: Spot[];
}

export interface PersonalDashboard {
  user: User;
  recent_contributions: Contribution[];
  recent_spots: Spot[];
  points_history: {
    date: string;
    points: number;
    reason: string;
  }[];
  next_badge: Badge | null;
  next_badge_progress: number;
}

// ──────────────────────────────────────────────
// API request / response helpers
// ──────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
  village_id?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateSpotRequest {
  spot_type: SpotType;
  geometry_type: string;
  latitude: number;
  longitude: number;
  geometry_coords: number[] | number[][] | number[][][];
  species?: string[];
  description?: string;
  estimated_height?: number;
  is_edible?: boolean;
  estimated_length?: number;
  estimated_surface?: number;
  village_id: number;
}

export interface UpdateSpotRequest {
  species?: string[];
  description?: string;
  estimated_height?: number;
  is_edible?: boolean;
  estimated_length?: number;
  estimated_surface?: number;
}

export interface ValidateSpotRequest {
  is_positive: boolean;
  comment?: string;
}

export interface ReportSpotRequest {
  reason: string;
  comment?: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  village_id?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface VillageRanking {
  id: number;
  name: string;
  code_postal: string;
  region: string;
  score: number;
  level_name: string;
  members_count: number;
  spots_total: number;
  hectares_planted: number;
}

export interface SpotsQueryParams {
  village_id?: number;
  spot_type?: SpotType;
  status?: SpotStatus;
  page?: number;
  per_page?: number;
}
