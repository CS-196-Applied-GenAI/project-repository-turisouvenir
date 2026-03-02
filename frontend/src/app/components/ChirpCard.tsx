import React, { useState } from 'react';
import { Heart, Repeat2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import type { Chirp } from '../api/feed';
import { UserAvatar } from './UserAvatar';
import { formatDistanceToNow } from 'date-fns';

export type ChirpDisplay = Chirp & { id: string | number };

interface ChirpCardProps {
  chirp: ChirpDisplay;
  onLike: (id: string) => void;
  onRetweet: (id: string) => void;
  onComment: (id: string) => void;
  onClick?: () => void;
}

export const ChirpCard = React.forwardRef<HTMLDivElement, ChirpCardProps>(({
  chirp,
  onLike,
  onRetweet,
  onComment,
  onClick
}, ref) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isRetweeting, setIsRetweeting] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    await onLike(String(chirp.id));
    setTimeout(() => setIsLiking(false), 500);
  };

  const handleRetweet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRetweeting) return;
    setIsRetweeting(true);
    await onRetweet(String(chirp.id));
    setTimeout(() => setIsRetweeting(false), 500);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment(String(chirp.id));
  };

  const renderChirpContent = (chirpData: ChirpDisplay, isNested: boolean = false) => (
    <div className={`${isNested ? 'mt-3 p-4 rounded-2xl border border-border/50 bg-background/30' : ''}`}>
      <div className="flex gap-3">
        <Link to={`/user/${chirpData.author.username}`} onClick={(e) => e.stopPropagation()}>
          <UserAvatar
            src={chirpData.author.profile_picture_url}
            username={chirpData.author.username}
            size="medium"
            level={chirpData.author.level}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link 
              to={`/user/${chirpData.author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              @{chirpData.author.username}
            </Link>
            <span className="text-muted-foreground text-sm">
              · {formatDistanceToNow(new Date(chirpData.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="mt-2 text-foreground whitespace-pre-wrap break-words">
            {chirpData.content}
          </p>

          {!isNested && (
            <div className="flex items-center gap-6 mt-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`flex items-center gap-1.5 group transition-colors ${
                  chirpData.is_liked ? 'text-secondary' : 'text-muted-foreground hover:text-secondary'
                }`}
              >
                <div className="relative">
                  <Heart
                    className={`w-5 h-5 transition-all ${chirpData.is_liked ? 'fill-current scale-110' : ''}`}
                  />
                  <AnimatePresence>
                    {isLiking && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(251, 113, 133, 0.4) 0%, transparent 70%)'
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-sm font-medium">{chirpData.likes_count}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleRetweet}
                className={`flex items-center gap-1.5 group transition-colors ${
                  chirpData.is_retweeted ? 'text-accent' : 'text-muted-foreground hover:text-accent'
                }`}
              >
                <div className="relative">
                  <Repeat2
                    className={`w-5 h-5 transition-all ${chirpData.is_retweeted ? 'scale-110' : ''}`}
                  />
                  <AnimatePresence>
                    {isRetweeting && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%)'
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-sm font-medium">{chirpData.retweets_count}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleComment}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{chirpData.comments_count}</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={onClick}
      className="p-4 rounded-2xl border border-border/50 cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      style={{
        background: 'rgba(26, 18, 41, 0.4)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {chirp.original_tweet ? (
        <>
          <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
            <Repeat2 className="w-4 h-4" />
            <span>@{chirp.author.username} rechirped</span>
          </div>
          {renderChirpContent(chirp.original_tweet, true)}
        </>
      ) : (
        renderChirpContent(chirp)
      )}
    </motion.div>
  );
});

ChirpCard.displayName = 'ChirpCard';