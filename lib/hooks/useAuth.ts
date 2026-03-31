'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../../types';
import { clearSessionUser, getSessionUser, setSessionUser } from '../session';

export const useAuth = () => {
  const sessionUser = getSessionUser();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    if (!sessionUser) return null;
    return {
      id: sessionUser.id,
      username: sessionUser.username,
      createdAt: sessionUser.createdAt ? new Date(sessionUser.createdAt) : new Date(),
    };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const failSafe = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 10000);

    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser) => {
        try {
          setFirebaseUser(fbUser);
          if (fbUser) {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              const createdAt =
                data.createdAt instanceof Timestamp
                  ? data.createdAt.toDate()
                  : data.createdAt
                  ? new Date(data.createdAt)
                  : new Date();
              const normalizedUser: User = {
                id: fbUser.uid,
                username: data.username || data.displayUsername || fbUser.displayName || 'user',
                createdAt,
              };
              setUser(normalizedUser);
              setSessionUser({
                id: normalizedUser.id,
                username: normalizedUser.username,
                createdAt: normalizedUser.createdAt.toISOString(),
              });
            } else {
              const fallbackUser: User = {
                id: fbUser.uid,
                username: fbUser.displayName || sessionUser?.username || 'user',
                createdAt: new Date(),
              };
              setUser(fallbackUser);
              setSessionUser({
                id: fallbackUser.id,
                username: fallbackUser.username,
                createdAt: fallbackUser.createdAt.toISOString(),
              });
            }
          } else {
            clearSessionUser();
            setUser(null);
          }
        } catch (err) {
          console.error('Auth sync failed', err);
          setError('Unable to refresh your session. Please try again.');
        } finally {
          if (!cancelled) setLoading(false);
        }
      },
      (err) => {
        console.error('Auth listener error', err);
        setError('Unable to connect to authentication services.');
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(failSafe);
      unsubscribe();
    };
  }, [sessionUser?.username]);

  return { firebaseUser, user, loading, error };
};
