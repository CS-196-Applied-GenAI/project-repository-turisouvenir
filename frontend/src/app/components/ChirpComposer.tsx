import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface ChirpComposerProps {
  onSubmit: (content: string) => Promise<void>;
  onClose?: () => void;
  placeholder?: string;
  compact?: boolean;
}

export const ChirpComposer: React.FC<ChirpComposerProps> = ({
  onSubmit,
  onClose,
  placeholder = "What's on your mind?",
  compact = false
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 280;
  const remaining = maxLength - content.length;
  const percentUsed = (content.length / maxLength) * 100;

  const getCharCountColor = () => {
    if (remaining < 0) return 'text-destructive';
    if (remaining < 20) return 'text-secondary';
    if (remaining < 50) return 'text-accent';
    return 'text-muted-foreground';
  };

  const getProgressColor = () => {
    if (remaining < 0) return '#F43F5E';
    if (remaining < 20) return '#FB7185';
    if (remaining < 50) return '#60A5FA';
    return '#A78BFA';
  };

  const handleSubmit = async () => {
    if (!content.trim() || content.length > maxLength || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={compact ? {} : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`${compact ? '' : 'p-6'} rounded-3xl border border-border/50`}
      style={{
        background: compact ? 'transparent' : 'rgba(26, 18, 41, 0.6)',
        backdropFilter: compact ? 'none' : 'blur(20px)'
      }}
    >
      {!compact && onClose && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Create Chirp</span>
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] resize-none bg-input-background border-border/50 focus:border-primary/50 rounded-2xl text-base placeholder:text-muted-foreground"
      />

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          {/* Character counter with circular progress */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="rgba(167, 139, 250, 0.1)"
                strokeWidth="3"
                fill="none"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                stroke={getProgressColor()}
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 20 * (1 - Math.min(percentUsed / 100, 1))
                }}
                transition={{ duration: 0.3 }}
                style={{
                  filter: remaining < 0 ? 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.6))' : 'none'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${getCharCountColor()}`}>
                {remaining < 50 ? remaining : ''}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {remaining < 0 && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm text-destructive font-medium"
              >
                Too long!
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || content.length > maxLength || isSubmitting}
          className="px-8 py-2 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
          }}
        >
          <motion.span
            className="relative z-10"
            animate={isSubmitting ? { opacity: 0.6 } : { opacity: 1 }}
          >
            {isSubmitting ? 'Posting...' : 'Chirp'}
          </motion.span>
          {!isSubmitting && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/30 to-primary/0"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
          )}
        </Button>
      </div>
    </motion.div>
  );
};
