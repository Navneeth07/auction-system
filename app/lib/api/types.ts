/* ---------------- AUTH TYPES ---------------- */
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

/* ---------------- TOURNAMENT & ROLES ---------------- */
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

/* ---------------- TEAM TYPES ---------------- */
export type Team = {
  id: string;
  _id?: string;
  name: string;
  owner: string;
  shortCode: string;
  tournamentId?: string;
  totalPurse?: number;
  remainingPurse: number;
};

export type TeamResponse = {
  message: string;
  status: number;
  data: Team;
};

/* ---------------- PLAYER TYPES ---------------- */
export type Player = {
  id: string;
  fullName: string;
  tournamentPlayerId?: string;
  role: string;
  basePrice: number;
  biddingPrice: number;
  image?: string;
  status?: "registered" | "sold";
};

export type PlayersResponse = {
  data: {
    data: Player[];
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

/* ---------------- AUCTION ROOM TYPES ---------------- */
export type BiddingHistoryItem = {
  teamCode: string;
  amount: number;
  timestamp: number;
};

export type AuctionPlayer = {
  id: string;
  fullName: string;
  tournamentPlayerId?: string;
  image?: string;
  role: string;
  basePrice: number;
  biddingPrice: number;
  status: "registered" | "sold";
  soldTo?: {
    id: string;
    name: string;
    shortCode: string;
  };
  soldAmount?: number;
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
  biddingHistory: BiddingHistoryItem[];
};

/* ---------------- DASHBOARD TYPES ---------------- */
export type DashboardTeamPlayer = {
  playerId: string;
  playerName: string;
  role: string;
  soldAmount: number;
};

export type DashboardTeam = {
  teamId: string;
  teamName: string;
  shortCode: string;
  maxPlayersAllowed: number;
  playersBought: number;
  playerCountDisplay: string;
  totalFundSpent: number;
  remainingPurse: number;
  players: DashboardTeamPlayer[];
};

export type TournamentDashboardResponse = {
  tournament: {
    id: string;
    name: string;
    budget: number;
    maxPlayers: number;
  };
  overallStats: {
    totalPlayersSoldDisplay: string;
    totalPlayersSold: number;
    totalSpendAmount: number;
    highestBid: {
      playerName: string;
      soldAmount: number;
      teamName: string;
      teamShortCode: string;
    };
  };
  teams: DashboardTeam[];
};