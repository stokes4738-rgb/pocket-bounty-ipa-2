import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBountySchema, insertMessageSchema, insertTransactionSchema, insertReviewSchema, insertPaymentMethodSchema, insertPaymentSchema, insertPlatformRevenueSchema } from "@shared/schema";
import Stripe from "stripe";

// Stripe setup with error handling for missing keys
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-07-30.basil",
    });
    console.log("Stripe initialized successfully");
  } catch (error) {
    console.warn("Stripe initialization error:", error);
  }
} else {
  console.log("Stripe not initialized - running in test mode (no STRIPE_SECRET_KEY)");
}

// Process expired bounties (auto-refund after 3 days with 5% fee)
async function processExpiredBounties() {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const expiredBounties = await storage.getExpiredBounties(threeDaysAgo);
    
    for (const bounty of expiredBounties) {
      const bountyReward = parseFloat(bounty.reward.toString());
      // Tiered fee structure: 5% for under $250, 3.5% for $250+
      const feePercentage = bountyReward >= 250 ? 0.035 : 0.05;
      const platformFee = bountyReward * feePercentage;
      const refundAmount = bountyReward - platformFee;
      
      // Mark bounty as expired
      await storage.updateBountyStatus(bounty.id, 'expired');
      
      // Refund user (minus 5% fee)
      await storage.updateUserBalance(bounty.authorId, `+${refundAmount.toFixed(2)}`);
      
      // Create refund transaction
      await storage.createTransaction({
        userId: bounty.authorId,
        type: "refund",
        amount: refundAmount.toString(),
        description: `Auto-refund for expired bounty: ${bounty.title} (less ${(feePercentage * 100).toFixed(1)}% platform fee)`,
        status: "completed",
      });
      
      // Record platform revenue from the fee
      await storage.createPlatformRevenue({
        bountyId: bounty.id,
        amount: platformFee.toString(),
        source: "expired_bounty_fee",
        description: `${(feePercentage * 100).toFixed(1)}% fee from expired bounty: ${bounty.title}`,
      });
      
      // Create activity
      await storage.createActivity({
        userId: bounty.authorId,
        type: "bounty_expired",
        description: `Your bounty "${bounty.title}" expired and was refunded (minus ${(feePercentage * 100).toFixed(1)}% fee)`,
        metadata: { bountyId: bounty.id, refundAmount: refundAmount.toFixed(2), fee: platformFee.toFixed(2) },
      });
    }
  } catch (error) {
    console.error("Error processing expired bounties:", error);
  }
}

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

  // Referral routes
  app.get("/api/referral/code", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let referralCode = user?.referralCode;
      if (!referralCode) {
        // Generate a new referral code
        referralCode = await storage.generateReferralCode(userId);
      }
      
      res.json({ 
        referralCode,
        referralCount: user?.referralCount || 0,
        shareUrl: `${req.protocol}://${req.hostname}${req.hostname === 'localhost' ? ':5000' : ''}/signup?ref=${referralCode}`
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error getting referral code: " + error.message });
    }
  });

  app.get("/api/referral/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const referrals = await storage.getUserReferrals(userId);
      
      const referralCount = user?.referralCount || 0;
      const milestones = [
        { count: 1, points: 10, reached: referralCount >= 1 },
        { count: 5, points: 50, reached: referralCount >= 5 },
        { count: 10, points: 100, reached: referralCount >= 10 },
        { count: 20, points: 200, reached: referralCount >= 20 }
      ];
      
      res.json({ 
        referralCount,
        referrals: referrals.map(r => ({
          id: r.id,
          firstName: r.firstName,
          lastName: r.lastName,
          handle: r.handle,
          createdAt: r.createdAt
        })),
        milestones
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error getting referral stats: " + error.message });
    }
  });

  app.post("/api/referral/signup", isAuthenticated, async (req: any, res) => {
    try {
      const { referralCode } = req.body;
      if (!referralCode) {
        return res.status(400).json({ message: "Referral code is required" });
      }

      const userId = req.user.claims.sub;
      await storage.processReferralSignup(userId, referralCode);
      
      res.json({ message: "Referral processed successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error processing referral: " + error.message });
    }
  });


  // Point purchase routes
  app.get("/api/points/packages", (req, res) => {
    const packages = [
      { id: "test", points: 25, price: 0.50, label: "Test Pack", popular: false },
      { id: "starter", points: 50, price: 0.99, label: "Starter Pack", popular: false },
      { id: "basic", points: 100, price: 1.99, label: "Basic Pack", popular: false },
      { id: "popular", points: 250, price: 4.99, label: "Popular Pack", popular: true },
      { id: "premium", points: 500, price: 9.99, label: "Premium Pack", popular: false },
      { id: "mega", points: 1000, price: 19.99, label: "Mega Pack", popular: false },
      { id: "ultimate", points: 2500, price: 49.99, label: "Ultimate Pack", popular: false },
      { id: "supreme", points: 5000, price: 99.99, label: "Supreme Pack", popular: false },
    ];
    res.json(packages);
  });

  app.post("/api/points/purchase", isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment system not available" });
    }

    try {
      const { packageId } = req.body;
      const userId = req.user.claims.sub;

      // Define point packages
      const packages: { [key: string]: { points: number; price: number; label: string } } = {
        test: { points: 25, price: 0.50, label: "Test Pack" },
        starter: { points: 50, price: 0.99, label: "Starter Pack" },
        basic: { points: 100, price: 1.99, label: "Basic Pack" },
        popular: { points: 250, price: 4.99, label: "Popular Pack" },
        premium: { points: 500, price: 9.99, label: "Premium Pack" },
        mega: { points: 1000, price: 19.99, label: "Mega Pack" },
        ultimate: { points: 2500, price: 49.99, label: "Ultimate Pack" },
        supreme: { points: 5000, price: 99.99, label: "Supreme Pack" },
      };

      const selectedPackage = packages[packageId];
      if (!selectedPackage) {
        return res.status(400).json({ message: "Invalid package selected" });
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(selectedPackage.price * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId,
          packageId,
          points: selectedPackage.points.toString(),
          type: "point_purchase"
        },
        description: `${selectedPackage.label} - ${selectedPackage.points} points`,
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        package: selectedPackage
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment: " + error.message });
    }
  });

  app.post("/api/points/confirm-purchase", isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment system not available" });
    }

    try {
      const { paymentIntentId } = req.body;
      const userId = req.user.claims.sub;

      // Retrieve payment intent to verify payment
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log(`Payment intent status: ${paymentIntent.status}, amount: ${paymentIntent.amount}`);
      
      if (paymentIntent.status !== 'succeeded') {
        console.error(`Payment not completed. Status: ${paymentIntent.status}`);
        return res.status(400).json({ message: "Payment not completed" });
      }

      if (paymentIntent.metadata.userId !== userId) {
        console.error(`Payment belongs to different user. Expected: ${userId}, Found: ${paymentIntent.metadata.userId}`);
        return res.status(403).json({ message: "Payment belongs to different user" });
      }

      if (paymentIntent.metadata.type !== 'point_purchase') {
        console.error(`Invalid payment type: ${paymentIntent.metadata.type}`);
        return res.status(400).json({ message: "Invalid payment type" });
      }

      const pointsToAward = parseInt(paymentIntent.metadata.points);
      const packageLabel = paymentIntent.description;
      const purchaseAmount = (paymentIntent.amount / 100).toFixed(2);

      console.log(`Awarding ${pointsToAward} points to user ${userId} for $${purchaseAmount}`);

      // Award points to user
      await storage.updateUserPoints(userId, pointsToAward);
      console.log(`Points awarded successfully`);

      // Create transaction record
      const transaction = await storage.createTransaction({
        userId,
        type: "point_purchase",
        amount: purchaseAmount,
        description: `Purchased ${packageLabel}`,
        status: "completed",
      });
      console.log(`Transaction created:`, transaction.id);

      // Create activity
      await storage.createActivity({
        userId,
        type: "points_purchased",
        description: `Purchased ${pointsToAward} points for $${purchaseAmount}`,
        metadata: { 
          points: pointsToAward, 
          amount: purchaseAmount,
          package: paymentIntent.metadata.packageId
        },
      });
      console.log(`Activity created`);

      // Create platform revenue record
      await storage.createPlatformRevenue({
        amount: purchaseAmount,
        source: "point_purchase",
        description: `Point purchase: ${packageLabel}`,
      });
      console.log(`Platform revenue recorded`);

      res.json({ 
        success: true, 
        pointsAwarded: pointsToAward,
        message: `Successfully purchased ${pointsToAward} points for $${purchaseAmount}!`
      });
    } catch (error: any) {
      console.error("Error confirming purchase:", error);
      res.status(500).json({ message: "Error confirming purchase: " + error.message });
    }
  });

  // Bounty routes
  app.get('/api/bounties', async (req, res) => {
    try {
      // Check for expired bounties before returning list
      await processExpiredBounties();
      
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
      
      // Full bounty amount is charged upfront (held in escrow)
      const bountyReward = parseFloat(bountyData.reward.toString());
      
      // Check if user has enough balance for the full bounty amount
      const user = await storage.getUser(userId);
      if (!user || parseFloat(user.balance) < bountyReward) {
        return res.status(400).json({ 
          message: `Insufficient balance. Need $${bountyReward.toFixed(2)} (held in escrow until completed or auto-refunded after 3 days minus ${bountyReward >= 250 ? '3.5%' : '5%'} fee)` 
        });
      }
      
      const bounty = await storage.createBounty(bountyData);
      
      // Deduct full bounty amount from user balance (held in escrow)
      await storage.updateUserBalance(userId, `-${bountyReward}`);
      
      // Deduct points for posting bounty
      await storage.updateUserPoints(userId, -5);
      
      // Create transaction record for escrow hold
      await storage.createTransaction({
        userId,
        type: "escrow_hold",
        amount: bountyReward.toString(),
        description: `Posted bounty: ${bountyData.title} (held in escrow, auto-refunds in 3 days minus ${bountyReward >= 250 ? '3.5%' : '5%'} fee if unclaimed)`,
        status: "completed",
      });

      res.status(201).json({
        ...bounty,
        totalCost: bountyReward.toFixed(2)
      });
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

  // User search route
  app.get('/api/users/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const searchTerm = req.query.searchTerm as string || '';
      
      if (searchTerm.length === 0) {
        return res.json([]);
      }
      
      const users = await storage.searchUsers(searchTerm, userId);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
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

  // Profile update route
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, handle, bio, skills, experience } = req.body;
      
      await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        handle,
        bio,
        skills,
        experience
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Payment routes
  app.get('/api/payments/methods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paymentMethods = await storage.getUserPaymentMethods(userId);
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post('/api/payments/setup-intent', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment system not configured" });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email) {
        return res.status(400).json({ message: "User email required" });
      }

      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        });
        await storage.updateUserStripeInfo(userId, customer.id);
      }

      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        usage: 'off_session',
      });

      res.json({ clientSecret: setupIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating setup intent:", error);
      res.status(500).json({ message: "Failed to create setup intent" });
    }
  });

  app.post('/api/payments/save-method', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment system not configured" });
    }

    try {
      const userId = req.user.claims.sub;
      const { paymentMethodId } = req.body;

      if (!paymentMethodId) {
        return res.status(400).json({ message: "Payment method ID required" });
      }

      // Retrieve payment method from Stripe
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      // Save to our database
      const savedMethod = await storage.createPaymentMethod({
        userId,
        stripePaymentMethodId: paymentMethodId,
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expiryMonth: paymentMethod.card?.exp_month,
        expiryYear: paymentMethod.card?.exp_year,
        isDefault: false,
      });

      res.status(201).json(savedMethod);
    } catch (error: any) {
      console.error("Error saving payment method:", error);
      res.status(500).json({ message: "Failed to save payment method" });
    }
  });

  app.post('/api/payments/set-default', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { paymentMethodId } = req.body;

      await storage.updatePaymentMethodDefault(userId, paymentMethodId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default payment method:", error);
      res.status(500).json({ message: "Failed to set default payment method" });
    }
  });

  app.delete('/api/payments/methods/:id', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment system not configured" });
    }

    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Get payment method from database
      const paymentMethods = await storage.getUserPaymentMethods(userId);
      const paymentMethod = paymentMethods.find(pm => pm.id === id);

      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }

      // Detach from Stripe
      await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
      
      // Delete from database
      await storage.deletePaymentMethod(id);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });

  app.post('/api/payments/deposit', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment system not configured" });
    }

    try {
      const userId = req.user.claims.sub;
      const { amount, paymentMethodId } = req.body;

      if (!amount || !paymentMethodId) {
        return res.status(400).json({ message: "Amount and payment method required" });
      }

      const user = await storage.getUser(userId);
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "Stripe customer not found" });
      }

      // Calculate platform fee (5% of deposit)
      const feeInfo = storage.calculatePlatformFee(amount.toString());
      const totalCharge = parseFloat(feeInfo.grossAmount) + parseFloat(feeInfo.fee);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalCharge * 100), // Convert to cents, include fee
        currency: 'usd',
        customer: user.stripeCustomerId,
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: false,
        },
        return_url: `${req.protocol}://${req.get('host')}/account`,
      });

      // Save payment record
      const payment = await storage.createPayment({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: feeInfo.grossAmount,
        platformFee: feeInfo.fee,
        netAmount: feeInfo.grossAmount, // User gets the full amount they requested
        status: paymentIntent.status,
        type: 'deposit',
        description: `Account deposit of $${amount} (platform fee: $${feeInfo.fee})`,
      });

      // If payment succeeded, update user balance and record platform revenue
      if (paymentIntent.status === 'succeeded') {
        await storage.updateUserBalance(userId, feeInfo.grossAmount);
        await storage.updatePaymentStatus(payment.id, 'succeeded');
        
        // Create platform revenue record
        await storage.createPlatformRevenue({
          transactionId: payment.id,
          amount: feeInfo.fee,
          source: "deposit",
          description: `Platform fee from deposit: $${amount}`,
        });
      }

      res.json({ 
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret
        },
        platformFee: feeInfo.fee,
        totalCharged: totalCharge.toFixed(2),
        amountCredited: feeInfo.grossAmount
      });
    } catch (error: any) {
      console.error("Error processing deposit:", error);
      
      // Handle Stripe-specific errors with better messages
      if (error.type === 'StripeCardError') {
        let message = "Payment failed";
        
        switch (error.decline_code) {
          case 'insufficient_funds':
            message = "Your card has insufficient funds. Please try a different payment method or a smaller amount.";
            break;
          case 'card_declined':
            message = "Your card was declined. Please try a different payment method.";
            break;
          case 'expired_card':
            message = "Your card has expired. Please add a new payment method.";
            break;
          default:
            message = error.message || "Payment failed. Please try again.";
        }
        
        return res.status(400).json({ message, decline_code: error.decline_code });
      }
      
      res.status(500).json({ message: error.message || "Failed to process deposit" });
    }
  });

  app.get('/api/payments/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payments = await storage.getUserPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  app.post('/api/payments/withdraw', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment system not configured" });
    }

    try {
      const userId = req.user.claims.sub;
      const { amount, method } = req.body;

      const user = await storage.getUser(userId);
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "Stripe customer not found" });
      }

      const withdrawalAmount = parseFloat(amount);
      const userBalance = parseFloat(user.balance);

      if (withdrawalAmount < 5) {
        return res.status(400).json({ message: "Minimum withdrawal amount is $5.00" });
      }

      if (withdrawalAmount > userBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create Stripe transfer for the withdrawal
      let transferAmount = Math.round(withdrawalAmount * 100); // Convert to cents
      let description = `Withdrawal: $${withdrawalAmount}`;
      
      // Apply fees for instant transfers
      if (method === 'debit_card') {
        const fee = Math.max(25, Math.round(withdrawalAmount * 0.015 * 100)); // 1.5% or $0.25 minimum
        transferAmount -= fee;
        description += ` (Instant transfer fee: $${(fee / 100).toFixed(2)})`;
      }

      const transfer = await stripe.transfers.create({
        amount: transferAmount,
        currency: 'usd',
        destination: user.stripeCustomerId, // In production, this should be a connected account
        description: description,
      });

      // Create withdrawal transaction record
      const methodNames: Record<string, string> = {
        'bank_transfer': 'bank transfer',
        'debit_card': 'instant debit',
        'cash_app': 'Cash App',
        'paypal': 'PayPal'
      };
      
      const withdrawalTransaction = await storage.createTransaction({
        userId,
        type: "spending",
        amount: amount,
        description: `Withdrawal via ${methodNames[method] || method}`,
        status: "pending",
      });

      // Deduct amount from user balance
      await storage.updateUserBalance(userId, `-${amount}`);

      // Create activity record
      await storage.createActivity({
        userId,
        type: "withdrawal",
        description: `Requested withdrawal of $${amount}`,
        metadata: { amount, method, transactionId: withdrawalTransaction.id },
      });

      res.json({
        success: true,
        transactionId: withdrawalTransaction.id,
        transferId: transfer.id,
        message: "Withdrawal request submitted successfully"
      });
    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      
      // Handle Stripe-specific errors
      if (error.type?.startsWith('Stripe')) {
        let message = "Withdrawal failed";
        
        switch (error.code) {
          case 'insufficient_funds':
            message = "Insufficient funds in your account.";
            break;
          case 'account_invalid':
            message = "Invalid payment account. Please contact support.";
            break;
          default:
            message = error.message || "Withdrawal failed. Please try again.";
        }
        
        return res.status(400).json({ message });
      }
      
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Test deposit endpoint (for development without Stripe)
  app.post('/api/test/deposit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount } = req.body;
      
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 1 || numAmount > 1000) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Add funds to user balance
      await storage.updateUserBalance(userId, amount);
      
      // Create transaction record
      await storage.createTransaction({
        userId,
        type: "earning",
        amount,
        description: "Test deposit",
        status: "completed",
      });
      
      // Create activity
      await storage.createActivity({
        userId,
        type: "deposit",
        description: `Added $${amount} in test funds`,
        metadata: { amount },
      });
      
      const updatedUser = await storage.getUser(userId);
      res.json({ 
        success: true, 
        balance: updatedUser?.balance,
        message: "Test funds added successfully"
      });
    } catch (error) {
      console.error("Error processing test deposit:", error);
      res.status(500).json({ message: "Failed to process test deposit" });
    }
  });

  // Creator dashboard endpoints (creator only)
  app.get('/api/creator/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Allow access to the app creator (you) or admin users
      const isAppCreator = userId === "46848986"; // Your user ID for full access
      const isAdmin = user?.email?.includes('admin') || user?.email?.includes('creator');
      
      if (!isAppCreator && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get comprehensive app statistics
      const [
        revenue,
        totalRevenue,
        allUsers,
        allBounties,
        allTransactions,
        recentActivity
      ] = await Promise.all([
        storage.getPlatformRevenue(),
        storage.getTotalPlatformRevenue(),
        storage.getAllUsers(),
        storage.getAllBounties(),
        storage.getAllTransactions(),
        storage.getRecentActivity(50)
      ]);

      // Calculate user statistics
      const activeUsers = allUsers.filter(u => 
        new Date(u.lastLogin || u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      const totalUserBalance = allUsers.reduce((sum, u) => sum + parseFloat(u.balance || '0'), 0);

      // Calculate bounty statistics
      const activeBounties = allBounties.filter(b => b.status === 'active').length;
      const completedBounties = allBounties.filter(b => b.status === 'completed').length;
      const totalBountyValue = allBounties.reduce((sum, b) => sum + parseFloat(b.reward || '0'), 0);

      // Calculate transaction statistics
      const deposits = allTransactions.filter(t => t.type === 'earning');
      const withdrawals = allTransactions.filter(t => t.type === 'spending');
      const totalVolume = allTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

      // Calculate comprehensive spending analytics
      const pointPurchases = allTransactions.filter(t => t.type === 'point_purchase');
      const totalPointPurchases = pointPurchases.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      const spendingTransactions = allTransactions.filter(t => t.type === 'spending');
      const totalSpending = spendingTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      const refundTransactions = allTransactions.filter(t => t.type === 'refund');
      const totalRefunds = refundTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      // Calculate total money users have spent across all categories
      const totalUserSpent = totalPointPurchases + totalSpending;
      
      // Break down spending by category
      const spendingByCategory = spendingTransactions.reduce((acc, t) => {
        const description = t.description || '';
        let category = 'other';
        
        if (description.toLowerCase().includes('withdrawal')) {
          category = 'withdrawals';
        } else if (description.toLowerCase().includes('bounty')) {
          category = 'bounty_related';
        } else if (description.toLowerCase().includes('fee')) {
          category = 'fees';
        }
        
        acc[category] = (acc[category] || 0) + parseFloat(t.amount || '0');
        return acc;
      }, {} as Record<string, number>);

      // Growth metrics (comparing last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const newUsersLast30 = allUsers.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;
      const newUsersPrevious30 = allUsers.filter(u => 
        new Date(u.createdAt) > sixtyDaysAgo && new Date(u.createdAt) <= thirtyDaysAgo
      ).length;

      const userGrowthRate = newUsersPrevious30 > 0 
        ? ((newUsersLast30 - newUsersPrevious30) / newUsersPrevious30 * 100).toFixed(1)
        : newUsersLast30 > 0 ? '100' : '0';

      res.json({ 
        revenue: {
          data: revenue,
          total: totalRevenue,
          transactionCount: revenue.length,
          avgPerTransaction: revenue.length > 0 ? (parseFloat(totalRevenue) / revenue.length).toFixed(2) : "0.00"
        },
        users: {
          total: allUsers.length,
          active: activeUsers,
          totalBalance: totalUserBalance.toFixed(2),
          newLast30Days: newUsersLast30,
          growthRate: userGrowthRate
        },
        bounties: {
          total: allBounties.length,
          active: activeBounties,
          completed: completedBounties,
          totalValue: totalBountyValue.toFixed(2),
          completionRate: allBounties.length > 0 ? ((completedBounties / allBounties.length) * 100).toFixed(1) : '0'
        },
        transactions: {
          total: allTransactions.length,
          totalVolume: totalVolume.toFixed(2),
          deposits: deposits.length,
          withdrawals: withdrawals.length,
          avgTransactionSize: allTransactions.length > 0 ? (totalVolume / allTransactions.length).toFixed(2) : '0'
        },
        spending: {
          totalUserSpent: totalUserSpent.toFixed(2),
          pointPurchases: {
            total: totalPointPurchases.toFixed(2),
            count: pointPurchases.length,
            avgPurchase: pointPurchases.length > 0 ? (totalPointPurchases / pointPurchases.length).toFixed(2) : '0'
          },
          withdrawals: {
            total: totalSpending.toFixed(2),
            count: spendingTransactions.length,
            avgWithdrawal: spendingTransactions.length > 0 ? (totalSpending / spendingTransactions.length).toFixed(2) : '0'
          },
          refunds: {
            total: totalRefunds.toFixed(2),
            count: refundTransactions.length
          },
          breakdown: spendingByCategory,
          last30Days: {
            pointPurchases: pointPurchases.filter(t => t.createdAt && new Date(t.createdAt) > thirtyDaysAgo).reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0).toFixed(2),
            spending: spendingTransactions.filter(t => t.createdAt && new Date(t.createdAt) > thirtyDaysAgo).reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0).toFixed(2)
          }
        },
        activity: recentActivity
      });
    } catch (error) {
      console.error("Error fetching creator stats:", error);
      res.status(500).json({ message: "Failed to fetch creator stats" });
    }
  });

  // Bounty completion with platform fee
  app.post('/api/bounties/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const bounty = await storage.getBounty(id);
      if (!bounty) {
        return res.status(404).json({ message: "Bounty not found" });
      }
      
      if (bounty.authorId !== userId) {
        return res.status(403).json({ message: "Only bounty author can mark as complete" });
      }
      
      if (bounty.status !== "active" || !bounty.claimedBy) {
        return res.status(400).json({ message: "Bounty must be claimed to complete" });
      }
      
      // Calculate platform fee (5% of bounty reward)
      const feeInfo = storage.calculatePlatformFee(bounty.reward.toString());
      
      // Mark bounty as completed
      await storage.updateBountyStatus(id, "completed");
      
      // Pay the worker (reward minus platform fee)
      await storage.updateUserBalance(bounty.claimedBy, feeInfo.netAmount);
      
      // Create transaction for the worker
      await storage.createTransaction({
        userId: bounty.claimedBy,
        bountyId: id,
        type: "earning",
        amount: feeInfo.netAmount,
        description: `Completed bounty: ${bounty.title} (after $${feeInfo.fee} platform fee)`,
        status: "completed",
      });
      
      // Create platform revenue record
      await storage.createPlatformRevenue({
        bountyId: id,
        amount: feeInfo.fee,
        source: "bounty_completion",
        description: `Platform fee from bounty completion: ${bounty.title}`,
      });
      
      // Create activities
      await storage.createActivity({
        userId: bounty.claimedBy,
        type: "bounty_completed",
        description: `Completed bounty: ${bounty.title}`,
        metadata: { bountyId: id, earned: feeInfo.netAmount, platformFee: feeInfo.fee },
      });
      
      await storage.createActivity({
        userId,
        type: "bounty_completed",
        description: `Bounty completed: ${bounty.title}`,
        metadata: { bountyId: id, workerId: bounty.claimedBy },
      });
      
      res.json({ 
        success: true,
        workerEarned: feeInfo.netAmount,
        platformFee: feeInfo.fee,
        originalReward: bounty.reward
      });
    } catch (error) {
      console.error("Error completing bounty:", error);
      res.status(500).json({ message: "Failed to complete bounty" });
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
