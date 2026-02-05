# API Inventory - Academic Platform Backend

## Base Configuration

- **Base URL**: `http://localhost:8000` (configurable via environment)
- **API Prefix**: None (direct routes)
- **Authentication**: JWT Bearer Token
- **CORS**: Enabled for all origins (development mode)
- **OpenAPI Docs**: Available at `/docs`

## Authentication Method

### JWT Bearer Token Authentication

- **Header**: `Authorization: Bearer <access_token>`
- **Token Type**: JWT (HS256 algorithm)
- **Access Token Expiry**: 30 minutes
- **Refresh Token Expiry**: 7 days
- **2FA Support**: TOTP (Time-based One-Time Password)

### Token Storage Strategy

- Store tokens in memory + localStorage
- Attach Authorization header to all authenticated requests
- Implement token refresh flow before expiry

---

## API Endpoints by Feature

### 1. Authentication (`/auth`)

**Tag**: Authentication

#### POST `/auth/register`

- **Description**: Register a new user
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "user_type": "enseignant|doctorant|admin"
  }
  ```
- **Response**: `UserResponse` (201)
- **Errors**: 400 (validation), 409 (email exists)

#### POST `/auth/login`

- **Description**: Login with email and password
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: `Token2FA` (200)
  ```json
  {
    "access_token": "string",
    "refresh_token": "string",
    "token_type": "bearer",
    "requires_2fa": false,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "user_type": "enseignant",
      "profile_completed": true,
      "otp_configured": false
    }
  }
  ```
- **Errors**: 401 (invalid credentials)

#### POST `/auth/complete-profile`

- **Description**: Complete user profile (enseignant/doctorant only)
- **Auth Required**: Yes (Bearer Token)
- **Request Body**:
  ```json
  {
    "nom": "Doe",
    "prenom": "John",
    "universityId": 1,
    "etablissementId": 1,
    "departementId": 1,
    "laboratoireId": 1,
    "equipeId": 1,
    "specialiteId": 1,
    "thematiqueDeRechercheId": 1,
    "numeroDeSomme": "ENS123" // Required for enseignant
  }
  ```
- **Response**: `UserResponse` (200)
- **Errors**: 403 (admin user), 400 (validation)

#### POST `/auth/setup-2fa`

- **Description**: Setup 2FA for current user
- **Auth Required**: Yes
- **Response**: `OTPSetup` (200)
  ```json
  {
    "secret": "BASE32SECRET",
    "qr_code": "data:image/png;base64,...",
    "uri": "otpauth://totp/..."
  }
  ```

#### POST `/auth/enable-2fa`

- **Description**: Verify and enable 2FA
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "token": "123456",
    "email": "user@example.com"
  }
  ```
- **Response**: `{"message": "2FA enabled successfully"}` (200)

#### POST `/auth/verify-2fa`

- **Description**: Verify 2FA token during login
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "token": "123456",
    "email": "user@example.com"
  }
  ```
- **Response**: `TokenResponse` (200)

#### POST `/auth/disable-2fa`

- **Description**: Disable 2FA
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "password": "password123"
  }
  ```
- **Response**: `{"message": "2FA disabled successfully"}` (200)

#### POST `/auth/refresh`

- **Description**: Refresh access token
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "refresh_token": "string"
  }
  ```
- **Response**: `TokenResponse` (200)

#### GET `/auth/me`

- **Description**: Get current user information
- **Auth Required**: Yes
- **Response**: `UserResponse` (200)

#### POST `/auth/logout`

- **Description**: Logout current user
- **Auth Required**: Yes
- **Response**: `{"message": "Logged out successfully"}` (200)

---

### 2. Admin - Organization Management (`/admin`)

**Tag**: Admin - Organisation Management  
**Auth Required**: All endpoints require admin role

#### Universities

**POST `/admin/universities`**

- Create university
- Body: `UniversityCreate` (nom, adresse, ville, pays, Logo)
- Response: `UniversityResponse` (201)

**GET `/admin/universities`**

- List all universities
- Response: `List[UniversityResponse]` (200)

**GET `/admin/universities/{university_id}`**

- Get university by ID
- Response: `UniversityResponse` (200)

**PUT `/admin/universities/{university_id}`**

- Update university
- Body: `UniversityUpdate`
- Response: `UniversityResponse` (200)

**DELETE `/admin/universities/{university_id}`**

- Delete university
- Response: `{"message": "..."}` (200)

#### Etablissements

**POST `/admin/etablissements`**

- Create etablissement
- Body: `EtablissementCreate` (nom, adresse, ville, pays, Logo, universityId)
- Response: `EtablissementResponse` (201)

**GET `/admin/etablissements`**

- List all etablissements
- Response: `List[EtablissementResponse]` (200)

**GET `/admin/etablissements/{etablissement_id}`**

- Get etablissement by ID
- Response: `EtablissementResponse` (200)

**PUT `/admin/etablissements/{etablissement_id}`**

- Update etablissement
- Body: `EtablissementUpdate`
- Response: `EtablissementResponse` (200)

**DELETE `/admin/etablissements/{etablissement_id}`**

- Delete etablissement
- Response: `{"message": "..."}` (200)

#### Departements

**POST `/admin/departements`**

- Create departement
- Body: `DepartementCreate` (nom, description, etablissementId)
- Response: `DepartementResponse` (201)

**GET `/admin/departements`**

- List all departements
- Response: `List[DepartementResponse]` (200)

**GET `/admin/departements/{departement_id}`**

- Get departement by ID
- Response: `DepartementResponse` (200)

**PUT `/admin/departements/{departement_id}`**

- Update departement
- Body: `DepartementUpdate`
- Response: `DepartementResponse` (200)

**DELETE `/admin/departements/{departement_id}`**

- Delete departement
- Response: `{"message": "..."}` (200)

#### Laboratoires

**POST `/admin/laboratoires`**

- Create laboratoire
- Body: `LaboratoireCreate` (nom, description, univesityId)
- Response: `LaboratoireResponse` (201)

**GET `/admin/laboratoires`**

- List all laboratoires
- Response: `List[LaboratoireResponse]` (200)

**GET `/admin/laboratoires/{laboratoire_id}`**

- Get laboratoire by ID
- Response: `LaboratoireResponse` (200)

**PUT `/admin/laboratoires/{laboratoire_id}`**

- Update laboratoire
- Body: `LaboratoireUpdate`
- Response: `LaboratoireResponse` (200)

**DELETE `/admin/laboratoires/{laboratoire_id}`**

- Delete laboratoire
- Response: `{"message": "..."}` (200)

#### Equipes

**POST `/admin/equipes`**

- Create equipe
- Body: `EquipeCreate` (nom, description, universityId)
- Response: `EquipeResponse` (201)

**GET `/admin/equipes`**

- List all equipes
- Response: `List[EquipeResponse]` (200)

**GET `/admin/equipes/{equipe_id}`**

- Get equipe by ID
- Response: `EquipeResponse` (200)

**PUT `/admin/equipes/{equipe_id}`**

- Update equipe
- Body: `EquipeUpdate`
- Response: `EquipeResponse` (200)

**DELETE `/admin/equipes/{equipe_id}`**

- Delete equipe
- Response: `{"message": "..."}` (200)

#### Specialites

**POST `/admin/specialites`**

- Create specialite
- Body: `SpecialiteCreate` (nom, description)
- Response: `SpecialiteResponse` (201)

**GET `/admin/specialites`**

- List all specialites
- Response: `List[SpecialiteResponse]` (200)

**GET `/admin/specialites/{specialite_id}`**

- Get specialite by ID
- Response: `SpecialiteResponse` (200)

**PUT `/admin/specialites/{specialite_id}`**

- Update specialite
- Body: `SpecialiteUpdate`
- Response: `SpecialiteResponse` (200)

**DELETE `/admin/specialites/{specialite_id}`**

- Delete specialite
- Response: `{"message": "..."}` (200)

#### Thematiques de Recherche

**POST `/admin/thematiques`**

- Create thematique
- Body: `ThematiqueDeRechercheCreate` (nom, description)
- Response: `ThematiqueDeRechercheResponse` (201)

**GET `/admin/thematiques`**

- List all thematiques
- Response: `List[ThematiqueDeRechercheResponse]` (200)

**GET `/admin/thematiques/{thematique_id}`**

- Get thematique by ID
- Response: `ThematiqueDeRechercheResponse` (200)

**PUT `/admin/thematiques/{thematique_id}`**

- Update thematique
- Body: `ThematiqueDeRechercheUpdate`
- Response: `ThematiqueDeRechercheResponse` (200)

**DELETE `/admin/thematiques/{thematique_id}`**

- Delete thematique
- Response: `{"message": "..."}` (200)

#### User Management

**GET `/admin/users`**

- List all users with optional filtering
- Query Params: `skip` (default: 0), `limit` (default: 100, max: 500), `user_type` (optional filter)
- Response: `UserListResponse` (200)

**GET `/admin/users/search`**

- Search users by name or email
- Query Params: `q` (required), `skip`, `limit`
- Response: `UserListResponse` (200)

**GET `/admin/users/{user_id}`**

- Get user details
- Response: `UserDetailResponse` (200)

**PATCH `/admin/users/{user_id}`**

- Update user
- Body: `UserUpdateByAdmin`
- Response: `UserDetailResponse` (200)

**DELETE `/admin/users/{user_id}`**

- Delete user
- Response: `{"message": "..."}` (200)

**PATCH `/admin/users/{user_id}/toggle-activation`**

- Activate/deactivate user
- Query Params: `active` (boolean, required)
- Response: `UserDetailResponse` (200)

#### Content Moderation

**GET `/admin/posts`**

- List all posts
- Query Params: `skip`, `limit`
- Response: Post list (200)

**GET `/admin/posts/{post_id}`**

- Get post details
- Response: Post details (200)

**DELETE `/admin/posts/{post_id}`**

- Delete post
- Response: `{"message": "..."}` (200)

**DELETE `/admin/users/{user_id}/posts`**

- Delete all posts from user
- Response: `{"message": "..."}` (200)

**GET `/admin/comments`**

- List all comments
- Query Params: `skip`, `limit`
- Response: Comment list (200)

**DELETE `/admin/comments/{comment_id}`**

- Delete comment
- Response: `{"message": "..."}` (200)

**GET `/admin/projets`**

- List all projets
- Query Params: `skip`, `limit`
- Response: Projet list (200)

**DELETE `/admin/projets/{projet_id}`**

- Delete projet
- Response: `{"message": "..."}` (200)

#### Platform Statistics

**GET `/admin/statistics`**

- Get platform statistics
- Response: `PlatformStatistics` (200)

---

### 3. CV Management (`/cv`)

**Tag**: CV  
**Auth Required**: All endpoints require authentication

#### CV Operations

**POST `/cv/create`**

- Create CV for current user
- Body: `CVCreate` (description, isPublic, isEnabled)
- Response: CV object (201)

**GET `/cv/`**

- Get current user's CV
- Response: Full CV with all sections (200)

**PATCH `/cv/update`**

- Update CV fields
- Body: `CVUpdate` (description, isPublic, isEnabled)
- Response: Updated CV (200)

**POST `/cv/set-public`**

- Set CV visibility
- Query Params: `is_public` (boolean)
- Response: `{"isPublic": boolean}` (200)

**POST `/cv/enable`**

- Enable CV
- Response: CV object (200)

**POST `/cv/disable`**

- Disable CV
- Response: CV object (200)

#### Contact

**POST `/cv/contact`**

- Add contact information
- Body: `ContactCreate` (telephone, adressePostale, siteWeb, LinkedIn, GitHub)
- Response: Contact object (201)

**GET `/cv/contact`**

- Get contact information
- Response: Contact list (200)

**PATCH `/cv/contact/{contact_id}`**

- Update contact
- Body: Partial contact fields
- Response: Updated contact (200)

#### Formation

**POST `/cv/formation`**

- Add formation
- Body: `FormationCreate` (titre, etablissement, anneeDebut, anneeFin, description, isHigherEducation)
- Response: Formation object (201)

**GET `/cv/formations`**

- Get all formations
- Response: Formation list (200)

**PATCH `/cv/formation/{formation_id}`**

- Update formation
- Body: Partial formation fields
- Response: Updated formation (200)

#### Competence

**POST `/cv/competence`**

- Add competence/skill
- Body: `CompetenceCreate` (nom, niveau)
- Response: Competence object (201)

**GET `/cv/competences`**

- Get all competences
- Response: Competence list (200)

**PATCH `/cv/competence/{competence_id}`**

- Update competence
- Body: Partial competence fields
- Response: Updated competence (200)

#### Langue

**POST `/cv/langue`**

- Add language
- Body: `LangueCreate` (nom, niveau)
- Response: Langue object (201)

**GET `/cv/langues`**

- Get all languages
- Response: Langue list (200)

**PATCH `/cv/langue/{langue_id}`**

- Update langue
- Body: Partial langue fields
- Response: Updated langue (200)

#### Experience

**POST `/cv/experience`**

- Add experience
- Body: `ExperienceCreate` (titre, entreprise, dateDebut, dateFin, description)
- Response: Experience object (201)

**GET `/cv/experiences`**

- Get all experiences
- Response: Experience list (200)

**PATCH `/cv/experience/{experience_id}`**

- Update experience
- Body: Partial experience fields
- Response: Updated experience (200)

---

### 4. Connections (`/connections`)

**Tag**: connections  
**Auth Required**: All endpoints require authentication

**POST `/connections/send`**

- Send connection request
- Body: `ConnectionCreate` (receiverId)
- Response: `ConnectionResponse` (200)

**POST `/connections/{connection_id}/accept`**

- Accept connection request
- Response: `ConnectionResponse` (200)

**POST `/connections/{connection_id}/reject`**

- Reject connection request
- Response: `ConnectionResponse` (200)

**GET `/connections/accepted`**

- List accepted connections
- Response: `List[ConnectionResponse]` (200)

**GET `/connections/pending/incoming`**

- List incoming pending requests
- Response: `List[ConnectionResponse]` (200)

**GET `/connections/pending/outgoing`**

- List outgoing pending requests
- Response: `List[ConnectionResponse]` (200)

**DELETE `/connections/{connection_id}`**

- Delete/remove connection
- Response: `{"message": "..."}` (200)

**GET `/connections/{user_id}/mutual`**

- Get mutual connections with user
- Response: `List[ConnectionResponse]` (200)

---

### 5. Chat/Messaging (`/chats`)

**Tag**: chats  
**Auth Required**: All endpoints require authentication

**POST `/chats/message`**

- Send a message (creates chat if doesn't exist)
- Body: `MessageCreate` (receiverId, content)
- Response: `MessageResponse` (200)

**GET `/chats`**

- List all chats for current user
- Response: `List[ChatResponse]` (200)

**GET `/chats/{chat_id}`**

- Get chat detail with messages
- Response: `ChatDetailResponse` (200)

**GET `/chats/{chat_id}/messages`**

- Get messages from specific chat
- Response: `List[MessageResponse]` (200)

**POST `/chats/with/{user_id}`**

- Get or create chat with user
- Response: `ChatResponse` (200)

**DELETE `/chats/{chat_id}`**

- Delete chat and all messages
- Response: `{"message": "..."}` (200)

---

### 6. Posts (`/posts`)

**Tag**: Posts  
**Auth Required**: All endpoints require authentication

#### Post Operations

**POST `/posts/`**

- Create new post
- Body: `PostCreate` (content, attachement, isPublic)
- Response: `PostResponse` (201)

**GET `/posts/feed`**

- Get personalized feed
- Query Params: `skip` (default: 0), `limit` (default: 50, max: 100)
- Response: `PostListResponse` (200)

**GET `/posts/user/{user_id}`**

- Get posts by specific user
- Query Params: `skip`, `limit`
- Response: `PostListResponse` (200)

**GET `/posts/{post_id}`**

- Get specific post
- Response: `PostResponse` (200)

**PATCH `/posts/{post_id}`**

- Update post (owner only)
- Body: `PostUpdate`
- Response: `PostResponse` (200)

**DELETE `/posts/{post_id}`**

- Delete post (owner only)
- Response: `{"message": "..."}` (200)

#### Comment Operations

**POST `/posts/{post_id}/comments`**

- Add comment to post
- Body: `CommentCreate` (content)
- Response: `CommentResponse` (201)

**PATCH `/posts/comments/{comment_id}`**

- Update comment (owner only)
- Body: `CommentUpdate` (content)
- Response: `CommentResponse` (200)

**DELETE `/posts/comments/{comment_id}`**

- Delete comment (owner or post owner)
- Response: `{"message": "..."}` (200)

#### Reaction Operations

**POST `/posts/{post_id}/reactions`**

- Add/update reaction to post
- Body: `ReactionCreate` (type: like|love|funny|angry|sad|dislike)
- Response: `ReactionResponse` (200)

**DELETE `/posts/{post_id}/reactions`**

- Remove reaction from post
- Response: `{"message": "..."}` (200)

**POST `/posts/comments/{comment_id}/reactions`**

- Add/update reaction to comment
- Body: `ReactionCreate` (type)
- Response: `ReactionResponse` (200)

**DELETE `/posts/comments/{comment_id}/reactions`**

- Remove reaction from comment
- Response: `{"message": "..."}` (200)

**GET `/posts/{post_id}/reactions`**

- Get all reactions for post
- Response: Reaction list (200)

---

### 7. Google Scholar (`/google-scholar`)

**Tag**: Google Scholar  
**Auth Required**: All endpoints require authentication

**POST `/google-scholar/link`**

- Link Google Scholar account
- Body: `GoogleScholarLink` (googleScholarId)
- Response: `GoogleScholarIntegrationResponse` (201)

**PUT `/google-scholar/update`**

- Update Google Scholar ID
- Body: `GoogleScholarLink` (googleScholarId)
- Response: `GoogleScholarIntegrationResponse` (200)

**GET `/google-scholar/integration`**

- Get current integration details
- Response: `GoogleScholarIntegrationResponse` (200)

**POST `/google-scholar/sync`**

- Sync publications from Google Scholar
- Response: `SyncPublicationsResponse` (200)

**GET `/google-scholar/publications`**

- Get user's publications
- Query Params: `skip` (default: 0), `limit` (default: 100, max: 100)
- Response: `PublicationListResponse` (200)

**GET `/google-scholar/publications/{publication_id}`**

- Get publication details
- Response: `PublicationResponse` (200)

**PATCH `/google-scholar/publications/{publication_id}/toggle-post`**

- Toggle publication posted status
- Query Params: `is_posted` (boolean, required)
- Response: `PublicationResponse` (200)

**DELETE `/google-scholar/unlink`**

- Unlink Google Scholar (deletes integration and publications)
- Response: `{"message": "..."}` (200)

---

### 8. Projets (`/projets`)

**Tag**: Projets  
**Auth Required**: All endpoints require authentication

**POST `/projets/`**

- Create projet (enseignant only)
- Body: `ProjetCreate` (titre, description, budget, dateDebut, dureeEnMois, statut)
- Response: `ProjetResponse` (201)

**GET `/projets/my-projets`**

- Get current user's projets (enseignant only)
- Query Params: `skip`, `limit`
- Response: `ProjetListResponse` (200)

**GET `/projets/`**

- Get all projets
- Query Params: `skip`, `limit`, `statut` (optional filter)
- Response: `ProjetListResponse` (200)

**GET `/projets/search`**

- Search projets by title or description
- Query Params: `q` (required), `skip`, `limit`
- Response: `ProjetListResponse` (200)

**GET `/projets/user/{user_id}`**

- Get projets by specific user
- Query Params: `skip`, `limit`
- Response: `ProjetListResponse` (200)

**GET `/projets/{projet_id}`**

- Get specific projet
- Response: `ProjetResponse` (200)

**PATCH `/projets/{projet_id}`**

- Update projet (owner, enseignant only)
- Body: `ProjetUpdate`
- Response: `ProjetResponse` (200)

**DELETE `/projets/{projet_id}`**

- Delete projet (owner, enseignant only)
- Response: `{"message": "..."}` (200)

---

### 9. Uploads (`/upload`)

**Tag**: Upload  
**Auth Required**: All endpoints require authentication

**POST `/upload/image`**

- Upload image (jpg, jpeg, png, gif, webp, svg)
- Body: `multipart/form-data` with `file`
- Response:
  ```json
  {
    "url": "/upload/files/<filename>",
    "filename": "original-name.jpg"
  }
  ```

**POST `/upload/document`**

- Upload document (pdf, doc, docx, txt, xls, xlsx)
- Body: `multipart/form-data` with `file`
- Response:
  ```json
  {
    "url": "/upload/files/<filename>",
    "filename": "original-name.pdf"
  }
  ```

**GET `/upload/files/{filename}`**

- Serve uploaded file
- Response: File stream (200)

---

## Common Response Patterns

### Success Responses

- **200 OK**: Successful GET, PATCH, POST (update/action)
- **201 Created**: Successful POST (create)
- **204 No Content**: Successful DELETE (rarely used, usually returns 200 with message)

### Error Responses

- **400 Bad Request**: Validation errors, invalid request
  ```json
  {
    "detail": "Validation error message"
  }
  ```
- **401 Unauthorized**: Missing or invalid JWT token
  ```json
  {
    "detail": "Could not validate credentials"
  }
  ```
- **403 Forbidden**: Insufficient permissions
  ```json
  {
    "detail": "Access denied. Required role: admin"
  }
  ```
- **404 Not Found**: Resource not found
  ```json
  {
    "detail": "Resource not found"
  }
  ```
- **422 Unprocessable Entity**: Pydantic validation errors
  ```json
  {
    "detail": [
      {
        "loc": ["body", "email"],
        "msg": "value is not a valid email address",
        "type": "value_error.email"
      }
    ]
  }
  ```

---

## User Roles and Permissions

### Role Types (UserType enum)

- **admin**: Full system access
- **enseignant**: Teacher/professor with projet creation rights
- **doctorant**: PhD student/researcher

### Role-Based Access Control

#### Admin-Only Endpoints

- All `/admin/*` endpoints
- Organization CRUD (universities, etablissements, etc.)
- User management
- Content moderation
- Platform statistics

#### Enseignant/Admin Endpoints

- Create projets
- Manage own projets

#### Doctorant/Admin Endpoints

- Currently same as authenticated user

#### All Authenticated Users

- CV management
- Connections
- Chat/messaging
- Posts, comments, reactions
- Google Scholar integration
- View projets (read-only for doctorants)

### Profile Completion Requirements

- Login returns `profile_completed` flag
- Some features may require completed profile (check dependencies)
- Profile completion requires organizat organization IDs (universityId, etc.)

---

## Key Technical Details

### JWT Token Structure

- **Access Token**: 30-minute expiry, used for API authentication
- **Refresh Token**: 7-day expiry, used to get new access token
- **Payload**: Contains `sub` (user ID), `exp` (expiry), `type` (access/refresh)

### 2FA Flow

1. User registers/logs in normally
2. Call `/auth/setup-2fa` to get QR code
3. Scan QR code in authenticator app
4. Call `/auth/enable-2fa` with test token to verify setup
5. On next login, if `requires_2fa: true`, prompt for token
6. Call `/auth/verify-2fa` to complete login and get tokens

### Pagination Pattern

- Query params: `skip` (offset), `limit` (page size)
- Response includes `total` count and paginated items array
- Default limits vary by endpoint (typically 50-100)

### File Upload Pattern

- No file upload endpoints detected in current API
- Attachments/images appear to use URL strings (external hosting)
- `attachement` field in posts, `photoDeProfil` in users, etc.

---

## Frontend Integration Checklist

### Must-Have Features

✅ JWT authentication with token refresh  
✅ Role-based routing and UI components  
✅ Protected routes requiring auth  
✅ Login/logout with 2FA support  
✅ Profile completion flow for new users  
✅ Form validation matching backend Pydantic constraints  
✅ Error handling for 400/401/403/422 responses  
✅ Loading states and skeleton loaders  
✅ Toast notifications for success/error  
✅ Pagination for list views  
✅ Search and filter functionality

### Feature-Specific Requirements

- **Admin Panel**: Full CRUD for all organization entities and user management
- **CV Builder**: Multi-section form with add/edit/delete for each section
- **Posts Feed**: Infinite scroll, reactions (6 types), nested comments
- **Connections**: Request/accept/reject flow, mutual connections
- **Chat**: Real-time message list, conversation threads
- **Projets**: Create (enseignant), search, filter by status
- **Google Scholar**: QR code display for linking, publication sync

---

## Environment Variables Required

```env
VITE_API_BASE_URL=http://localhost:8000
```

Optional:

```env
VITE_ENABLE_MOCK_MODE=false
VITE_DEBUG_MODE=true
```
