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
  return apiFetch<PaginatedResponse<Village>>(`/villages${qs}`);
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
  return apiFetch<PaginatedResponse<VillageRanking>>(`/villages-ranking${qs}`);
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
  return apiFetch<Spot>("/spots", {
    method: "POST",
    body: JSON.stringify(data),
  });
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
  return apiFetch<DashboardGlobal>("/dashboard/global");
}

export async function getVillageDashboard(
  villageId: number,
): Promise<VillageDashboard> {
  return apiFetch<VillageDashboard>(`/dashboard/village/${villageId}`);
}

export async function getPersonalDashboard(): Promise<PersonalDashboard> {
  return apiFetch<PersonalDashboard>("/dashboard/personal");
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
