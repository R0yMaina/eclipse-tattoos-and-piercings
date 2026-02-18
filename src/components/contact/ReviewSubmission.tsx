import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Star, Send, MessageSquare, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ReviewSubmission = () => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({ title: 'Rating required', description: 'Please select a star rating.', variant: 'destructive' });
      return;
    }
    if (!reviewText.trim()) {
      toast({ title: 'Review required', description: 'Please write your review or complaint.', variant: 'destructive' });
      return;
    }
    if (reviewText.trim().length > 1000) {
      toast({ title: 'Too long', description: 'Please keep your review under 1000 characters.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        client_name: isAnonymous ? null : name.trim() || null,
        is_anonymous: isAnonymous,
        rating,
        review_text: reviewText.trim(),
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: 'Thank you!', description: 'Your review has been submitted and will appear once approved.' });
    } catch (err) {
      console.error('Review submission error:', err);
      toast({ title: 'Error', description: 'Failed to submit review. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/30 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-heading font-bold text-foreground mb-2">Review Submitted!</h3>
        <p className="text-muted-foreground">Your feedback means a lot. It will be visible once our team reviews it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/30 p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-heading font-bold text-foreground">Leave a Review or Complaint</h3>
      </div>
      <p className="text-muted-foreground text-sm">
        Had a session with us? Share your experience — compliments and complaints are equally welcome.
      </p>

      {/* Star Rating */}
      <div className="space-y-2">
        <Label className="text-foreground/80">Your Rating *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'h-7 w-7 transition-colors',
                  (hoveredStar || rating) >= star
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground/40'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Anonymous toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="anonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="rounded border-border"
        />
        <Label htmlFor="anonymous" className="text-foreground/80 cursor-pointer text-sm">
          Submit anonymously
        </Label>
      </div>

      {/* Name */}
      {!isAnonymous && (
        <div className="space-y-2">
          <Label className="text-foreground/80">Your Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Doe"
            maxLength={100}
            className="bg-background/50 border-border/50"
          />
        </div>
      )}

      {/* Review Text */}
      <div className="space-y-2">
        <Label className="text-foreground/80">Your Review / Complaint *</Label>
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Tell us about your experience — what went well or what could be improved..."
          maxLength={1000}
          rows={4}
          className="bg-background/50 border-border/50 resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">{reviewText.length}/1000</p>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/20">
        <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Reviews are moderated before being published. Complaints are forwarded to our team for follow-up.
        </p>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <>Submitting...</>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Review
          </>
        )}
      </Button>
    </form>
  );
};

export default ReviewSubmission;
