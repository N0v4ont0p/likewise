export interface User {
  id: string;
  username: string;
  createdAt: Date;
}

export interface School {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  createdAt: Date;
  memberCount?: number;
  schoolId?: string;
}

export interface Membership {
  id: string;
  userId: string;
  groupId: string;
  role: 'owner' | 'member';
  username: string;
  displayUsername?: string;
  joinedAt: Date;
}

export interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  groupId: string;
  createdAt: Date;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  groupId: string;
  createdAt: Date;
  otherUsername?: string;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  groupId: string;
  reason: string;
  createdAt: Date;
}
