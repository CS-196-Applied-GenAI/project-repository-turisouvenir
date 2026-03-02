import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Bell, Heart, Repeat2, MessageCircle, UserPlus } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { UserAvatar } from '../components/UserAvatar';
import { getNotifications } from '../api/notifications';
import type { Notification } from '../api/notifications';
import { formatDistanceToNow } from 'date-fns';

export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

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
      <div
        className="sticky top-0 z-40 border-b border-border/50"
        style={{
          background: 'rgba(15, 10, 30, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
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
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="p-4 rounded-2xl border border-border/50 cursor-pointer"
              style={{
                background: 'rgba(26, 18, 41, 0.5)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <Link to={`/user/${notification.user.username}`}>
                      <UserAvatar
                        src={notification.user.profile_picture_url}
                        username={notification.user.username}
                        size="small"
                        level={notification.user.level}
                      />
                    </Link>
                    <div className="flex-1">
                      <p className="text-sm">
                        <Link
                          to={`/user/${notification.user.username}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          @{notification.user.username}
                        </Link>{' '}
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
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};
