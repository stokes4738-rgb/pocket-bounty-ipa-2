import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Bounty } from "@shared/schema";

export default function Board() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bounties = [], isLoading } = useQuery<Bounty[]>({
    queryKey: ["/api/bounties", selectedCategory],
    queryFn: ({ queryKey }) => {
      const category = queryKey[1] === "all" ? undefined : queryKey[1];
      const params = new URLSearchParams();
      if (category) params.append("category", category as string);
      return fetch(`/api/bounties?${params.toString()}`).then(res => res.json());
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (bountyId: string) => {
      return apiRequest("POST", `/api/bounties/${bountyId}/apply`, {
        message: "I'd like to work on this bounty!"
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Sent!",
        description: "Your application has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bounties"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to apply to bounty. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-9 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3.5 animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Available Bounties</h2>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40" data-testid="select-category-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="testing">Testing</SelectItem>
            <SelectItem value="writing">Writing</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bounties List */}
      <div className="space-y-3">
        {bounties.length === 0 ? (
          <Card className="theme-transition">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">No bounties available</h3>
              <p className="text-muted-foreground">
                Be the first to post a bounty in this category!
              </p>
            </CardContent>
          </Card>
        ) : (
          bounties.map((bounty: any) => (
            <Card key={bounty.id} className="theme-transition" data-testid={`bounty-${bounty.id}`}>
              <CardContent className="p-3.5">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold mb-1.5" data-testid="text-bounty-title">
                      {bounty.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2" data-testid="text-bounty-description">
                      {bounty.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="secondary">{bounty.category}</Badge>
                      {bounty.tags?.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <span>Posted by </span>
                      <span className="text-foreground font-medium">@{bounty.authorId}</span>
                      <span> • {formatDate(bounty.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-pocket-gold mb-1" data-testid="text-bounty-reward">
                      {formatCurrency(bounty.reward)}
                    </div>
                    {Math.random() > 0.7 && ( // Random boost indicator
                      <div className="boost-pill">
                        <span>🚀</span>
                        <span>Boosted</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button
                    className="bg-pocket-red hover:bg-pocket-red-dark text-white flex-1"
                    onClick={() => applyMutation.mutate(bounty.id)}
                    disabled={applyMutation.isPending || bounty.authorId === user?.id}
                    data-testid={`button-apply-${bounty.id}`}
                  >
                    {bounty.authorId === user?.id ? "Your Bounty" : "Apply"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    data-testid={`button-favorite-${bounty.id}`}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
