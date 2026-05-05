export type OnlineStatus = "online" | "away" | "offline";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: OnlineStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface GroupMember {
  initials: string;
  avatarBg: string;
  avatarColor: string;
}

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  avatarBg: string;
  avatarColor: string;
  preview: string;
  time: string;
  unread: number;
  online?: OnlineStatus;
  typing: boolean;
  pinned: boolean;
  muted: boolean;
  isMine: boolean;
  group: boolean;
  groupMembers?: GroupMember[];
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageSenderId?: string;
}
