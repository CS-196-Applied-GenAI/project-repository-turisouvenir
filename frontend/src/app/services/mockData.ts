export interface Chirp {
  id: string;
  author_id: string;
  author: {
    id: string;
    username: string;
    profile_picture_url?: string;
    level: number;
  };
  content: string;
  created_at: string;
  likes_count: number;
  retweets_count: number;
  comments_count: number;
  is_liked: boolean;
  is_retweeted: boolean;
  original_tweet_id?: string;
  original_tweet?: Chirp;
}

export interface Comment {
  id: string;
  author_id: string;
  author: {
    id: string;
    username: string;
    profile_picture_url?: string;
    level: number;
  };
  content: string;
  created_at: string;
  tweet_id: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  profile_picture_url?: string;
  created_at: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  followers_count: number;
  following_count: number;
  chirps_count: number;
  is_following?: boolean;
  is_blocked?: boolean;
}

const mockUsers = [
  {
    id: '2',
    username: 'cosmicvibes',
    profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic',
    level: 8,
    email: 'cosmic@chirper.app',
    bio: 'Living for the cosmic vibes ✨ | Level 8 | Music & Art',
    xp: 3200,
    streak: 12,
    badges: ['first_chirp', 'early_bird', 'social_butterfly', 'influencer'],
    followers_count: 542,
    following_count: 189,
    chirps_count: 234,
    created_at: '2025-08-15T10:30:00Z'
  },
  {
    id: '3',
    username: 'pixelpanda',
    profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel',
    level: 12,
    email: 'pixel@chirper.app',
    bio: 'Pixel artist | Gaming enthusiast 🎮 | Pro procrastinator',
    xp: 5800,
    streak: 25,
    badges: ['first_chirp', 'early_bird', 'social_butterfly', 'legend'],
    followers_count: 1203,
    following_count: 342,
    chirps_count: 567,
    created_at: '2025-06-20T14:20:00Z'
  },
  {
    id: '4',
    username: 'neonwarrior',
    profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon',
    level: 6,
    email: 'neon@chirper.app',
    bio: 'Warrior of the neon realm 💜 | Fitness & Vibes',
    xp: 2400,
    streak: 7,
    badges: ['first_chirp', 'early_bird'],
    followers_count: 324,
    following_count: 156,
    chirps_count: 145,
    created_at: '2025-10-12T09:15:00Z'
  },
  {
    id: '5',
    username: 'dreamweaver',
    profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dream',
    level: 15,
    email: 'dream@chirper.app',
    bio: 'Weaving dreams into reality ✨ | Creator | Vibe curator',
    xp: 7200,
    streak: 45,
    badges: ['first_chirp', 'early_bird', 'social_butterfly', 'legend', 'influencer'],
    followers_count: 2847,
    following_count: 421,
    chirps_count: 892,
    created_at: '2025-03-05T16:45:00Z'
  }
];

const mockChirpContents = [
  'just dropped my new playlist and its fire 🔥🔥🔥',
  'why is nobody talking about this??? 👀',
  'new record: stayed up for 48 hours straight gaming',
  'ok but hear me out... pineapple DOES belong on pizza',
  'touch grass they said. it was overrated 🌱',
  'main character energy today ✨',
  'cant believe its already march 2026... time flies',
  'hot take: morning people are lying about being happy',
  'just hit 10k followers!! love you all 💜',
  'procrastination level: expert 😎',
  'life update: still no idea what im doing',
  'shoutout to everyone who believed in me',
  'sometimes you just gotta vibe and let it happen',
  'new life goal: collect all the badges',
  'the grind never stops 💪',
];

let mockChirps: Chirp[] = [];
let nextId = 100;

// Generate initial mock data
export const generateMockChirps = (count: number = 20): Chirp[] => {
  if (mockChirps.length > 0) return mockChirps;

  mockChirps = Array.from({ length: count }, (_, i) => {
    const author = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const isRetweet = Math.random() > 0.7;
    
    const baseChirp: Chirp = {
      id: String(nextId++),
      author_id: author.id,
      author,
      content: mockChirpContents[Math.floor(Math.random() * mockChirpContents.length)],
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes_count: Math.floor(Math.random() * 500),
      retweets_count: Math.floor(Math.random() * 100),
      comments_count: Math.floor(Math.random() * 50),
      is_liked: Math.random() > 0.7,
      is_retweeted: false,
    };

    if (isRetweet) {
      const originalAuthor = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      baseChirp.original_tweet_id = String(nextId++);
      baseChirp.original_tweet = {
        id: baseChirp.original_tweet_id,
        author_id: originalAuthor.id,
        author: originalAuthor,
        content: mockChirpContents[Math.floor(Math.random() * mockChirpContents.length)],
        created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        likes_count: Math.floor(Math.random() * 1000),
        retweets_count: Math.floor(Math.random() * 200),
        comments_count: Math.floor(Math.random() * 100),
        is_liked: false,
        is_retweeted: true,
      };
    }

    return baseChirp;
  });

  return mockChirps;
};

export const createChirp = async (content: string, authorId: string): Promise<Chirp> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newChirp: Chirp = {
    id: String(nextId++),
    author_id: authorId,
    author: {
      id: authorId,
      username: 'You',
      profile_picture_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`,
      level: 5
    },
    content,
    created_at: new Date().toISOString(),
    likes_count: 0,
    retweets_count: 0,
    comments_count: 0,
    is_liked: false,
    is_retweeted: false,
  };

  mockChirps.unshift(newChirp);
  return newChirp;
};

export const toggleLike = async (chirpId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const chirp = mockChirps.find(c => c.id === chirpId);
  if (chirp) {
    chirp.is_liked = !chirp.is_liked;
    chirp.likes_count += chirp.is_liked ? 1 : -1;
  }
};

export const toggleRetweet = async (chirpId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const chirp = mockChirps.find(c => c.id === chirpId);
  if (chirp) {
    chirp.is_retweeted = !chirp.is_retweeted;
    chirp.retweets_count += chirp.is_retweeted ? 1 : -1;
  }
};

export const getFeed = async (limit: number = 20, cursor?: string): Promise<{ feed: Chirp[], nextCursor: string | null }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (mockChirps.length === 0) {
    generateMockChirps(50);
  }

  const startIndex = cursor ? parseInt(cursor) : 0;
  const endIndex = startIndex + limit;
  const feed = mockChirps.slice(startIndex, endIndex);
  const nextCursor = endIndex < mockChirps.length ? String(endIndex) : null;

  return { feed, nextCursor };
};

export const getChirpById = async (id: string): Promise<Chirp | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockChirps.find(c => c.id === id) || null;
};

export const getComments = async (chirpId: string): Promise<Comment[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Generate mock comments
  const count = Math.floor(Math.random() * 8) + 2;
  return Array.from({ length: count }, (_, i) => {
    const author = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    return {
      id: `comment_${chirpId}_${i}`,
      author_id: author.id,
      author,
      content: mockChirpContents[Math.floor(Math.random() * mockChirpContents.length)],
      created_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      tweet_id: chirpId
    };
  });
};

export const addComment = async (chirpId: string, content: string, authorId: string): Promise<Comment> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const chirp = mockChirps.find(c => c.id === chirpId);
  if (chirp) {
    chirp.comments_count += 1;
  }

  return {
    id: `comment_${chirpId}_${Date.now()}`,
    author_id: authorId,
    author: {
      id: authorId,
      username: 'You',
      profile_picture_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`,
      level: 5
    },
    content,
    created_at: new Date().toISOString(),
    tweet_id: chirpId
  };
};

// User profile management
const followingList: Set<string> = new Set();
const blockedList: Set<string> = new Set();

export const getUserProfile = async (username: string): Promise<UserProfile | null> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return null;

  return {
    ...user,
    is_following: followingList.has(user.id),
    is_blocked: blockedList.has(user.id)
  };
};

export const getFollowers = async (userId: string): Promise<UserProfile[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Return a random subset of users as followers (mock data)
  const count = Math.floor(Math.random() * 5) + 3;
  const shuffled = [...mockUsers].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, count).map(user => ({
    ...user,
    is_following: followingList.has(user.id),
    is_blocked: blockedList.has(user.id)
  }));
};

export const getFollowing = async (userId: string): Promise<UserProfile[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Return users that the current logged-in user is following
  const following = mockUsers.filter(user => followingList.has(user.id));
  
  // If no one is followed, return a random subset for demo purposes
  if (following.length === 0) {
    const count = Math.floor(Math.random() * 4) + 2;
    const shuffled = [...mockUsers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(user => ({
      ...user,
      is_following: followingList.has(user.id),
      is_blocked: blockedList.has(user.id)
    }));
  }
  
  return following.map(user => ({
    ...user,
    is_following: true,
    is_blocked: blockedList.has(user.id)
  }));
};

export const getUserChirps = async (userId: string, limit: number = 20): Promise<Chirp[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  if (mockChirps.length === 0) {
    generateMockChirps(50);
  }

  return mockChirps.filter(c => c.author_id === userId).slice(0, limit);
};

export const toggleFollow = async (userId: string): Promise<{ is_following: boolean, followers_count: number }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = mockUsers.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  if (followingList.has(userId)) {
    followingList.delete(userId);
    user.followers_count -= 1;
    return { is_following: false, followers_count: user.followers_count };
  } else {
    followingList.add(userId);
    // Remove from blocked if they were blocked
    if (blockedList.has(userId)) {
      blockedList.delete(userId);
    }
    user.followers_count += 1;
    return { is_following: true, followers_count: user.followers_count };
  }
};

export const toggleBlock = async (userId: string): Promise<{ is_blocked: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (blockedList.has(userId)) {
    blockedList.delete(userId);
    return { is_blocked: false };
  } else {
    blockedList.add(userId);
    // Remove from following if they were followed
    if (followingList.has(userId)) {
      followingList.delete(userId);
      const user = mockUsers.find(u => u.id === userId);
      if (user) user.followers_count -= 1;
    }
    return { is_blocked: true };
  }
};