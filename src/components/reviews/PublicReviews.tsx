import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Star, Quote } from 'lucide-react';

interface Review {
  id: string;
  client_name: string | null;
  is_anonymous: boolean;
  rating: number;
  review_text: string | null;
  created_at: string;
}

const PublicReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'fill-primary text-primary' : 'text-muted'}`}
        />
      ))}
    </div>
  );

  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground">
            Real reviews from our satisfied customers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                
                {review.review_text && (
                  <p className="text-foreground mb-4 leading-relaxed">
                    "{review.review_text}"
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="font-medium text-foreground">
                      {review.is_anonymous ? 'Anonymous' : review.client_name || 'Happy Client'}
                    </p>
                  </div>
                  {renderStars(review.rating)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PublicReviews;
