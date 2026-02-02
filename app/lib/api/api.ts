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

export const registerteams = (data:Team) =>
  api.post<TeamResponse>(API.REGISTER_TEAMS,data)