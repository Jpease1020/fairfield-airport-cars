import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export type BookingPhase = 'trip-details' | 'contact-info' | 'payment' | 'payment-processing';

export interface FlightInfo {
  airline: string;
  flightNumber: string;
  arrivalTime: string;
  terminal: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BookingFormData {
  // Trip details
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: Coordinates | null;
  dropoffCoords: Coordinates | null;
  pickupDateTime: string;
  fareType: 'personal' | 'business';
  flightInfo: FlightInfo;
  
  // Contact info
  name: string;
  email: string;
  phone: string;
  notes: string;
  saveInfoForFuture: boolean;
  
  // Payment
  fare: number | null;
  tipAmount: number;
  tipPercent: number;
  depositAmount: number | null;
}

export const useBookingForm = () => {
  // Get URL search parameters
  const searchParams = useSearchParams();
  
  // Phase management
  const [currentPhase, setCurrentPhase] = useState<BookingPhase>('trip-details');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Trip details
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null);
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [fareType, setFareType] = useState<'personal' | 'business'>('personal');
  const [flightInfo, setFlightInfo] = useState<FlightInfo>({
    airline: '',
    flightNumber: '',
    arrivalTime: '',
    terminal: ''
  });

  // Initialize form with URL parameters
  useEffect(() => {
    const pickup = searchParams.get('pickup');
    const dropoff = searchParams.get('dropoff');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    
    if (pickup) {
      setPickupLocation(pickup);
    }
    if (dropoff) {
      setDropoffLocation(dropoff);
    }
    if (date && time) {
      // Combine date and time into ISO format
      const dateTime = `${date}T${time}`;
      setPickupDateTime(dateTime);
    }
  }, [searchParams]);

  // Payment
  const [fare, setFare] = useState<number | null>(null);
  const [baseFare, setBaseFare] = useState<number | null>(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercent, setTipPercent] = useState(15);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Contact info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saveInfoForFuture, setSaveInfoForFuture] = useState(true);

  // Form state
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Calculate deposit amount when fare changes
  const calculateDeposit = useCallback((fareAmount: number) => {
    return Math.round(fareAmount * 0.3 * 100) / 100; // 30% deposit
  }, []);

  // Calculate total fare with tip
  const getTotalFare = useCallback(() => {
    if (!fare) return 0;
    return fare + tipAmount;
  }, [fare, tipAmount]);

  // Calculate deposit amount when fare changes
  useEffect(() => {
    if (fare) {
      const deposit = calculateDeposit(fare);
      setDepositAmount(deposit);
    } else {
      setDepositAmount(null);
    }
  }, [fare, calculateDeposit]);

  // Handle tip changes
  const handleTipChange = useCallback((amount: number, percent: number) => {
    setTipAmount(amount);
    setTipPercent(percent);
  }, []);

  // Navigation functions
  const goToPhase = useCallback((phase: BookingPhase) => {
    setCurrentPhase(phase);
    setError(null);
    setSuccess(null);
  }, []);

  const goToNextPhase = useCallback(() => {
    switch (currentPhase) {
      case 'trip-details':
        goToPhase('contact-info');
        break;
      case 'contact-info':
        goToPhase('payment');
        // Show payment form immediately when reaching payment phase
        setShowPaymentForm(true);
        break;
      default:
        break;
    }
  }, [currentPhase, goToPhase, setShowPaymentForm]);

  const goToPreviousPhase = useCallback(() => {
    switch (currentPhase) {
      case 'contact-info':
        goToPhase('trip-details');
        break;
      case 'payment':
        goToPhase('contact-info');
        break;
      default:
        break;
    }
  }, [currentPhase, goToPhase]);

  // Reset form
  const resetForm = useCallback(() => {
    setCurrentPhase('trip-details');
    setShowPaymentForm(false);
    setBookingId(null);
    setPickupLocation('');
    setDropoffLocation('');
    setPickupCoords(null);
    setDropoffCoords(null);
    setPickupDateTime('');
    setFareType('personal');
    setFlightInfo({
      airline: '',
      flightNumber: '',
      arrivalTime: '',
      terminal: ''
    });
    setFare(null);
    setBaseFare(null);
    setTipAmount(0);
    setTipPercent(15);
    setDepositAmount(null);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setSaveInfoForFuture(true);
    setError(null);
    setSuccess(null);
    setPaymentError(null);
    setIsProcessingPayment(false);
  }, []);

  return {
    // State
    currentPhase,
    showPaymentForm,
    bookingId,
    pickupLocation,
    dropoffLocation,
    pickupCoords,
    dropoffCoords,
    pickupDateTime,
    fareType,
    flightInfo,
    fare,
    baseFare,
    tipAmount,
    tipPercent,
    depositAmount,
    isProcessingPayment,
    paymentError,
    name,
    email,
    phone,
    notes,
    saveInfoForFuture,
    isCalculating,
    error,
    success,

    // Setters
    setPickupLocation,
    setDropoffLocation,
    setPickupCoords,
    setDropoffCoords,
    setPickupDateTime,
    setFareType,
    setFlightInfo,
    setFare,
    setBaseFare,
    setTipAmount,
    setTipPercent,
    setDepositAmount,
    setIsProcessingPayment,
    setPaymentError,
    setName,
    setEmail,
    setPhone,
    setNotes,
    setSaveInfoForFuture,
    setIsCalculating,
    setError,
    setSuccess,
    setShowPaymentForm,
    setBookingId,

    // Computed values
    getTotalFare,
    calculateDeposit,

    // Actions
    handleTipChange,
    goToPhase,
    goToNextPhase,
    goToPreviousPhase,
    resetForm,
  };
};
