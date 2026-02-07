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
  PaginatedPlayersResponse,
  AuctionRoomResponse,
  TournamentDashboardResponse,
} from "./types";

export const registerUser = (data: RegisterPayload) =>
  api.post<AuthResponse>(API.REGISTER, data);

export const loginUser = (data: LoginPayload) =>
  api.post<LoginResponse>(API.LOGIN, data);

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

export const registerteams = (data: Team) =>
  api.post<TeamResponse>(API.REGISTER_TEAMS, data);

export const getTeams = (tournamentId?: string) =>
  api.get(
    `${API.REGISTER_TEAMS}${tournamentId ? `?tournamentId=${tournamentId}` : ""}`,
  );

export const getRolesDropdown = (tournamentId: string) =>
  api.get<RolesDropdownResponse>(`/tournaments/${tournamentId}/roles-dropdown`);

export const getPlayers = (tournamentId: string) =>
  api.get<PlayersResponse>(`/tournament-players?tournamentId=${tournamentId}`);

export const createPlayer = (formData: FormData) =>
  api.post<PlayerResponse>("/players", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getPaginatedPlayers = (
  tournamentId: string,
  page = 1,
  limit = 10,
) =>
  api.get<PaginatedPlayersResponse>(
    `/players?tournamentId=${tournamentId}&page=${page}&limit=${limit}`,
  );

export const getAuctionRoom = (tournamentId: string) =>
  api.get<AuctionRoomResponse>(
    `/auction-room?tournamentId=${encodeURIComponent(tournamentId)}`,
  );

export const postAuctionBid = (payload: {
  tournamentPlayerId: string;
  teamId: string;
  bidAmount: number;
}) => {
  return api.post(`/auction-room`, payload);
};

export const hammerDownPlayer = (payload: { tournamentPlayerId: string }) => {
  return api.post("/hammer-down", payload);
};

export const updateBiddingPrice = (payload: {
  tournamentPlayerId: string;
  biddingPrice: number;
}) => {
  return api.put("/tournament-player", payload);
};

export const deleteTeam = (teamId: string) => 
  api.delete(`/teams/${teamId}`);

export const deletePlayer = (tournamentPlayerId: string) =>
  api.delete(`/players?tournamentPlayerId=${encodeURIComponent(tournamentPlayerId)}`);

export const getTournamentDashboard = (tournamentId: string) =>
  api.get<any>(`/tournament-dashboard?tournamentId=${encodeURIComponent(tournamentId)}`);