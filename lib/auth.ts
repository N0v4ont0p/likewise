import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const signUp = async (username: string, password: string) => {
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    throw new Error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
  }

  const available = await isUsernameAvailable(username);
  if (!available) {
    throw new Error('Username is already taken');
  }

  const email = `${username.toLowerCase()}@mutualmatchweb.app`;
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: username });

  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    username: username.toLowerCase(),
    displayUsername: username,
    createdAt: serverTimestamp(),
  });

  return user;
};

export const signIn = async (username: string, password: string) => {
  const email = `${username.toLowerCase()}@mutualmatchweb.app`;
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logOut = async () => {
  await signOut(auth);
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
};
