import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import {
  doc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
  getDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { clearSessionUser, setSessionUser } from './session';

const AUTH_TIMEOUT_MS = 12000;

const withTimeout = async <T>(promise: Promise<T>, message = 'Request timed out'): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), AUTH_TIMEOUT_MS);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

let persistencePromise: Promise<void> | null = null;
const ensurePersistence = () => {
  if (persistencePromise) return persistencePromise;
  persistencePromise = setPersistence(auth, browserLocalPersistence).catch((error) => {
    persistencePromise = null;
    throw error;
  });
  return persistencePromise;
};

const normalizeCreatedAt = (createdAt?: unknown) => {
  if (!createdAt) return new Date();
  if (createdAt instanceof Date) return createdAt;
  if (typeof createdAt === 'string' || typeof createdAt === 'number') {
    const date = new Date(createdAt);
    if (!Number.isNaN(date.getTime())) return date;
  }
  // Firestore Timestamp has toDate()
  // @ts-expect-error — accessing toDate for Firestore Timestamp compatibility
  if (typeof createdAt.toDate === 'function') return createdAt.toDate();
  return new Date();
};

const cacheSessionUser = (userId: string, data: { username?: string; displayUsername?: string; createdAt?: unknown }) => {
  const createdAt = normalizeCreatedAt(data.createdAt).toISOString();
  const username = (data.username || data.displayUsername || '').toString();
  if (username) {
    setSessionUser({ id: userId, username, createdAt });
  }
};

const formatAuthError = (error: unknown) => {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/invalid-api-key') {
      return new Error('Authentication is misconfigured. Please verify your Firebase environment variables and try again.');
    }
    if (error.code === 'auth/network-request-failed') {
      return new Error('Network error prevented contacting the authentication service. Please check your connection and try again.');
    }
  }
  return error;
};

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
  const snapshot = await withTimeout(getDocs(q), 'Username check timed out');
  return snapshot.empty;
};

export const signUp = async (username: string, password: string) => {
  try {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      throw new Error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
    }

    await ensurePersistence();

    const available = await isUsernameAvailable(username);
    if (!available) {
      throw new Error('Username is already taken');
    }

    const email = `${username.toLowerCase()}@mutualmatchweb.app`;
    const userCredential = await withTimeout(
      createUserWithEmailAndPassword(auth, email, password),
      'Creating your account is taking too long. Please try again.'
    );
    const user = userCredential.user;

    await withTimeout(updateProfile(user, { displayName: username }), 'Updating your profile is taking too long.');

    await withTimeout(
      setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        username: username.toLowerCase(),
        displayUsername: username,
        createdAt: serverTimestamp(),
      }),
      'Saving your profile is taking too long.'
    );

    cacheSessionUser(user.uid, { username, createdAt: new Date() });
    return user;
  } catch (error) {
    throw formatAuthError(error);
  }
};

export const signIn = async (username: string, password: string) => {
  try {
    const email = `${username.toLowerCase()}@mutualmatchweb.app`;
    await ensurePersistence();
    const userCredential = await withTimeout(
      signInWithEmailAndPassword(auth, email, password),
      'Signing in is taking longer than expected. Please try again.'
    );

    const userProfile = await withTimeout(
      getDoc(doc(db, 'users', userCredential.user.uid)),
      'Loading your profile is taking too long.'
    );
    if (userProfile.exists()) {
      cacheSessionUser(userCredential.user.uid, userProfile.data());
    } else {
      cacheSessionUser(userCredential.user.uid, { username });
    }

    return userCredential.user;
  } catch (error) {
    throw formatAuthError(error);
  }
};

export const logOut = async () => {
  await signOut(auth);
  clearSessionUser();
};

export const deleteAccount = async (password: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No user logged in');

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);

  const batch = writeBatch(db);

  const likesQuery = query(collection(db, 'likes'), where('fromUserId', '==', user.uid));
  const likesSnapshot = await getDocs(likesQuery);
  likesSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

  const matchesQueryA = query(collection(db, 'matches'), where('userAId', '==', user.uid));
  const matchesQueryB = query(collection(db, 'matches'), where('userBId', '==', user.uid));
  const [matchesA, matchesB] = await Promise.all([getDocs(matchesQueryA), getDocs(matchesQueryB)]);
  matchesA.forEach((docSnap) => batch.delete(docSnap.ref));
  matchesB.forEach((docSnap) => batch.delete(docSnap.ref));

  const membershipsQuery = query(collection(db, 'memberships'), where('userId', '==', user.uid));
  const membershipsSnapshot = await getDocs(membershipsQuery);
  membershipsSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

  batch.delete(doc(db, 'users', user.uid));

  await batch.commit();
  await deleteUser(user);
  clearSessionUser();
};
