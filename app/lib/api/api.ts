import api from "./axios";
import API from "./endpoints";
import {
  RegisterPayload,
  AuthResponse,
  LoginPayload,
  LoginResponse,
  TournamentPayload,
  TournamentResponse,
  Team,
  TeamResponse,
  RolePricing,
  RolesDropdownResponse,
  Player,
  PlayersResponse,
  PlayerResponse,
} from "./types";

// Register
export const registerUser = (data: RegisterPayload) =>
  api.post<AuthResponse>(API.REGISTER, data);

//Login
export const loginUser = (data: LoginPayload) =>
  api.post<LoginResponse>(API.LOGIN, data);

//Create Tournament
export const createTournament = (data: TournamentPayload) =>
  api.post<TournamentResponse>("/tournaments", data);

export const getTournaments = (page = 1, limit = 10) =>
  api.get<{
    data: (TournamentPayload & {
      _id?: string;
      createdBy?: string;
      createdAt?: string;
      updatedAt?: string;
    })[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`${API.TOURNAMENT}?page=${page}&limit=${limit}`);

export const getTournamentById = (id: string) =>
  api.get<{ data: TournamentPayload & { _id?: string; createdBy?: string; createdAt?: string; updatedAt?: string } }>(
    `${API.TOURNAMENT}/${encodeURIComponent(id)}`
  );

export const registerteams = (data:Team) =>
  api.post<TeamResponse>(API.REGISTER_TEAMS,data)

export const getTeams = (tournamentId?: string) =>
  api.get<{ data: Team[] }>(
    `${API.REGISTER_TEAMS}${tournamentId ? `?tournamentId=${encodeURIComponent(tournamentId)}` : ''}`
  )

// Roles & Players
export const getRolesDropdown = (tournamentId?: string) =>
  api.get<RolesDropdownResponse>(
    `/tournaments/${encodeURIComponent(tournamentId || '')}/roles-dropdown`
  );

export const getPlayers = (tournamentId?: string) =>
  api.get<PlayersResponse>(
    `/tournament-players${tournamentId ? `?tournamentId=${encodeURIComponent(tournamentId)}` : ''}`
  );

export const createPlayer = (data: {
  name: string;
  role: string;
  basePrice: number;
  biddingPrice: number;
  tournamentId: string;
}) => {
  // Return optimistically created player
  // In production, you'd create the player in backend first, then associate it
  const player: Player = {
    id: crypto.randomUUID(),
    name: data.name,
    role: data.role,
    basePrice: data.basePrice,
    biddingPrice: data.biddingPrice,
  };
  
  return Promise.resolve({
    data: player,
    status: 201,
  } as PlayerResponse);
};