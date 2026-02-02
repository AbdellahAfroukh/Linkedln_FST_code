// User types
export type UserType = 'enseignant' | 'doctorant' | 'admin';

export interface User {
  id: number;
  email: string;
  fullName: string;
  user_type: UserType;
  profile_completed: boolean;
  otp_configured: boolean;
  nom?: string;
  prenom?: string;
  grade?: string;
  dateDeNaissance?: string;
  photoDeProfil?: string;
  numeroDeSomme?: string;
  universityId?: number;
  etablissementId?: number;
  departementId?: number;
  laboratoireId?: number;
  equipeId?: number;
  specialiteId?: number;
  thematiqueDeRechercheId?: number;
}

export interface UserBasicInfo {
  id: number;
  fullName: string;
  photoDeProfil?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  user_type: UserType;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Token2FAResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  requires_2fa: boolean;
  user?: User;
}

export interface ProfileCompleteRequest {
  nom: string;
  prenom: string;
  grade?: string;
  dateDeNaissance?: string;
  photoDeProfil?: string;
  universityId?: number;
  etablissementId?: number;
  departementId?: number;
  laboratoireId?: number;
  equipeId?: number;
  specialiteId?: number;
  thematiqueDeRechercheId?: number;
  numeroDeSomme?: string;
}

export interface OTPSetupResponse {
  secret: string;
  qr_code: string;
  uri: string;
}

export interface OTPVerifyRequest {
  token: string;
  email: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface Disable2FARequest {
  password: string;
}

// Organization types
export interface University {
  id: number;
  nom: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  Logo?: string;
}

export interface UniversityCreate {
  nom: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  Logo?: string;
}

export interface UniversityUpdate extends Partial<UniversityCreate> {}

export interface Etablissement {
  id: number;
  nom: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  Logo?: string;
  universityId?: number;
}

export interface EtablissementCreate {
  nom: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  Logo?: string;
  universityId?: number;
}

export interface EtablissementUpdate extends Partial<EtablissementCreate> {}

export interface Departement {
  id: number;
  nom: string;
  description?: string;
  etablissementId?: number;
}

export interface DepartementCreate {
  nom: string;
  description?: string;
  etablissementId?: number;
}

export interface DepartementUpdate extends Partial<DepartementCreate> {}

export interface Laboratoire {
  id: number;
  nom: string;
  description?: string;
  univesityId?: number;
}

export interface LaboratoireCreate {
  nom: string;
  description?: string;
  univesityId?: number;
}

export interface LaboratoireUpdate extends Partial<LaboratoireCreate> {}

export interface Equipe {
  id: number;
  nom: string;
  description?: string;
  universityId?: number;
}

export interface EquipeCreate {
  nom: string;
  description?: string;
  universityId?: number;
}

export interface EquipeUpdate extends Partial<EquipeCreate> {}

export interface Specialite {
  id: number;
  nom: string;
  description?: string;
}

export interface SpecialiteCreate {
  nom: string;
  description?: string;
}

export interface SpecialiteUpdate extends Partial<SpecialiteCreate> {}

export interface ThematiqueDeRecherche {
  id: number;
  nom: string;
  description?: string;
}

export interface ThematiqueDeRechercheCreate {
  nom: string;
  description?: string;
}

export interface ThematiqueDeRechercheUpdate extends Partial<ThematiqueDeRechercheCreate> {}

// Admin user management types
export interface UserListResponse {
  total: number;
  users: User[];
}

export interface UserDetailResponse extends User {}

export interface UserUpdateByAdmin {
  email?: string;
  fullName?: string;
  user_type?: UserType;
  profile_completed?: boolean;
  nom?: string;
  prenom?: string;
  universityId?: number;
  etablissementId?: number;
  departementId?: number;
  laboratoireId?: number;
  equipeId?: number;
  specialiteId?: number;
  thematiqueDeRechercheId?: number;
}

export interface PlatformStatistics {
  totalUsers: number;
  totalEnseignants: number;
  totalDoctorants: number;
  totalAdmins: number;
  totalPosts: number;
  totalComments: number;
  totalProjets: number;
  totalConnections: number;
}

// CV types
export interface CV {
  id: number;
  userId: number;
  description?: string;
  dateCreation: string;
  dateModification: string;
  isPublic: boolean;
  isEnabled: boolean;
}

export interface CVCreate {
  description?: string;
  isPublic?: boolean;
  isEnabled?: boolean;
}

export interface CVUpdate {
  description?: string;
  isPublic?: boolean;
  isEnabled?: boolean;
}

export interface Contact {
  id: number;
  cvId: number;
  telephone?: string;
  adressePostale?: string;
  siteWeb?: string;
  LinkedIn?: string;
  GitHub?: string;
}

export interface ContactCreate {
  telephone?: string;
  adressePostale?: string;
  siteWeb?: string;
  LinkedIn?: string;
  GitHub?: string;
}

export interface Formation {
  id: number;
  cvId: number;
  titre: string;
  etablissement: string;
  anneeDebut: number;
  anneeFin?: number;
  description?: string;
  isHigherEducation: boolean;
}

export interface FormationCreate {
  titre: string;
  etablissement: string;
  anneeDebut: number;
  anneeFin?: number;
  description?: string;
  isHigherEducation?: boolean;
}

export interface Competence {
  id: number;
  cvId: number;
  nom: string;
  niveau?: string;
}

export interface CompetenceCreate {
  nom: string;
  niveau?: string;
}

export interface Langue {
  id: number;
  cvId: number;
  nom: string;
  niveau?: string;
}

export interface LangueCreate {
  nom: string;
  niveau?: string;
}

export interface Experience {
  id: number;
  cvId: number;
  titre: string;
  entreprise: string;
  dateDebut: string;
  dateFin?: string;
  description?: string;
}

export interface ExperienceCreate {
  titre: string;
  entreprise: string;
  dateDebut: string;
  dateFin?: string;
  description?: string;
}

// Connection types
export interface Connection {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
  sender?: UserBasicInfo;
  receiver?: UserBasicInfo;
}

export interface ConnectionCreate {
  receiverId: number;
}

// Chat types
export interface Chat {
  id: number;
  user1Id: number;
  user2Id: number;
  lastMessageAt?: string;
  user1?: UserBasicInfo;
  user2?: UserBasicInfo;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  timestamp: string;
  sender?: UserBasicInfo;
}

export interface MessageCreate {
  receiverId: number;
  content: string;
}

export interface ChatDetailResponse extends Chat {
  messages: Message[];
}

// Post types
export type ReactionType = 'like' | 'love' | 'funny' | 'angry' | 'sad' | 'dislike';

export interface Post {
  id: number;
  content: string;
  timestamp: string;
  attachement?: string;
  isPublic: boolean;
  userId: number;
  user: UserBasicInfo;
  comments: Comment[];
  reactions: Reaction[];
}

export interface PostCreate {
  content: string;
  attachement?: string;
  isPublic?: boolean;
}

export interface PostUpdate {
  content?: string;
  attachement?: string;
  isPublic?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  timestamp: string;
  postId: number;
  userId: number;
  user: UserBasicInfo;
  reactions: Reaction[];
}

export interface CommentCreate {
  content: string;
}

export interface CommentUpdate {
  content: string;
}

export interface Reaction {
  id: number;
  type: ReactionType;
  timestamp: string;
  userId: number;
  user: UserBasicInfo;
}

export interface ReactionCreate {
  type: ReactionType;
}

export interface PostListResponse {
  total: number;
  posts: Post[];
}

// Google Scholar types
export interface GoogleScholarIntegration {
  id: number;
  userId: number;
  googleScholarId: string;
  lastSyncedAt?: string;
}

export interface GoogleScholarLink {
  googleScholarId: string;
}

export interface Publication {
  id: number;
  integrationId: number;
  title: string;
  authors?: string;
  publicationDate?: string;
  journal?: string;
  citations?: number;
  link?: string;
  isPosted: boolean;
}

export interface PublicationListResponse {
  total: number;
  publications: Publication[];
}

export interface SyncPublicationsResponse {
  message: string;
  syncedCount: number;
  newPublications: number;
  updatedPublications: number;
}

// Projet types
export interface Projet {
  id: number;
  titre: string;
  description: string;
  budget: number;
  dateDebut: string;
  dureeEnMois: number;
  statut: string;
  userId: number;
  user?: UserBasicInfo;
}

export interface ProjetCreate {
  titre: string;
  description: string;
  budget: number;
  dateDebut: string;
  dureeEnMois: number;
  statut: string;
}

export interface ProjetUpdate {
  titre?: string;
  description?: string;
  budget?: number;
  dateDebut?: string;
  dureeEnMois?: number;
  statut?: string;
}

export interface ProjetListResponse {
  total: number;
  projets: Projet[];
}

// Common API response types
export interface ApiError {
  detail: string | Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

export interface SuccessResponse {
  message: string;
}
