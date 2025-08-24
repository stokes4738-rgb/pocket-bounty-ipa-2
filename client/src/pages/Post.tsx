import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

const postBountySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(255, "Title too long"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  reward: z.string().refine((val) => parseFloat(val) >= 1, "Minimum reward is $1"),
  tags: z.string().optional(),
  duration: z.string().min(1, "Please select a duration"),
});

type PostBountyForm = z.infer<typeof postBountySchema>;

export default function Post() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<PostBountyForm>({
    resolver: zodResolver(postBountySchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      reward: "10",
      tags: "",
      duration: "7",
    },
  });

  const postMutation = useMutation({
    mutationFn: async (data: PostBountyForm) => {
      const tags = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [];
      return apiRequest("POST", "/api/bounties", {
        ...data,
        reward: parseFloat(data.reward),
        duration: parseInt(data.duration),
        tags,
      });
    },
    onSuccess: () => {
      toast({
        title: "Bounty Posted!",
        description: "Your bounty has been posted successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/bounties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to post bounty. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostBountyForm) => {
    if ((user?.points || 0) < 5) {
      toast({
        title: "Insufficient Points",
        description: "You need at least 5 points to post a bounty.",
        variant: "destructive",
      });
      return;
    }
    postMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Post a New Bounty</h2>
      
      <Card className="theme-transition">
        <CardContent className="p-3.5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Bounty Title
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="What do you need done?" 
                        {...field}
                        data-testid="input-bounty-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the task in detail..." 
                        rows={4}
                        className="resize-none"
                        {...field}
                        data-testid="textarea-bounty-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Value Range
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-bounty-category">
                            <SelectValue placeholder="Select value range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quick_cash">💵 Quick Cash ($5-15)</SelectItem>
                          <SelectItem value="good_money">💰 Good Money ($16-50)</SelectItem>
                          <SelectItem value="big_bucks">💎 Big Bucks ($51-100)</SelectItem>
                          <SelectItem value="major_bag">🏆 Major Bag ($100+)</SelectItem>
                          <SelectItem value="other">🎲 Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Reward Amount ($)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="5" 
                          max="500"
                          {...field}
                          data-testid="input-bounty-reward"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Tags (comma separated)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="mobile, testing, feedback" 
                        {...field}
                        data-testid="input-bounty-tags"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Duration
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-bounty-duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                        <SelectItem value="14">2 weeks</SelectItem>
                        <SelectItem value="30">1 month</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-pocket-red hover:bg-pocket-red-dark text-white"
                  disabled={postMutation.isPending || (user?.points || 0) < 5}
                  data-testid="button-post-bounty"
                >
                  {postMutation.isPending ? "Posting..." : "Post Bounty"}
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  💰 Full amount held in escrow. Auto-refunds in 3 days minus 5% fee if unclaimed.
                </div>
                {(user?.points || 0) < 5 && (
                  <div className="text-xs text-destructive text-center">
                    You need at least 5 points to post a bounty
                  </div>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
