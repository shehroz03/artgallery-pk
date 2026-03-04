// Auto-seed Firestore with real data on first run
import { db } from '../firebase';
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';

const seedArtists = [
    {
        name: 'Zara Ahmed',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        bio: 'Contemporary artist exploring the boundaries of abstract expressionism.',
        country: 'Pakistan',
        artworkCount: 47,
        followers: 12543,
        verified: true,
    },
    {
        name: 'Ali Raza',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        bio: 'Minimalist painter focusing on the intersection of space and emotion.',
        country: 'Pakistan',
        artworkCount: 32,
        followers: 8976,
        verified: true,
    },
    {
        name: 'Fatima Khan',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
        bio: 'Portrait artist capturing the essence of human stories through mixed media.',
        country: 'Pakistan',
        artworkCount: 68,
        followers: 15234,
        verified: true,
    },
    {
        name: 'Hassan Ali',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        bio: "Landscape painter celebrating Pakistan's natural beauty.",
        country: 'Pakistan',
        artworkCount: 54,
        followers: 21456,
        verified: true,
    },
    {
        name: 'Ayesha Malik',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
        bio: 'Expressionist artist known for bold colors and emotional depth.',
        country: 'Pakistan',
        artworkCount: 39,
        followers: 9812,
        verified: true,
    },
    {
        name: 'Kamran Sheikh',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
        bio: 'Minimalist digital artist bridging traditional and contemporary art.',
        country: 'Pakistan',
        artworkCount: 25,
        followers: 6234,
        verified: false,
    },
];

const seedArtworks = [
    {
        title: 'Ethereal Dreams',
        artist: 'Zara Ahmed',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&fit=crop',
        category: 'Abstract',
        style: 'Contemporary',
        medium: 'Acrylic on Canvas',
        dimensions: { width: 120, height: 90, unit: 'cm' },
        year: 2024,
        description: 'A mesmerizing blend of colors representing the fluid nature of dreams and consciousness.',
        featured: true,
        trending: true,
        likes: 1247,
        views: 8932,
    },
    {
        title: 'Gallery Serenity',
        artist: 'Ali Raza',
        price: 65000,
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&fit=crop',
        category: 'Modern',
        style: 'Minimalist',
        medium: 'Oil on Canvas',
        dimensions: { width: 150, height: 100, unit: 'cm' },
        year: 2024,
        description: 'A contemplative piece exploring the relationship between space and art.',
        featured: true,
        trending: false,
        likes: 892,
        views: 5621,
    },
    {
        title: 'Portrait of Time',
        artist: 'Fatima Khan',
        price: 52000,
        image: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=800&fit=crop',
        category: 'Portrait',
        style: 'Contemporary',
        medium: 'Mixed Media',
        dimensions: { width: 80, height: 100, unit: 'cm' },
        year: 2023,
        description: 'An exploration of human emotion through contemporary portrait techniques.',
        featured: false,
        trending: true,
        likes: 1543,
        views: 9876,
    },
    {
        title: 'Mountain Majesty',
        artist: 'Hassan Ali',
        price: 38000,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&fit=crop',
        category: 'Landscape',
        style: 'Realism',
        medium: 'Oil on Canvas',
        dimensions: { width: 140, height: 80, unit: 'cm' },
        year: 2024,
        description: "A breathtaking view of northern Pakistan's majestic mountain ranges.",
        featured: true,
        trending: true,
        likes: 2341,
        views: 12456,
    },
    {
        title: 'Vibrant Chaos',
        artist: 'Ayesha Malik',
        price: 42000,
        image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&fit=crop',
        category: 'Abstract',
        style: 'Expressionism',
        medium: 'Acrylic on Canvas',
        dimensions: { width: 100, height: 120, unit: 'cm' },
        year: 2024,
        description: 'An explosion of color representing the beautiful chaos of life.',
        featured: false,
        trending: true,
        likes: 1876,
        views: 7654,
    },
    {
        title: 'Minimalist Zen',
        artist: 'Kamran Sheikh',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&fit=crop',
        category: 'Abstract',
        style: 'Minimalist',
        medium: 'Digital Print on Canvas',
        dimensions: { width: 90, height: 90, unit: 'cm' },
        year: 2024,
        description: 'A study in simplicity and balance, embodying the principles of minimalism.',
        featured: false,
        trending: false,
        likes: 654,
        views: 3421,
    },
    {
        title: 'Indus Valley Dreams',
        artist: 'Zara Ahmed',
        price: 75000,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&fit=crop',
        category: 'Cultural',
        style: 'Contemporary',
        medium: 'Watercolor on Paper',
        dimensions: { width: 60, height: 80, unit: 'cm' },
        year: 2024,
        description: "An homage to Pakistan's rich ancient civilization through modern artistic expression.",
        featured: true,
        trending: true,
        likes: 3102,
        views: 15670,
    },
    {
        title: 'Lahore Nights',
        artist: 'Ali Raza',
        price: 58000,
        image: 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=800&fit=crop',
        category: 'Urban',
        style: 'Impressionism',
        medium: 'Oil on Canvas',
        dimensions: { width: 130, height: 90, unit: 'cm' },
        year: 2023,
        description: "The vibrant nightlife of Lahore captured in rich, glowing impressionistic strokes.",
        featured: false,
        trending: true,
        likes: 1450,
        views: 8230,
    },
    {
        title: 'Desert Bloom',
        artist: 'Fatima Khan',
        price: 44000,
        image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&fit=crop',
        category: 'Landscape',
        style: 'Realism',
        medium: 'Acrylic on Canvas',
        dimensions: { width: 110, height: 85, unit: 'cm' },
        year: 2024,
        description: 'Rare wildflowers blooming against the stark beauty of the Thar desert.',
        featured: true,
        trending: false,
        likes: 987,
        views: 5441,
    },
    {
        title: 'Soul in Motion',
        artist: 'Hassan Ali',
        price: 62000,
        image: 'https://images.unsplash.com/photo-1587095951604-b9d924a3fda0?w=800&fit=crop',
        category: 'Abstract',
        style: 'Expressionism',
        medium: 'Mixed Media',
        dimensions: { width: 100, height: 130, unit: 'cm' },
        year: 2024,
        description: 'Dynamic movement captured in layered textures and bold color contrasts.',
        featured: false,
        trending: true,
        likes: 2187,
        views: 11234,
    },
    {
        title: 'Badshahi Mosque at Golden Sunset',
        artist: 'Ahmed Khan',
        price: 95000,
        image: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&fit=crop',
        category: 'Cultural',
        style: 'Realism',
        medium: 'Oil on Canvas',
        dimensions: { width: 160, height: 120, unit: 'cm' },
        year: 2025,
        description: 'A breathtaking oil painting of Lahore\'s iconic Badshahi Mosque bathed in the warm glow of a golden sunset. The Mughal architecture glows with rich reds and amber tones as the sun dips below the horizon, capturing the eternal beauty of Pakistan\'s cultural heritage.',
        featured: true,
        trending: true,
        likes: 4215,
        views: 21500,
    },
];

let seeded = false;

export async function seedDatabase(): Promise<void> {
    if (seeded) return;
    seeded = true;

    try {
        // Check if data already exists
        const artistsSnap = await getDocs(collection(db, 'artists'));
        const artworksSnap = await getDocs(collection(db, 'artworks'));

        // Check if Badshahi painting already exists
        const hasBadshahi = artworksSnap.docs.some(
            (d) => d.data().title === 'Badshahi Mosque at Golden Sunset'
        );

        if (artistsSnap.size > 0 && artworksSnap.size > 0 && hasBadshahi) {
            console.log('✅ Database already seeded:', artistsSnap.size, 'artists,', artworksSnap.size, 'artworks');
            return;
        }

        console.log('🌱 Seeding database with initial data...');

        // Seed artists
        if (artistsSnap.size === 0) {
            for (const artist of seedArtists) {
                await addDoc(collection(db, 'artists'), {
                    ...artist,
                    createdAt: serverTimestamp(),
                });
            }
            console.log('✅ Artists seeded:', seedArtists.length);
        }

        // Seed artworks
        if (artworksSnap.size === 0) {
            for (const artwork of seedArtworks) {
                await addDoc(collection(db, 'artworks'), {
                    ...artwork,
                    sellerId: 'seed',
                    status: 'active',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }
            console.log('✅ Artworks seeded:', seedArtworks.length);
        } else if (!hasBadshahi) {
            // Only add the new Badshahi painting if it doesn't exist yet
            const badshahiPainting = seedArtworks.find(
                (a) => a.title === 'Badshahi Mosque at Golden Sunset'
            );
            if (badshahiPainting) {
                await addDoc(collection(db, 'artworks'), {
                    ...badshahiPainting,
                    sellerId: 'seed',
                    status: 'active',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                console.log('✅ Badshahi Mosque painting added to Firestore!');
            }
        }

        console.log('🎉 Database seeding complete!');
    } catch (error) {
        console.warn('⚠️ Seeding skipped (Firestore may not be set up yet):', error);
    }
}
