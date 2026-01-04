import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { safeLocalStorage } from '@/utils/safeStorage';
import { Clock, CheckCircle, XCircle, Music } from 'lucide-react';

export default function MyQueueTracker() {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    const email = safeLocalStorage.getItem('apiryon_user_email');
    setUserEmail(email);
  }, []);

  const { data: allRequests = [], isLoading } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 10000,
    staleTime: 8000,
    enabled: !!userEmail
  });

  const myRequests = allRequests.filter(r => r.email === userEmail);
  const waiting = myRequests.filter(r => r.status === 'waiting');
  const performing = myRequests.filter(r => r.status === 'performing');
  const done = myRequests.filter(r => r.status === 'done');

  if (!userEmail || myRequests.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      borderRadius: '16px',
      padding: '16px',
      marginTop: '16px',
      border: '2px solid rgba(0, 202, 255, 0.3)'
    }}>
      <h3 style={{
        fontSize: '1.2rem',
        fontWeight: '700',
        color: '#00caff',
        marginBottom: '12px',
        textAlign: 'center'
      }}>
        🎤 השירים שלי
      </h3>

      {performing.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
          border: '2px solid #fbbf24',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '12px'
        }}>
          <div style={{ color: '#fbbf24', fontSize: '0.85rem', marginBottom: '4px' }}>
            🔴 שר עכשיו!
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
            {performing[0].song_title}
          </div>
        </div>
      )}

      {waiting.length > 0 && (
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>
            ⏳ ממתינים ({waiting.length})
          </div>
          {waiting.map((req, idx) => (
            <div key={req.id} style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '8px'
            }}>
              <div style={{ color: '#e2e8f0', fontWeight: '600' }}>
                {req.song_title}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                מיקום: #{idx + 1} • המתנה: ~{(idx + 1) * 3.5} דקות
              </div>
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ color: '#22c55e', fontSize: '0.85rem' }}>
            ✅ הושלמו: {done.length}
          </div>
        </div>
      )}
    </div>
  );
}
