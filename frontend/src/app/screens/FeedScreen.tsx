import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Loader, RefreshCw } from 'lucide-react';
import { ChirpCard } from '../components/ChirpCard';
import { ChirpComposer } from '../components/ChirpComposer';
import { BottomNav } from '../components/BottomNav';
import { getFeed } from '../api/feed';
import { createTweet, likeTweet, unlikeTweet, retweet, unretweet } from '../api/tweets';
import type { Chirp } from '../api/feed';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

function chirpToDisplay(c: Chirp): Chirp & { id: string } {
  return { ...c, id: String(c.id) };
}

export const FeedScreen: React.FC = () => {
  const [chirps, setChirps] = useState<(Chirp & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadInitialFeed();
  }, []);

  const loadInitialFeed = async () => {
    setIsLoading(true);
    try {
      const { feed, nextCursor: cursor } = await getFeed(20);
      setChirps(feed.map(chirpToDisplay));
      setNextCursor(cursor);
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreChirps = async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const { feed, nextCursor: cursor } = await getFeed(20, nextCursor);
      setChirps((prev) => [...prev, ...feed.map(chirpToDisplay)]);
      setNextCursor(cursor);
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to load more');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { feed, nextCursor: cursor } = await getFeed(20);
      setChirps(feed.map(chirpToDisplay));
      setNextCursor(cursor);
      toast.success('Feed refreshed! ✨');
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateChirp = async (content: string) => {
    if (!user) return;

    try {
      const newChirp = await createTweet(content);
      setChirps((prev) => [chirpToDisplay(newChirp), ...prev]);
      setShowComposer(false);
      toast.success('Chirped! 🎉');
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to post');
    }
  };

  const handleLike = async (id: string) => {
    const chirp = chirps.find((c) => c.id === id);
    if (!chirp) return;
    const target = chirp.original_tweet || chirp;
    try {
      if (chirp.is_liked) {
        await unlikeTweet(id);
        setChirps((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  is_liked: false,
                  likes_count: Math.max(0, c.likes_count - 1),
                  ...(c.original_tweet && {
                    original_tweet: {
                      ...c.original_tweet,
                      is_liked: false,
                      likes_count: Math.max(0, c.original_tweet.likes_count - 1),
                    },
                  }),
                }
              : c
          )
        );
      } else {
        await likeTweet(id);
        setChirps((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  is_liked: true,
                  likes_count: c.likes_count + 1,
                  ...(c.original_tweet && {
                    original_tweet: {
                      ...c.original_tweet,
                      is_liked: true,
                      likes_count: c.original_tweet.likes_count + 1,
                    },
                  }),
                }
              : c
          )
        );
      }
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to update like');
    }
  };

  const handleRetweet = async (id: string) => {
    const chirp = chirps.find((c) => c.id === id);
    if (!chirp) return;
    const originalId = chirp.original_tweet_id || chirp.id;
    try {
      if (chirp.is_retweeted) {
        await unretweet(String(originalId));
        setChirps((prev) =>
          prev.map((c) => {
            const match = c.id === id || c.original_tweet_id === Number(originalId);
            if (!match) return c;
            const base = c.original_tweet || c;
            return {
              ...c,
              is_retweeted: false,
              retweets_count: Math.max(0, base.retweets_count - 1),
              ...(c.original_tweet && {
                original_tweet: {
                  ...c.original_tweet,
                  is_retweeted: false,
                  retweets_count: Math.max(0, c.original_tweet.retweets_count - 1),
                },
              }),
            };
          })
        );
        toast.success('Unrechirped');
      } else {
        await retweet(String(originalId));
        setChirps((prev) =>
          prev.map((c) => {
            const base = c.original_tweet || c;
            const isThisChirp = c.id === id || (base && base.id === Number(originalId));
            if (!isThisChirp) return c;
            return {
              ...c,
              is_retweeted: true,
              retweets_count: base.retweets_count + 1,
              ...(c.original_tweet && {
                original_tweet: {
                  ...c.original_tweet,
                  is_retweeted: true,
                  retweets_count: c.original_tweet.retweets_count + 1,
                },
              }),
            };
          })
        );
        toast.success('Rechirped! 🔄');
      }
    } catch (err: unknown) {
      const e = err as { error?: string };
      toast.error(e?.error || 'Failed to rechirp');
    }
  };

  const handleComment = (id: string) => {
    navigate(`/chirp/${id}`);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isLoadingMore && nextCursor) {
      loadMoreChirps();
    }
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-0 lg:pl-64">
      <div
        className="sticky top-0 z-40 border-b border-border/50"
        style={{
          background: 'rgba(15, 10, 30, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 lg:hidden">
              <span className="text-2xl">Chirper</span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                ✨
              </motion.span>
            </h1>
            <h1 className="hidden lg:block text-2xl">Feed</h1>
            <p className="text-sm text-muted-foreground">Your feed is on fire</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.9, rotate: 180 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div
        className="max-w-2xl mx-auto px-4 py-6 space-y-4 overflow-y-auto"
        onScroll={handleScroll}
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
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
              <p className="text-muted-foreground">Loading your feed...</p>
            </div>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <ChirpComposer onSubmit={handleCreateChirp} compact />
            </motion.div>

            <AnimatePresence mode="popLayout">
              {chirps.map((chirp) => (
                <ChirpCard
                  key={chirp.id}
                  chirp={chirp}
                  onLike={handleLike}
                  onRetweet={handleRetweet}
                  onComment={handleComment}
                  onClick={() => navigate(`/chirp/${chirp.id}`)}
                />
              ))}
            </AnimatePresence>

            {isLoadingMore && (
              <div className="flex justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader className="w-6 h-6 text-primary" />
                </motion.div>
              </div>
            )}

            {!nextCursor && chirps.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <p>You've reached the end! 🎉</p>
                <p className="text-sm mt-2">Come back later for more chirps</p>
              </motion.div>
            )}
          </>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowComposer(true)}
        className="fixed bottom-24 right-6 lg:bottom-8 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.5)',
        }}
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15, 10, 30, 0.95)' }}
            onClick={() => setShowComposer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <ChirpComposer
                onSubmit={handleCreateChirp}
                onClose={() => setShowComposer(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};
