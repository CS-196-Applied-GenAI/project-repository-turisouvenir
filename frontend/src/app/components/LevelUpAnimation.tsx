import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Sparkles } from 'lucide-react';

interface LevelUpAnimationProps {
  level: number;
  onComplete?: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({ level, onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: 'rgba(15, 10, 30, 0.9)' }}
    >
      <div className="text-center">
        {/* Trophy icon with bounce */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: 2,
            ease: 'easeInOut'
          }}
          className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
            boxShadow: '0 20px 60px rgba(139, 92, 246, 0.8)'
          }}
        >
          <Trophy className="w-16 h-16 text-primary-foreground" />
        </motion.div>

        {/* Level up text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-4xl font-bold mb-2">Level Up!</h2>
          <p className="text-2xl text-muted-foreground mb-4">
            You reached <span className="text-primary font-bold">Level {level}</span>
          </p>
          <p className="text-sm text-muted-foreground">Keep crushing it! 🚀</p>
        </motion.div>

        {/* Sparkles around */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8;
          const distance = 150;
          const x = Math.cos((angle * Math.PI) / 180) * distance;
          const y = Math.sin((angle * Math.PI) / 180) * distance;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: [0, x],
                y: [0, y],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 1.5,
                delay: 0.2 + i * 0.1,
                ease: 'easeOut'
              }}
              className="absolute top-1/2 left-1/2"
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
