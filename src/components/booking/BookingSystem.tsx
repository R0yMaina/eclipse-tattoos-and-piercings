import { useState, useEffect, useCallback, useRef } from 'react';
import { format, isBefore, startOfDay, isSunday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Clock, CheckCircle, Calendar as CalendarIcon, User, Phone, DollarSign, Smartphone, AlertCircle, Sparkles, Copy, FileText } from 'lucide-react';
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

type BookingStep = 'details' | 'payment' | 'submitted' | 'confirmed';

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
  // Manual payment fields
  const [transactionCode, setTransactionCode] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const { toast } = useToast();

  const heroRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const heading = heroRef.current.querySelector('.booking-hero-title');
    const subtitle = heroRef.current.querySelector('.booking-hero-sub');
    if (!heading || !subtitle) return;
    const split = new SplitType(heading as HTMLElement, { types: 'chars' });
    gsap.set(split.chars, { opacity: 0, y: 40, rotateX: -90 });
    gsap.set(subtitle, { opacity: 0, y: 20 });
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(split.chars, { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.03 });
    tl.to(subtitle, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
    return () => { split.revert(); };
  }, []);

  useEffect(() => {
    if (!stepRef.current) return;
    gsap.fromTo(
      stepRef.current.querySelectorAll('.step-dot'),
      { scale: 0.7, opacity: 0.5 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(2)' }
    );
  }, [bookingStep, selectedSlot]);

  useEffect(() => {
    const target = formRef.current || paymentRef.current;
    if (!target) return;
    gsap.fromTo(target, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  }, [bookingStep, selectedSlot]);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
    else { setSlots([]); setSelectedSlot(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

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
        imageUrl = fileName;
      }
      const newBookingId = crypto.randomUUID();
      const deposit = Math.ceil(price * 0.15);
      const { error: bookingError } = await supabase.from('bookings').insert({
        id: newBookingId, slot_id: selectedSlot.slot_id, client_name: clientName.trim(), phone_number: phoneNumber.trim(),
        inspiration_image_url: imageUrl, notes: notes.trim() || null, status: 'pending_payment' as any, agreed_price: price,
        deposit_amount: deposit, payment_status: 'pending', deposit_paid: false,
        payment_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      if (bookingError) {
        if (bookingError.message.includes('duplicate') || bookingError.message.includes('already exists')) throw new Error('This slot has already been booked. Please select another time.');
        throw bookingError;
      }
      setCurrentBookingId(newBookingId);
      setDepositAmount(deposit);
      setPaymentPhone(phoneNumber.trim());
      setBookingStep('payment');
      setTimeout(() => {
        paymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create booking. Please try again.';
      toast({ title: 'Booking failed', description: message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleSubmitTransaction = async () => {
    if (!currentBookingId || !transactionCode.trim()) {
      toast({ title: 'Missing transaction code', description: 'Please enter your M-Pesa transaction code.', variant: 'destructive' }); return;
    }
    if (!paymentPhone.trim()) {
      toast({ title: 'Missing phone number', description: 'Please enter the phone number used for payment.', variant: 'destructive' }); return;
    }
    const code = transactionCode.trim().toUpperCase();
    if (code.length < 6 || code.length > 15) {
      toast({ title: 'Invalid code', description: 'M-Pesa transaction codes are typically 8-10 characters.', variant: 'destructive' }); return;
    }

    setSubmittingPayment(true);
    try {
      const { error } = await supabase.from('bookings').update({
        transaction_code: code,
        payment_phone: paymentPhone.trim(),
        payment_status: 'pending',
        status: 'pending_verification' as any,
      }).eq('id', currentBookingId);
      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          throw new Error('This transaction code has already been used. Please check and enter the correct code.');
        }
        throw error;
      }
      setBookingStep('submitted');
      toast({ title: 'Transaction submitted! ✅', description: 'Your payment details are under review. You will be notified once confirmed.' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit transaction. Please try again.';
      toast({ title: 'Submission failed', description: message, variant: 'destructive' });
    } finally { setSubmittingPayment(false); }
  };

  const handleResetBooking = () => {
    setClientName(''); setPhoneNumber(''); setNotes(''); setAgreedPrice('');
    setInspirationImage(null); setImagePreview(null); setSelectedSlot(null);
    setBookingStep('details'); setCurrentBookingId(null); setDepositAmount(0);
    setTransactionCode(''); setPaymentPhone('');
    if (selectedDate) fetchSlots(selectedDate);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `"${text}" copied to clipboard.` });
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
      case 'upcoming': case 'pending_payment': case 'pending_verification': case 'confirmed':
        return 'border-red-500/30 bg-red-500/10 text-red-400 cursor-not-allowed';
      case 'completed': return 'border-border/30 bg-muted/20 text-muted-foreground cursor-not-allowed';
      default: return 'border-border/20 bg-muted/10 text-muted-foreground cursor-not-allowed';
    }
  };

  const getSlotLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available'; case 'ongoing': return 'In Progress';
      case 'upcoming': case 'pending_payment': case 'pending_verification': case 'confirmed': return 'Booked';
      case 'completed': return 'Completed'; default: return status;
    }
  };

  const calculatedDeposit = agreedPrice ? Math.ceil(parseFloat(agreedPrice) * 0.15) : 0;

  const stepLabels = ['Select Slot', 'Your Details', 'Send Payment', 'Confirmed'];
  const currentIndex = bookingStep === 'details' ? (selectedSlot ? 1 : 0) :
    bookingStep === 'payment' ? 2 : bookingStep === 'submitted' ? 3 : 3;

  const MPESA_NUMBER = '0769138198';

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Hero */}
      <div ref={heroRef} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-wider uppercase mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Online Booking
        </div>
        <h2 className="booking-hero-title text-4xl md:text-5xl font-heading font-bold text-foreground mb-3" style={{ perspective: '600px' }}>
          Book Your Session
        </h2>
        <p className="booking-hero-sub text-muted-foreground max-w-md mx-auto">
          Select a date and time slot, then send a 15% deposit via M-Pesa to confirm your appointment
        </p>
      </div>

      {/* Step Indicator */}
      <div ref={stepRef} className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
        {stepLabels.map((step, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step} className="flex items-center gap-1 sm:gap-2">
              <div className={cn(
                "step-dot w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                isCurrent ? "bg-primary text-primary-foreground gold-glow scale-110" : isActive ? "bg-primary/80 text-primary-foreground" : "glass-panel text-muted-foreground"
              )}>
                {i < currentIndex ? '✓' : i + 1}
              </div>
              <span className={cn(
                "text-xs sm:text-sm hidden sm:inline font-medium tracking-wide",
                isCurrent ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
              )}>{step}</span>
              {i < 3 && (
                <div className={cn("w-6 sm:w-10 h-px transition-colors duration-300", isActive ? "bg-primary/60" : "bg-border/40")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Date & Slot Selection */}
      {bookingStep === 'details' && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
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
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, startOfDay(new Date())) || isSunday(date)}
                  className="rounded-xl border border-border/30" />
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Mon-Fri: 10am – 6:30pm · Sat: 11am – 5:30pm · Closed Sundays
              </p>
            </GlassCard>

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
                      <button key={slot.slot_id}
                        onClick={() => {
                          if (slot.status === 'available') {
                            setSelectedSlot(slot);
                            setTimeout(() => { formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
                          }
                        }}
                        disabled={slot.status !== 'available'}
                        className={cn(
                          "p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 text-sm font-medium",
                          getSlotColor(slot.status),
                          selectedSlot?.slot_id === slot.slot_id && "ring-2 ring-primary ring-offset-2 ring-offset-background gold-glow"
                        )}
                      >
                        <div className="font-semibold text-xs">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</div>
                        <div className="text-[10px] opacity-70 mt-0.5">{getSlotLabel(slot.status)}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </GlassCard>
          </div>

          {/* Booking Form */}
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
                        <Phone className="h-3.5 w-3.5" /> Phone Number *
                      </Label>
                      <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712345678 or +254712345678" required
                        className="bg-input/50 border-border/40 focus:border-primary/60 focus:ring-primary/20" />
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
                      <>Book Now — Deposit KES {calculatedDeposit > 0 ? calculatedDeposit.toLocaleString() : '0'}</>
                    )}
                  </Button>
                </form>
              </GlassCard>
            </div>
          )}
        </>
      )}

      {/* Payment Instructions & Transaction Code Form */}
      {bookingStep === 'payment' && (
        <div ref={paymentRef}>
          <GlassCard elevated className="max-w-lg mx-auto p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 gold-glow">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-1">Send Deposit via M-Pesa</h3>
              <p className="text-sm text-muted-foreground">Follow the steps below, then enter your transaction code</p>
            </div>

            {/* Booking Summary */}
            <div className="p-5 rounded-xl glass-panel space-y-3 text-left mb-6">
              {[
                ['Booking date', selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''],
                ['Time slot', selectedSlot ? `${formatTime(selectedSlot.start_time)} – ${formatTime(selectedSlot.end_time)}` : ''],
                ['Total price', `KES ${parseFloat(agreedPrice).toLocaleString()}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
              <div className="h-px bg-border/30" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Deposit (15%)</span>
                <span className="text-2xl font-heading font-bold text-primary">KES {depositAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* M-Pesa Instructions */}
            <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20 mb-6">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                M-Pesa Payment Instructions
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs shrink-0 font-semibold">1</div>
                  <p className="text-muted-foreground">Go to M-Pesa on your phone and select <span className="text-foreground font-medium">Send Money</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs shrink-0 font-semibold">2</div>
                  <div className="text-muted-foreground">
                    Send to this number:
                    <button onClick={() => copyToClipboard(MPESA_NUMBER)}
                      className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-bold text-base hover:bg-primary/20 transition-colors">
                      {MPESA_NUMBER}
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs shrink-0 font-semibold">3</div>
                  <p className="text-muted-foreground">
                    Enter amount: <span className="text-foreground font-bold">KES {depositAmount.toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs shrink-0 font-semibold">4</div>
                  <p className="text-muted-foreground">Complete the payment and note your <span className="text-foreground font-medium">M-Pesa transaction code</span> from the confirmation SMS</p>
                </div>
              </div>
            </div>

            {/* Transaction Code Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentPhone" className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> Phone Number Used to Pay *
                </Label>
                <Input id="paymentPhone" type="tel" value={paymentPhone} onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="0712345678" required
                  className="bg-input/50 border-border/40 focus:border-primary/60 focus:ring-primary/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionCode" className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" /> M-Pesa Transaction Code *
                </Label>
                <Input id="transactionCode" value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SLK4H7R2T0"
                  required maxLength={15}
                  className="bg-input/50 border-border/40 focus:border-primary/60 focus:ring-primary/20 font-mono text-lg tracking-wider uppercase" />
                <p className="text-[10px] text-muted-foreground">Find this in the M-Pesa confirmation SMS you received</p>
              </div>

              <Button onClick={handleSubmitTransaction} size="lg" disabled={submittingPayment || !transactionCode.trim() || !paymentPhone.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                {submittingPayment ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : <>Submit Transaction Code</>}
              </Button>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex gap-3 text-left">
              <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-yellow-500">Booking expires in 24 hours</p>
                <p className="text-muted-foreground mt-0.5">If payment is not verified within 24 hours, your booking will be cancelled.</p>
              </div>
            </div>

            <Button variant="ghost" onClick={handleResetBooking} className="w-full mt-2 text-muted-foreground hover:text-foreground">Cancel booking</Button>
          </GlassCard>
        </div>
      )}

      {/* Submitted - Under Verification */}
      {bookingStep === 'submitted' && (
        <div ref={paymentRef}>
          <GlassCard elevated className="max-w-lg mx-auto p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-5">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-1">Under Verification</h3>
            <p className="text-sm text-muted-foreground mb-6">Your payment details have been submitted and are being reviewed</p>

            <div className="p-5 rounded-xl glass-panel space-y-3 text-left mb-6">
              {[
                ['Name', clientName],
                ['Date', selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''],
                ['Time', selectedSlot ? `${formatTime(selectedSlot.start_time)} – ${formatTime(selectedSlot.end_time)}` : ''],
                ['Transaction Code', transactionCode],
                ['Deposit Amount', `KES ${depositAmount.toLocaleString()}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
              <p className="text-sm text-muted-foreground">
                You'll receive a confirmation via WhatsApp once the admin verifies your payment. This usually takes a few minutes during working hours.
              </p>
            </div>

            <Button onClick={handleResetBooking} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gold-glow font-semibold">
              Book Another Session
            </Button>
          </GlassCard>
        </div>
      )}

      {/* Confirmed */}
      {bookingStep === 'confirmed' && (
        <div ref={paymentRef}>
          <GlassCard elevated className="max-w-lg mx-auto p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-green-400 mb-1">Booking Confirmed!</h3>
            <p className="text-sm text-muted-foreground mb-6">Your deposit has been verified and your slot is secured</p>

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

            <p className="text-xs text-muted-foreground mb-6">Please arrive on time for your appointment.</p>

            <Button onClick={handleResetBooking} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gold-glow font-semibold">
              Book Another Session
            </Button>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
