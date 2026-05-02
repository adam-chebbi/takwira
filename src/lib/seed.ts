import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const TunisianCities = ['Tunis', 'Sousse', 'Sfax', 'Bizerte', 'Nabeul'];

export const seedDatabase = async () => {
  console.log('Starting seeding...');

  // 1. Admin User
  const adminId = 'admin_user_id';
  await setDoc(doc(db, 'users', adminId), {
    id: adminId,
    phone: '+216 20 000 000',
    name: 'Admin Takwira',
    role: 'admin',
    city: 'Tunis',
    isActive: true,
    createdAt: Timestamp.now()
  });
  await setDoc(doc(db, 'admins', adminId), { userId: adminId });

  // 2. Managers
  const managers = [
    { id: 'm1', name: 'Zied Ayari', city: 'Tunis' },
    { id: 'm2', name: 'Mehdi Kouka', city: 'Sousse' },
    { id: 'm3', name: 'Hamza Ben Amor', city: 'Sfax' }
  ];

  for (const m of managers) {
    await setDoc(doc(db, 'users', m.id), {
      id: m.id,
      phone: `+216 55 ${Math.floor(Math.random() * 900000 + 100000)}`,
      name: m.name,
      role: 'manager',
      city: m.city,
      isActive: true,
      createdAt: Timestamp.now()
    });
  }

  // 3. Players
  const players = [
    { id: 'p1', name: 'Ahmed Skhiri' },
    { id: 'p2', name: 'Sami Allagui' },
    { id: 'p3', name: 'Youssef Msakni' },
    { id: 'p4', name: 'Wahbi Khazri' },
    { id: 'p5', name: 'Ali Maaloul' }
  ];

  for (const p of players) {
    await setDoc(doc(db, 'users', p.id), {
      id: p.id,
      phone: `+216 22 ${Math.floor(Math.random() * 900000 + 100000)}`,
      name: p.name,
      role: 'player',
      city: TunisianCities[Math.floor(Math.random() * TunisianCities.length)],
      isActive: true,
      createdAt: Timestamp.now()
    });
  }

  // 4. Complexes
  const complexes = [
    { id: 'c1', managerId: 'm1', name: 'Gammarth Sport Village', city: 'Tunis', lat: 36.88, lng: 10.32 },
    { id: 'c2', managerId: 'm2', name: 'Sousse Beach Foot', city: 'Sousse', lat: 35.82, lng: 10.63 },
    { id: 'c3', managerId: 'm3', name: 'Sfax Indoor Soccer', city: 'Sfax', lat: 34.74, lng: 10.76 }
  ];

  for (const c of complexes) {
    await setDoc(doc(db, 'complexes', c.id), {
      ...c,
      address: `Route de ${c.city}, km 5`,
      governorate: c.city,
      photos: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop'],
      description: `Le meilleur complexe de ${c.city}`,
      openingTime: '08:00',
      closingTime: '23:00',
      isVerified: true,
      isActive: true,
      createdAt: Timestamp.now()
    });

    // 5. Terrains per Complex
    const terrainCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 1; i <= terrainCount; i++) {
      const tId = `t_${c.id}_${i}`;
      const type = i % 2 === 0 ? '7v7' : '6v6';
      await setDoc(doc(db, 'terrains', tId), {
        id: tId,
        complexId: c.id,
        complexName: c.name,
        managerId: c.managerId,
        name: `Terrain ${i}`,
        type,
        maxPlayers: type === '6v6' ? 12 : 14,
        amenities: ['vestiaires', 'eclairage', 'parking'],
        photos: ['https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=500&auto=format&fit=crop'],
        pricePerHour: i % 2 === 0 ? 90 : 70,
        isActive: true,
        createdAt: Timestamp.now()
      });
    }
  }

  // 6. Blog Posts
  const categories = ['actualites', 'conseils', 'terrains', 'interviews', 'communaute'];
  for (let i = 1; i <= 5; i++) {
    const bId = `blog_${i}`;
    await setDoc(doc(db, 'blogPosts', bId), {
      id: bId,
      authorId: adminId,
      authorName: 'Admin Takwira',
      title: `Article Tunisien Foot #${i}`,
      slug: `article-tunisien-${i}`,
      excerpt: 'Un article passionnant sur le football en Tunisie.',
      content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>',
      coverImageUrl: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=800&auto=format&fit=crop',
      category: categories[i-1],
      tags: ['Tunisie', 'Foot', 'Amateur'],
      status: 'published',
      readTimeMinutes: 5,
      viewCount: 10 * i,
      publishedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  console.log('Seeding completed!');
};
