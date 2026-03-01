import React from 'react';
import { motion } from 'motion/react';

export const ChirpSkeleton: React.FC = () => {
  return (
    <div 
      className="p-4 rounded-2xl border border-border/50"
      style={{
        background: 'rgba(26, 18, 41, 0.4)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex gap-3">
        {/* Avatar skeleton */}
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="w-12 h-12 rounded-full bg-muted/30"
        />

        <div className="flex-1 space-y-3">
          {/* Header skeleton */}
          <div className="flex gap-2">
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.1
              }}
              className="h-4 w-24 rounded bg-muted/30"
            />
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2
              }}
              className="h-4 w-16 rounded bg-muted/20"
            />
          </div>

          {/* Content skeleton */}
          <div className="space-y-2">
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3
              }}
              className="h-4 w-full rounded bg-muted/30"
            />
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4
              }}
              className="h-4 w-3/4 rounded bg-muted/30"
            />
          </div>

          {/* Actions skeleton */}
          <div className="flex gap-6 pt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5 + i * 0.1
                }}
                className="h-4 w-12 rounded bg-muted/20"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeedSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <ChirpSkeleton key={i} />
      ))}
    </div>
  );
};
