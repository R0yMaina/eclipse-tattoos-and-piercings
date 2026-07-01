import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
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
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, Clock, User, FileImage, Play, Square, CheckCircle, DollarSign, Star, UserCheck, UserX, Plus } from 'lucide-react';

interface Booking {
  id: string;
  slot_id: string | null;
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
  booking_source: 'online' | 'manual';
  payment_method: string | null;
  service_type: string | null;
  agreed_price: number | null;
  deposit_amount: number | null;
  appointment_date: string | null;
  appointment_time: string | null;
  is_walk_in: boolean | null;
  booking_slots: {
    slot_date: string;
    start_time: string;
    end_time: string;
    slot_number: number;
  } | null;
}

interface SlotAvailability {
  slot_id: string;
  slot_number: number;
  start_time: string;
  end_time: string;
  status: string;
  client_name: string | null;
}

type BookingInsertPayload = Omit<Database['public']['Tables']['bookings']['Insert'], 'slot_id'> & {
  slot_id?: string | null;
};

const BookingsManagement = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slotOptions, setSlotOptions] = useState<SlotAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [priceCharged, setPriceCharged] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [addToReviewQueue, setAddToReviewQueue] = useState(true);
  const [selectedSlotOption, setSelectedSlotOption] = useState('');
  const [manualAppointmentTime, setManualAppointmentTime] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualBookingForm, setManualBookingForm] = useState({
    clientName: '',
    phoneNumber: '',
    serviceType: '',
    notes: '',
    paymentMethod: 'cash',
    isWalkIn: false,
    agreedPrice: '',
    amountPaid: '',
  });
  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('appointment_date', formattedDate);

      if (error) throw error;
      const sortedBookings = ((data as unknown as Booking[]) || []).sort((a, b) => {
        const aTime = a.appointment_time || a.booking_slots?.start_time || '00:00';
        const bTime = b.appointment_time || b.booking_slots?.start_time || '00:00';
        return aTime.localeCompare(bTime);
      });
      setBookings(sortedBookings);
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

  const fetchSlotAvailability = useCallback(async (date: Date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      await supabase.functions.invoke('generate-slots', { body: { date: formattedDate } });
      const { data, error } = await supabase.rpc('get_slot_availability', { target_date: formattedDate });
      if (error) throw error;
      const availableSlots = ((data as SlotAvailability[]) || []).filter(slot => slot.status === 'available');
      setSlotOptions(availableSlots);
      setSelectedSlotOption(availableSlots[0]?.slot_id ?? '');
      setManualAppointmentTime(availableSlots[0]?.start_time ?? '');
    } catch (error) {
      console.error('Error fetching slot availability:', error);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchSlotAvailability(selectedDate);
  }, [fetchBookings, fetchSlotAvailability, selectedDate]);



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
            time: formatTime(booking.booking_slots?.start_time)
          }
        });
      }
    }, 15 * 60 * 1000);
  };

  const handleCreateManualBooking = async (event: FormEvent) => {
    event.preventDefault();

    if (!manualBookingForm.clientName.trim() || !manualBookingForm.phoneNumber.trim() || !manualBookingForm.serviceType.trim()) {
      toast({ title: 'Missing information', description: 'Please fill in the customer name, phone number, and service type.', variant: 'destructive' });
      return;
    }

    if (!manualBookingForm.agreedPrice.trim() || isNaN(Number(manualBookingForm.agreedPrice)) || Number(manualBookingForm.agreedPrice) <= 0) {
      toast({ title: 'Missing amount', description: 'Please enter a valid total price for the booking.', variant: 'destructive' });
      return;
    }

    if (!manualBookingForm.amountPaid.trim() || isNaN(Number(manualBookingForm.amountPaid)) || Number(manualBookingForm.amountPaid) < 0) {
      toast({ title: 'Missing amount paid', description: 'Please enter a valid amount paid so far.', variant: 'destructive' });
      return;
    }

    if (!manualAppointmentTime) {
      toast({ title: 'Missing time', description: 'Please enter the exact appointment time.', variant: 'destructive' });
      return;
    }

    setManualSubmitting(true);
    try {
      const appointmentDate = format(selectedDate, 'yyyy-MM-dd');
      const chosenSlot = slotOptions.find(slot => slot.slot_id === selectedSlotOption);
      const appointmentTime = manualAppointmentTime || chosenSlot?.start_time || null;
      const agreedPrice = parseFloat(manualBookingForm.agreedPrice);
      const amountPaid = parseFloat(manualBookingForm.amountPaid);

      if (amountPaid > agreedPrice) {
        toast({ title: 'Invalid payment', description: 'Amount paid cannot exceed the total price.', variant: 'destructive' });
        setManualSubmitting(false);
        return;
      }


      if (!manualBookingForm.isWalkIn && chosenSlot) {
        const { data: existingBooking, error: existingBookingError } = await supabase
          .from('bookings')
          .select('id')
          .eq('slot_id', chosenSlot.slot_id)
          .neq('status', 'cancelled')
          .neq('status', 'no_show')
          .maybeSingle();

        if (existingBookingError) throw existingBookingError;
        if (existingBooking) {
          throw new Error('This time slot is already booked. Please pick another available time.');
        }
      }

      const paymentStatus = 'pending';
      const depositPaid = amountPaid > 0;
      const bookingPayload: BookingInsertPayload = {
        id: crypto.randomUUID(),
        client_name: manualBookingForm.clientName.trim(),
        phone_number: manualBookingForm.phoneNumber.trim(),
        service_type: manualBookingForm.serviceType.trim() || null,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime || null,
        notes: manualBookingForm.notes.trim() || null,
        status: 'upcoming',
        booking_source: 'manual',
        payment_method: manualBookingForm.paymentMethod,
        is_walk_in: manualBookingForm.isWalkIn,
        payment_status: paymentStatus,
        deposit_paid: depositPaid,
        deposit_amount: amountPaid,
        agreed_price: agreedPrice,
        payment_expires_at: null,
        slot_id: manualBookingForm.isWalkIn ? null : chosenSlot?.slot_id ?? null,
      };

      const { error: bookingError } = await supabase.from('bookings').insert(bookingPayload);

      if (bookingError) throw bookingError;

      toast({
        title: 'Manual booking created',
        description: manualBookingForm.isWalkIn ? 'Walk-in record saved successfully.' : 'Booking added to the selected slot.',
      });

      setManualBookingForm({ clientName: '', phoneNumber: '', serviceType: '', notes: '', paymentMethod: 'cash', isWalkIn: false, agreedPrice: '', amountPaid: '' });
      setSelectedSlotOption('');
      setManualAppointmentTime('');
      setManualDialogOpen(false);
      fetchBookings();
      fetchSlotAvailability(selectedDate);
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string'
          ? (error as any).message
          : 'Failed to create the manual booking.';
      toast({ title: 'Booking failed', description: message, variant: 'destructive' });
    } finally {
      setManualSubmitting(false);
    }
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

  const formatTime = (time: string | null | undefined) => {
    if (!time) return '—';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      pending_payment: { variant: 'outline', className: 'border-blue-500 text-blue-500' },
      pending_verification: { variant: 'default', className: 'bg-yellow-500' },
      confirmed: { variant: 'default', className: 'bg-green-500' },
      upcoming: { variant: 'default', className: 'bg-blue-500' },
      ongoing: { variant: 'default', className: 'bg-yellow-500' },
      completed: { variant: 'default', className: 'bg-green-500' },
      cancelled: { variant: 'destructive', className: '' },
      no_show: { variant: 'destructive', className: '' }
    };

    const config = variants[status] || { variant: 'secondary', className: '' };

    return (
      <Badge variant={config.variant} className={cn("font-bold tracking-tight", config.className)}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  // Calculate daily revenue summary
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + (b.price_charged ?? b.agreed_price ?? 0),
    0
  );
  const totalCollectedToday = bookings
    .filter(b => b.status !== 'cancelled' && b.status !== 'no_show')
    .reduce((sum, b) => sum + (b.price_charged ?? b.deposit_amount ?? 0), 0);
  const outstandingBalance = bookings
    .filter(b => b.status !== 'cancelled' && b.status !== 'no_show')
    .reduce((sum, b) => {
      const price = b.price_charged ?? b.agreed_price ?? 0;
      const paid = b.price_charged ? price : (b.deposit_amount ?? 0);
      return sum + Math.max(0, price - paid);
    }, 0);
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
        <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl glass-panel-elevated border-primary/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Create Manual Booking
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateManualBooking} className="space-y-4 pt-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="manual-client-name">Customer Name</Label>
                  <Input
                    id="manual-client-name"
                    value={manualBookingForm.clientName}
                    onChange={(e) => setManualBookingForm(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-phone">Phone Number</Label>
                  <Input
                    id="manual-phone"
                    value={manualBookingForm.phoneNumber}
                    onChange={(e) => setManualBookingForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="0712 345678"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-service">Service / Tattoo Type</Label>
                <Input
                  id="manual-service"
                  value={manualBookingForm.serviceType}
                  onChange={(e) => setManualBookingForm(prev => ({ ...prev, serviceType: e.target.value }))}
                  placeholder="Small linework / Piercing"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <Input type="date" value={format(selectedDate, 'yyyy-MM-dd')} onChange={(e) => setSelectedDate(new Date(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={manualBookingForm.paymentMethod} onValueChange={(value) => setManualBookingForm(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="manual-price">Total Price (KES)</Label>
                  <Input
                    id="manual-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualBookingForm.agreedPrice}
                    onChange={(e) => setManualBookingForm(prev => ({ ...prev, agreedPrice: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-paid">Amount Paid (KES)</Label>
                  <Input
                    id="manual-paid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualBookingForm.amountPaid}
                    onChange={(e) => setManualBookingForm(prev => ({ ...prev, amountPaid: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Exact Appointment Time</Label>
                <Input
                  type="time"
                  step={60}
                  value={manualAppointmentTime ? manualAppointmentTime.slice(0, 5) : ''}
                  onChange={(e) => setManualAppointmentTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">This exact time is what gets saved for the record.</p>
              </div>

              {!manualBookingForm.isWalkIn && (
                <div className="space-y-2">
                  <Label>Reserve Available Slot (optional)</Label>
                  <Select
                    value={selectedSlotOption}
                    onValueChange={(value) => {
                      setSelectedSlotOption(value);
                      const slot = slotOptions.find(s => s.slot_id === value);
                      if (slot) setManualAppointmentTime(slot.start_time.slice(0, 5));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an available slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {slotOptions.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No available slots for this date.</div>
                      ) : (
                        slotOptions.map(slot => (
                          <SelectItem key={slot.slot_id} value={slot.slot_id}>
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 p-3">
                <input
                  type="checkbox"
                  id="manual-walk-in"
                  checked={manualBookingForm.isWalkIn}
                  onChange={(e) => setManualBookingForm(prev => ({ ...prev, isWalkIn: e.target.checked }))}
                  className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                />
                <Label htmlFor="manual-walk-in" className="cursor-pointer text-sm">Record as walk-in (does not occupy a booked slot)</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-notes">Optional Notes</Label>
                <Textarea
                  id="manual-notes"
                  value={manualBookingForm.notes}
                  onChange={(e) => setManualBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special notes for the studio team"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setManualDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={manualSubmitting}>
                  {manualSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Booking
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="font-semibold text-lg flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              {formatTime(booking.appointment_time || booking.booking_slots?.start_time || '00:00')} - {formatTime(booking.booking_slots?.end_time || booking.appointment_time || booking.appointment_time || '00:00')}
                            </div>
                            {getStatusBadge(booking.status)}
                            <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
                              {booking.booking_source === 'manual' ? 'Manual' : 'Online'}
                            </Badge>
                            {booking.is_walk_in && (
                              <Badge variant="secondary" className="text-[11px] uppercase tracking-wide">Walk-in</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {booking.client_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {booking.phone_number}
                            </span>
                          </div>

                          {booking.service_type && (
                            <p className="text-sm text-muted-foreground">
                              Service: <span className="font-medium text-foreground">{booking.service_type}</span>
                            </p>
                          )}

                          {booking.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              "{booking.notes}"
                            </p>
                          )}

                          {booking.payment_method && (
                            <p className="text-sm text-muted-foreground">
                              Payment: <span className="font-medium text-foreground">{booking.payment_method === 'cash' ? 'Cash' : booking.payment_method}</span>
                            </p>
                          )}

                          {booking.deposit_amount !== null && booking.deposit_amount !== undefined && (
                            <p className="text-sm text-muted-foreground">
                              Amount Paid: <span className="font-medium text-foreground">KES {booking.deposit_amount.toLocaleString()}</span>
                            </p>
                          )}

                          {booking.agreed_price !== null && booking.deposit_amount !== null && (
                            <p className="text-sm text-muted-foreground">
                              Balance: <span className="font-medium text-foreground">KES {(booking.agreed_price - booking.deposit_amount).toLocaleString()}</span>
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
                          {(booking.status === 'upcoming' || booking.status === 'confirmed' || booking.status === 'pending_payment' || booking.status === 'pending_verification') && (
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, 'no_show')}
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              No-Show
                            </Button>
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
                                          : formatTime(booking.booking_slots?.start_time || booking.appointment_time || '00:00')}
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
