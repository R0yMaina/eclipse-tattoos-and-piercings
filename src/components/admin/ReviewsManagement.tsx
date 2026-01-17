import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, Check, X, Send, MessageSquare } from 'lucide-react';
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
          className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
        />
      ))}
    </div>
  );

  return (
    <Tabs defaultValue="queue" className="space-y-6">
      <TabsList>
        <TabsTrigger value="queue" className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Request Queue
          {queue.filter(q => !q.request_sent).length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {queue.filter(q => !q.request_sent).length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="reviews" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Reviews
          {reviews.filter(r => !r.is_approved).length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {reviews.filter(r => !r.is_approved).length} pending
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="queue">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Review Request Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingQueue ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No clients in review queue</p>
              </div>
            ) : (
              <div className="space-y-4">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 border"
                  >
                    <div>
                      <p className="font-medium">{item.bookings.client_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Visit: {format(new Date(item.bookings.booking_slots.slot_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.client_phone}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.request_sent ? (
                        <Badge variant="outline" className="text-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Sent
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => sendReviewRequest(item)}
                          disabled={sending === item.id}
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

      <TabsContent value="reviews">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingReviews ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className={`p-4 rounded-lg border ${
                      review.is_approved ? 'bg-green-500/10 border-green-500/30' : 'bg-background/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {review.is_anonymous ? 'Anonymous' : review.client_name || 'Unknown'}
                          </span>
                          {review.is_approved && (
                            <Badge variant="outline" className="text-green-500">
                              Approved
                            </Badge>
                          )}
                        </div>
                        
                        {review.review_text && (
                          <p className="text-sm">{review.review_text}</p>
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
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => toggleReviewApproval(review.id, true)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Check className="h-4 w-4" />
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
  );
};

export default ReviewsManagement;
