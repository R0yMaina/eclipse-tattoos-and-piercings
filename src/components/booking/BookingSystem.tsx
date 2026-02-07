import { useState, useEffect, useCallback } from 'react';
import { format, isBefore, startOfDay, isSunday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Clock, CheckCircle, Calendar as CalendarIcon, User, Phone, DollarSign, Smartphone, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotAvailability {
  slot_id: string;
  slot_number: number;
  start_time: string;
  end_time: string;
  status: string;
  client_name: string | null;
}

type BookingStep = 'details' | 'payment' | 'waiting' | 'confirmed' | 'failed';

export const BookingSystem = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [inspirationImage, setInspirationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>('details');
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const { toast } = useToast();

  // Fetch slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    } else {
      setSlots([]);
      setSelectedSlot(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Poll for payment confirmation
  useEffect(() => {
    if (!paymentPolling || !currentBookingId) return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('payment_status, deposit_paid, mpesa_receipt')
          .eq('id', currentBookingId)
          .single();

        if (error) {
          console.error('Polling error:', error);
          return;
        }

        if (data?.payment_status === 'paid' && data?.deposit_paid) {
          setPaymentPolling(false);
          setBookingStep('confirmed');
          toast({
            title: 'Payment received! ✅',
            description: `Deposit of KES ${depositAmount} confirmed. Receipt: ${data.mpesa_receipt || 'Processing'}`,
          });
        } else if (data?.payment_status === 'failed') {
          setPaymentPolling(false);
          setBookingStep('failed');
          toast({
            title: 'Payment failed',
            description: 'The M-Pesa payment was not completed. You can retry.',
            variant: 'destructive'
          });
        }
      } catch (err) {
        console.error('Payment polling error:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [paymentPolling, currentBookingId, depositAmount, toast]);

  const fetchSlots = useCallback(async (date: Date) => {
    setLoading(true);
    setSelectedSlot(null);

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');

      await supabase.functions.invoke('generate-slots', {
        body: { date: formattedDate }
      });

      const { data, error } = await supabase.rpc('get_slot_availability', {
        target_date: formattedDate
      });

      if (error) throw error;
      setSlots((data as SlotAvailability[]) || []);
    } catch (error: unknown) {
      console.error('Error fetching slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available slots. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (JPEG, PNG, etc.)',
          variant: 'destructive'
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }

      setInspirationImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot || !clientName.trim() || !phoneNumber.trim() || !agreedPrice) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields including the agreed price.',
        variant: 'destructive'
      });
      return;
    }

    const price = parseFloat(agreedPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid price amount.',
        variant: 'destructive'
      });
      return;
    }

    const phoneRegex = /^[\d\s\-+()]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number (e.g. 0712345678 or +254712345678).',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = null;

      if (inspirationImage) {
        const fileExt = inspirationImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inspiration-images')
          .upload(fileName, inspirationImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('inspiration-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create booking with pending payment
      const newBookingId = crypto.randomUUID();
      const deposit = Math.ceil(price * 0.15);

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          id: newBookingId,
          slot_id: selectedSlot.slot_id,
          client_name: clientName.trim(),
          phone_number: phoneNumber.trim(),
          inspiration_image_url: imageUrl,
          notes: notes.trim() || null,
          status: 'upcoming',
          agreed_price: price,
          deposit_amount: deposit,
          payment_status: 'pending',
          deposit_paid: false,
          payment_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (bookingError) {
        if (bookingError.message.includes('duplicate') || bookingError.message.includes('already exists')) {
          throw new Error('This slot has already been booked. Please select another time.');
        }
        throw bookingError;
      }

      setCurrentBookingId(newBookingId);
      setDepositAmount(deposit);
      setBookingStep('payment');

    } catch (error: unknown) {
      console.error('Booking error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create booking. Please try again.';
      toast({
        title: 'Booking failed',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayDeposit = async () => {
    if (!currentBookingId) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          bookingId: currentBookingId,
          phoneNumber: phoneNumber.trim(),
          agreedPrice: parseFloat(agreedPrice),
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'M-Pesa prompt sent! 📱',
        description: 'Check your phone and enter your M-Pesa PIN to complete the payment.',
      });

      setBookingStep('waiting');
      setPaymentPolling(true);

    } catch (error: unknown) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : 'Failed to send M-Pesa prompt. Please try again.';
      toast({
        title: 'Payment initiation failed',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryPayment = () => {
    setBookingStep('payment');
  };

  const handleResetBooking = () => {
    setClientName('');
    setPhoneNumber('');
    setNotes('');
    setAgreedPrice('');
    setInspirationImage(null);
    setImagePreview(null);
    setSelectedSlot(null);
    setBookingStep('details');
    setCurrentBookingId(null);
    setDepositAmount(0);
    setPaymentPolling(false);

    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30';
      case 'ongoing':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400 cursor-not-allowed';
      case 'upcoming':
        return 'bg-red-500/20 border-red-500 text-red-400 cursor-not-allowed';
      case 'completed':
        return 'bg-muted/50 border-muted text-muted-foreground cursor-not-allowed';
      default:
        return 'bg-muted/20 border-muted text-muted-foreground cursor-not-allowed';
    }
  };

  const getSlotLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'ongoing':
        return 'In Progress';
      case 'upcoming':
        return 'Booked';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const calculatedDeposit = agreedPrice ? Math.ceil(parseFloat(agreedPrice) * 0.15) : 0;

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Book Your Session</h2>
        <p className="text-muted-foreground">Select a date and time slot, then pay a 15% deposit to confirm</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['Select Slot', 'Your Details', 'Pay Deposit', 'Confirmed'].map((step, i) => {
          const stepIndex = i;
          const currentIndex = bookingStep === 'details' ? (selectedSlot ? 1 : 0) :
            bookingStep === 'payment' ? 2 :
              bookingStep === 'waiting' ? 2 :
                bookingStep === 'confirmed' ? 3 : 1;
          const isActive = stepIndex <= currentIndex;
          return (
            <div key={step} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {stepIndex < currentIndex ? '✓' : stepIndex + 1}
              </div>
              <span className={cn(
                "text-sm hidden sm:inline",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>{step}</span>
              {i < 3 && <div className={cn("w-8 h-px", isActive ? "bg-primary" : "bg-muted")} />}
            </div>
          );
        })}
      </div>

      {/* Date & Slot Selection */}
      {bookingStep === 'details' && (
        <>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calendar Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Select Date
                </CardTitle>
                <CardDescription>Choose your preferred appointment date</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, startOfDay(new Date())) || isSunday(date)}
                  className="rounded-md border border-border/50"
                />
              </CardContent>
              <p className="text-xs text-muted-foreground mt-2 text-center pb-4">
                Mon-Fri: 10am - 6:30pm | Sat: 11am - 5:30pm | Closed Sundays
              </p>
            </Card>

            {/* Slots Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Available Slots
                </CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Showing availability for ${format(selectedDate, 'MMMM d, yyyy')}`
                    : 'Select a date to view available slots'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select a date first</p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No slots available for this date</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Booked</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.slot_id}
                          onClick={() => slot.status === 'available' && setSelectedSlot(slot)}
                          disabled={slot.status !== 'available'}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                            getSlotColor(slot.status),
                            selectedSlot?.slot_id === slot.slot_id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          )}
                        >
                          <div className="font-semibold">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {getSlotLabel(slot.status)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          {selectedDate && selectedSlot && (
            <Card className="mt-8 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Your Details
                </CardTitle>
                <CardDescription>
                  Booking for {format(selectedDate!, 'MMMM d, yyyy')} at {formatTime(selectedSlot.start_time)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="clientName" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        M-Pesa Phone Number *
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712345678 or +254712345678"
                        required
                      />
                      <p className="text-xs text-muted-foreground">This number will receive the M-Pesa payment prompt</p>
                    </div>
                  </div>

                  {/* Agreed Price Section */}
                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                    <div className="grid md:grid-cols-2 gap-6 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="agreedPrice" className="flex items-center gap-2 text-base font-semibold">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Agreed Price (KES) *
                        </Label>
                        <Input
                          id="agreedPrice"
                          type="number"
                          min="100"
                          step="1"
                          value={agreedPrice}
                          onChange={(e) => setAgreedPrice(e.target.value)}
                          placeholder="Enter the price agreed with the studio"
                          required
                          className="text-lg"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the total price you agreed on when you called the studio
                        </p>
                      </div>

                      {agreedPrice && parseFloat(agreedPrice) > 0 && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-sm text-muted-foreground">15% Deposit Required</p>
                          <p className="text-2xl font-bold text-primary">KES {calculatedDeposit.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Balance of KES {(parseFloat(agreedPrice) - calculatedDeposit).toLocaleString()} due at appointment
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inspirationImage" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Tattoo Inspiration Image (optional)
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="inspirationImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="max-w-sm"
                      />
                      {imagePreview && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setInspirationImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Max 5MB, JPEG/PNG</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Short Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific requests or details..."
                      rows={2}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">{notes.length}/200 characters</p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting || !agreedPrice || calculatedDeposit <= 0}
                    className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating booking...
                      </>
                    ) : (
                      <>
                        Proceed to Pay Deposit — KES {calculatedDeposit > 0 ? calculatedDeposit.toLocaleString() : '0'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Payment Step */}
      {bookingStep === 'payment' && (
        <Card className="mt-8 bg-card/50 backdrop-blur-sm border-border/50 max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Pay Deposit via M-Pesa</CardTitle>
            <CardDescription>
              A payment prompt will be sent to your phone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Booking date</span>
                <span className="font-medium">{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time slot</span>
                <span className="font-medium">{selectedSlot ? `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}` : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total price</span>
                <span className="font-medium">KES {parseFloat(agreedPrice).toLocaleString()}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="font-semibold">Deposit (15%)</span>
                <span className="text-xl font-bold text-primary">KES {depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">M-Pesa number</span>
                <span className="font-medium">{phoneNumber}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-500">Payment expires in 24 hours</p>
                <p className="text-muted-foreground mt-1">
                  If the deposit is not paid within 24 hours, your booking will be automatically cancelled.
                </p>
              </div>
            </div>

            <Button
              onClick={handlePayDeposit}
              size="lg"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending M-Pesa prompt...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2 h-5 w-5" />
                  Pay KES {depositAmount.toLocaleString()} via M-Pesa
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleResetBooking}
              className="w-full"
            >
              Cancel booking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Waiting for Payment */}
      {bookingStep === 'waiting' && (
        <Card className="mt-8 bg-card/50 backdrop-blur-sm border-border/50 max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
            </div>
            <CardTitle>Waiting for Payment</CardTitle>
            <CardDescription>
              Check your phone for the M-Pesa prompt and enter your PIN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-3xl font-bold text-primary">KES {depositAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">to {phoneNumber}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">1</div>
                <p>Check your phone for the Safaricom M-Pesa pop-up</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">2</div>
                <p>Enter your M-Pesa PIN to authorize the payment</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs shrink-0">3</div>
                <p>This page will update automatically once payment is confirmed</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRetryPayment}
                className="flex-1"
              >
                Retry Payment
              </Button>
              <Button
                variant="ghost"
                onClick={handleResetBooking}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Confirmed */}
      {bookingStep === 'confirmed' && (
        <Card className="mt-8 bg-card/50 backdrop-blur-sm border-border/50 max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-green-500">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your deposit has been received and your slot is now secured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{clientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedSlot ? `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}` : ''}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit paid</span>
                <span className="font-medium text-green-500">KES {depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance due</span>
                <span className="font-medium">KES {(parseFloat(agreedPrice) - depositAmount).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              You'll receive a confirmation message on WhatsApp shortly. Please arrive on time for your appointment.
            </p>

            <Button
              onClick={handleResetBooking}
              className="w-full"
            >
              Book Another Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Failed */}
      {bookingStep === 'failed' && (
        <Card className="mt-8 bg-card/50 backdrop-blur-sm border-border/50 max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Payment Failed</CardTitle>
            <CardDescription>
              The M-Pesa payment was not completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Your booking is still held for 24 hours. You can retry the payment or cancel the booking.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleRetryPayment}
                className="flex-1 bg-primary text-primary-foreground"
              >
                Retry Payment
              </Button>
              <Button
                variant="outline"
                onClick={handleResetBooking}
                className="flex-1"
              >
                Cancel Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
