import { lazy, Suspense } from 'react';
import { usePageSeo, SITE_URL } from '@/hooks/usePageSeo';
import { ContactHero } from '@/components/contact/ContactHero';
import { BookingSystem } from '@/components/booking/BookingSystem';
import { ContactDetails } from '@/components/contact/ContactDetails';
import { MapSection } from '@/components/contact/MapSection';
import { FAQ } from '@/components/contact/FAQ';
import { CTAFooter } from '@/components/contact/CTAFooter';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import PublicReviews from '@/components/reviews/PublicReviews';

const ReviewSubmission = lazy(() => import('@/components/contact/ReviewSubmission'));

const Scene3DBroad = lazy(() => import('@/components/home/Scene3DBroad'));

const Contact = () => {
  usePageSeo({
    title: 'Book & Contact | Eclipse Tattoo & Piercings Nairobi',
    description:
      'Book your tattoo or piercing at Eclipse in Nairobi. Find our studio location, hours, contact details and answers to common booking questions.',
    path: '/contact',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'TattooParlor',
        name: 'Eclipse Tattoo & Piercings',
        url: `${SITE_URL}/contact`,
        telephone: '+254705025961',
        email: 'jamingtonbuluma17@gmail.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'THE BAZAAR, Floor M4, Suite 6, Room 6',
          addressLocality: 'Nairobi',
          addressRegion: 'Nairobi',
          addressCountry: 'KE',
        },
        openingHoursSpecification: [
          { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '11:00', closes: '19:00' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Friday', 'Saturday'], opens: '11:00', closes: '21:00' },
        ],
        priceRange: 'KES',
        description: 'Premium tattoo and piercing studio offering custom artwork, expert piercings, and a luxury experience.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Do you accept walk-ins?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, subject to artist availability. Appointments are recommended for custom work to ensure dedicated time with your preferred artist and proper planning for your piece.' } },
          { '@type': 'Question', name: 'What should I bring to my appointment?', acceptedAnswer: { '@type': 'Answer', text: 'Please bring a valid ID, reference images if you have them, and any notes on placement and sizing. We also recommend wearing comfortable clothing that provides easy access to the area being tattooed or pierced.' } },
          { '@type': 'Question', name: 'How do deposits work?', acceptedAnswer: { '@type': 'Answer', text: 'A 30% non-refundable deposit secures your booking and goes toward your final session cost, paid via M-Pesa Pochi la Biashara.' } },
          { '@type': 'Question', name: 'What is your cancellation policy?', acceptedAnswer: { '@type': 'Answer', text: 'We require at least 48 hours notice for cancellations or rescheduling. Late cancellations or no-shows will forfeit the deposit.' } },
          { '@type': 'Question', name: 'Do you offer touch-ups?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, one complimentary touch-up is included within 6 months of your original session. Additional touch-ups are charged at our standard rates.' } }
        ],
      },
    ],
  });

  return (
    <div className="min-h-screen relative">
      <Suspense fallback={null}>
        <Scene3DBroad />
      </Suspense>
      <div className="relative z-10">
        <ErrorBoundary fallback={<div className="h-96 flex items-center justify-center text-destructive">Failed to load Hero Section</div>}>
          <ContactHero />
        </ErrorBoundary>

        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4">
            {/* How It Works intro */}
            <div className="mb-12 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">How Booking Works</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Start by reaching out to us — via call or the chat — to discuss your tattoo idea and get a price quote from our artists. Once you've agreed on the design and cost, come back here to pick a date and time slot. Confirm your booking by paying a 30% deposit via M-Pesa Pochi la Biashara (0769138198), and you're all set.
              </p>
            </div>

            {/* Booking System Section */}
            <div id="contact-form" className="mb-16 scroll-mt-24">
              <ErrorBoundary fallback={
                <div className="p-8 border border-destructive rounded-lg text-center bg-destructive/10">
                  <h3 className="text-lg font-semibold text-destructive mb-2">Unavailable</h3>
                  <p className="text-muted-foreground mb-4">The booking system could not be loaded.</p>
                </div>
              }>
                <BookingSystem />
              </ErrorBoundary>
            </div>

            <div className="my-12 h-px bg-border/50" />

            {/* Review / Complaint Section */}
            <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
              <div>
                <Suspense fallback={null}>
                  <ReviewSubmission />
                </Suspense>
              </div>
              <div>
                <PublicReviews />
              </div>
            </div>

            <div className="my-12 h-px bg-border/50" />

            {/* Contact Details Section */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-bold">Get In Touch</h2>
                <p className="text-muted-foreground text-lg">
                  Have questions? We're here to help. Reach out to us directly or visit our studio.
                </p>
                <ErrorBoundary fallback={<div>Failed to load contact details</div>}>
                  <ContactDetails />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </section>

        <ErrorBoundary fallback={null}>
          <MapSection />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <FAQ />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <CTAFooter />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Contact;
