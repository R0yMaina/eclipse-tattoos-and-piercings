import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';

interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  serviceType: string;
  preferredArtist?: string;
  placement?: string;
  size?: string;
  budget?: string;
  preferredContact: string;
  message: string;
  howDidYouHear?: string;
  consent: boolean;
}

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ContactFormData>();

  const consent = watch('consent');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Check file count
    if (files.length + selectedFiles.length > 4) {
      toast.error('Maximum 4 files allowed');
      return;
    }

    // Check total size (24MB)
    const totalSize = [...files, ...selectedFiles].reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 24 * 1024 * 1024) {
      toast.error('Total file size must be less than 24MB');
      return;
    }

    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ContactFormData) => {
    if (!data.consent) {
      toast.error('Please consent to be contacted');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      // For now, just simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Thank you—your request has been received. We\'ll reply shortly.');
      
      // Reset form
      setFiles([]);
    } catch (error) {
      toast.error('We couldn\'t send your request. Please try again or call the studio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact-form" className="glass-panel glass-highlight rounded-[28px] p-8 md:p-12">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-3">Let's Connect</h2>
        <p className="text-muted-foreground">
          Tell us about your idea. We'll get back to you promptly with next steps.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            {...register('fullName', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
            placeholder="Your name"
            className="bg-input border-border focus:border-primary transition-smooth"
          />
          {errors.fullName && (
            <p className="text-destructive text-sm">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email & Phone */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              placeholder="your@email.com"
              className="bg-input border-border focus:border-primary transition-smooth"
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+1 (555) 555-0142"
              className="bg-input border-border focus:border-primary transition-smooth"
            />
          </div>
        </div>

        {/* Service Type */}
        <div className="space-y-2">
          <Label htmlFor="serviceType">Service *</Label>
          <Select onValueChange={(value) => setValue('serviceType', value)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tattoo">Tattoo</SelectItem>
              <SelectItem value="Piercing">Piercing</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
            </SelectContent>
          </Select>
          {errors.serviceType && (
            <p className="text-destructive text-sm">{errors.serviceType.message}</p>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="placement">Placement</Label>
            <Input
              id="placement"
              {...register('placement')}
              placeholder="e.g., forearm"
              className="bg-input border-border focus:border-primary transition-smooth"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Approximate Size</Label>
            <Input
              id="size"
              {...register('size')}
              placeholder="e.g., 4x6 inches"
              className="bg-input border-border focus:border-primary transition-smooth"
            />
          </div>
        </div>

        {/* Preferred Contact */}
        <div className="space-y-3">
          <Label>Preferred Contact Method *</Label>
          <RadioGroup 
            defaultValue="Email" 
            onValueChange={(value) => setValue('preferredContact', value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Email" id="email-contact" />
              <Label htmlFor="email-contact" className="font-normal cursor-pointer">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Phone" id="phone-contact" />
              <Label htmlFor="phone-contact" className="font-normal cursor-pointer">Phone</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Either" id="either-contact" />
              <Label htmlFor="either-contact" className="font-normal cursor-pointer">Either</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Tell us about your idea *</Label>
          <Textarea
            id="message"
            {...register('message', { 
              required: 'Message is required',
              minLength: { value: 20, message: 'Please provide more details (min 20 characters)' },
              maxLength: { value: 1200, message: 'Message too long (max 1200 characters)' }
            })}
            placeholder="Describe your vision, style preferences, and any questions..."
            rows={5}
            className="bg-input border-border focus:border-primary transition-smooth resize-none"
          />
          {errors.message && (
            <p className="text-destructive text-sm">{errors.message.message}</p>
          )}
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <Label>Reference Images (optional, max 4 files, 24MB total)</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="border-border hover:border-primary transition-smooth"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.heic"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How did you hear */}
        <div className="space-y-2">
          <Label htmlFor="howDidYouHear">How did you hear about us?</Label>
          <Select onValueChange={(value) => setValue('howDidYouHear', value)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Friend">Friend</SelectItem>
              <SelectItem value="Walk-in">Walk-in</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Consent */}
        <div className="flex items-start space-x-3 pt-4">
          <Checkbox 
            id="consent" 
            onCheckedChange={(checked) => setValue('consent', checked as boolean)}
            className="mt-1"
          />
          <Label htmlFor="consent" className="text-sm font-normal cursor-pointer leading-relaxed">
            I consent to be contacted by Eclipse Tattoo & Piercings regarding my inquiry. *
          </Label>
        </div>
        {errors.consent && (
          <p className="text-destructive text-sm">{errors.consent.message}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || !consent}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth py-6 text-base font-semibold rounded-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Inquiry'
          )}
        </Button>
      </form>
    </div>
  );
};
