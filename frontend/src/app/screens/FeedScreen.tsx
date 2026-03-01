import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Loader, RefreshCw } from 'lucide-react';
import { ChirpCard } from '../components/ChirpCard';
import { ChirpComposer } from '../components/ChirpComposer';
import { BottomNav } from '../components/BottomNav';
import { getFeed, toggleLike, toggleRetweet, createChirp, Chirp } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const FeedScreen: React.FC = () => {
  const [chirps, setChirps] = useState<Chirp[]>([]);
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
      setChirps(feed);
      setNextCursor(cursor);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreChirps = async () => {
    if (!nextCursor || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const { feed, nextCursor: cursor } = await getFeed(20, nextCursor);
      setChirps(prev => [...prev, ...feed]);
      setNextCursor(cursor);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { feed, nextCursor: cursor } = await getFeed(20);
      setChirps(feed);
      setNextCursor(cursor);
      toast.success('Feed refreshed! ✨');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateChirp = async (content: string) => {
    if (!user) return;
    
    const newChirp = await createChirp(content, user.id);
    setChirps(prev => [newChirp, ...prev]);
    setShowComposer(false);
    
    // Award XP for creating a chirp
    user.xp += 10;
    toast.success('+10 XP for chirping! 🎉');
  };

  const handleLike = async (id: string) => {
    await toggleLike(id);
    setChirps(prev => [...prev]);
  };

  const handleRetweet = async (id: string) => {
    await toggleRetweet(id);
    setChirps(prev => [...prev]);
    toast.success('Rechirped! 🔄');
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
      {/* Header */}
      <div 
        className="sticky top-0 z-40 border-b border-border/50"
        style={{
          background: 'rgba(15, 10, 30, 0.8)',
          backdropFilter: 'blur(20px)'
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

      {/* Feed content */}
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
                    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.5)'
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
            {/* Quick composer */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ChirpComposer onSubmit={handleCreateChirp} compact />
            </motion.div>

            {/* Chirps list */}
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

            {/* Loading more indicator */}
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

            {/* End of feed */}
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

      {/* Floating action button for mobile composer */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowComposer(true)}
        className="fixed bottom-24 right-6 lg:bottom-8 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.5)'
        }}
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      {/* Full screen composer modal */}
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