import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, Lock, User, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
        toast.success('Welcome back! 🎉');
      } else {
        if (!email) return;
        await register(username, email, password, bio);
        toast.success('Account created! Welcome to Chirper! 🚀');
      }
      navigate('/feed');
    } catch (error: unknown) {
      const e = error as { error?: string };
      toast.error(e?.error || 'Something went wrong. Try again!');
    } finally {
      setIsLoading(false);
    }
  };

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
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: 'linear-gradient(135deg, #FB7185 0%, #F472B6 100%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and branding */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
              boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5)'
            }}
          >
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl mb-2">Chirper</h1>
          <p className="text-muted-foreground">Where vibes meet community 💜</p>
        </motion.div>

        {/* Auth form */}
        <motion.div
          layout
          className="p-8 rounded-3xl border border-border/50"
          style={{
            background: 'rgba(26, 18, 41, 0.6)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Toggle between login and register */}
          <div className="flex gap-2 p-1 mb-6 rounded-2xl bg-background/30">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                isLogin
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                !isLogin
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                className="bg-input-background border-border/50 focus:border-primary/50 rounded-xl"
              />
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required={!isLogin}
                    className="bg-input-background border-border/50 focus:border-primary/50 rounded-xl"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-input-background border-border/50 focus:border-primary/50 rounded-xl"
              />
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Bio (optional)
                  </label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-input-background border-border/50 focus:border-primary/50 rounded-xl resize-none"
                    rows={3}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 rounded-2xl font-bold text-lg relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              <motion.span
                className="relative z-10"
                animate={isLoading ? { opacity: 0.6 } : { opacity: 1 }}
              >
                {isLoading ? 'Loading...' : isLogin ? 'Let\'s Go!' : 'Join Chirper'}
              </motion.span>
              {!isLoading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/30 to-primary/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </Button>
          </form>
        </motion.div>

        {/* Fun tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground text-sm mt-6"
        >
          {isLogin ? 'New here?' : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            {isLogin ? 'Create an account' : 'Sign in'}
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};
