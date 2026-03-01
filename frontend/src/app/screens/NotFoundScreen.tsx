import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Home, Search, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

export const NotFoundScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background gradients */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        {/* 404 Text */}
        <motion.div
          animate={{
            y: [0, -10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Looks like this page took a wrong turn into the void. Don't worry, we'll get you back on track!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/feed')}
            className="px-8 py-6 rounded-2xl font-bold text-base relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
              boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)'
            }}
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Feed
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/30 to-primary/0"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          </Button>

          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="px-8 py-6 rounded-2xl font-bold text-base border-border/50"
          >
            Go Back
          </Button>
        </div>

        {/* Fun decoration */}
        <motion.div
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute -top-20 -right-20 opacity-20"
        >
          <Sparkles className="w-40 h-40 text-primary" />
        </motion.div>
      </motion.div>
    </div>
  );
};
