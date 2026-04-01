import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Group, Membership, Match, School } from '../types';

const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
};

export const createSchool = async (userId: string, schoolName: string): Promise<School> => {
  const schoolRef = await addDoc(collection(db, 'schools'), {
    name: schoolName.trim(),
    ownerId: userId,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'schoolMembers', `${schoolRef.id}_${userId}`), {
    userId,
    schoolId: schoolRef.id,
    role: 'owner',
    joinedAt: serverTimestamp(),
  });

  return {
    id: schoolRef.id,
    name: schoolName.trim(),
    ownerId: userId,
    createdAt: new Date(),
  };
};

export const getUserSchools = async (userId: string): Promise<School[]> => {
  const q = query(collection(db, 'schoolMembers'), where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const schools = await Promise.all(
    snapshot.docs.map(async (memberDoc) => {
      const { schoolId } = memberDoc.data();
      const schoolDoc = await getDoc(doc(db, 'schools', schoolId));
      if (!schoolDoc.exists()) return null;
      return { id: schoolDoc.id, ...schoolDoc.data() } as School;
    })
  );

  return schools.filter(Boolean) as School[];
};

export const getSchoolClasses = async (schoolId: string): Promise<Group[]> => {
  const q = query(collection(db, 'groups'), where('schoolId', '==', schoolId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Group));
};

export const createGroup = async (userId: string, username: string, groupName: string, schoolId?: string): Promise<Group> => {
  let inviteCode = generateInviteCode();
  
  let attempts = 0;
  while (attempts < 10) {
    const existing = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode));
    const snapshot = await getDocs(existing);
    if (snapshot.empty) break;
    inviteCode = generateInviteCode();
    attempts++;
  }
  if (attempts === 10) {
    throw new Error('Failed to generate a unique invite code. Please try again.');
  }

  const groupRef = await addDoc(collection(db, 'groups'), {
    name: groupName,
    ownerId: userId,
    inviteCode,
    createdAt: serverTimestamp(),
    ...(schoolId ? { schoolId } : {}),
  });

  await setDoc(doc(db, 'memberships', `${groupRef.id}_${userId}`), {
    userId,
    groupId: groupRef.id,
    role: 'owner',
    username: username.toLowerCase(),
    displayUsername: username,
    joinedAt: serverTimestamp(),
  });

  return {
    id: groupRef.id,
    name: groupName,
    ownerId: userId,
    inviteCode,
    createdAt: new Date(),
    ...(schoolId ? { schoolId } : {}),
  };
};

export const joinGroupByCode = async (userId: string, username: string, inviteCode: string): Promise<Group> => {
  const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode.toUpperCase()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Invalid invite code');
  }

  const groupDoc = snapshot.docs[0];
  const group = { id: groupDoc.id, ...groupDoc.data() } as Group;

  const memberQuery = query(
    collection(db, 'memberships'),
    where('userId', '==', userId),
    where('groupId', '==', group.id)
  );
  const memberSnapshot = await getDocs(memberQuery);
  if (!memberSnapshot.empty) {
    return group;
  }

  await setDoc(doc(db, 'memberships', `${group.id}_${userId}`), {
    userId,
    groupId: group.id,
    role: 'member',
    username: username.toLowerCase(),
    displayUsername: username,
    joinedAt: serverTimestamp(),
  });

  return group;
};

export const getUserGroups = async (userId: string): Promise<{ group: Group; role: string }[]> => {
  const memberQuery = query(collection(db, 'memberships'), where('userId', '==', userId));
  const memberSnapshot = await getDocs(memberQuery);

  const groups = await Promise.all(
    memberSnapshot.docs.map(async (memberDoc) => {
      const { groupId, role } = memberDoc.data();
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) return null;
      return {
        group: { id: groupDoc.id, ...groupDoc.data() } as Group,
        role,
      };
    })
  );

  return groups.filter(Boolean) as { group: Group; role: string }[];
};

export const getGroupMembers = async (groupId: string): Promise<Membership[]> => {
  const q = query(collection(db, 'memberships'), where('groupId', '==', groupId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Membership));
};

export const subscribeToGroupMembers = (
  groupId: string,
  callback: (members: Membership[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'memberships'), where('groupId', '==', groupId));
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Membership));
    callback(members);
  });
};

export const likeUser = async (
  fromUserId: string,
  toUserId: string,
  groupId: string
): Promise<{ isMatch: boolean; matchId?: string }> => {
  const existingLike = query(
    collection(db, 'likes'),
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId),
    where('groupId', '==', groupId)
  );
  const existing = await getDocs(existingLike);
  if (!existing.empty) {
    return { isMatch: false };
  }

  await addDoc(collection(db, 'likes'), {
    fromUserId,
    toUserId,
    groupId,
    createdAt: serverTimestamp(),
  });

  const mutualLike = query(
    collection(db, 'likes'),
    where('fromUserId', '==', toUserId),
    where('toUserId', '==', fromUserId),
    where('groupId', '==', groupId)
  );
  const mutualSnapshot = await getDocs(mutualLike);

  if (!mutualSnapshot.empty) {
    const matchRef = await addDoc(collection(db, 'matches'), {
      userAId: fromUserId,
      userBId: toUserId,
      groupId,
      createdAt: serverTimestamp(),
    });
    return { isMatch: true, matchId: matchRef.id };
  }

  return { isMatch: false };
};

export const unlikeUser = async (fromUserId: string, toUserId: string, groupId: string): Promise<void> => {
  const q = query(
    collection(db, 'likes'),
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId),
    where('groupId', '==', groupId)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));

  const matchQuery1 = query(
    collection(db, 'matches'),
    where('userAId', '==', fromUserId),
    where('userBId', '==', toUserId),
    where('groupId', '==', groupId)
  );
  const matchQuery2 = query(
    collection(db, 'matches'),
    where('userAId', '==', toUserId),
    where('userBId', '==', fromUserId),
    where('groupId', '==', groupId)
  );

  const [m1, m2] = await Promise.all([getDocs(matchQuery1), getDocs(matchQuery2)]);
  m1.docs.forEach((docSnap) => batch.delete(docSnap.ref));
  m2.docs.forEach((docSnap) => batch.delete(docSnap.ref));

  await batch.commit();
};

export const getUserLikes = async (userId: string, groupId: string): Promise<string[]> => {
  const q = query(
    collection(db, 'likes'),
    where('fromUserId', '==', userId),
    where('groupId', '==', groupId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => docSnap.data().toUserId);
};

export const subscribeToUserLikes = (
  userId: string,
  groupId: string,
  callback: (likedUserIds: string[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'likes'),
    where('fromUserId', '==', userId),
    where('groupId', '==', groupId)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((docSnap) => docSnap.data().toUserId));
  });
};

export const subscribeToMatches = (
  userId: string,
  groupId: string,
  callback: (matches: Match[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'matches'),
    where('userAId', '==', userId),
    where('groupId', '==', groupId)
  );
  const q2 = query(
    collection(db, 'matches'),
    where('userBId', '==', userId),
    where('groupId', '==', groupId)
  );

  let matchesA: Match[] = [];
  let matchesB: Match[] = [];

  const unsubA = onSnapshot(q, (snapshot) => {
    matchesA = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Match));
    callback([...matchesA, ...matchesB]);
  });

  const unsubB = onSnapshot(q2, (snapshot) => {
    matchesB = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Match));
    callback([...matchesA, ...matchesB]);
  });

  return () => {
    unsubA();
    unsubB();
  };
};

export const blockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  await addDoc(collection(db, 'blocks'), {
    blockerId,
    blockedId,
    createdAt: serverTimestamp(),
  });
};

export const reportUser = async (
  reporterId: string,
  reportedId: string,
  groupId: string,
  reason: string
): Promise<void> => {
  await addDoc(collection(db, 'reports'), {
    reporterId,
    reportedId,
    groupId,
    reason,
    createdAt: serverTimestamp(),
  });
};
