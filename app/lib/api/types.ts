export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  accessToken: string;
  message: string;
  status:number;
};

export type LoginPayload = {
  email: string
  password: string
}


export type LoginResponse = {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  accessToken: string;
  message?: string;
  status:number;
};

export type RolePricing = {
  role: string;
  basePrice: number;
  biddingPrice: number;
};

export type RolesDropdownResponse = {
  roles: RolePricing[];
  status: number;
};

export type TournamentPayload = {
  name: string;
  date: string;
  budget: number;
  minPlayers: number;
  maxPlayers: number;
  rules: string;
  roles: RolePricing[];
};

export type TournamentResponse = {
  message: string;
  data: {
    name: string;
    date: string;
    budget: number;
    minPlayers: number;
    maxPlayers: number;
    rules: string;
    roles: RolePricing[];
  };
  status: number;
};

export type TournamentsResponse = {
  data: Array<{
    _id: string;
    name: string;
    date: string;
    budget: number;
    minPlayers: number;
    maxPlayers: number;
    rules: string;
    roles: RolePricing[];
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SingleTournamentResponse = {
  data: {
    _id: string;
    name: string;
    date: string;
    budget: number;
    minPlayers: number;
    maxPlayers: number;
    rules: string;
    roles: RolePricing[];
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

export type Team = {
  id?: string;
  name: string;
  owner: string;
  shortCode: string;
  tournamentId?: string;
  purse?: number;
};

export type TeamResponse = {
  message:string,
  status:number,
  data:{
    name:string,
    owner:string,
    shortCode:string,
    tournamentId?: string
  }
}

export type Player = {
  id: string;
  name: string;
  role: string;
  basePrice: number;
  biddingPrice: number;
};

export type PlayersResponse = {
  data: Player[];
  status?: number;
};

export type PlayerResponse = {
  data: Player;
  status?: number;
};


