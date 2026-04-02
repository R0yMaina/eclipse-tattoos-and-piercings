import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
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
import { Loader2, Phone, Clock, User, FileImage, Play, Square, CheckCircle, DollarSign, Star, UserCheck, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  slot_id: string;
  client_name: string;
  phone_number: string;
  inspiration_image_url: string | null;
  notes: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'no_show' | 'pending_payment' | 'pending_verification' | 'confirmed';
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

  const fetchBookings = useCallback(async () => {
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
      setBookings((data as unknown as Booking[]) || []);
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
  }, [selectedDate, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);



  const updateBookingStatus = async (
    bookingId: string,
    newStatus: Booking['status'],
    additionalData?: Partial<Booking>
  ) => {
    try {
      const updateData: Partial<Booking> = { status: newStatus, ...additionalData };

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

  // Calculate daily revenue summary
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.price_charged || 0), 0);
  const sessionsCompleted = completedBookings.length;
  const avgSessionValue = sessionsCompleted > 0 ? totalRevenue / sessionsCompleted : 0;

  // Count bookings by status
  const upcomingCount = bookings.filter(b => b.status === 'upcoming').length;
  const ongoingCount = bookings.filter(b => b.status === 'ongoing').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Bookings Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage daily appointments and sessions</p>
        </div>
      </div>

      {/* Daily Revenue Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-500">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-primary">{sessionsCompleted}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-blue-500">{upcomingCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Value</p>
                <p className="text-2xl font-bold text-yellow-500">${avgSessionValue.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="glass-panel-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Select Date
            </CardTitle>
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
        <Card className="lg:col-span-2 glass-panel-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                Bookings for {format(selectedDate, 'MMMM d, yyyy')}
              </span>
              <div className="flex items-center gap-2">
                {ongoingCount > 0 && (
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">
                    {ongoingCount} in progress
                  </Badge>
                )}
                <Badge variant="outline">{bookings.length} total</Badge>
              </div>
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
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id} className={`border transition-all duration-300 hover:border-primary/20 ${booking.status === 'ongoing'
                    ? 'bg-yellow-500/5 border-yellow-500/30'
                    : booking.status === 'completed'
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-card/50 border-border/50'
                    }`}>
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
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleStartSession(booking)}
                                className="bg-yellow-500 hover:bg-yellow-600"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'ongoing')}
                                className="border-green-500 text-green-500 hover:bg-green-500/10"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Arrived
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'no_show')}
                                className="border-destructive text-destructive hover:bg-destructive/10"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                No-Show
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                Cancel
                              </Button>
                            </div>
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
                              <DialogContent className="sm:max-w-md glass-panel-elevated border-primary/20">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                    Complete Session & Checkout
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-5 pt-4">
                                  {/* Client Info Summary */}
                                  <div className="glass-panel rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-muted-foreground">Client</span>
                                      <span className="font-medium">{selectedBooking?.client_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-muted-foreground">Started At</span>
                                      <span className="font-medium">
                                        {selectedBooking?.actual_start_time
                                          ? format(new Date(selectedBooking.actual_start_time), 'h:mm a')
                                          : formatTime(booking.booking_slots.start_time)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-muted-foreground">Finishing At</span>
                                      <span className="font-medium text-green-500">
                                        {format(new Date(), 'h:mm a')}
                                      </span>
                                    </div>
                                    {/* Session Duration */}
                                    {selectedBooking?.actual_start_time && (
                                      <div className="flex items-center justify-between pt-3 border-t border-border/30">
                                        <span className="text-sm text-muted-foreground">Session Duration</span>
                                        <span className="font-semibold text-primary">
                                          {(() => {
                                            const startTime = new Date(selectedBooking.actual_start_time);
                                            const now = new Date();
                                            const totalMinutes = differenceInMinutes(now, startTime);
                                            const hours = Math.floor(totalMinutes / 60);
                                            const minutes = totalMinutes % 60;
                                            if (hours > 0) {
                                              return `${hours}h ${minutes}m`;
                                            }
                                            return `${minutes} min`;
                                          })()}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Price Input */}
                                  <div className="space-y-2">
                                    <Label htmlFor="price" className="flex items-center gap-2 text-sm">
                                      <DollarSign className="h-4 w-4 text-primary" />
                                      Price Charged
                                    </Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                      <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={priceCharged}
                                        onChange={(e) => setPriceCharged(e.target.value)}
                                        placeholder="0.00"
                                        className="pl-7 bg-background/50 border-border/50 focus:border-primary/50"
                                      />
                                    </div>
                                  </div>

                                  {/* Admin Notes */}
                                  <div className="space-y-2">
                                    <Label htmlFor="adminNotes" className="text-sm">Internal Notes</Label>
                                    <Textarea
                                      id="adminNotes"
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Session notes, work done, etc..."
                                      rows={3}
                                      className="bg-background/50 border-border/50 focus:border-primary/50"
                                    />
                                  </div>

                                  {/* Review Queue Toggle */}
                                  <div className="flex items-center gap-3 p-4 glass-panel rounded-xl border-primary/20">
                                    <input
                                      type="checkbox"
                                      id="reviewQueue"
                                      checked={addToReviewQueue}
                                      onChange={(e) => setAddToReviewQueue(e.target.checked)}
                                      className="h-5 w-5 rounded border-primary text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="reviewQueue" className="text-sm flex items-center gap-2 cursor-pointer">
                                      <Star className="h-4 w-4 text-primary" />
                                      <span>Send review request to client</span>
                                    </Label>
                                  </div>

                                  <Button onClick={handleCompleteSession} className="w-full bg-green-500 hover:bg-green-600" size="lg">
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Complete & Checkout
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
