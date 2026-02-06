# Cricket Auction System - Frontend Documentation

## Documents

1. BRD (Business Requirements Document)
2. ERD (Entity Relationship Diagram)

---

## BRD (Business Requirements Document)

### Core Requirements
1. Players are unique to a particular Organizer
2. Only players' past history available for a particular organizer and tournament
3. Tournament players association manages the relationship between players and tournaments

### System Constraints
- Players unique for a particular organizer
- Only Players past history available for particular organizer per tournament

---

## ERD (Entity Relationship Diagram)

### Relationships
1. Player has many Tournaments and Tournament has many Players
2. TournamentPlayer is an association table managing the M2M relationship
3. Team belongs to an Organizer
4. Tournament belongs to an Organizer

---

# API Documentation

## Base URL
```
/api
```

## Authentication

### Headers
All authenticated endpoints require:
```
Authorization: Bearer <accessToken>
```

### Authentication Flow
1. User registers/logs in to get `accessToken` and `refreshToken`
2. `refreshToken` is stored as HTTP-only cookie
3. Include `accessToken` in Authorization header for protected endpoints

---

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user (organizer)

**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "status": 201,
  "accessToken": "string",
  "user": {
    "id": "string (MongoDB ID)",
    "fullName": "string",
    "email": "string"
  }
}
```

**Error Responses:**
- `400`: Missing required fields (fullName, email, password)
- `409`: Email already exists

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive tokens

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "status": 200,
  "accessToken": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid email or password

---

### 3. Logout User
**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user and invalidate refresh token

**Authentication:** Required

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Behavior:**
- Clears `refreshToken` from database
- Clears HTTP-only cookie
- Session is terminated

---

## Tournament Endpoints

### 1. Create Tournament
**Endpoint:** `POST /api/tournaments`

**Description:** Create a new tournament (Admin/Organizer only)

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string",
  "date": "string (ISO 8601)",
  "budget": "number",
  "minPlayers": "number",
  "maxPlayers": "number",
  "roles": [
    {
      "role": "string",
      "basePrice": "number",
      "biddingPrice": "number"
    }
  ],
  "rules": "string"
}
```

**Response (201):**
```json
{
  "message": "Tournament created successfully",
  "status": 201,
  "data": {
    "_id": "string",
    "name": "string",
    "date": "string",
    "budget": "number",
    "minPlayers": "number",
    "maxPlayers": "number",
    "roles": [
      {
        "role": "string",
        "basePrice": "number",
        "biddingPrice": "number"
      }
    ],
    "rules": "string",
    "createdBy": "string (User ID)"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (user is not admin or organizer)
- `400`: Invalid request body

---

### 2. Get Tournament by ID
**Endpoint:** `GET /api/tournaments/[id]`

**Description:** Retrieve tournament details by ID

**Authentication:** Required

**URL Parameters:**
- `id`: Tournament MongoDB ID

**Response (200):**
```json
{
  "data": {
    "_id": "string",
    "name": "string",
    "date": "string",
    "budget": "number",
    "minPlayers": "number",
    "maxPlayers": "number",
    "roles": [
      {
        "role": "string",
        "basePrice": "number",
        "biddingPrice": "number"
      }
    ],
    "rules": "string",
    "createdBy": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Tournament not found
- `400`: Invalid tournament ID

---

### 3. Update Tournament
**Endpoint:** `PUT /api/tournaments/[id]`

**Description:** Update tournament details

**Authentication:** Required

**URL Parameters:**
- `id`: Tournament MongoDB ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "date": "string (optional)",
  "budget": "number (optional)",
  "minPlayers": "number (optional)",
  "maxPlayers": "number (optional)",
  "rules": "string (optional)",
  "roles": "array (optional)"
}
```

**Response (200):**
```json
{
  "message": "Tournament updated successfully",
  "data": { /* updated tournament object */ }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Tournament not found
- `400`: Invalid request body or validation error

---

### 4. Get Tournament Roles (Dynamic)
**Endpoint:** `GET /api/tournaments/roles-dropdown`

**Description:** Get available roles for a tournament (optional auth)

**Authentication:** Optional

**Response (200):**
```json
{
  "data": [
    {
      "role": "string",
      "basePrice": "number",
      "biddingPrice": "number"
    }
  ]
}
```

---

### 5. Get Tournament Roles by Tournament ID
**Endpoint:** `GET /api/tournaments/[id]/roles-dropdown`

**Description:** Get roles for a specific tournament

**Authentication:** Optional

**URL Parameters:**
- `id`: Tournament MongoDB ID

**Response (200):**
```json
{
  "roles": [
    {
      "role": "string",
      "basePrice": "number",
      "biddingPrice": "number"
    }
  ],
  "status": 200
}
```

**Error Responses:**
- `404`: Tournament not found
- `500`: Server error

---

## Team Endpoints

### 1. Create Team
**Endpoint:** `POST /api/teams`

**Description:** Create a new team

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string",
  "owner": "string",
  "shortCode": "string (unique)"
}
```

**Response (201):**
```json
{
  "message": "Team created successfully",
  "status": 201,
  "data": {
    "_id": "string",
    "name": "string",
    "owner": "string",
    "shortCode": "string",
    "createdBy": "string (User ID)",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `400`: Missing required fields
- `409`: shortCode already exists

---

### 2. Get Team by ID
**Endpoint:** `GET /api/teams/[id]`

**Description:** Retrieve team details by ID

**Authentication:** Required

**URL Parameters:**
- `id`: Team MongoDB ID

**Response (200):**
```json
{
  "data": {
    "_id": "string",
    "name": "string",
    "owner": "string",
    "shortCode": "string",
    "createdBy": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Team not found
- `400`: Invalid team ID

---

### 3. Update Team
**Endpoint:** `PUT /api/teams/[id]`

**Description:** Update team details

**Authentication:** Required

**URL Parameters:**
- `id`: Team MongoDB ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "owner": "string (optional)",
  "shortCode": "string (optional)"
}
```

**Response (200):**
```json
{
  "message": "Team updated successfully",
  "data": { /* updated team object */ }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Team not found
- `400`: Invalid request body
- `409`: shortCode already exists

---

### 4. Delete Team
**Endpoint:** `DELETE /api/teams/[id]`

**Description:** Delete a team

**Authentication:** Required

**URL Parameters:**
- `id`: Team MongoDB ID

**Response (200):**
```json
{
  "message": "Team deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Team not found

---

## Tournament Players (Association) Endpoints

### 1. Add Player to Tournament
**Endpoint:** `POST /api/tournament-players`

**Description:** Add a player to a tournament

**Authentication:** Required

**Request Body:**
```json
{
  "tournamentId": "string",
  "playerId": "string"
}
```

**Response (201):**
```json
{
  "message": "Player added to tournament successfully",
  "data": {
    "_id": "string",
    "tournamentId": "string",
    "playerId": "string",
    "createdBy": "string (User ID)",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `400`: Missing tournamentId or playerId
- `409`: Player already added to this tournament
- `404`: Tournament or player not found

---

## Players Endpoint

### 1. Get Players
**Endpoint:** `GET /api/players`

**Description:** Retrieve list of players (Currently empty in implementation)

**Authentication:** Optional

**Response (200):**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "role": "string",
      "basePrice": "number"
    }
  ]
}
```

---

## Error Handling

### Common HTTP Status Codes
- `200`: Success
- `201`: Created successfully
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate entry)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "message": "string (error description)",
  "field": "string (optional, for validation errors)",
  "status": "number"
}
```

---

## Authentication & Authorization

### Role-Based Access Control
- **Admin**: Can create tournaments
- **Organizer**: Can create tournaments, teams, and manage tournament players
- **User**: Basic access

### Token Management
- **Access Token**: JWT token for API authentication
- **Refresh Token**: HTTP-only cookie for session persistence
- Both tokens generated on login/register

---

## Data Types & Validation

### RolePricing Object
```typescript
{
  role: string;
  basePrice: number;
  biddingPrice: number;
}
```

### Tournament Object
```typescript
{
  name: string;
  date: string (ISO 8601);
  budget: number;
  minPlayers: number;
  maxPlayers: number;
  roles: RolePricing[];
  rules: string;
}
```

### Team Object
```typescript
{
  name: string;
  owner: string;
  shortCode: string (unique);
}
```

### Player Object
```typescript
{
  id: string;
  name: string;
  role: string;
  basePrice: number;
}
```

---

## Implementation Notes

1. **Database Connection**: All endpoints connect to MongoDB via `connectDB()`
2. **Authentication Verification**: Protected endpoints verify JWT token via `verifyAuth(middleware)`
3. **Validation**: Request bodies are validated for required fields
4. **Error Handling**: Proper HTTP status codes and error messages returned
5. **Organizer Isolation**: Players and tournaments are isolated per organizer via `createdBy` field
6. **Async Operations**: All database operations are async/await based

---