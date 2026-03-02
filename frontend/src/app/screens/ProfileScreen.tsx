import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Edit, LogOut, Camera, Trophy, Flame, Award, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { BottomNav } from '../components/BottomNav';
import { FollowListModal } from '../components/FollowListModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  getUserById,
  updateMe,
  uploadProfilePicture,
  type UserProfile,
} from '../api/users';
import { toast } from 'sonner';

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getUserById(user.id);
      setProfile(data);
      setUsername(data.username);
      setBio(data.bio || '');
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const handleSave = async () => {
    try {
      const updated = await updateMe({ username, bio });
      updateUser({
        username: updated.username,
        bio: updated.bio,
      });
      setProfile((p) => (p ? { ...p, ...updated } : updated));
      setIsEditing(false);
      toast.success('Profile updated! ✨');
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('See you later! 👋');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (jpg, png, webp)');
      return;
    }

    try {
      const updated = await uploadProfilePicture(file);
      updateUser({ profile_picture_url: updated.profile_picture_url ?? undefined });
      setProfile((p) => (p ? { ...p, profile_picture_url: updated.profile_picture_url } : p));
      toast.success('Profile picture updated! 📸');
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to upload image');
    }
  };

  const badges = [
    { id: 'first_chirp', name: 'First Chirp', icon: Sparkles, color: '#A78BFA' },
    { id: 'early_bird', name: 'Early Bird', icon: Trophy, color: '#60A5FA' },
    { id: 'social_butterfly', name: 'Social Butterfly', icon: Award, color: '#FB7185' },
  ];

  const userBadges = badges.filter((b) => (profile?.badges || user.badges || []).includes(b.id));
  const displayUser = profile || user;
  const xpForNextLevel = ((displayUser?.level ?? 1) + 1) * 500;
  const xpProgress = ((displayUser?.xp ?? 0) % 500) / 5;

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0 lg:pl-64">
      <div
        className="relative h-48"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #FB7185 50%, #60A5FA 100%)',
        }}
      >
        <div className="absolute top-4 left-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/feed')}
            className="p-2 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        <div className="flex justify-between items-end mb-6">
          <div className="relative">
            <UserAvatar
              src={user.profile_picture_url}
              username={user.username}
              size="large"
              level={displayUser?.level ?? user.level}
              streak={displayUser?.streak ?? user.streak}
              showStreak
            />
            <input
              type="file"
              id="profile-photo-upload"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            <motion.label
              htmlFor="profile-photo-upload"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary shadow-lg cursor-pointer"
            >
              <Camera className="w-4 h-4 text-primary-foreground" />
            </motion.label>
          </div>

          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="rounded-full px-6"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 mb-6"
            >
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input-background border-border/50 focus:border-primary/50 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-input-background border-border/50 focus:border-primary/50 rounded-xl resize-none"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="flex-1 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                  }}
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setUsername(profile?.username ?? user.username);
                    setBio(profile?.bio ?? user.bio ?? '');
                  }}
                  variant="outline"
                  className="flex-1 rounded-xl border-border/50"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="viewing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold">@{user.username}</h2>
              <p className="text-muted-foreground mt-2">{user.bio || 'No bio yet'}</p>
            </motion.div>
          )}
        </AnimatePresence>

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
            <div className="text-3xl font-bold">{displayUser?.level ?? user.level}</div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{displayUser?.xp ?? user.xp} XP</span>
                <span>{xpForNextLevel} XP</span>
              </div>
              <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
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
              {displayUser?.streak ?? user.streak}
              <span className="text-lg text-muted-foreground ml-1">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Keep it going! 🔥</p>
          </motion.div>
        </div>

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

        <div
          className="p-6 rounded-2xl border border-border/50 mb-6"
          style={{
            background: 'rgba(26, 18, 41, 0.5)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h3 className="text-lg font-semibold mb-4">Activity</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {profile?.chirps_count ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">Chirps</div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
              onClick={() => {
                setFollowModalType('followers');
                setShowFollowModal(true);
              }}
            >
              <div className="text-2xl font-bold text-secondary">
                {profile?.followers_count ?? 0}
              </div>
              <div className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                Followers
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
              onClick={() => {
                setFollowModalType('following');
                setShowFollowModal(true);
              }}
            >
              <div className="text-2xl font-bold text-accent">
                {profile?.following_count ?? 0}
              </div>
              <div className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Following
              </div>
            </motion.div>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <FollowListModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={user.id}
        type={followModalType}
      />

      <BottomNav />
    </div>
  );
};
