import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBountySchema, insertMessageSchema, insertTransactionSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Bounty routes
  app.get('/api/bounties', async (req, res) => {
    try {
      const { category, search } = req.query;
      const bounties = await storage.getBounties({
        category: category as string,
        search: search as string,
      });
      res.json(bounties);
    } catch (error) {
      console.error("Error fetching bounties:", error);
      res.status(500).json({ message: "Failed to fetch bounties" });
    }
  });

  app.post('/api/bounties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bountyData = insertBountySchema.parse({ ...req.body, authorId: userId });
      const bounty = await storage.createBounty(bountyData);
      
      // Deduct posting fee
      await storage.updateUserPoints(userId, -5);
      await storage.createTransaction({
        userId,
        type: "spending",
        amount: "5.00",
        description: "Bounty posting fee",
        status: "completed",
      });

      res.status(201).json(bounty);
    } catch (error) {
      console.error("Error creating bounty:", error);
      res.status(500).json({ message: "Failed to create bounty" });
    }
  });

  app.post('/api/bounties/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { message } = req.body;
      
      const application = await storage.createBountyApplication(id, userId, message);
      
      // Create activity
      await storage.createActivity({
        userId,
        type: "bounty_applied",
        description: "Applied to a bounty",
        metadata: { bountyId: id },
      });
      
      res.status(201).json(application);
    } catch (error) {
      console.error("Error applying to bounty:", error);
      res.status(500).json({ message: "Failed to apply to bounty" });
    }
  });

  app.get('/api/user/bounties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bounties = await storage.getUserBounties(userId);
      res.json(bounties);
    } catch (error) {
      console.error("Error fetching user bounties:", error);
      res.status(500).json({ message: "Failed to fetch user bounties" });
    }
  });

  // Transaction routes
  app.get('/api/user/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/user/points', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { points, reason } = req.body;
      
      await storage.updateUserPoints(userId, points);
      await storage.createActivity({
        userId,
        type: "points_earned",
        description: `Earned ${points} points: ${reason}`,
        metadata: { points, reason },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating points:", error);
      res.status(500).json({ message: "Failed to update points" });
    }
  });

  // Messaging routes
  app.get('/api/messages/threads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const threads = await storage.getUserThreads(userId);
      res.json(threads);
    } catch (error) {
      console.error("Error fetching threads:", error);
      res.status(500).json({ message: "Failed to fetch threads" });
    }
  });

  app.get('/api/messages/threads/:threadId', isAuthenticated, async (req: any, res) => {
    try {
      const { threadId } = req.params;
      const messages = await storage.getThreadMessages(threadId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({ ...req.body, senderId: userId });
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Friend routes
  app.get('/api/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getUserFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get('/api/friends/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getFriendRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.post('/api/friends/request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { addresseeId } = req.body;
      
      const friendship = await storage.createFriendRequest({
        requesterId: userId,
        addresseeId,
      });
      
      res.status(201).json(friendship);
    } catch (error) {
      console.error("Error creating friend request:", error);
      res.status(500).json({ message: "Failed to create friend request" });
    }
  });

  app.patch('/api/friends/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await storage.updateFriendshipStatus(id, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating friendship:", error);
      res.status(500).json({ message: "Failed to update friendship" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ ...req.body, reviewerId: userId });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/user/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviews = await storage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Activity routes
  app.get('/api/user/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activities = await storage.getUserActivities(userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
