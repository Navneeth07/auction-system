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

export type PaginatedPlayersResponse = {
  data: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    image?: string;
    createdAt: string;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    roles?: Record<string, number>;
  };
};

type AuctionPlayer = {
  id: string;
  fullName: string;
  tournamentPlayerId?: string; // optional (API inconsistency)
  image?: string;
  role: string;
  basePrice: number;
  biddingPrice: number;
  status: "registered" | "sold";
};

export type AuctionRoleGroup = {
  basePrice: number;
  biddingPrice: number;
  players: AuctionPlayer[];
};

export type AuctionTeam = {
  id: string;
  name: string;
  owner: string;
  shortCode: string;
  totalPurse?: number;
  remainingPurse?: number;
};

export type AuctionTournament = {
  id: string;
  name: string;
  date: string;
  budget: number;
  minPlayers: number;
  maxPlayers: number;
};


export type AuctionRoomResponse = {
  tournament: AuctionTournament;

  roles: Record<string, AuctionRoleGroup>;

  teams: AuctionTeam[];

  activePlayer: AuctionPlayer | null;
};
