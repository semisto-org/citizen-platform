import type {
  AuthResponse,
  CreateSpotRequest,
  DashboardGlobal,
  GeoJSONFeatureCollection,
  LoginRequest,
  PaginatedResponse,
  PersonalDashboard,
  RegisterRequest,
  ReportSpotRequest,
  Spot,
  SpotsQueryParams,
  UpdateProfileRequest,
  UpdateSpotRequest,
  User,
  ValidateSpotRequest,
  Village,
  VillageDashboard,
  VillageRanking,
  ApiError,
} from "../types";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

const BASE_URL: string =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const TOKEN_KEY = "auth_token";

// ──────────────────────────────────────────────
// Generic fetch helper
// ──────────────────────────────────────────────

class ApiRequestError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Remove Content-Type for FormData (browser will set multipart boundary)
  if (options.body instanceof FormData) {
    delete (headers as Record<string, string>)["Content-Type"];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorBody: ApiError = { error: "An unexpected error occurred" };
    try {
      errorBody = (await response.json()) as ApiError;
    } catch {
      // Response body was not valid JSON; use default error message.
    }

    throw new ApiRequestError(
      errorBody.error || `Request failed with status ${response.status}`,
      response.status,
      errorBody.details,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// ──────────────────────────────────────────────
// Query string builder
// ──────────────────────────────────────────────

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(result.token);
  return result;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(result.token);
  return result;
}

export async function getMe(): Promise<User> {
  const result = await apiFetch<{ user: User }>("/auth/me");
  return result.user;
}

export function logout(): void {
  removeToken();
}

// ──────────────────────────────────────────────
// Villages
// ──────────────────────────────────────────────

export async function getVillages(params?: {
  region?: string;
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<PaginatedResponse<Village>> {
  const qs = params ? buildQueryString(params) : "";
  const raw = await apiFetch<{ villages?: Village[]; data?: Village[] }>(`/villages${qs}`);
  // Backend returns { villages: [...] }, normalize to PaginatedResponse
  const items = raw.data ?? raw.villages ?? [];
  const perPage = params?.per_page ?? items.length;
  return {
    data: items,
    meta: {
      current_page: 1,
      total_pages: Math.max(1, Math.ceil(items.length / perPage)),
      total_count: items.length,
      per_page: perPage,
    },
  };
}

export async function getVillage(id: number): Promise<Village> {
  return apiFetch<Village>(`/villages/${id}`);
}

export async function getVillageRanking(params?: {
  region?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<VillageRanking>> {
  const qs = params ? buildQueryString(params) : "";
  const raw = await apiFetch<{
    ranking?: VillageRanking[];
    data?: VillageRanking[];
    meta?: { total_pages: number };
  }>(`/villages-ranking${qs}`);
  // Backend returns { ranking: [...] } without pagination, normalize to PaginatedResponse
  const all = raw.data ?? raw.ranking ?? [];
  const perPage = params?.per_page ?? 25;
  const page = params?.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(all.length / perPage));
  const start = (page - 1) * perPage;
  const data = all.slice(start, start + perPage);
  return {
    data,
    meta: raw.meta ?? {
      current_page: page,
      total_pages: totalPages,
      total_count: all.length,
      per_page: perPage,
    },
  };
}

// ──────────────────────────────────────────────
// Spots
// ──────────────────────────────────────────────

export async function getSpots(
  params?: SpotsQueryParams,
): Promise<PaginatedResponse<Spot>> {
  const qs = params ? buildQueryString(params as Record<string, unknown>) : "";
  return apiFetch<PaginatedResponse<Spot>>(`/spots${qs}`);
}

export async function getSpot(id: number): Promise<Spot> {
  return apiFetch<Spot>(`/spots/${id}`);
}

export async function getSpotsGeoJSON(params?: {
  village_id?: number;
  spot_type?: string;
  status?: string;
  bbox?: string;
}): Promise<GeoJSONFeatureCollection> {
  const qs = params ? buildQueryString(params) : "";
  return apiFetch<GeoJSONFeatureCollection>(`/spots-geojson${qs}`);
}

export async function createSpot(data: CreateSpotRequest): Promise<Spot> {
  const res = await apiFetch<{ spot: Spot }>("/spots", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.spot;
}

export async function updateSpot(
  id: number,
  data: UpdateSpotRequest,
): Promise<Spot> {
  return apiFetch<Spot>(`/spots/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function submitSpot(id: number): Promise<Spot> {
  return apiFetch<Spot>(`/spots/${id}/submit`, {
    method: "POST",
  });
}

export async function validateSpot(
  id: number,
  data: ValidateSpotRequest,
): Promise<Spot> {
  return apiFetch<Spot>(`/spots/${id}/validate`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function reportSpot(
  id: number,
  data: ReportSpotRequest,
): Promise<void> {
  return apiFetch<void>(`/spots/${id}/report`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export async function getGlobalDashboard(): Promise<DashboardGlobal> {
  const raw = await apiFetch<{
    stats?: {
      villages_active?: number;
      total_users?: number;
      total_spots?: number;
      spots_validated?: number;
      spots_planted?: number;
      hectares_planted?: number;
    };
    top_villages?: Array<{ id: number; name: string; score: number; level: number; level_name: string }>;
    recent_spots?: Array<{
      id: number;
      type: string;
      status: string;
      village: string;
      creator: string;
      created_at: string;
    }>;
  }>("/dashboard/global");

  const stats = raw.stats ?? {};
  return {
    total_villages: stats.villages_active ?? 0,
    total_users: stats.total_users ?? 0,
    total_spots: stats.total_spots ?? 0,
    total_hectares_planted: stats.hectares_planted ?? 0,
    total_hectares_potential: 0,
    spots_by_status: {
      brouillon: 0,
      soumis: Math.max(
        0,
        (stats.total_spots ?? 0) - (stats.spots_validated ?? 0) - (stats.spots_planted ?? 0),
      ),
      validé: stats.spots_validated ?? 0,
      planté: stats.spots_planted ?? 0,
    },
    spots_by_type: {
      haie_existante: 0,
      haie_potentielle: 0,
      arbre_isole: 0,
      bosquet: 0,
      zone_potentielle: 0,
    },
    top_villages: (raw.top_villages ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      score: v.score,
      level_name: v.level_name,
    })),
    recent_contributions: (raw.recent_spots ?? []).map((s) => ({
      id: s.id,
      type: s.type,
      spot_type: s.type,
      is_positive: true,
      comment: null,
      user_name: s.creator,
      village: s.village,
      created_at: s.created_at,
    })),
  };
}

export async function getVillageDashboard(
  villageId: number,
): Promise<VillageDashboard> {
  return apiFetch<VillageDashboard>(`/dashboard/village/${villageId}`);
}

export async function getPersonalDashboard(): Promise<PersonalDashboard> {
  const raw = await apiFetch<{
    user?: {
      id: number;
      display_name: string;
      points: number;
      role: string;
      village_name?: string | null;
    };
    stats?: {
      points?: number;
      spots_created?: number;
      validations?: number;
      photos?: number;
      badges?: string[];
    };
    badges?: Array<{ name: string; slug: string; icon: string; description: string }>;
    recent_contributions?: Array<{
      id: number;
      type: string;
      spot_type: string;
      village: string;
      created_at: string;
    }>;
  }>("/dashboard/personal");

  const userData = raw.user ?? { id: 0, display_name: "", points: 0, role: "membre", village_name: null };
  const statsData = raw.stats ?? {};

  return {
    user: {
      ...userData,
      email: "",
      village_id: null,
      village_name: userData.village_name ?? null,
      badges: raw.badges ?? [],
      stats: {
        points: statsData.points ?? userData.points ?? 0,
        spots_created: statsData.spots_created ?? 0,
        validations: statsData.validations ?? 0,
        validations_given: statsData.validations ?? 0,
        photos: statsData.photos ?? 0,
        photos_uploaded: statsData.photos ?? 0,
        badges: statsData.badges ?? [],
        villages_contributed: 0,
      },
      bio: null,
      created_at: "",
    },
    recent_contributions: raw.recent_contributions ?? [],
    recent_spots: [],
    points_history: [],
    next_badge: null,
    next_badge_progress: 0,
  };
}

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────

export async function getUser(id: number): Promise<User> {
  return apiFetch<User>(`/users/${id}`);
}

export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<User> {
  return apiFetch<User>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ──────────────────────────────────────────────
// Re-exports for convenience
// ──────────────────────────────────────────────

export { ApiRequestError, getToken, setToken, removeToken, TOKEN_KEY };
