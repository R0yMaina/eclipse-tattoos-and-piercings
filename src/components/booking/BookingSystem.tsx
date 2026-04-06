import { useState, useEffect, useCallback, useRef } from 'react';
import { format, isBefore, startOfDay, isSunday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Clock, CheckCircle, Calendar as CalendarIcon, User, Phone, DollarSign, Smartphone, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import SplitType from 'split-type';

interface SlotAvailability {
  slot_id: string;
  slot_number: number;
  start_time: string;
  end_time: string;
  status: string;
  client_name: string | null;
}

type BookingStep = 'details' | 'payment' | 'waiting' | 'confirmed' | 'failed' | 'manual_details';

/* ─── Reusable glass card ─── */
const GlassCard = ({ children, className, elevated = false }: { children: React.ReactNode; className?: string; elevated?: boolean }) => (
  <div className={cn(
    "rounded-2xl backdrop-blur-xl",
    elevated ? "glass-panel-elevated" : "glass-panel",
    "glass-highlight",
    className
  )}>
    {children}
  </div>
);

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
  const [transactionCode, setTransactionCode] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const [hasRestored, setHasRestored] = useState(false);

  // Restore booking session from localStorage
  useEffect(() => {
    if (hasRestored) return;
    const savedBookingId = localStorage.getItem('eclipse_current_booking_id');
    const savedDeposit = localStorage.getItem('eclipse_current_deposit');
    const savedPrice = localStorage.getItem('eclipse_current_price');

    if (savedBookingId) {
      setCurrentBookingId(savedBookingId);
      if (savedDeposit) setDepositAmount(parseInt(savedDeposit));
      if (savedPrice) setAgreedPrice(savedPrice);
      
      // Fetch latest status to determine step
      const checkStatus = async () => {
        const { data } = await supabase
          .from('bookings')
          .select('status, payment_status, transaction_code')
          .eq('id', savedBookingId)
          .maybeSingle();
        
        if (data) {
          if (data.status === 'confirmed' || data.status === 'upcoming') {
            setBookingStep('confirmed');
          } else if (data.status === 'pending_verification' || data.transaction_code) {
            setBookingStep('waiting');
            setTransactionCode(data.transaction_code || '');
            setPaymentPolling(true);
          } else {
            setBookingStep('payment');
          }
        } else {
          setBookingStep('waiting'); // Fallback
          setPaymentPolling(true);
        }
      };
      
      checkStatus();
    }
    setHasRestored(true);
  }, [hasRestored]);

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  // GSAP hero text animation
  useEffect(() => {
    if (!heroRef.current) return;
    const heading = heroRef.current.querySelector('.booking-hero-title');
    const subtitle = heroRef.current.querySelector('.booking-hero-sub');
    if (!heading || !subtitle) return;

    const split = new SplitType(heading as HTMLElement, { types: 'chars' });
    gsap.set(split.chars, { opacity: 0, y: 40, rotateX: -90 });
    gsap.set(subtitle, { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(split.chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      stagger: 0.03,
    });
    tl.to(subtitle, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    return () => { split.revert(); };
  }, []);

  // Animate step indicator on step change
  useEffect(() => {
    if (!stepRef.current) return;
    gsap.fromTo(
      stepRef.current.querySelectorAll('.step-dot'),
      { scale: 0.7, opacity: 0.5 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(2)' }
    );
  }, [bookingStep, selectedSlot]);

  // Animate form/payment cards on mount
  useEffect(() => {
    const target = formRef.current || paymentRef.current;
    if (!target) return;
    gsap.fromTo(target, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  }, [bookingStep, selectedSlot]);

  // ── Business logic (unchanged) ──
  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
    else { setSlots([]); setSelectedSlot(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    if (!paymentPolling || !currentBookingId) return;
    const interval = setInterval(async () => {
      try {
        const { data: rows, error } = await supabase
          .rpc('check_booking_status', { booking_id: currentBookingId });
        const data = rows?.[0] ?? null;

        if (error) {
          console.error('Polling error:', error);
          return;
        }

        if (!data) return;

        // Either confirmed/paid OR the status changed to confirmed/upcoming
        if (
          data.payment_status === 'confirmed' ||
          data.payment_status === 'paid' ||
          data.status === 'confirmed' ||
          data.status === 'upcoming'
        ) {
          setPaymentPolling(false);
          setBookingStep('confirmed');
          toast({
            title: 'Payment verified! ✅',
            description: `Deposit of KES ${depositAmount} confirmed.`,
          });
          // Clear persistence on success
          localStorage.removeItem('eclipse_current_booking_id');
        } else if (data.payment_status === 'rejected' || data.payment_status === 'failed' || data.status === 'cancelled') {
          setPaymentPolling(false);
          setBookingStep('failed');
          toast({
            title: 'Verification failed',
            description: 'The M-Pesa payment details could not be verified by the admin.',
            variant: 'destructive'
          });
        }
      } catch (err) {
        console.error('Payment polling error:', err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [paymentPolling, currentBookingId, depositAmount, toast]);

  const fetchSlots = useCallback(async (date: Date) => {
    setLoading(true);
    setSelectedSlot(null);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      await supabase.functions.invoke('generate-slots', { body: { date: formattedDate } });
      const { data, error } = await supabase.rpc('get_slot_availability', { target_date: formattedDate });
      if (error) throw error;
      setSlots((data as SlotAvailability[]) || []);
    } catch (error: unknown) {
      console.error('Error fetching slots:', error);
      toast({ title: 'Error', description: 'Failed to load available slots. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { toast({ title: 'Invalid file type', description: 'Please upload an image file (JPEG, PNG, etc.)', variant: 'destructive' }); return; }
      if (file.size > 5 * 1024 * 1024) { toast({ title: 'File too large', description: 'Please upload an image smaller than 5MB', variant: 'destructive' }); return; }
      setInspirationImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !clientName.trim() || !phoneNumber.trim() || !agreedPrice) {
      toast({ title: 'Missing information', description: 'Please fill in all required fields including the agreed price.', variant: 'destructive' }); return;
    }
    const price = parseFloat(agreedPrice);
    if (isNaN(price) || price <= 0) { toast({ title: 'Invalid price', description: 'Please enter a valid price amount.', variant: 'destructive' }); return; }
    const phoneRegex = /^[\d\s\-+()]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) { toast({ title: 'Invalid phone number', description: 'Please enter a valid phone number.', variant: 'destructive' }); return; }

    setSubmitting(true);
    try {
      let imageUrl = null;
      if (inspirationImage) {
        const fileExt = inspirationImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspiration-images').upload(fileName, inspirationImage);
        if (uploadError) throw uploadError;
        // Store the file path only; admins access via signed URLs
        imageUrl = fileName;
      }
      const newBookingId = crypto.randomUUID();
      const deposit = Math.ceil(price * 0.15);
      const { error: bookingError } = await supabase.from('bookings').insert({
        id: newBookingId, slot_id: selectedSlot.slot_id, client_name: clientName.trim(), phone_number: phoneNumber.trim(),
        inspiration_image_url: imageUrl, notes: notes.trim() || null, status: 'pending_payment', agreed_price: price,
        deposit_amount: deposit, payment_status: 'pending_payment', deposit_paid: false,
        payment_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      if (bookingError) {
        if (bookingError.message.includes('duplicate') || bookingError.message.includes('already exists')) throw new Error('This slot has already been booked. Please select another time.');
        throw bookingError;
      }
      setCurrentBookingId(newBookingId);
      setDepositAmount(deposit);
      // Persist booking session details
      localStorage.setItem('eclipse_current_booking_id', newBookingId);
      localStorage.setItem('eclipse_current_deposit', deposit.toString());
      localStorage.setItem('eclipse_current_price', price.toString());
      
      setBookingStep('payment');
      setTimeout(() => {
        paymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create booking. Please try again.';
      toast({ title: 'Booking failed', description: message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleManualPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBookingId || !transactionCode.trim() || !paymentPhone.trim()) {
      toast({ title: 'Missing details', description: 'Please enter the M-Pesa transaction code and phone number used.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      let screenshotUrl = null;
      if (paymentScreenshot) {
        try {
          const fileExt = paymentScreenshot.name.split('.').pop();
          const fileName = `payment-${currentBookingId}-${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('payment-screenshots').upload(fileName, paymentScreenshot);
          if (uploadError) throw uploadError;
          screenshotUrl = fileName;
        } catch (uploadError) {
          console.error('Screenshot upload error:', uploadError);
          // Don't fail the whole submission if screenshot fails
        }
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          transaction_code: transactionCode.trim().toUpperCase(),
          payment_phone: paymentPhone.trim(),
          payment_screenshot_url: screenshotUrl,
          payment_status: 'pending_verification',
          status: 'pending_verification' // CRITICAL: This allows admin to see it
        })
        .eq('id', currentBookingId);

      if (updateError) {
        if (updateError.message.includes('unique') || updateError.message.includes('duplicate')) {
          throw new Error('This transaction code has already been submitted.');
        }
        throw updateError;
      }

      toast({ title: 'Details submitted! 🚀', description: 'Our team is verifying your payment. Keep this page open.' });
      setBookingStep('waiting');
      setPaymentPolling(true);
    } catch (error: any) {
      console.error('Submission error:', error);
      const message = error.message || error.error_description || 'Failed to submit payment details. Please try again.';
      toast({ title: 'Submission failed', description: message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { toast({ title: 'Invalid file type', description: 'Please upload an image file.', variant: 'destructive' }); return; }
      setPaymentScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRetryPayment = () => setBookingStep('payment');
  const handleResetBooking = () => {
    setClientName(''); setPhoneNumber(''); setNotes(''); setAgreedPrice('');
    setInspirationImage(null); setImagePreview(null); setSelectedSlot(null);
    setTransactionCode(''); setPaymentPhone(''); setPaymentScreenshot(null); setScreenshotPreview(null);
    setBookingStep('details'); setCurrentBookingId(null); setDepositAmount(0); setPaymentPolling(false);
    
    // Clear all persistence
    localStorage.removeItem('eclipse_current_booking_id');
    localStorage.removeItem('eclipse_current_deposit');
    localStorage.removeItem('eclipse_current_price');
    
    if (selectedDate) fetchSlots(selectedDate);
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
      case 'available': return 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:border-green-400/60 hover:shadow-[0_0_20px_hsl(142_52%_64%/0.15)]';
      case 'ongoing': return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400 cursor-not-allowed';
      case 'upcoming': return 'border-red-500/30 bg-red-500/10 text-red-400 cursor-not-allowed';
      case 'completed': return 'border-border/30 bg-muted/20 text-muted-foreground cursor-not-allowed';
      default: return 'border-border/20 bg-muted/10 text-muted-foreground cursor-not-allowed';
    }
  };

  const getSlotLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available'; case 'ongoing': return 'In Progress';
      case 'upcoming': return 'Booked'; case 'completed': return 'Completed'; default: return status;
    }
  };

  const calculatedDeposit = agreedPrice ? Math.ceil(parseFloat(agreedPrice) * 0.15) : 0;

  const stepLabels = ['Select Slot', 'Your Details', 'Payment', 'Confirmed'];
  const currentIndex = bookingStep === 'details' ? (selectedSlot ? 1 : 0) :
    bookingStep === 'payment' ? 2 : bookingStep === 'waiting' ? 2 : bookingStep === 'confirmed' ? 3 : 1;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ── Hero ── */}
      <div ref={heroRef} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-wider uppercase mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Online Booking
        </div>
        <h2
          className="booking-hero-title text-4xl md:text-5xl font-heading font-bold text-foreground mb-3"
          style={{ perspective: '600px' }}
        >
          Book Your Session
        </h2>
        <p className="booking-hero-sub text-muted-foreground max-w-md mx-auto">
          Select a date and time slot, then pay a 15% deposit to confirm your appointment
        </p>
      </div>

      {/* ── Step Indicator ── */}
      <div ref={stepRef} className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
        {stepLabels.map((step, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step} className="flex items-center gap-1 sm:gap-2">
              <div className={cn(
                "step-dot w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                isCurrent
                  ? "bg-primary text-primary-foreground gold-glow scale-110"
                  : isActive
                    ? "bg-primary/80 text-primary-foreground"
                    : "glass-panel text-muted-foreground"
              )}>
                {i < currentIndex ? '✓' : i + 1}
              </div>
              <span className={cn(
                "text-xs sm:text-sm hidden sm:inline font-medium tracking-wide",
                isCurrent ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
              )}>{step}</span>
              {i < 3 && (
                <div className={cn(
                  "w-6 sm:w-10 h-px transition-colors duration-300",
                  isActive ? "bg-primary/60" : "bg-border/40"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Date & Slot Selection ── */}
      {bookingStep === 'details' && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <GlassCard elevated className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Select Date</h3>
                  <p className="text-xs text-muted-foreground">Choose your preferred day</p>
                </div>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, startOfDay(new Date())) || isSunday(date)}
                  className="rounded-xl border border-border/30"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Mon-Fri: 10am – 6:30pm · Sat: 11am – 5:30pm · Closed Sundays
              </p>
            </GlassCard>

            {/* Slots */}
            <GlassCard elevated className="p-6 h-fit">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Available Slots</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date to view'}
                  </p>
                </div>
              </div>

              {!selectedDate ? (
                <div className="text-center py-16 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Please select a date first</p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-xl">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-foreground">No slots available</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different date</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-4 mb-5 text-xs text-muted-foreground">
                    {[{ color: 'bg-green-500', label: 'Available' }, { color: 'bg-yellow-500', label: 'In Progress' }, { color: 'bg-red-500', label: 'Booked' }].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.slot_id}
                        onClick={() => {
                          if (slot.status === 'available') {
                            setSelectedSlot(slot);
                            setTimeout(() => {
                              formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }
                        }}
                        disabled={slot.status !== 'available'}
                        className={cn(
                          "p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 text-sm font-medium",
                          getSlotColor(slot.status),
                          selectedSlot?.slot_id === slot.slot_id && "ring-2 ring-primary ring-offset-2 ring-offset-background gold-glow"
                        )}
                      >
                        <div className="font-semibold text-xs">
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        </div>
                        <div className="text-[10px] opacity-70 mt-0.5">{getSlotLabel(slot.status)}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </GlassCard>
          </div>

          {/* ── Booking Form ── */}
          {selectedDate && selectedSlot && (
            <div ref={formRef}>
              <GlassCard elevated className="mt-8 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">Your Details</h3>
                    <p className="text-xs text-muted-foreground">
                      {format(selectedDate, 'MMMM d, yyyy')} at {formatTime(selectedSlot.start_time)}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="clientName" className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" /> Full Name *
                      </Label>
                      <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)}
                        placeholder="Enter your full name" required maxLength={100}
                        className="bg-input/50 border-border/40 focus:border-primary/60 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /> M-Pesa Phone Number *
                      </Label>
                      <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712345678 or +254712345678" required
                        className="bg-input/50 border-border/40 focus:border-primary/60 focus:ring-primary/20" />
                      <p className="text-[10px] text-muted-foreground">This number will receive the M-Pesa payment prompt</p>
                    </div>
                  </div>

                  {/* Agreed Price */}
                  <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm">
                    <div className="grid md:grid-cols-2 gap-5 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="agreedPrice" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <DollarSign className="h-4 w-4 text-primary" /> Agreed Price (KES) *
                        </Label>
                        <Input id="agreedPrice" type="number" min="100" step="1" value={agreedPrice}
                          onChange={(e) => setAgreedPrice(e.target.value)}
                          placeholder="Enter the price agreed with the studio" required
                          className="text-lg bg-input/50 border-border/40 focus:border-primary/60" />
                        <p className="text-[10px] text-muted-foreground">Enter the total price agreed when you called the studio</p>
                      </div>
                      {agreedPrice && parseFloat(agreedPrice) > 0 && (
                        <GlassCard className="p-4 text-center">
                          <p className="text-xs text-muted-foreground">15% Deposit Required</p>
                          <p className="text-3xl font-heading font-bold text-primary mt-1">KES {calculatedDeposit.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Balance KES {(parseFloat(agreedPrice) - calculatedDeposit).toLocaleString()} at appointment
                          </p>
                        </GlassCard>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inspirationImage" className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-3.5 w-3.5" /> Tattoo Inspiration Image (optional)
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input id="inspirationImage" type="file" accept="image/*" onChange={handleImageChange}
                        className="max-w-sm bg-input/50 border-border/40" />
                      {imagePreview && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/30">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setInspirationImage(null); setImagePreview(null); }}
                            className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Max 5MB, JPEG/PNG</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm text-muted-foreground">Short Notes (optional)</Label>
                    <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific requests or details…" rows={2} maxLength={200}
                      className="bg-input/50 border-border/40 focus:border-primary/60" />
                    <p className="text-[10px] text-muted-foreground">{notes.length}/200</p>
                  </div>

                  <Button type="submit" size="lg"
                    disabled={submitting || !agreedPrice || calculatedDeposit <= 0}
                    className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gold-glow font-semibold tracking-wide">
                    {submitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating booking…</>
                    ) : (
                      <>Proceed to Pay Deposit — KES {calculatedDeposit > 0 ? calculatedDeposit.toLocaleString() : '0'}</>
                    )}
                  </Button>
                </form>
              </GlassCard>
            </div>
          )}
        </>
      )}

      {/* ── Payment Step (Instructions & Form) ── */}
      {bookingStep === 'payment' && (
        <div ref={paymentRef}>
          <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Instructions */}
            <GlassCard elevated className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-4 text-left">Payment Instructions</h3>
              
              <div className="space-y-6 text-left">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">M-Pesa Pay Bill / Number</p>
                  <p className="text-2xl font-bold text-primary">0769138198</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Send money directly to this number</p>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Deposit Amount</p>
                  <p className="text-2xl font-bold text-foreground">KES {depositAmount.toLocaleString()}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Next steps:</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">1.</span>
                      Go to M-Pesa &gt; Send Money
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">2.</span>
                      Enter number <span className="font-mono font-bold text-foreground">0769138198</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">3.</span>
                      Enter amount <span className="font-bold text-foreground">KES {depositAmount.toLocaleString()}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">4.</span>
                      Enter your M-Pesa PIN and send
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-yellow-500">Important:</span> Enter your M-Pesa transaction code in the form to confirm your booking.
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Confirmation Form */}
            <GlassCard elevated className="p-8">
              <h3 className="font-heading text-xl font-bold text-foreground mb-6 text-left">Confirm Payment</h3>
              <form onSubmit={handleManualPaymentSubmit} className="space-y-5 text-left">
                <div className="space-y-2">
                  <Label htmlFor="paymentPhone" className="text-sm text-muted-foreground">M-Pesa Phone Number</Label>
                  <Input id="paymentPhone" value={paymentPhone} onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder="Number used to pay" required
                    className="bg-input/50 border-border/40 focus:border-primary/60" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionCode" className="text-sm text-muted-foreground text-left">M-Pesa Transaction Code</Label>
                  <Input id="transactionCode" value={transactionCode} onChange={(e) => setTransactionCode(e.target.value)}
                    placeholder="e.g. RBT1234567" required maxLength={12}
                    className="bg-input/50 border-border/40 focus:border-primary/60 uppercase font-mono" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot" className="text-sm text-muted-foreground">Screenshot (Optional)</Label>
                  <div className="flex items-center gap-3">
                    <Input id="screenshot" type="file" accept="image/*" onChange={handleScreenshotChange}
                      className="bg-input/50 border-border/40" />
                    {screenshotPreview && (
                      <div className="relative w-12 h-12 rounded border border-border/30 overflow-hidden">
                        <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" size="lg" disabled={submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gold-glow font-semibold">
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Submit for Verification"}
                </Button>
                <Button variant="ghost" type="button" onClick={() => setBookingStep('details')} className="w-full text-muted-foreground">Back to details</Button>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ── Waiting ── */}
      {bookingStep === 'waiting' && (
        <div ref={paymentRef}>
          <GlassCard elevated className="max-w-lg mx-auto p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-5">
              <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-1">Verifying Payment</h3>
            <p className="text-sm text-muted-foreground mb-6">Our admin is manually verifying your transaction</p>

            <div className="p-5 rounded-xl glass-panel text-center mb-6">
              <p className="text-xs text-muted-foreground">Transaction Code</p>
              <p className="text-2xl font-mono font-bold text-primary mt-1 uppercase">{transactionCode}</p>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-xl font-bold text-foreground">KES {depositAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-left mb-6">
              {['Verification usually takes 5-10 minutes', 'Keep this page open to receive confirmation', 'You will be notified once verified'].map((txt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-semibold bg-primary text-primary-foreground"
                  )}>{i + 1}</div>
                  <p className="text-muted-foreground">{txt}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="ghost" onClick={handleRetryPayment} className="text-muted-foreground">Correction? Edit Details</Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── Confirmed ── */}
      {bookingStep === 'confirmed' && (
        <div ref={paymentRef}>
          <GlassCard elevated className="max-w-lg mx-auto p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-green-400 mb-1">Booking Confirmed!</h3>
            <p className="text-sm text-muted-foreground mb-6">Your deposit has been received and your slot is secured</p>

            <div className="p-5 rounded-xl glass-panel space-y-3 text-left mb-6">
              {[
                ['Name', clientName],
                ['Date', selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''],
                ['Time', selectedSlot ? `${formatTime(selectedSlot.start_time)} – ${formatTime(selectedSlot.end_time)}` : ''],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
              <div className="h-px bg-border/30" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit paid</span>
                <span className="font-medium text-green-400">KES {depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance due</span>
                <span className="font-medium text-foreground">KES {(parseFloat(agreedPrice) - depositAmount).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-6">Your booking is confirmed. Please arrive on time.</p>

            <Button onClick={handleResetBooking} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gold-glow font-semibold">
              Book Another Session
            </Button>
          </GlassCard>
        </div>
      )}

      {/* ── Failed ── */}
      {bookingStep === 'failed' && (
        <div ref={paymentRef}>
          <GlassCard elevated className="max-w-lg mx-auto p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-destructive mb-1">Payment Failed</h3>
            <p className="text-sm text-muted-foreground mb-6">The M-Pesa payment was not completed</p>
            <p className="text-xs text-muted-foreground mb-6">Your booking is held for 24 hours. You can retry or cancel.</p>
            <div className="flex gap-2">
              <Button onClick={handleRetryPayment} className="flex-1 bg-primary text-primary-foreground gold-glow">Retry Payment</Button>
              <Button variant="outline" onClick={handleResetBooking} className="flex-1 border-border/40">Cancel Booking</Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
