export interface Complex {
  id: string;
  name: string;
  address: string;
  city: string;
  photos: string[];
  description: string;
  rating: number;
  lat: number;
  lng: number;
}

export interface Terrain {
  id: string;
  complex_id: string;
  name: string;
  type: '5v5' | '6v6' | '7v7' | '9v9' | '11v11';
  max_players: number;
  price_per_hour: number;
  available: boolean;
}

export interface Match {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  playersCount: number;
  maxPlayers: number;
  type: string;
  status: 'open' | 'full' | 'completed';
  price: number;
}

export const MOCK_COMPLEXES: Complex[] = [
  {
    id: '1',
    name: 'Arena Foot Lac 2',
    address: 'Les Berges du Lac 2',
    city: 'Tunis',
    photos: ['https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&q=80&w=800'],
    description: 'Le plus grand complexe de foot à 5 en Tunisie avec des terrains dernière génération.',
    rating: 4.8,
    lat: 36.8485,
    lng: 10.2704
  },
  {
    id: '2',
    name: 'Sousse Soccer Hub',
    address: 'Khezama',
    city: 'Sousse',
    photos: ['https://images.unsplash.com/photo-1529900948632-58674ba193cb?auto=format&fit=crop&q=80&w=800'],
    description: 'Terrains indoor et outdoor premium avec vestiaires et café.',
    rating: 4.5,
    lat: 35.8256,
    lng: 10.6084
  },
  {
    id: '3',
    name: 'Bizerte Stadium',
    address: 'Corniche',
    city: 'Bizerte',
    photos: ['https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800'],
    description: 'Une vue imprenable sur la mer en jouant votre match préféré.',
    rating: 4.2,
    lat: 37.2744,
    lng: 9.8739
  },
  {
    id: '4',
    name: 'Ariana Foot Zone',
    address: 'Ennasr 2',
    city: 'Ariana',
    photos: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800'],
    description: 'Nouveaux terrains synthétiques au cœur d\'Ennasr.',
    rating: 4.7,
    lat: 36.8587,
    lng: 10.1601
  },
  {
    id: '5',
    name: 'Sfax Pro Arena',
    address: 'Route de Tunis km 4',
    city: 'Sfax',
    photos: ['https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800'],
    description: 'Complexe sportif haut de gamme pour les passionnés de Sfax.',
    rating: 4.6,
    lat: 34.7406,
    lng: 10.7603
  },
  {
    id: '6',
    name: 'Stadium El Mourouj',
    address: 'Mourouj 1',
    city: 'Tunis',
    photos: ['https://images.unsplash.com/photo-1529900948632-58674ba193cb?auto=format&fit=crop&q=80&w=800'],
    description: 'Terrains de proximité de haute qualité.',
    rating: 4.4,
    lat: 36.7262,
    lng: 10.2173
  }
];

export const MOCK_TERRAINS: (Terrain & { complex_name: string, city: string, lat: number, lng: number, photos: string[], rating: number })[] = MOCK_COMPLEXES.flatMap(complex => [
  {
    id: `t-${complex.id}-1`,
    complex_id: complex.id,
    complex_name: complex.name,
    name: `${complex.name} - Pitch A`,
    type: '5v5',
    max_players: 10,
    price_per_hour: 80,
    available: true,
    city: complex.city,
    lat: complex.lat + (Math.random() - 0.5) * 0.01,
    lng: complex.lng + (Math.random() - 0.5) * 0.01,
    photos: complex.photos,
    rating: complex.rating
  },
  {
    id: `t-${complex.id}-2`,
    complex_id: complex.id,
    complex_name: complex.name,
    name: `${complex.name} - Pitch B`,
    type: '7v7',
    max_players: 14,
    price_per_hour: 120,
    available: Math.random() > 0.3,
    city: complex.city,
    lat: complex.lat + (Math.random() - 0.5) * 0.01,
    lng: complex.lng + (Math.random() - 0.5) * 0.01,
    photos: complex.photos,
    rating: complex.rating
  }
]);

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    title: 'Match Amical Lac 2',
    date: '2026-05-02',
    time: '20:00',
    location: 'Arena Foot Tunis',
    playersCount: 8,
    maxPlayers: 10,
    type: '5v5',
    status: 'open',
    price: 15
  },
  {
    id: 'm2',
    title: 'Takwira de Nuit',
    date: '2026-05-02',
    time: '22:00',
    location: 'Sousse Soccer Hub',
    playersCount: 12,
    maxPlayers: 12,
    type: '6v6',
    status: 'full',
    price: 12
  },
  {
    id: 'm3',
    title: 'Tournoi Bizerte #4',
    date: '2026-05-03',
    time: '18:00',
    location: 'Bizerte Stadium',
    playersCount: 5,
    maxPlayers: 14,
    type: '7v7',
    status: 'open',
    price: 10
  }
];
