/* ================= AUTH ================= */
export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  message: string;
  status: number;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = AuthResponse;

/* ================= ROLE ================= */
export type RolePricing = {
  _id: string;
  role: string;
  basePrice: number;
  biddingPrice: number;
};

export type RolesDropdownResponse = {
  roles: RolePricing[];
  status: number;
};

/* ================= TOURNAMENT ================= */
export type Tournament = {
  _id: string;
  name: string;
};

export type TournamentPayload = {
  _id?: string;
  name: string;
  date: string;
  budget: number;
  minPlayers: number;
  maxPlayers: number;
  rules: string;
  roles: RolePricing[];
};

/* ================= TEAM ================= */
export type Team = {
  id?: string;
  name: string;
  owner: string;
  shortCode: string;
  tournamentId?: string;
  purse?: number;
};

export type TeamResponse = {
  message: string;
  status: number;
  data: Team;
};

/* ================= PLAYER ================= */
export type Player = {
  id: string;
  name: string;
  role: string;
  basePrice: number;
  biddingPrice: number;
  image?: string;
};

export type PlayersResponse = {
  data: {
    data: any[];
  };
};

export type PlayerResponse = {
  data: {
    _id: string;
    fullName: string;
    image?: string;
  };
};
