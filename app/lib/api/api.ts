import api from "./axios";
import API from "./endpoints";
import {
  RegisterPayload,
  AuthResponse,
  LoginPayload,
  LoginResponse,
  TournamentPayload,
  Team,
  TeamResponse,
  RolesDropdownResponse,
  PlayersResponse,
  PlayerResponse,
} from "./types";

/* ---------- AUTH ---------- */
export const registerUser = (data: RegisterPayload) =>
  api.post<AuthResponse>(API.REGISTER, data);

export const loginUser = (data: LoginPayload) =>
  api.post<LoginResponse>(API.LOGIN, data);

/* ---------- TOURNAMENT ---------- */
export const createTournament = (data: TournamentPayload) =>
  api.post("/tournaments", data);

export const getTournamentById = (id: string) =>
  api.get(`/tournaments/${encodeURIComponent(id)}`);

export const getTournaments = (page = 1, limit = 10) =>
  api.get<{
    data: (TournamentPayload & {
      _id?: string;
      createdBy?: string;
      createdAt?: string;
      updatedAt?: string;
    })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`${API.TOURNAMENT}?page=${page}&limit=${limit}`);

/* ---------- TEAM ---------- */
export const registerteams = (data: Team) =>
  api.post<TeamResponse>(API.REGISTER_TEAMS, data);

export const getTeams = (tournamentId?: string) =>
  api.get(
    `${API.REGISTER_TEAMS}${tournamentId ? `?tournamentId=${tournamentId}` : ""}`,
  );

/* ---------- ROLES & PLAYERS ---------- */
export const getRolesDropdown = (tournamentId: string) =>
  api.get<RolesDropdownResponse>(`/tournaments/${tournamentId}/roles-dropdown`);

export const getPlayers = (tournamentId: string) =>
  api.get<PlayersResponse>(`/tournament-players?tournamentId=${tournamentId}`);

/* ✅ REAL CREATE PLAYER (FormData) */
export const createPlayer = (formData: FormData) =>
  api.post<PlayerResponse>("/players", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
