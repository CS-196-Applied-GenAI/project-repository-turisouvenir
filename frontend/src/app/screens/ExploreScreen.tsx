import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Search, TrendingUp, Hash, Users, UserPlus, UserMinus } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { UserAvatar } from '../components/UserAvatar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toggleFollow } from '../services/mockData';
import { toast } from 'sonner';

export const ExploreScreen: React.FC = () => {
  const trendingTopics = [
    { tag: 'GenZ', chirps: '12.5K' },
    { tag: 'Gaming', chirps: '8.3K' },
    { tag: 'TechNews', chirps: '5.7K' },
    { tag: 'MusicVibes', chirps: '4.2K' },
  ];

  const suggestedUsers = [
    {
      id: '2',
      username: 'cosmicvibes',
      bio: 'Living for the cosmic vibes ✨',
      level: 8,
      profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic'
    },
    {
      id: '3',
      username: 'pixelpanda',
      bio: 'Pixel artist | Gaming enthusiast 🎮',
      level: 12,
      profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel'
    },
    {
      id: '4',
      username: 'neonwarrior',
      bio: 'Warrior of the neon realm 💜',
      level: 6,
      profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon'
    },
  ];

  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

  const handleFollow = async (userId: string, username: string) => {
    const result = await toggleFollow(userId);
    setFollowStates(prev => ({ ...prev, [userId]: result.is_following }));
    
    if (result.is_following) {
      toast.success(`Following @${username}! 🎉`);
    } else {
      toast.success(`Unfollowed @${username}`);
    }
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-0 lg:pl-64">
      {/* Header */}
      <div 
        className="sticky top-0 z-40 border-b border-border/50"
        style={{
          background: 'rgba(15, 10, 30, 0.8)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl mb-4">Explore</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search chirps, users, topics..."
              className="pl-10 bg-input-background border-border/50 focus:border-primary/50 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Trending section */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <span>Trending Now</span>
          </h2>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.tag}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl border border-border/50 cursor-pointer"
                style={{
                  background: 'rgba(26, 18, 41, 0.5)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">#{topic.tag}</div>
                      <div className="text-sm text-muted-foreground">
                        {topic.chirps} chirps
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Suggested users */}
        <div>
          <h2 className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-secondary" />
            <span>Who to Follow</span>
          </h2>
          <div className="space-y-3">
            {suggestedUsers.map((user, index) => (
              <motion.div
                key={user.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-2xl border border-border/50"
                style={{
                  background: 'rgba(26, 18, 41, 0.5)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/user/${user.username}`} className="flex items-start gap-3 flex-1 min-w-0">
                    <UserAvatar
                      src={user.profile_picture_url}
                      username={user.username}
                      size="medium"
                      level={user.level}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold hover:text-primary transition-colors">
                        @{user.username}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {user.bio}
                      </div>
                    </div>
                  </Link>
                  <Button
                    size="sm"
                    className="rounded-full px-4 shrink-0"
                    style={{
                      background: followStates[user.id] 
                        ? 'rgba(139, 92, 246, 0.2)' 
                        : 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                      border: followStates[user.id] ? '1px solid rgba(139, 92, 246, 0.5)' : 'none'
                    }}
                    onClick={() => handleFollow(user.id, user.username)}
                  >
                    {followStates[user.id] ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};