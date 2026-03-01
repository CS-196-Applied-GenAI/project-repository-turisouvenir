import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Sparkles, Award, Flame } from 'lucide-react';

interface AchievementNotificationProps {
  type: 'level_up' | 'badge' | 'streak' | 'xp';
  title: string;
  description: string;
  icon?: 'trophy' | 'sparkles' | 'award' | 'flame';
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  type,
  title,
  description,
  icon = 'trophy'
}) => {
  const icons = {
    trophy: Trophy,
    sparkles: Sparkles,
    award: Award,
    flame: Flame
  };

  const Icon = icons[icon];

  const gradients = {
    level_up: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    badge: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
    streak: 'linear-gradient(135deg, #84CC16 0%, #A3E635 100%)',
    xp: 'linear-gradient(135deg, #FB7185 0%, #F472B6 100%)'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      className="p-4 rounded-2xl border border-border/50 shadow-2xl max-w-sm"
      style={{
        background: 'rgba(26, 18, 41, 0.95)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 0.5,
            repeat: 2
          }}
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: gradients[type],
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.5)'
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        <div className="flex-1">
          <h4 className="font-bold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Sparkle effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: 3 }}
        className="absolute -top-2 -right-2"
      >
        <Sparkles className="w-6 h-6 text-primary" />
      </motion.div>
    </motion.div>
  );
};
