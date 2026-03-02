import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Search, TrendingUp, Hash, Users, UserPlus, UserMinus } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { UserAvatar } from '../components/UserAvatar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { getSuggestedUsers, follow, unfollow } from '../api/users';
import type { UserProfile } from '../api/users';
import { toast } from 'sonner';

export const ExploreScreen: React.FC = () => {
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggested();
  }, []);

  const loadSuggested = async () => {
    setLoading(true);
    try {
      const users = await getSuggestedUsers(10);
      setSuggestedUsers(users);
      const states: Record<string, boolean> = {};
      users.forEach((u) => {
        states[String(u.id)] = u.is_following ?? false;
      });
      setFollowStates(states);
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUser: UserProfile) => {
    try {
      const result = followStates[String(targetUser.id)]
        ? await unfollow(String(targetUser.id))
        : await follow(String(targetUser.id));
      setFollowStates((prev) => ({ ...prev, [String(targetUser.id)]: result.is_following }));
      toast.success(
        result.is_following ? `Following @${targetUser.username}! 🎉` : `Unfollowed @${targetUser.username}`
      );
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to update follow');
    }
  };

  const trendingTopics = [
    { tag: 'GenZ', chirps: '12.5K' },
    { tag: 'Gaming', chirps: '8.3K' },
    { tag: 'TechNews', chirps: '5.7K' },
    { tag: 'MusicVibes', chirps: '4.2K' },
  ];

  return (
    <div className="min-h-screen pb-20 lg:pb-0 lg:pl-64">
      <div
        className="sticky top-0 z-40 border-b border-border/50"
        style={{
          background: 'rgba(15, 10, 30, 0.8)',
          backdropFilter: 'blur(20px)',
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

      <div className="max-w-2xl mx-auto px-4 py-6">
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
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">#{topic.tag}</div>
                      <div className="text-sm text-muted-foreground">{topic.chirps} chirps</div>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-secondary" />
            <span>Who to Follow</span>
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
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
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/user/${user.username}`} className="flex items-start gap-3 flex-1 min-w-0">
                      <UserAvatar
                        src={user.profile_picture_url ?? undefined}
                        username={user.username}
                        size="medium"
                        level={user.level ?? 1}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold hover:text-primary transition-colors">
                          @{user.username}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {user.bio || 'No bio'}
                        </div>
                      </div>
                    </Link>
                    <Button
                      size="sm"
                      className="rounded-full px-4 shrink-0"
                      style={{
                        background: followStates[String(user.id)]
                          ? 'rgba(139, 92, 246, 0.2)'
                          : 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                        border: followStates[String(user.id)]
                          ? '1px solid rgba(139, 92, 246, 0.5)'
                          : 'none',
                      }}
                      onClick={() => handleFollow(user)}
                    >
                      {followStates[String(user.id)] ? (
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
              {suggestedUsers.length === 0 && !loading && (
                <p className="text-center py-8 text-muted-foreground">No suggestions right now</p>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
