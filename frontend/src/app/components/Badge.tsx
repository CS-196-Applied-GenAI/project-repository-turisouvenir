import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  unlocked?: boolean;
  index?: number;
}

export const Badge: React.FC<BadgeProps> = ({
  name,
  description,
  icon: Icon,
  color,
  unlocked = false,
  index = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      className={`p-4 rounded-2xl border border-border/50 ${
        unlocked ? 'cursor-pointer' : 'opacity-50'
      }`}
      style={{
        background: 'rgba(26, 18, 41, 0.5)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Badge icon */}
        <motion.div
          animate={unlocked ? {
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
            unlocked ? '' : 'grayscale'
          }`}
          style={{
            background: unlocked 
              ? `linear-gradient(135deg, ${color} 0%, ${color}90 100%)`
              : 'rgba(161, 161, 184, 0.2)',
            boxShadow: unlocked ? `0 4px 20px ${color}40` : 'none'
          }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Badge info */}
        <h4 className="font-semibold text-sm mb-1">{name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Locked/Unlocked indicator */}
        {!unlocked && (
          <div className="mt-2 text-xs text-muted-foreground">
            🔒 Locked
          </div>
        )}
      </div>
    </motion.div>
  );
};
