import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function PushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [subscription, setSubscription] = useState(null);

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 3000,
  });

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setPermission(permission);
    }
  };

  useEffect(() => {
    if (!requests.length) return;

    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return;

    const userRequests = requests.filter(r => r.email === userEmail && r.status === 'waiting');
    if (!userRequests.length) return;

    const myRequest = userRequests[0];
    const myPosition = requests.filter(r => r.status === 'waiting').findIndex(r => r.id === myRequest.id);

    // התראה כשאתה במקום 3 או פחות
    if (myPosition <= 2 && myPosition >= 0 && permission === 'granted') {
      const notifiedKey = `notified_${myRequest.id}_position_${myPosition}`;
      if (!localStorage.getItem(notifiedKey)) {
        showNotification(
          '🎤 התור שלך מתקרב!',
          `אתה במקום ${myPosition + 1} בתור. התכונן!`,
          myPosition
        );
        localStorage.setItem(notifiedKey, 'true');
        
        // רטט אם זמין
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    }

    // התראה כשהגיע התור
    const performing = requests.find(r => r.status === 'performing');
    if (performing && performing.email === userEmail && permission === 'granted') {
      const performingKey = `notified_performing_${performing.id}`;
      if (!localStorage.getItem(performingKey)) {
        showNotification(
          '🎉 התור שלך הגיע!',
          'עלה לבמה עכשיו! 🎤',
          0
        );
        localStorage.setItem(performingKey, 'true');
        
        // רטט חזק
        if ('vibrate' in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500]);
        }
      }
    }
  }, [requests, permission]);

  const showNotification = (title, body, position) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `queue-position-${position}`,
        requireInteraction: position === 0,
        vibrate: position === 0 ? [500, 200, 500] : [200, 100, 200],
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // נגן צליל
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTWH0fPTgjMGHm7A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFgtCmuT0wW0gBTqPz/TVejMGHm3A7+OZSA0PVank87FeFg==');
        audio.play().catch(() => {});
      } catch (e) {}
    }
  };

  return null;
}