import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface UserAvatarProps {
  src?: string;
  username: string;
  size?: 'small' | 'medium' | 'large';
  level?: number;
  streak?: number;
  showStreak?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  username,
  size = 'medium',
  level,
  streak,
  showStreak = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-12 h-12',
    large: 'w-20 h-20'
  };

  const levelSizeClasses = {
    small: 'w-5 h-5 text-[10px]',
    medium: 'w-6 h-6 text-xs',
    large: 'w-8 h-8 text-sm'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-secondary/20`}
      >
        <img
          src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
          alt={username}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {level !== undefined && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute -bottom-1 -right-1 ${levelSizeClasses[size]} rounded-full flex items-center justify-center font-bold`}
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
          }}
        >
          {level}
        </motion.div>
      )}

      {showStreak && streak && streak > 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -top-1 -right-1"
        >
          <div className="relative">
            <Flame className="w-5 h-5 fill-[#84CC16] text-[#A3E635]" />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-background">
              {streak}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
