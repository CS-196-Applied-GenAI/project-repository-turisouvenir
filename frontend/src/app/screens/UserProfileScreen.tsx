import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, Flame, Award, Sparkles, UserPlus, UserMinus, Ban, Loader } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { ChirpCard } from '../components/ChirpCard';
import { BottomNav } from '../components/BottomNav';
import { FollowListModal } from '../components/FollowListModal';
import { Button } from '../components/ui/button';
import {
  getUserByUsername,
  getUserTweets,
  follow,
  unfollow,
  block,
  unblock,
  type UserProfile,
} from '../api/users';
import { likeTweet, unlikeTweet, retweet, unretweet } from '../api/tweets';
import type { Chirp } from '../api/feed';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

function chirpToDisplay(c: Chirp): Chirp & { id: string } {
  return { ...c, id: String(c.id) };
}

export const UserProfileScreen: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [chirps, setChirps] = useState<(Chirp & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chirps' | 'followers' | 'following'>('chirps');
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    if (username) loadProfile();
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;

    setIsLoading(true);
    try {
      const profileData = await getUserByUsername(username);
      setProfile(profileData);
      const chirpsData = await getUserTweets(String(profileData.id));
      setChirps(chirpsData.map(chirpToDisplay));
    } catch (err: unknown) {
      const e = err as { error?: string; status?: number };
      setProfile(null);
      setChirps([]);
      if (e?.status !== 404) {
        toast.error(e?.error || 'Failed to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    try {
      const result = profile.is_following
        ? await unfollow(String(profile.id))
        : await follow(String(profile.id));
      setProfile({
        ...profile,
        is_following: result.is_following,
        followers_count: result.followers_count,
      });
      toast.success(
        result.is_following ? `Following @${profile.username}! 🎉` : `Unfollowed @${profile.username}`
      );
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to update follow');
    }
  };

  const handleBlock = async () => {
    if (!profile) return;

    try {
      const result = profile.is_blocked
        ? await unblock(String(profile.id))
        : await block(String(profile.id));
      setProfile({
        ...profile,
        is_blocked: result.is_blocked,
        is_following: result.is_blocked ? false : profile.is_following,
      });
      toast.success(
        result.is_blocked ? `Blocked @${profile.username}` : `Unblocked @${profile.username}`
      );
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to update block');
    }
  };

  const handleLike = async (chirpId: string) => {
    const chirp = chirps.find((c) => c.id === chirpId);
    if (!chirp) return;
    try {
      if (chirp.is_liked) {
        await unlikeTweet(chirpId);
        setChirps((prev) =>
          prev.map((c) =>
            c.id === chirpId
              ? { ...c, is_liked: false, likes_count: Math.max(0, c.likes_count - 1) }
              : c
          )
        );
      } else {
        await likeTweet(chirpId);
        setChirps((prev) =>
          prev.map((c) =>
            c.id === chirpId ? { ...c, is_liked: true, likes_count: c.likes_count + 1 } : c
          )
        );
      }
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to update like');
    }
  };

  const handleRetweet = async (chirpId: string) => {
    const chirp = chirps.find((c) => c.id === chirpId);
    if (!chirp) return;
    const originalId = chirp.original_tweet_id || chirp.id;
    try {
      if (chirp.is_retweeted) {
        await unretweet(String(originalId));
        setChirps((prev) =>
          prev.map((c) => {
            const base = c.original_tweet || c;
            const match = c.id === chirpId || base.id === Number(originalId);
            if (!match) return c;
            return { ...c, is_retweeted: false, retweets_count: Math.max(0, base.retweets_count - 1) };
          })
        );
        toast.success('Unrechirped');
      } else {
        await retweet(String(originalId));
        setChirps((prev) =>
          prev.map((c) => {
            const base = c.original_tweet || c;
            const match = c.id === chirpId || base.id === Number(originalId);
            if (!match) return c;
            return { ...c, is_retweeted: true, retweets_count: base.retweets_count + 1 };
          })
        );
        toast.success('Rechirped! 🔄');
      }
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to rechirp');
    }
  };

  const badges = [
    { id: 'first_chirp', name: 'First Chirp', icon: Sparkles, color: '#A78BFA' },
    { id: 'early_bird', name: 'Early Bird', icon: Trophy, color: '#60A5FA' },
    { id: 'social_butterfly', name: 'Social Butterfly', icon: Award, color: '#FB7185' },
    { id: 'influencer', name: 'Influencer', icon: Flame, color: '#84CC16' },
    { id: 'legend', name: 'Legend', icon: Trophy, color: '#FBBF24' },
  ];

  const userBadges = profile ? badges.filter((b) => (profile.badges || []).includes(b.id)) : [];

  return (
    <div className="min-h-screen pb-20 lg:pb-0 lg:pl-64">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-4"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                  boxShadow: '0 8px 30px rgba(139, 92, 246, 0.5)',
                }}
              >
                <Loader className="w-8 h-8 text-primary-foreground" />
              </div>
            </motion.div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      ) : !profile ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">Profile not found 😢</p>
            <button
              onClick={() => navigate('/feed')}
              className="mt-4 text-primary hover:text-primary/80 transition-colors"
            >
              Back to feed
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="relative h-48"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #FB7185 50%, #60A5FA 100%)',
            }}
          >
            <div className="absolute top-4 left-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
            <div className="flex justify-between items-end mb-6">
              <UserAvatar
                src={profile.profile_picture_url ?? undefined}
                username={profile.username}
                size="large"
                level={profile.level ?? 1}
                streak={profile.streak ?? 0}
                showStreak
              />

              <div className="flex gap-2">
                {profile.is_blocked ? (
                  <Button
                    onClick={handleBlock}
                    variant="outline"
                    className="rounded-full px-6 border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Unblock
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleFollow}
                      className="rounded-full px-6"
                      style={{
                        background: profile.is_following
                          ? 'rgba(139, 92, 246, 0.2)'
                          : 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                        border: profile.is_following ? '1px solid rgba(139, 92, 246, 0.5)' : 'none',
                      }}
                    >
                      {profile.is_following ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleBlock}
                      variant="outline"
                      className="rounded-full px-4 border-border/50 hover:border-destructive/50 hover:text-destructive"
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold">@{profile.username}</h2>
              <p className="text-muted-foreground mt-2">{profile.bio || 'No bio yet'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl border border-border/50"
                style={{
                  background: 'rgba(26, 18, 41, 0.5)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Level</span>
                </div>
                <div className="text-3xl font-bold">{profile.level ?? 1}</div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{profile.xp ?? 0} XP</span>
                    <span>{((profile.level ?? 1) + 1) * 500} XP</span>
                  </div>
                  <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((profile.xp ?? 0) % 500) / 5}%` }}
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%)',
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl border border-border/50"
                style={{
                  background: 'rgba(26, 18, 41, 0.5)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-[#84CC16]" />
                  <span className="text-sm text-muted-foreground">Streak</span>
                </div>
                <div className="text-3xl font-bold">
                  {profile.streak ?? 0}
                  <span className="text-lg text-muted-foreground ml-1">days</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">On fire! 🔥</p>
              </motion.div>
            </div>

            {userBadges.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  Badges
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {userBadges.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="p-4 rounded-2xl border border-border/50 flex flex-col items-center text-center"
                        style={{
                          background: 'rgba(26, 18, 41, 0.5)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                          style={{
                            background: `linear-gradient(135deg, ${badge.color} 0%, ${badge.color}90 100%)`,
                            boxShadow: `0 4px 15px ${badge.color}40`,
                          }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-semibold">{badge.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div
                className="flex gap-1 p-1 rounded-2xl border border-border/50"
                style={{
                  background: 'rgba(26, 18, 41, 0.5)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {[
                  { id: 'chirps' as const, label: 'Chirps', count: profile.chirps_count },
                  { id: 'followers' as const, label: 'Followers', count: profile.followers_count },
                  { id: 'following' as const, label: 'Following', count: profile.following_count },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'followers') {
                        setFollowModalType('followers');
                        setShowFollowModal(true);
                      } else if (tab.id === 'following') {
                        setFollowModalType('following');
                        setShowFollowModal(true);
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors relative ${
                      activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeProfileTab"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                        }}
                      />
                    )}
                    <span className="relative z-10">
                      {tab.label} <span className="font-bold">{tab.count}</span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'chirps' && (
                <motion.div
                  key="chirps"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {profile.is_blocked ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>You've blocked this user</p>
                      <p className="text-sm mt-2">Unblock to see their chirps</p>
                    </div>
                  ) : chirps.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No chirps yet</p>
                      <p className="text-sm mt-2">@{profile.username} hasn't posted anything</p>
                    </div>
                  ) : (
                    chirps.map((chirp) => (
                      <ChirpCard
                        key={chirp.id}
                        chirp={chirp}
                        onLike={handleLike}
                        onRetweet={handleRetweet}
                        onComment={() => navigate(`/chirp/${chirp.id}`)}
                      />
                    ))
                  )}
                </motion.div>
              )}

              {(activeTab === 'followers' || activeTab === 'following') && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <p>Tap above to see {activeTab} list</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <FollowListModal
            isOpen={showFollowModal}
            onClose={() => setShowFollowModal(false)}
            userId={String(profile.id)}
            type={followModalType}
          />

          <BottomNav />
        </>
      )}
    </div>
  );
};
