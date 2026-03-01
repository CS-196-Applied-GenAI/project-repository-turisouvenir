import React from 'react';
import { motion } from 'motion/react';
import { Bell, Heart, Repeat2, MessageCircle, UserPlus } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { UserAvatar } from '../components/UserAvatar';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'like' | 'retweet' | 'comment' | 'follow';
  user: {
    username: string;
    profile_picture_url: string;
    level: number;
  };
  content?: string;
  timestamp: string;
}

export const NotificationsScreen: React.FC = () => {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'like',
      user: {
        username: 'cosmicvibes',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic',
        level: 8
      },
      content: 'just dropped my new playlist and its fire 🔥🔥🔥',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
    {
      id: '2',
      type: 'follow',
      user: {
        username: 'pixelpanda',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel',
        level: 12
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: '3',
      type: 'comment',
      user: {
        username: 'neonwarrior',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon',
        level: 6
      },
      content: 'totally agree with this take!',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    },
    {
      id: '4',
      type: 'retweet',
      user: {
        username: 'dreamweaver',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dream',
        level: 15
      },
      content: 'main character energy today ✨',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 fill-secondary text-secondary" />;
      case 'retweet':
        return <Repeat2 className="w-5 h-5 text-accent" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-primary" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-accent" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your chirp';
      case 'retweet':
        return 'rechirped your chirp';
      case 'comment':
        return 'commented on your chirp';
      case 'follow':
        return 'started following you';
      default:
        return 'interacted with you';
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
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
          </h1>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {mockNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-2xl border border-border/50 cursor-pointer"
            style={{
              background: 'rgba(26, 18, 41, 0.5)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <UserAvatar
                    src={notification.user.profile_picture_url}
                    username={notification.user.username}
                    size="small"
                    level={notification.user.level}
                  />
                  
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">
                        @{notification.user.username}
                      </span>{' '}
                      <span className="text-muted-foreground">
                        {getNotificationText(notification)}
                      </span>
                    </p>
                    
                    {notification.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        "{notification.content}"
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty state example */}
        {mockNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              When someone interacts with your chirps, you'll see it here
            </p>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};