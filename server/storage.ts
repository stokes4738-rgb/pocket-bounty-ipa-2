import {
  users,
  bounties,
  transactions,
  messageThreads,
  messages,
  friendships,
  reviews,
  activities,
  bountyApplications,
  type User,
  type UpsertUser,
  type Bounty,
  type InsertBounty,
  type Transaction,
  type InsertTransaction,
  type MessageThread,
  type Message,
  type InsertMessage,
  type Friendship,
  type InsertFriendship,
  type Review,
  type InsertReview,
  type Activity,
  type InsertActivity,
  type BountyApplication,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPoints(userId: string, points: number): Promise<void>;
  updateUserBalance(userId: string, amount: string): Promise<void>;
  
  // Bounty operations
  createBounty(bounty: InsertBounty): Promise<Bounty>;
  getBounties(filters?: { category?: string; search?: string }): Promise<Bounty[]>;
  getBounty(id: string): Promise<Bounty | undefined>;
  updateBountyStatus(id: string, status: string, claimedBy?: string): Promise<void>;
  getUserBounties(userId: string): Promise<Bounty[]>;
  
  // Application operations
  createBountyApplication(bountyId: string, userId: string, message?: string): Promise<BountyApplication>;
  getBountyApplications(bountyId: string): Promise<BountyApplication[]>;
  updateApplicationStatus(id: string, status: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  updateTransactionStatus(id: string, status: string): Promise<void>;
  
  // Messaging operations
  getOrCreateThread(user1Id: string, user2Id: string): Promise<MessageThread>;
  getUserThreads(userId: string): Promise<(MessageThread & { otherUser: User; lastMessage?: Message })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getThreadMessages(threadId: string): Promise<Message[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  // Friend operations
  createFriendRequest(friendship: InsertFriendship): Promise<Friendship>;
  getUserFriends(userId: string): Promise<(Friendship & { friend: User })[]>;
  getFriendRequests(userId: string): Promise<(Friendship & { requester: User })[]>;
  updateFriendshipStatus(id: string, status: string): Promise<void>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getUserReviews(userId: string): Promise<(Review & { reviewer: User; bounty: Bounty })[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: string): Promise<Activity[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        points: sql`${users.points} + ${points}`,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async updateUserBalance(userId: string, amount: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        balance: sql`${users.balance} + ${amount}`,
        lifetimeEarned: sql`${users.lifetimeEarned} + ${amount}`,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  // Bounty operations
  async createBounty(bounty: InsertBounty): Promise<Bounty> {
    const [newBounty] = await db.insert(bounties).values(bounty).returning();
    return newBounty;
  }

  async getBounties(filters?: { category?: string; search?: string }): Promise<Bounty[]> {
    let query = db.select().from(bounties).where(eq(bounties.status, "active"));
    
    if (filters?.category) {
      query = query.where(eq(bounties.category, filters.category));
    }
    
    if (filters?.search) {
      query = query.where(
        or(
          sql`${bounties.title} ILIKE ${'%' + filters.search + '%'}`,
          sql`${bounties.description} ILIKE ${'%' + filters.search + '%'}`
        )
      );
    }
    
    return query.orderBy(desc(bounties.createdAt));
  }

  async getBounty(id: string): Promise<Bounty | undefined> {
    const [bounty] = await db.select().from(bounties).where(eq(bounties.id, id));
    return bounty;
  }

  async updateBountyStatus(id: string, status: string, claimedBy?: string): Promise<void> {
    await db
      .update(bounties)
      .set({ 
        status, 
        claimedBy,
        completedAt: status === "completed" ? new Date() : undefined,
        updatedAt: new Date() 
      })
      .where(eq(bounties.id, id));
  }

  async getUserBounties(userId: string): Promise<Bounty[]> {
    return db
      .select()
      .from(bounties)
      .where(or(eq(bounties.authorId, userId), eq(bounties.claimedBy, userId)))
      .orderBy(desc(bounties.createdAt));
  }

  // Application operations
  async createBountyApplication(bountyId: string, userId: string, message?: string): Promise<BountyApplication> {
    const [application] = await db
      .insert(bountyApplications)
      .values({ bountyId, userId, message })
      .returning();
    return application;
  }

  async getBountyApplications(bountyId: string): Promise<BountyApplication[]> {
    return db
      .select()
      .from(bountyApplications)
      .where(eq(bountyApplications.bountyId, bountyId))
      .orderBy(desc(bountyApplications.createdAt));
  }

  async updateApplicationStatus(id: string, status: string): Promise<void> {
    await db
      .update(bountyApplications)
      .set({ status })
      .where(eq(bountyApplications.id, id));
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(id: string, status: string): Promise<void> {
    await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id));
  }

  // Messaging operations
  async getOrCreateThread(user1Id: string, user2Id: string): Promise<MessageThread> {
    const [existingThread] = await db
      .select()
      .from(messageThreads)
      .where(
        or(
          and(eq(messageThreads.user1Id, user1Id), eq(messageThreads.user2Id, user2Id)),
          and(eq(messageThreads.user1Id, user2Id), eq(messageThreads.user2Id, user1Id))
        )
      );

    if (existingThread) {
      return existingThread;
    }

    const [newThread] = await db
      .insert(messageThreads)
      .values({ user1Id, user2Id })
      .returning();
    return newThread;
  }

  async getUserThreads(userId: string): Promise<(MessageThread & { otherUser: User; lastMessage?: Message })[]> {
    const threadsWithUsers = await db
      .select({
        thread: messageThreads,
        otherUser: users,
        lastMessage: messages,
      })
      .from(messageThreads)
      .leftJoin(
        users,
        or(
          and(eq(messageThreads.user1Id, userId), eq(users.id, messageThreads.user2Id)),
          and(eq(messageThreads.user2Id, userId), eq(users.id, messageThreads.user1Id))
        )
      )
      .leftJoin(
        messages,
        and(
          eq(messages.threadId, messageThreads.id),
          eq(messages.createdAt, sql`(
            SELECT MAX(created_at) 
            FROM ${messages} 
            WHERE thread_id = ${messageThreads.id}
          )`)
        )
      )
      .where(or(eq(messageThreads.user1Id, userId), eq(messageThreads.user2Id, userId)))
      .orderBy(desc(messageThreads.lastMessageAt));

    return threadsWithUsers.map(row => ({
      ...row.thread,
      otherUser: row.otherUser!,
      lastMessage: row.lastMessage || undefined,
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    
    // Update thread's lastMessageAt
    await db
      .update(messageThreads)
      .set({ lastMessageAt: new Date() })
      .where(eq(messageThreads.id, message.threadId));
    
    return newMessage;
  }

  async getThreadMessages(threadId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(messages.createdAt);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(eq(messages.id, messageId));
  }

  // Friend operations
  async createFriendRequest(friendship: InsertFriendship): Promise<Friendship> {
    const [newFriendship] = await db.insert(friendships).values(friendship).returning();
    return newFriendship;
  }

  async getUserFriends(userId: string): Promise<(Friendship & { friend: User })[]> {
    const friendships = await db
      .select({
        friendship: friendships,
        friend: users,
      })
      .from(friendships)
      .leftJoin(
        users,
        or(
          and(eq(friendships.requesterId, userId), eq(users.id, friendships.addresseeId)),
          and(eq(friendships.addresseeId, userId), eq(users.id, friendships.requesterId))
        )
      )
      .where(
        and(
          or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
          eq(friendships.status, "accepted")
        )
      );

    return friendships.map(row => ({
      ...row.friendship,
      friend: row.friend!,
    }));
  }

  async getFriendRequests(userId: string): Promise<(Friendship & { requester: User })[]> {
    const requests = await db
      .select({
        friendship: friendships,
        requester: users,
      })
      .from(friendships)
      .leftJoin(users, eq(users.id, friendships.requesterId))
      .where(
        and(
          eq(friendships.addresseeId, userId),
          eq(friendships.status, "pending")
        )
      );

    return requests.map(row => ({
      ...row.friendship,
      requester: row.requester!,
    }));
  }

  async updateFriendshipStatus(id: string, status: string): Promise<void> {
    await db
      .update(friendships)
      .set({ status, updatedAt: new Date() })
      .where(eq(friendships.id, id));
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update user's rating
    const userReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.revieweeId, review.revieweeId));
    
    const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    
    await db
      .update(users)
      .set({ 
        rating: avgRating.toFixed(2),
        reviewCount: userReviews.length,
        updatedAt: new Date() 
      })
      .where(eq(users.id, review.revieweeId));
    
    return newReview;
  }

  async getUserReviews(userId: string): Promise<(Review & { reviewer: User; bounty: Bounty })[]> {
    const userReviews = await db
      .select({
        review: reviews,
        reviewer: users,
        bounty: bounties,
      })
      .from(reviews)
      .leftJoin(users, eq(users.id, reviews.reviewerId))
      .leftJoin(bounties, eq(bounties.id, reviews.bountyId))
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));

    return userReviews.map(row => ({
      ...row.review,
      reviewer: row.reviewer!,
      bounty: row.bounty!,
    }));
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getUserActivities(userId: string): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(50);
  }
}

export const storage = new DatabaseStorage();
