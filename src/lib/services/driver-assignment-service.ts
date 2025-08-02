import { getBooking, updateBooking } from './booking-service';
import { sendSms } from './twilio-service';
import { sendConfirmationEmail } from './email-service';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: {
    make: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
  };
  rating: number;
  totalRides: number;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  photo?: string;
}

interface DriverAssignment {
  bookingId: string;
  driverId: string;
  assignedAt: Date;
  estimatedArrival: Date;
  pickupInstructions: string;
  meetingPoint: string;
}

class DriverAssignmentService {
  private drivers: Driver[] = [
    {
      id: 'driver-001',
      name: 'Gregg',
      phone: '+1234567890',
      email: 'gregg@fairfieldairportcars.com',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: '2022',
        color: 'Silver',
        licensePlate: 'ABC-123'
      },
      rating: 4.8,
      totalRides: 1250,
      isAvailable: true,
      photo: '/images/drivers/gregg.jpg'
    }
  ];

  async assignDriverToBooking(bookingId: string): Promise<DriverAssignment> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Gregg is our only driver for now
      const gregg = this.drivers.find(driver => driver.id === 'driver-001');
      if (!gregg || !gregg.isAvailable) {
        throw new Error('Gregg is not available at this time');
      }

      // Calculate estimated arrival (30 minutes before pickup)
      const pickupTime = new Date(booking.pickupDateTime);
      const estimatedArrival = new Date(pickupTime.getTime() - 30 * 60 * 1000);

      // Generate pickup instructions
      const pickupInstructions = this.generatePickupInstructions(booking);
      const meetingPoint = this.generateMeetingPoint(booking.pickupLocation);

      const assignment: DriverAssignment = {
        bookingId,
        driverId: gregg.id,
        assignedAt: new Date(),
        estimatedArrival,
        pickupInstructions,
        meetingPoint
      };

      // Update booking with driver assignment
      await updateBooking(bookingId, {
        driverId: gregg.id,
        driverName: gregg.name,
        estimatedArrival,
        status: 'confirmed'
      });

      // Send driver assignment notifications
      await this.sendDriverAssignmentNotifications(booking, gregg, assignment);

      return assignment;
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  }

  private generatePickupInstructions(booking: any): string {
    const instructions = [
      `Gregg will arrive 30 minutes before your scheduled pickup time.`,
      `Please have your ID ready for verification.`,
      `Look for Gregg's silver Toyota Camry with our company logo.`,
      `Gregg will call you when he arrives.`
    ];

    if (booking.specialRequests?.meetAndGreet) {
      instructions.push(`Your driver will meet you at the designated meeting point.`);
    }

    if (booking.specialRequests?.childSeat) {
      instructions.push(`Child seat will be installed and ready.`);
    }

    if (booking.specialRequests?.wheelchair) {
      instructions.push(`Wheelchair accessible vehicle confirmed.`);
    }

    return instructions.join(' ');
  }

  private generateMeetingPoint(pickupLocation: string): string {
    // Simple meeting point generation based on location
    if (pickupLocation.toLowerCase().includes('airport')) {
      return 'Airport pickup area - Follow signs to ground transportation';
    } else if (pickupLocation.toLowerCase().includes('station')) {
      return 'Train station main entrance';
    } else {
      return 'Main entrance of your location';
    }
  }

  private async sendDriverAssignmentNotifications(
    booking: any, 
    driver: Driver, 
    assignment: DriverAssignment
  ): Promise<void> {
    try {
      // Send customer notification
      const customerMessage = `Gregg has been assigned to your ride! He will arrive at ${assignment.meetingPoint} at ${assignment.estimatedArrival.toLocaleTimeString()}. Vehicle: ${driver.vehicle.year} ${driver.vehicle.make} ${driver.vehicle.model} (${driver.vehicle.color}). Call ${driver.phone} if needed.`;

      await sendSms({
        to: booking.phone,
        body: customerMessage
      });

      // Send driver notification
      const driverMessage = `New booking: ${booking.name} from ${booking.pickupLocation} to ${booking.dropoffLocation} on ${new Date(booking.pickupDateTime).toLocaleString()}. Please arrive at ${assignment.estimatedArrival.toLocaleTimeString()}.`;

      await sendSms({
        to: driver.phone,
        body: driverMessage
      });

      // Send confirmation email to customer
      await sendConfirmationEmail({
        ...booking,
        driverName: driver.name,
        driverPhone: driver.phone,
        vehicleInfo: `${driver.vehicle.year} ${driver.vehicle.make} ${driver.vehicle.model}`,
        pickupInstructions: assignment.pickupInstructions,
        meetingPoint: assignment.meetingPoint
      });

    } catch (error) {
      console.error('Error sending driver assignment notifications:', error);
    }
  }

  async getDriverProfile(driverId: string): Promise<Driver | null> {
    return this.drivers.find(driver => driver.id === driverId) || null;
  }

  async updateDriverLocation(driverId: string, lat: number, lng: number): Promise<void> {
    const driver = this.drivers.find(d => d.id === driverId);
    if (driver) {
      driver.currentLocation = { lat, lng };
    }
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    return this.drivers.filter(driver => driver.isAvailable);
  }

  async sendDriverEnRouteNotification(bookingId: string): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking || !booking.driverId) return;

      const driver = await this.getDriverProfile(booking.driverId);
      if (!driver) return;

      const message = `Gregg is en route and will arrive in approximately 15 minutes. Vehicle: ${driver.vehicle.year} ${driver.vehicle.make} ${driver.vehicle.model} (${driver.vehicle.color}).`;

      await sendSms({
        to: booking.phone,
        body: message
      });
    } catch (error) {
      console.error('Error sending driver en route notification:', error);
    }
  }

  async sendDriverArrivedNotification(bookingId: string): Promise<void> {
    try {
      const booking = await getBooking(bookingId);
      if (!booking || !booking.driverId) return;

      const driver = await this.getDriverProfile(booking.driverId);
      if (!driver) return;

      const message = `Gregg has arrived at ${booking.pickupLocation}. Please proceed to the meeting point. Safe travels!`;

      await sendSms({
        to: booking.phone,
        body: message
      });
    } catch (error) {
      console.error('Error sending driver arrived notification:', error);
    }
  }
}

export const driverAssignmentService = new DriverAssignmentService(); 