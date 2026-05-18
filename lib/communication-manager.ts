import { Message, Contact, MessageThread } from './types';

/**
 * Communication Management System
 * Handles messaging, contacts, and communication workflows
 */

/**
 * Create direct message
 * @param senderId - Sender ID
 * @param senderName - Sender name
 * @param recipientId - Recipient ID
 * @param content - Message content
 * @returns New message
 */
export function createDirectMessage(
  senderId: string,
  senderName: string,
  recipientId: string,
  content: string
): Message {
  if (!content || content.trim() === '') {
    throw new Error('Message content is required');
  }

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    senderName,
    recipientId,
    content,
    timestamp: new Date().toISOString(),
    read: false,
    type: 'direct',
  };
}

/**
 * Create group message
 * @param senderId - Sender ID
 * @param senderName - Sender name
 * @param recipientIds - Recipient IDs
 * @param content - Message content
 * @returns New message
 */
export function createGroupMessage(
  senderId: string,
  senderName: string,
  recipientIds: string[],
  content: string
): Message {
  if (!content || content.trim() === '') {
    throw new Error('Message content is required');
  }

  if (recipientIds.length === 0) {
    throw new Error('At least one recipient is required');
  }

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    senderName,
    recipientIds,
    content,
    timestamp: new Date().toISOString(),
    read: false,
    type: 'group',
  };
}

/**
 * Create broadcast message
 * @param senderId - Sender ID
 * @param senderName - Sender name
 * @param content - Message content
 * @returns New message
 */
export function createBroadcastMessage(
  senderId: string,
  senderName: string,
  content: string
): Message {
  if (!content || content.trim() === '') {
    throw new Error('Message content is required');
  }

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    senderName,
    content,
    timestamp: new Date().toISOString(),
    read: false,
    type: 'broadcast',
  };
}

/**
 * Mark message as read
 * @param message - Message to mark
 * @returns Updated message
 */
export function markMessageAsRead(message: Message): Message {
  return {
    ...message,
    read: true,
    readAt: new Date().toISOString(),
  };
}

/**
 * Add attachment to message
 * @param message - Message
 * @param attachmentUrl - Attachment URL
 * @returns Updated message
 */
export function addAttachmentToMessage(message: Message, attachmentUrl: string): Message {
  return {
    ...message,
    attachments: [...(message.attachments || []), attachmentUrl],
  };
}

/**
 * Create message thread
 * @param participantIds - Participant IDs
 * @param initialMessage - First message
 * @returns New thread
 */
export function createMessageThread(
  participantIds: string[],
  initialMessage: Message
): MessageThread {
  return {
    id: `thread-${Date.now()}`,
    participantIds: [...new Set(participantIds)],
    messages: [initialMessage],
    lastMessage: initialMessage,
    lastMessageTime: initialMessage.timestamp,
  };
}

/**
 * Add message to thread
 * @param thread - Message thread
 * @param message - Message to add
 * @returns Updated thread
 */
export function addMessageToThread(thread: MessageThread, message: Message): MessageThread {
  return {
    ...thread,
    messages: [message, ...thread.messages],
    lastMessage: message,
    lastMessageTime: message.timestamp,
  };
}

/**
 * Search messages
 * @param messages - Messages to search
 * @param query - Search query
 * @returns Matching messages
 */
export function searchMessages(messages: Message[], query: string): Message[] {
  const lowerQuery = query.toLowerCase();
  return messages.filter(
    (msg) =>
      msg.content.toLowerCase().includes(lowerQuery) ||
      msg.senderName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get unread count
 * @param messages - Messages array
 * @param userId - User ID (optional filter)
 * @returns Unread count
 */
export function getUnreadCount(messages: Message[], userId?: string): number {
  return messages.filter((msg) => {
    if (!msg.read) {
      if (userId) {
        return msg.recipientId === userId || msg.recipientIds?.includes(userId);
      }
      return true;
    }
    return false;
  }).length;
}

/**
 * Get conversation history
 * @param threads - Message threads
 * @param participantId - Participant ID
 * @param limit - Number of threads to return
 * @returns Conversations for participant
 */
export function getConversationHistory(
  threads: MessageThread[],
  participantId: string,
  limit: number = 10
): MessageThread[] {
  return threads
    .filter((thread) => thread.participantIds.includes(participantId))
    .sort(
      (a, b) =>
        new Date(b.lastMessageTime || '').getTime() - new Date(a.lastMessageTime || '').getTime()
    )
    .slice(0, limit);
}

/**
 * Update contact status
 * @param contact - Contact to update
 * @param newStatus - New status
 * @returns Updated contact
 */
export function updateContactStatus(
  contact: Contact,
  newStatus: 'online' | 'offline' | 'away'
): Contact {
  const updated = { ...contact, status: newStatus };

  if (newStatus === 'offline') {
    updated.lastSeen = new Date().toISOString();
  }

  return updated;
}

/**
 * Get active contacts
 * @param contacts - All contacts
 * @returns Online and away contacts
 */
export function getActiveContacts(contacts: Contact[]): Contact[] {
  return contacts.filter((c) => c.status === 'online' || c.status === 'away');
}

/**
 * Get message delivery status
 * @param messages - Messages to check
 * @param recipientId - Recipient to check
 * @returns Delivery statistics
 */
export function getDeliveryStatus(messages: Message[], recipientId: string) {
  const total = messages.filter(
    (m) =>
      m.recipientId === recipientId || m.recipientIds?.includes(recipientId) || m.type === 'broadcast'
  ).length;

  const read = messages.filter(
    (m) =>
      (m.recipientId === recipientId || m.recipientIds?.includes(recipientId) || m.type === 'broadcast') &&
      m.read
  ).length;

  return {
    total,
    read,
    unread: total - read,
    deliveryRate: total > 0 ? (read / total) * 100 : 0,
  };
}

/**
 * Export messages to CSV
 * @param messages - Messages to export
 * @returns CSV string
 */
export function exportMessagesToCSV(messages: Message[]): string {
  const headers = [
    'Timestamp',
    'From',
    'To',
    'Type',
    'Content',
    'Read',
    'Read At',
  ];

  const rows = messages.map((msg) => {
    const recipients = msg.recipientId || msg.recipientIds?.join(';') || 'Broadcast';
    return [
      new Date(msg.timestamp).toLocaleString(),
      msg.senderName,
      recipients,
      msg.type,
      msg.content.substring(0, 50),
      msg.read ? 'Yes' : 'No',
      msg.readAt ? new Date(msg.readAt).toLocaleString() : '',
    ]
      .map((cell) => `"${cell}"`)
      .join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Get messaging statistics
 * @param messages - Messages array
 * @returns Statistics
 */
export function getMessagingStats(messages: Message[]) {
  return {
    total: messages.length,
    read: messages.filter((m) => m.read).length,
    unread: messages.filter((m) => !m.read).length,
    byType: {
      direct: messages.filter((m) => m.type === 'direct').length,
      group: messages.filter((m) => m.type === 'group').length,
      broadcast: messages.filter((m) => m.type === 'broadcast').length,
    },
    avgReadTime: (() => {
      const readMessages = messages.filter((m) => m.read && m.readAt);
      if (readMessages.length === 0) return 0;

      const times = readMessages.map((m) => {
        const sent = new Date(m.timestamp).getTime();
        const read = new Date(m.readAt!).getTime();
        return (read - sent) / (1000 * 60); // minutes
      });

      return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    })(),
  };
}

/**
 * Get recent messages
 * @param messages - All messages
 * @param hours - Hours to look back
 * @returns Recent messages
 */
export function getRecentMessages(messages: Message[], hours: number = 24): Message[] {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);

  return messages.filter((msg) => new Date(msg.timestamp) >= cutoff);
}
