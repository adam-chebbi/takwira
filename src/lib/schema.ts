import { Timestamp } from 'firebase/firestore';

export type UserRole = 'player' | 'manager' | 'admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  city: string;
  avatarUrl?: string;
  createdAt: Timestamp;
  isActive: boolean;
}

export interface Complex {
  id: string;
  managerId: string;
  name: string;
  address: string;
  city: string;
  governorate: string;
  lat: number;
  lng: number;
  photos: string[];
  description: string;
  openingTime: string; // "HH:MM"
  closingTime: string; // "HH:MM"
  isVerified: boolean;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Terrain {
  id: string;
  complexId: string;
  complexName: string;
  managerId: string;
  name: string;
  type: '6vs6' | '7vs7';
  maxPlayers: number;
  amenities: ('vestiaires' | 'eclairage' | 'parking' | 'buvette' | 'tribune')[];
  photos: string[];
  pricePerHour: number;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Reservation {
  id: string;
  terrainId: string;
  complexId: string;
  managerId: string;
  organizerId: string;
  organizerName: string;
  organizerPhone: string;
  matchTitle?: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  status: 'pending' | 'confirmed' | 'cancelled';
  isRecurring: boolean;
  recurrenceId?: string;
  internalNote?: string;
  createdAt: Timestamp;
}

export interface Recurrence {
  id: string;
  terrainId: string;
  complexId: string;
  managerId: string;
  clientName: string;
  clientPhone: string;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Match {
  id: string;
  reservationId?: string;
  terrainId?: string;
  terrainName?: string;
  complexName?: string;
  organizerId: string;
  organizerName: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  format: '6vs6' | '7vs7';
  maxPlayers: number;
  linkToken: string;
  teamA: string[];
  teamB: string[];
  teamsPublished: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Timestamp;
}

export interface MatchPlayer {
  id: string;
  matchId: string;
  playerName: string;
  playerPhone?: string;
  userId?: string;
  status: 'confirmed' | 'absent' | 'waiting';
  joinedAt: Timestamp;
}

export interface MatchMessage {
  id: string;
  matchId: string;
  senderId: string; // userId or 'anonymous'
  senderName: string;
  senderAvatarColor: string;
  text: string;
  createdAt: Timestamp;
  isDeleted: boolean;
}

export interface Tournament {
  id: string;
  title: string;
  locationId?: string; // complexId
  locationName: string;
  address: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  pricePerTeam: number;
  format: '5v5' | '6v6' | '7v7' | '11v11';
  maxTeams: number;
  currentTeams: number;
  prizes: string[];
  level: 'Open' | 'Pro' | 'Entreprise' | 'U18';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  photoUrl?: string;
  createdAt: Timestamp;
}

export interface Review {
  id: string;
  terrainId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp;
}

export interface Academy {
  id: string;
  complexId: string;
  managerId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  trainingDays: number[];
  trainingTime: string;
  terrainId?: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface AcademyMember {
  id: string;
  userId?: string;
  academyId: string;
  complexId: string;
  managerId: string;
  fullName: string;
  phone: string;
  parentPhone?: string;
  birthDate?: string;
  subscriptionType: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  subscriptionStart: string;
  subscriptionEnd: string;
  status: 'active' | 'expiring_soon' | 'expired';
  notes?: string;
  createdAt: Timestamp;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'Actualités' | 'Conseils' | 'Terrains' | 'Interviews' | 'Communauté';
  tags: string[];
  coverImageUrl: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewCount: number;
  readTime: string;
}

export interface AdSlot {
  id: string;
  name: string;
  title: string; // for internal use or display
  imageUrl: string;
  linkUrl: string;
  altText: string;
  position: 'blog_list_between' | 'blog_post_inline' | 'blog_sidebar_top' | 'blog_sidebar_bottom';
  isActive: boolean;
  startDate: Timestamp;
  endDate: Timestamp | null;
  impressionCount: number;
  clickCount: number;
  createdAt: Timestamp;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'reservation_confirmed' | 'reservation_cancelled' | 'match_full' | 'team_published' | 'new_player_joined' | 'academy_expiring' | 'general';
  title: string;
  body: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Timestamp;
}
