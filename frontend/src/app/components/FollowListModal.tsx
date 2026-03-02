import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { getFollowers, getFollowing, follow, unfollow } from '../api/users';
import type { UserProfile } from '../api/users';
import { UserAvatar } from './UserAvatar';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  userId,
  type,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) loadUsers();
  }, [isOpen, userId, type]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data =
        type === 'followers' ? await getFollowers(userId) : await getFollowing(userId);
      setUsers(data);
      const states: Record<string, boolean> = {};
      data.forEach((u) => {
        states[String(u.id)] = u.is_following ?? false;
      });
      setFollowStates(states);
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUser: UserProfile) => {
    try {
      const result = targetUser.is_following
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

  const handleUserClick = (username: string) => {
    onClose();
    navigate(`/user/${username}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative w-full max-w-lg mx-4 mb-4 sm:mb-0 max-h-[80vh] rounded-3xl border border-border/50 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 18, 41, 0.98) 0%, rgba(18, 12, 30, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
          }}
        >
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <h2 className="text-2xl font-bold">
              {type === 'followers' ? 'Followers' : 'Following'}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="overflow-y-auto max-h-[calc(80vh-88px)] p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {type === 'followers'
                    ? 'No followers yet'
                    : 'Not following anyone yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-border/30 hover:border-primary/50 transition-all cursor-pointer"
                    style={{
                      background: 'rgba(26, 18, 41, 0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                    onClick={() => handleUserClick(u.username)}
                  >
                    <UserAvatar
                      src={u.profile_picture_url ?? undefined}
                      username={u.username}
                      size="medium"
                      level={u.level ?? 1}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">@{u.username}</h3>
                      {u.bio && (
                        <p className="text-sm text-muted-foreground truncate">{u.bio}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-primary">Level {u.level ?? 1}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {u.followers_count} followers
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full px-4 shrink-0"
                      style={{
                        background: followStates[String(u.id)]
                          ? 'rgba(139, 92, 246, 0.2)'
                          : 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                        border: followStates[String(u.id)]
                          ? '1px solid rgba(139, 92, 246, 0.5)'
                          : 'none',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(u);
                      }}
                    >
                      {followStates[String(u.id)] ? (
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
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
