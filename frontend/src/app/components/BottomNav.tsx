import React from 'react';
import { Home, User, Bell, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <nav className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-50 border-r border-border/50"
        style={{
          background: 'rgba(15, 10, 30, 0.9)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="flex items-center gap-2 text-2xl">
              <span>Chirper</span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                ✨
              </motion.span>
            </h1>
          </div>

          {/* Nav Items */}
          <div className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-lg font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarTab"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full"
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                          boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)'
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* User Info at Bottom */}
          {user && (
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)'
                  }}
                >
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">@{user.username}</p>
                  <p className="text-xs text-muted-foreground">Level {user.level}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div 
          className="border-t border-border/50"
          style={{
            background: 'rgba(15, 10, 30, 0.9)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div className="max-w-lg mx-auto flex items-center justify-around px-2 h-16">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center justify-center flex-1 h-full group"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <Icon
                      className={`w-6 h-6 transition-all ${
                        isActive
                          ? 'text-primary scale-110'
                          : 'text-muted-foreground group-hover:text-primary'
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                          boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)'
                        }}
                      />
                    )}
                  </motion.div>
                  <span
                    className={`text-xs mt-1 transition-colors ${
                      isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};