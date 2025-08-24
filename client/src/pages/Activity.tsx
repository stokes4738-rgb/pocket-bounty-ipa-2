import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function Activity() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["/api/user/activities"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "bounty_applied":
        return "📝";
      case "bounty_completed":
        return "✅";
      case "payment_received":
        return "💰";
      case "points_earned":
        return "⭐";
      case "friend_request":
        return "👥";
      case "level_up":
        return "🎉";
      case "review_received":
        return "⭐";
      case "bounty_posted":
        return "📋";
      default:
        return "🔔";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "payment_received":
      case "bounty_completed":
        return "bg-green-600";
      case "points_earned":
      case "level_up":
        return "bg-purple-600";
      case "friend_request":
        return "bg-blue-600";
      case "review_received":
        return "bg-orange-600";
      case "bounty_posted":
      case "bounty_applied":
        return "bg-pocket-red";
      default:
        return "bg-secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-32 animate-pulse mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3.5 animate-pulse">
            <div className="flex gap-2.5">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Activity Feed</h2>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <Card className="theme-transition">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
              <p className="text-muted-foreground">
                Start completing bounties and connecting with others to see your activity here!
              </p>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity: any) => (
            <Card 
              key={activity.id} 
              className="theme-transition"
              data-testid={`activity-${activity.id}`}
            >
              <CardContent className="p-3.5">
                <div className="flex gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm" data-testid="text-activity-description">
                      {activity.description}
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid="text-activity-time">
                      {formatDate(activity.createdAt)}
                    </div>
                    
                    {/* Special handling for certain activity types */}
                    {activity.type === "friend_request" && activity.metadata?.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          className="bg-pocket-red hover:bg-pocket-red-dark text-white"
                          data-testid="button-accept-friend-request"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid="button-decline-friend-request"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                    
                    {activity.type === "payment_received" && activity.metadata?.amount && (
                      <Badge className="bg-pocket-gold text-gray-900 mt-1">
                        +{formatCurrency(activity.metadata.amount)}
                      </Badge>
                    )}
                    
                    {activity.type === "points_earned" && activity.metadata?.points && (
                      <Badge className="bg-purple-600 text-white mt-1">
                        +{activity.metadata.points} ⭐
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
