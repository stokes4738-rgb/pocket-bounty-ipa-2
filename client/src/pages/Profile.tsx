import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";

export default function Profile() {
  const { user } = useAuth();
  
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/user/reviews"],
  });

  const { data: userBounties = [], isLoading: bountiesLoading } = useQuery({
    queryKey: ["/api/user/bounties"],
  });

  const completedBounties = userBounties.filter((b: any) => b.status === "completed");
  const activeBounties = userBounties.filter((b: any) => b.status === "active");
  const postedBounties = userBounties.filter((b: any) => b.authorId === user?.id);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card className="theme-transition">
        <CardContent className="p-3.5">
          <div className="flex gap-3 items-center mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-border bg-secondary flex items-center justify-center text-xl font-bold">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                  data-testid="img-profile-photo"
                />
              ) : (
                <span data-testid="text-profile-initials">
                  {user?.firstName && user?.lastName 
                    ? getInitials(`${user.firstName} ${user.lastName}`)
                    : "👤"
                  }
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1" data-testid="text-profile-name">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || "User"
                }
              </h2>
              <div className="text-sm text-muted-foreground mb-2" data-testid="text-profile-handle">
                {user?.handle || "@user"}
              </div>
              <div className="text-xs text-pocket-gold-light font-bold" data-testid="text-profile-rating">
                ⭐ {user?.rating || "0.0"} Rating ({user?.reviewCount || 0} reviews)
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            <Card className="bg-card border border-border">
              <CardContent className="p-2.5 text-center">
                <div className="text-lg font-bold text-pocket-gold" data-testid="text-completed-bounties">
                  {completedBounties.length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border">
              <CardContent className="p-2.5 text-center">
                <div className="text-lg font-bold text-pocket-gold" data-testid="text-active-bounties">
                  {activeBounties.length}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border">
              <CardContent className="p-2.5 text-center">
                <div className="text-lg font-bold text-pocket-gold" data-testid="text-total-earned">
                  {formatCurrency(user?.lifetimeEarned || "0")}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border">
              <CardContent className="p-2.5 text-center">
                <div className="text-lg font-bold text-pocket-gold" data-testid="text-user-level">
                  {user?.level || 1}
                </div>
                <div className="text-xs text-muted-foreground">Level</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Expertise */}
      <Card className="theme-transition">
        <CardContent className="p-3.5">
          <h3 className="text-sm font-semibold mb-3">Skills & Expertise</h3>
          <div className="flex flex-wrap gap-1.5">
            <Badge className="bg-blue-900/30 border-blue-600/50 text-blue-300">
              Mobile Testing
            </Badge>
            <Badge className="bg-green-900/30 border-green-600/50 text-green-300">
              UX Design  
            </Badge>
            <Badge className="bg-purple-900/30 border-purple-600/50 text-purple-300">
              Content Writing
            </Badge>
            <Badge className="bg-orange-900/30 border-orange-600/50 text-orange-300">
              App Reviews
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card className="theme-transition">
        <CardContent className="p-3.5">
          <h3 className="text-sm font-semibold mb-3">Recent Reviews</h3>
          {reviewsLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-sm">No reviews yet</div>
              <div className="text-xs">Complete bounties to start receiving reviews!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 3).map((review: any) => (
                <div 
                  key={review.id} 
                  className="pb-3 border-b border-border last:border-b-0"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm" data-testid="text-reviewer-name">
                      {review.reviewer.firstName || review.reviewer.handle}
                    </div>
                    <div className="text-pocket-gold-light text-sm">
                      {"⭐".repeat(review.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-review-comment">
                    "{review.comment}"
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {review.bounty.title} • {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
