'use client';

import React, { useRef } from 'react';
import { Container, Stack, Box, Text, H2, StarRating, Button } from '@/design/ui';
import styled from 'styled-components';
import { colors } from '@/design/system/tokens/tokens';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: visible;
  padding: 0 60px;
  
  @media (max-width: 768px) {
    padding: 0;
    overflow: hidden;
  }
`;

const CarouselTrack = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 1rem 0 2rem .5rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: ${colors.primary[600]} ${colors.gray[200]};
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.gray[200]};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.primary[600]};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.primary[700]};
  }
  
  /* Mobile: Show partial next card + smooth scrolling */
  @media (max-width: 768px) {
    padding: 1rem 1rem 2rem 1rem;
    scrollbar-width: none;
    gap: 1rem;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    /* Snap scrolling for better mobile UX */
    scroll-snap-type: x mandatory;
    scroll-padding: 0 1rem;
  }
`;

const FadeOverlay = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 2rem;
    width: 80px;
    background: linear-gradient(to right, transparent, ${colors.background.secondary});
    pointer-events: none;
    z-index: 5;
  }
`;

const ScrollHintText = styled(Text)`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    text-align: center;
    margin-top: 0.5rem;
    opacity: 0.6;
    font-size: 0.875rem;
  }
`;

const MobileLeftArrow = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    pointer-events: none;
    
    svg {
      width: 32px;
      height: 32px;
      color: ${colors.primary[600]};
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
  }
`;

const MobileRightArrow = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    pointer-events: none;
    
    svg {
      width: 32px;
      height: 32px;
      color: ${colors.primary[600]};
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
  }
`;

const TestimonialCard = styled(Box)`
  background-color: ${colors.background.primary};
  min-width: 350px;
  max-width: 450px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    min-width: 280px;
    max-width: 320px;
    min-height: 280px;
    scroll-snap-align: start;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const QuoteText = styled(Text)<{ $isExpanded: boolean }>`
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: ${({ $isExpanded }) => ($isExpanded ? 'unset' : '4')};
  transition: all 0.3s ease;
`;

const ReviewContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const FullHeightStack = styled(Stack)`
  height: 100%;
`;

const ReadMoreButton = styled.button`
  background: none;
  border: none;
  color: ${colors.primary[600]};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-top: 0.5rem;
  text-align: left;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${colors.primary[700]};
    text-decoration: underline;
  }
  
  &:focus {
    outline: 2px solid ${colors.primary[600]};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const ReviewerInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 0.25rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid ${colors.gray[200]};
  align-items: center;
`;

const NavigationButton = styled(Button)`
  position: absolute;
  top: 50%;
  z-index: 10;
  background: ${colors.background.primary};
  border-radius: 50%;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%) !important;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease !important;
  
  &:hover {
    background: ${colors.primary[600]};
    color: ${colors.text.white};
    transform: translateY(-50%) !important;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(-50%) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LeftButton = styled(NavigationButton)`
  left: 0;
`;

const RightButton = styled(NavigationButton)`
  right: 0;
`;

interface TestimonialProps {
  rating: number;
  review: string;
  name: string;
  location: string;
  cmsId: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ rating, review, name, location, cmsId }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Determine if review is long enough to need "Read More"
  // Roughly 250 characters = ~4 lines at typical widths
  const needsReadMore = review.length > 250;

  return (
    <TestimonialCard variant="elevated" padding="lg" data-testid={`testimonial-${cmsId}`}>
      <FullHeightStack spacing="md" direction="vertical">
        <StarRating rating={rating} size="lg" aria-label={`${rating} star rating`} />
        
        <ReviewContentContainer>
          <QuoteText 
            $isExpanded={isExpanded}
            size="md" 
            color="secondary"
            cmsId={`${cmsId}-review`}
          >
            "{review}"
          </QuoteText>
          
          {needsReadMore && (
            <ReadMoreButton
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Read less' : 'Read more'}
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </ReadMoreButton>
          )}
        </ReviewContentContainer>
        
        <ReviewerInfo>
          <Text 
            weight="semibold" 
            size="md"
            cmsId={`${cmsId}-name`}
          >
            {name}
          </Text>
          <br />
          <Text 
            size="sm" 
            color="secondary"
            cmsId={`${cmsId}-location`}
          >
            {location}
          </Text>
        </ReviewerInfo>
      </FullHeightStack>
    </TestimonialCard>
  );
};

interface TestimonialsSectionProps {
  cmsData: any | null;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ cmsData }) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      id: 'testimonial-1',
      rating: 5,
      review: "Fairfield Airport Car Service exceeded my expectations. The pickup at JFK was on time, which reduced my travel stress. Gregg, our driver, was friendly and professional. The vehicle was clean and clearly well-maintained. I highly recommend their service to anyone looking for reliable airport transportation, and I'll definitely be booking with them again!",
      name: "Geordie",
      location: "Newtown, CT"
    },
    {
      id: 'testimonial-2',
      rating: 5,
      review: "Fairfield Airport Car Service is exceptional!! I have used them several times for airport runs! No matter how early my pickup has been Gregg has always been amazing! The car is beautiful and Gregg is always on time. I will definitely be using him again for all my airport trips! He is truly amazing!",
      name: "Kim S.",
      location: "Greenwich, CT"
    },
    {
      id: 'testimonial-3',
      rating: 5,
      review: "Fairfield Airport Car Service is top tier. I've used them twice now - once for LaGuardia and once for Newark. Even for a 5am pickup, Gregg, my driver, greeted me with a friendly smile. The car was immaculate and he was punctual both times. I will absolutely be using this company for all my airport runs.",
      name: "Tari D.",
      location: "Newtown, CT"
    },
    {
      id: 'testimonial-4',
      rating: 5,
      review: "Would highly recommend Greggs service. Prompt and communicative. Very comfortable ride. Great conversation, but also felt comfortable shutting it down and resting for the ride to the airport. Perfect mix of professional and friendly. Will be using Gregg for my rides going forward.",
      name: "Ian S.",
      location: "Westport, CT"
    },
    {
      id: 'testimonial-5',
      rating: 5,
      review: "Outstanding Service from Start to Finish! I had an excellent experience with Fairfield Airport Car Service, thanks to Gregg. From the moment I booked, Gregg was professional, punctual, and incredibly accommodating. The vehicle was spotless, comfortable, and on time — which made my trip to the airport completely stress-free. If you want the assurance of knowing what you're getting, do yourself a favor and book Gregg - the peace of mind is worth it alone!",
      name: "Andy K.",
      location: "Connecticut"
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      const newScrollPosition = direction === 'left' 
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Container padding="xl" variant="section" data-testid="testimonials-section">
      <Stack spacing="sm" align="center">
        {/* Section Header */}
        <Stack spacing="md" align="center">
          <H2
            align="center"
            cmsId="testimonials-title"
            data-testid="testimonials-title"
          >
            {cmsData?.['testimonials-title'] || 'What Our Customers Say'}
          </H2>
          <Text
            align="center"
            size="lg"
            cmsId="testimonials-subtitle"
            data-testid="testimonials-subtitle"
          >
            {cmsData?.['testimonials-subtitle'] || 'Trusted by travelers across Connecticut'}
          </Text>
        </Stack>

        {/* Carousel Container */}
        <CarouselContainer>
          <LeftButton
            onClick={() => scroll('left')}
            variant="outline"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </LeftButton>

          <CarouselTrack ref={carouselRef}>
            {testimonials.map((testimonial) => (
              <Testimonial
                key={testimonial.id}
                rating={testimonial.rating}
                review={cmsData?.[`${testimonial.id}-review`] || testimonial.review}
                name={cmsData?.[`${testimonial.id}-name`] || testimonial.name}
                location={cmsData?.[`${testimonial.id}-location`] || testimonial.location}
                cmsId={testimonial.id}
              />
            ))}
          </CarouselTrack>

          <RightButton
            onClick={() => scroll('right')}
            variant="outline"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </RightButton>
          
          {/* Mobile: Fade overlay to hint at more content */}
          <FadeOverlay />
          
          {/* Mobile: Simple arrow indicators */}
          <MobileLeftArrow>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </MobileLeftArrow>
          <MobileRightArrow>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </MobileRightArrow>
        </CarouselContainer>
        
        {/* Mobile: Swipe hint text */}
        <ScrollHintText 
          color="secondary" 
          cmsId="testimonials-swipe-hint"
        >
          {cmsData?.['testimonials-swipe-hint'] || '← Swipe to see more reviews →'}
        </ScrollHintText>
      </Stack>
    </Container>
  );
};

