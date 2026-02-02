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
    name: string;
    email: string;
    password:string
  };
  accessToken: string;
  refreshToken: string;
  status:number;
};

export type RolePricing = {
  role: string;
  basePrice: number;
  biddingPrice: number;
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

export type Team = {
  name: string;
  owner: string;
  shortCode: string;
};

export type TeamResponse = {
  message:string,
  status:number,
  data:{
    name:string,
    owner:string,
    shortCode:string
  }
}

export type Player = {
  id: string;
  name: string;
  role: string;
  basePrice: number;
};


