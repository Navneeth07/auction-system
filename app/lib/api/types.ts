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

export type TournamentPayload = {
  name:string,
  date:string,
  budget:number,
  biddingPrice:number,
  minPlayers:number,
  maxPlayers:number,
  rules:string
}

export type TournamentResponse = {
  message:string,
  data:{
    name:string,
    date:string,
    budget:number,
    basePrice:number,
    biddingPrice:number,
    minPlayers:number,
    maxPlayers:number,
    rules:string,
  }
  status:number
}