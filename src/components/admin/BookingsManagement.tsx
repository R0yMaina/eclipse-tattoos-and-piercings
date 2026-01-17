import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, Clock, User, FileImage, Play, Square, CheckCircle, DollarSign, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  slot_id: string;
  client_name: string;
  phone_number: string;
  inspiration_image_url: string | null;
  notes: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'no_show';
  actual_start_time: string | null;
  actual_end_time: string | null;
  price_charged: number | null;
  admin_notes: string | null;
  created_at: string;
  booking_slots: {
    slot_date: string;
    start_time: string;
    end_time: string;
    slot_number: number;
  };
}

const BookingsManagement = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [priceCharged, setPriceCharged] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [addToReviewQueue, setAddToReviewQueue] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [selectedDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          booking_slots!inner (
            slot_date,
            start_time,
            end_time,
            slot_number
          )
        `)
        .eq('booking_slots.slot_date', formattedDate)
        .order('booking_slots(start_time)', { ascending: true });
      
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string, additionalData?: any) => {
    try {
      const updateData: any = { status: newStatus, ...additionalData };
      
      if (newStatus === 'ongoing') {
        updateData.actual_start_time = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.actual_end_time = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);
      
      if (error) throw error;
      
      toast({
        title: 'Status updated',
        description: `Booking marked as ${newStatus}`,
      });
      
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive'
      });
    }
  };

  const handleStartSession = async (booking: Booking) => {
    await updateBookingStatus(booking.id, 'ongoing');
    
    // Send late warning check after 15 minutes
    setTimeout(async () => {
      const { data: currentBooking } = await supabase
        .from('bookings')
        .select('status, late_warning_sent')
        .eq('id', booking.id)
        .single();
      
      if (currentBooking?.status === 'upcoming' && !currentBooking.late_warning_sent) {
        await supabase.functions.invoke('send-whatsapp', {
          body: {
            type: 'late_warning',
            bookingId: booking.id,
            clientName: booking.client_name,
            phoneNumber: booking.phone_number,
            time: formatTime(booking.booking_slots.start_time)
          }
        });
      }
    }, 15 * 60 * 1000);
  };

  const handleCompleteSession = async () => {
    if (!selectedBooking) return;
    
    await updateBookingStatus(selectedBooking.id, 'completed', {
      price_charged: priceCharged ? parseFloat(priceCharged) : null,
      admin_notes: adminNotes || null
    });
    
    if (addToReviewQueue) {
      try {
        await supabase
          .from('review_queue')
          .insert({
            booking_id: selectedBooking.id,
            client_phone: selectedBooking.phone_number
          });
      } catch (error) {
        console.error('Error adding to review queue:', error);
      }
    }
    
    setCompleteDialogOpen(false);
    setSelectedBooking(null);
    setPriceCharged('');
    setAdminNotes('');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      upcoming: { variant: 'default', className: 'bg-blue-500' },
      ongoing: { variant: 'default', className: 'bg-yellow-500' },
      completed: { variant: 'default', className: 'bg-green-500' },
      cancelled: { variant: 'destructive', className: '' },
      no_show: { variant: 'destructive', className: '' }
    };
    
    const config = variants[status] || { variant: 'secondary', className: '' };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="lg:col-span-2 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Bookings for {format(selectedDate, 'MMMM d, yyyy')}</span>
              <Badge variant="outline">{bookings.length} bookings</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No bookings for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="bg-background/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-lg flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              {formatTime(booking.booking_slots.start_time)} - {formatTime(booking.booking_slots.end_time)}
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {booking.client_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {booking.phone_number}
                            </span>
                          </div>
                          
                          {booking.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              "{booking.notes}"
                            </p>
                          )}
                          
                          {booking.inspiration_image_url && (
                            <a
                              href={booking.inspiration_image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary flex items-center gap-1 hover:underline"
                            >
                              <FileImage className="h-4 w-4" />
                              View Inspiration Image
                            </a>
                          )}
                          
                          {booking.price_charged && (
                            <div className="flex items-center gap-1 text-sm text-green-500">
                              <DollarSign className="h-4 w-4" />
                              ${booking.price_charged}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {booking.status === 'upcoming' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStartSession(booking)}
                                className="bg-yellow-500 hover:bg-yellow-600"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                              <Select
                                onValueChange={(value) => updateBookingStatus(booking.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cancelled">Cancel</SelectItem>
                                  <SelectItem value="no_show">No Show</SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          )}
                          
                          {booking.status === 'ongoing' && (
                            <Dialog open={completeDialogOpen && selectedBooking?.id === booking.id} onOpenChange={setCompleteDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedBooking(booking)}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <Square className="h-4 w-4 mr-1" />
                                  Complete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Complete Session</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="price">Price Charged ($)</Label>
                                    <Input
                                      id="price"
                                      type="number"
                                      step="0.01"
                                      value={priceCharged}
                                      onChange={(e) => setPriceCharged(e.target.value)}
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="adminNotes">Internal Notes</Label>
                                    <Textarea
                                      id="adminNotes"
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Session notes..."
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="reviewQueue"
                                      checked={addToReviewQueue}
                                      onChange={(e) => setAddToReviewQueue(e.target.checked)}
                                      className="rounded border-border"
                                    />
                                    <Label htmlFor="reviewQueue" className="text-sm flex items-center gap-1">
                                      <Star className="h-4 w-4" />
                                      Add to review request queue
                                    </Label>
                                  </div>
                                  <Button onClick={handleCompleteSession} className="w-full">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {booking.status === 'completed' && (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingsManagement;
