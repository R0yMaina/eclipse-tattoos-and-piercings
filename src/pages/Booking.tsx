import { useState, useEffect } from 'react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Clock, CheckCircle, Calendar as CalendarIcon, User, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotAvailability {
  slot_id: string;
  slot_number: number;
  start_time: string;
  end_time: string;
  status: string;
  client_name: string | null;
}

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [inspirationImage, setInspirationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchSlots = async (date: Date) => {
    setLoading(true);
    setSelectedSlot(null);
    
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // First, ensure slots exist for this date
      await supabase.functions.invoke('generate-slots', {
        body: { date: formattedDate }
      });
      
      // Then fetch availability
      const { data, error } = await supabase.rpc('get_slot_availability', {
        target_date: formattedDate
      });
      
      if (error) throw error;
      setSlots(data || []);
    } catch (error: any) {
      console.error('Error fetching slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available slots. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (JPEG, PNG, etc.)',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (max 5MB)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot || !clientName.trim() || !phoneNumber.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields and select a time slot.',
        variant: 'destructive'
      });
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[\d\s\-+()]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      let imageUrl = null;
      
      // Upload inspiration image if provided
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
      
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          slot_id: selectedSlot.slot_id,
          client_name: clientName.trim(),
          phone_number: phoneNumber.trim(),
          inspiration_image_url: imageUrl,
          notes: notes.trim() || null,
          status: 'upcoming'
        })
        .select()
        .single();
      
      if (bookingError) {
        if (bookingError.message.includes('duplicate') || bookingError.message.includes('already exists')) {
          throw new Error('This slot has already been booked. Please select another time.');
        }
        throw bookingError;
      }
      
      // Send confirmation message
      await supabase.functions.invoke('send-whatsapp', {
        body: {
          type: 'confirmation',
          bookingId: booking.id,
          clientName: clientName.trim(),
          phoneNumber: phoneNumber.trim(),
          date: format(selectedDate!, 'MMMM d, yyyy'),
          time: formatTime(selectedSlot.start_time)
        }
      });
      
      toast({
        title: 'Booking confirmed!',
        description: 'You will receive a confirmation message shortly.',
      });
      
      // Reset form
      setClientName('');
      setPhoneNumber('');
      setNotes('');
      setInspirationImage(null);
      setImagePreview(null);
      setSelectedSlot(null);
      
      // Refresh slots
      if (selectedDate) {
        fetchSlots(selectedDate);
      }
      
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Book Your Session</h1>
          <p className="text-muted-foreground">Select a date and time slot for your appointment</p>
        </div>

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
                disabled={(date) => isBefore(date, startOfDay(new Date()))}
                className="rounded-md border border-border/50"
              />
            </CardContent>
          </Card>

          {/* Slots Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
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
                  {/* Legend */}
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
        {selectedSlot && (
          <Card className="mt-8 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Complete Your Booking
              </CardTitle>
              <CardDescription>
                Booking for {format(selectedDate!, 'MMMM d, yyyy')} at {formatTime(selectedSlot.start_time)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
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
                  disabled={submitting}
                  className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Booking;
