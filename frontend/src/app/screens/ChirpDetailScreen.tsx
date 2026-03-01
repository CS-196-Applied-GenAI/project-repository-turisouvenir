import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Loader, Send } from 'lucide-react';
import { ChirpCard } from '../components/ChirpCard';
import { UserAvatar } from '../components/UserAvatar';
import { BottomNav } from '../components/BottomNav';
import { getChirpById, getComments, addComment, toggleLike, toggleRetweet, Chirp, Comment } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export const ChirpDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [chirp, setChirp] = useState<Chirp | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      loadChirpAndComments();
    }
  }, [id]);

  const loadChirpAndComments = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const [chirpData, commentsData] = await Promise.all([
        getChirpById(id),
        getComments(id)
      ]);
      setChirp(chirpData);
      setComments(commentsData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (chirpId: string) => {
    await toggleLike(chirpId);
    if (chirp && chirp.id === chirpId) {
      setChirp({ ...chirp });
    }
  };

  const handleRetweet = async (chirpId: string) => {
    await toggleRetweet(chirpId);
    if (chirp && chirp.id === chirpId) {
      setChirp({ ...chirp });
    }
    toast.success('Rechirped! 🔄');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !id) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await addComment(id, commentText, user.id);
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      toast.success('+5 XP for commenting! 💬');
      
      // Update chirp comment count
      if (chirp) {
        setChirp({ ...chirp });
      }
    } finally {
      setIsSubmittingComment(false);
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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </motion.button>
          <div>
            <h1>Chirp Thread</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
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
              <p className="text-muted-foreground">Loading chirp...</p>
            </div>
          </div>
        ) : !chirp ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Chirp not found 😢</p>
            <button
              onClick={() => navigate('/feed')}
              className="mt-4 text-primary hover:text-primary/80 transition-colors"
            >
              Back to feed
            </button>
          </div>
        ) : (
          <>
            {/* Main chirp */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ChirpCard
                chirp={chirp}
                onLike={handleLike}
                onRetweet={handleRetweet}
                onComment={() => {}}
              />
            </motion.div>

            {/* Comment input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 p-4 rounded-2xl border border-border/50"
              style={{
                background: 'rgba(26, 18, 41, 0.4)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <form onSubmit={handleAddComment} className="flex gap-3">
                <UserAvatar
                  src={user?.profile_picture_url}
                  username={user?.username || 'User'}
                  size="medium"
                  level={user?.level}
                />
                <div className="flex-1 flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add your thoughts..."
                    className="bg-input-background border-border/50 focus:border-primary/50 rounded-xl flex-1"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="px-4 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* Comments list */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">Comments</h3>
              
              <AnimatePresence mode="popLayout">
                {comments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <p>No comments yet</p>
                    <p className="text-sm mt-2">Be the first to share your thoughts!</p>
                  </motion.div>
                ) : (
                  comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-2xl border border-border/50"
                      style={{
                        background: 'rgba(26, 18, 41, 0.3)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="flex gap-3">
                        <Link to={`/user/${comment.author.username}`}>
                          <UserAvatar
                            src={comment.author.profile_picture_url}
                            username={comment.author.username}
                            size="small"
                            level={comment.author.level}
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link 
                              to={`/user/${comment.author.username}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              @{comment.author.username}
                            </Link>
                            <span className="text-muted-foreground text-sm">
                              · {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="mt-1 text-foreground break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};