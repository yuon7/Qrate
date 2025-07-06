export interface RecommendSessionData {
  results: any[];
  roomId: string;
  timestamp: number;
}

const PREFIX = 'recommend-';
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24時間

export function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function saveSession(sessionId: string, data: RecommendSessionData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${PREFIX}${sessionId}`;
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save session data:', error);
    throw new Error('Session storage save failed');
  }
}

export function getSession(sessionId: string): RecommendSessionData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = `${PREFIX}${sessionId}`;
    const data = sessionStorage.getItem(key);
    
    if (!data) {
      return null;
    }
    
    const parsed = JSON.parse(data) as RecommendSessionData;
    
    // 有効期限チェック
    if (Date.now() - parsed.timestamp > EXPIRY_TIME) {
      removeSession(sessionId);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to get session data:', error);
    return null;
  }
}

export function removeSession(sessionId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${PREFIX}${sessionId}`;
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove session data:', error);
  }
}

export function clearExpiredSessions(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keys = Object.keys(sessionStorage).filter(key => 
      key.startsWith(PREFIX)
    );
    
    keys.forEach(key => {
      const data = sessionStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data) as RecommendSessionData;
          if (Date.now() - parsed.timestamp > EXPIRY_TIME) {
            sessionStorage.removeItem(key);
          }
        } catch {
          // 不正なデータは削除
          sessionStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Failed to clear expired sessions:', error);
  }
}

export function saveRecommendationResult(results: any[], roomId: string): string {
  const sessionId = generateSessionId();
  const sessionData: RecommendSessionData = {
    results,
    roomId,
    timestamp: Date.now(),
  };
  
  saveSession(sessionId, sessionData);
  return sessionId;
}