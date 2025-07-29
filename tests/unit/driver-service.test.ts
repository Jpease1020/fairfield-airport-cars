import { 
  getDriver, 
  updateDriverStatus, 
  updateDriverLocation, 
  checkDriverAvailability,
  assignDriverToBooking,
  initializeGreggDriver 
} from '@/lib/services/driver-service';

// Mock Firebase
jest.mock('@/lib/utils/firebase', () => ({
  db: {}
}));

describe('Driver Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Driver Profile Management', () => {
    it('should initialize Gregg driver profile correctly', () => {
      const gregg = initializeGreggDriver();
      
      expect(gregg.id).toBe('gregg-main-driver');
      expect(gregg.name).toBe('Gregg');
      expect(gregg.phone).toBe('(203) 555-0123');
      expect(gregg.email).toBe('gregg@fairfieldairportcars.com');
      expect(gregg.vehicleInfo.make).toBe('Toyota');
      expect(gregg.vehicleInfo.model).toBe('Highlander');
      expect(gregg.vehicleInfo.year).toBe(2022);
      expect(gregg.status).toBe('available');
    });

    it('should get driver profile', async () => {
      const driver = await getDriver('gregg-main-driver');
      
      expect(driver).toBeDefined();
      expect(driver?.name).toBe('Gregg');
      expect(driver?.id).toBe('gregg-main-driver');
    });

    it('should return null for non-existent driver', async () => {
      const driver = await getDriver('non-existent-driver');
      
      expect(driver).toBeNull();
    });
  });

  describe('Driver Status Management', () => {
    it('should update driver status', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await updateDriverStatus('gregg-main-driver', 'busy');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Driver gregg-main-driver status updated to:',
        'busy'
      );
      
      consoleSpy.mockRestore();
    });

    it('should update driver location', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await updateDriverLocation('gregg-main-driver', 41.123, -73.456, 90, 35);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Driver gregg-main-driver location updated:',
        { latitude: 41.123, longitude: -73.456, heading: 90, speed: 35 }
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Driver Availability', () => {
    it('should check driver availability for valid time', async () => {
      const testDate = new Date('2024-12-25'); // Wednesday
      const testTime = '10:00';
      
      const isAvailable = await checkDriverAvailability('gregg-main-driver', testDate, testTime);
      
      expect(isAvailable).toBe(true);
    });

    it('should return false for unavailable time', async () => {
      const testDate = new Date('2024-12-25'); // Wednesday
      const testTime = '23:00'; // Outside 6 AM - 10 PM hours
      
      const isAvailable = await checkDriverAvailability('gregg-main-driver', testDate, testTime);
      
      expect(isAvailable).toBe(false);
    });

    it('should return false for non-existent driver', async () => {
      const testDate = new Date('2024-12-25');
      const testTime = '10:00';
      
      const isAvailable = await checkDriverAvailability('non-existent-driver', testDate, testTime);
      
      expect(isAvailable).toBe(false);
    });
  });

  describe('Driver Assignment', () => {
    it('should assign driver to booking', async () => {
      const driverId = await assignDriverToBooking('test-booking-123');
      
      expect(driverId).toBe('gregg-main-driver');
    });
  });
}); 