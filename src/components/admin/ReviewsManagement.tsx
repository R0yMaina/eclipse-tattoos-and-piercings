import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, Check, X, Send, MessageSquare, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewQueueItem {
  id: string;
  booking_id: string;
  client_phone: string;
  request_sent: boolean;
  created_at: string;
  bookings: {
    client_name: string;
    booking_slots: {
      slot_date: string;
    };
  };
}

interface Review {
  id: string;
  client_name: string | null;
  is_anonymous: boolean;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string;
}

const ReviewsManagement = () => {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchQueue();
    fetchReviews();
  }, []);

  const fetchQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('review_queue')
        .select(`
          *,
          bookings!inner (
            client_name,
            booking_slots!inner (
              slot_date
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setQueue(data || []);
    } catch (error) {
      console.error('Error fetching review queue:', error);
    } finally {
      setLoadingQueue(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const sendReviewRequest = async (item: ReviewQueueItem) => {
    setSending(item.id);
    try {
      await supabase.functions.invoke('send-whatsapp', {
        body: {
          type: 'review_request',
          phoneNumber: item.client_phone,
          clientName: item.bookings.client_name
        }
      });
      
      await supabase
        .from('review_queue')
        .update({ request_sent: true })
        .eq('id', item.id);
      
      toast({
        title: 'Review request sent',
        description: `Request sent to ${item.bookings.client_name}`,
      });
      
      fetchQueue();
    } catch (error) {
      console.error('Error sending review request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send review request',
        variant: 'destructive'
      });
    } finally {
      setSending(null);
    }
  };

  const toggleReviewApproval = async (reviewId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: approve })
        .eq('id', reviewId);
      
      if (error) throw error;
      
      toast({
        title: approve ? 'Review approved' : 'Review hidden',
        description: approve ? 'Review is now visible publicly' : 'Review is hidden from public',
      });
      
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: 'Error',
        description: 'Failed to update review',
        variant: 'destructive'
      });
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );

  // Stats
  const pendingQueue = queue.filter(q => !q.request_sent).length;
  const pendingReviews = reviews.filter(r => !r.is_approved).length;
  const approvedReviews = reviews.filter(r => r.is_approved).length;
  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Reviews Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage review requests and customer feedback</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-500">{pendingQueue}</p>
              </div>
              <Send className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-blue-500">{pendingReviews}</p>
              </div>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-500">{approvedReviews}</p>
              </div>
              <Check className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-500">{avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="space-y-6">
        <div className="glass-panel rounded-xl p-1.5">
          <TabsList className="w-full bg-transparent">
            <TabsTrigger 
              value="queue" 
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3"
            >
              <Send className="h-4 w-4 mr-2" />
              Request Queue
              {pendingQueue > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {pendingQueue}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Reviews
              {pendingReviews > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {pendingReviews} pending
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="queue" className="mt-0">
          <Card className="glass-panel-elevated">
            <CardHeader>
              <CardTitle className="text-base">Review Request Queue</CardTitle>
              <CardDescription>Send review requests to clients after their sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingQueue ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Send className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No clients in review queue</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Complete sessions to add clients to the queue</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.bookings.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Visit: {format(new Date(item.bookings.booking_slots.slot_date), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.client_phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.request_sent ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <Check className="h-3 w-3 mr-1" />
                            Sent
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => sendReviewRequest(item)}
                            disabled={sending === item.id}
                            className="gold-glow"
                          >
                            {sending === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Send Request
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-0">
          <Card className="glass-panel-elevated">
            <CardHeader>
              <CardTitle className="text-base">Customer Reviews</CardTitle>
              <CardDescription>Approve or hide reviews to control what's shown publicly</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingReviews ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        review.is_approved 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-card/50 border-border/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            {renderStars(review.rating)}
                            <span className="text-sm text-muted-foreground">
                              {review.is_anonymous ? 'Anonymous' : review.client_name || 'Unknown'}
                            </span>
                            {review.is_approved && (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                <Check className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            )}
                          </div>
                          
                          {review.review_text && (
                            <p className="text-sm bg-muted/30 p-3 rounded-lg">"{review.review_text}"</p>
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {review.is_approved ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleReviewApproval(review.id, false)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => toggleReviewApproval(review.id, true)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewsManagement;