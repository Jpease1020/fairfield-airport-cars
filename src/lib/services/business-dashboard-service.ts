import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';

export interface DashboardData {
  revenue: {
    total: number;
    change: string;
  };
  bookings: {
    total: number;
    change: string;
  };
  averageFare: number;
  averageFareChange: string;
  rating: number;
  ratingChange: string;
  revenueTrend: Array<{
    period: string;
    amount: number;
  }>;
  bookingStatus: Array<{
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  recentBookings: Array<{
    id: string;
    customerName: string;
    pickupLocation: string;
    dropoffLocation: string;
    amount: number;
    status: string;
    date: Date;
  }>;
  topRoutes: Array<{
    from: string;
    to: string;
    bookings: number;
    revenue: number;
  }>;
}

export interface ExpenseData {
  id: string;
  category: 'fuel' | 'maintenance' | 'insurance' | 'other';
  description: string;
  amount: number;
  date: Date;
  receipt?: string;
}

export interface TaxSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  mileage: number;
  fuelExpenses: number;
  maintenanceExpenses: number;
  insuranceExpenses: number;
  otherExpenses: number;
}

class BusinessDashboardService {
  // Get dashboard data for specified time range
  async getDashboardData(timeRange: 'week' | 'month' | 'quarter'): Promise<DashboardData> {
    try {
      const startDate = this.getStartDate(timeRange);
      const endDate = new Date();

      // Get bookings for the time period
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      // Calculate metrics
      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
      const totalBookings = bookings.length;
      const averageFare = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Calculate revenue trend
      const revenueTrend = this.calculateRevenueTrend(bookings, timeRange);

      // Calculate booking status breakdown
      const bookingStatus = this.calculateBookingStatus(bookings);

      // Get recent bookings
      const recentBookings = bookings.slice(0, 5).map(booking => ({
        id: booking.id,
        customerName: booking.customerName || 'Unknown',
        pickupLocation: booking.pickupLocation || 'Unknown',
        dropoffLocation: booking.dropoffLocation || 'Unknown',
        amount: booking.amount || 0,
        status: booking.status || 'unknown',
        date: booking.createdAt?.toDate() || new Date()
      }));

      // Calculate top routes
      const topRoutes = this.calculateTopRoutes(bookings);

      // Mock data for changes (in production, compare with previous period)
      const revenueChange = '+12.5%';
      const bookingsChange = '+8.2%';
      const averageFareChange = '+5.1%';
      const ratingChange = '+0.2';

      return {
        revenue: {
          total: totalRevenue,
          change: revenueChange
        },
        bookings: {
          total: totalBookings,
          change: bookingsChange
        },
        averageFare,
        averageFareChange,
        rating: 4.8, // Mock rating
        ratingChange,
        revenueTrend,
        bookingStatus,
        recentBookings,
        topRoutes
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // Get expense data
  async getExpenses(timeRange: 'week' | 'month' | 'quarter'): Promise<ExpenseData[]> {
    try {
      const startDate = this.getStartDate(timeRange);
      const endDate = new Date();

      const expensesQuery = query(
        collection(db, 'expenses'),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );

      const expensesSnapshot = await getDocs(expensesQuery);
      return expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      })) as ExpenseData[];
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  // Generate tax summary
  async generateTaxSummary(): Promise<TaxSummary> {
    try {
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1); // January 1st
      const endDate = new Date();

      // Get all bookings for the year
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => doc.data());

      // Get all expenses for the year
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );

      const expensesSnapshot = await getDocs(expensesQuery);
      const expenses = expensesSnapshot.docs.map(doc => doc.data());

      // Calculate totals
      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const netIncome = totalRevenue - totalExpenses;

      // Calculate expense breakdown
      const fuelExpenses = expenses
        .filter(expense => expense.category === 'fuel')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const maintenanceExpenses = expenses
        .filter(expense => expense.category === 'maintenance')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const insuranceExpenses = expenses
        .filter(expense => expense.category === 'insurance')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const otherExpenses = expenses
        .filter(expense => expense.category === 'other')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      // Calculate mileage (mock data - in production, track actual mileage)
      const mileage = 15000; // Mock mileage for the year

      return {
        totalRevenue,
        totalExpenses,
        netIncome,
        mileage,
        fuelExpenses,
        maintenanceExpenses,
        insuranceExpenses,
        otherExpenses
      };
    } catch (error) {
      console.error('Error generating tax summary:', error);
      throw error;
    }
  }

  // Export report as CSV
  async exportReport(timeRange: 'week' | 'month' | 'quarter'): Promise<string> {
    try {
      const dashboardData = await this.getDashboardData(timeRange);
      const expenses = await this.getExpenses(timeRange);

      // Create CSV content
      const csvContent = this.generateCSV(dashboardData, expenses);
      
      // Return CSV content for client-side download
      return csvContent;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  // Helper methods
  private getStartDate(timeRange: 'week' | 'month' | 'quarter'): Date {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      }
      default:
        return new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    }
  }

  private calculateRevenueTrend(bookings: any[], timeRange: string): Array<{ period: string; amount: number }> {
    // Mock revenue trend data
    const periods = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const trend = [];
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend.push({
        period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: Math.floor(Math.random() * 500) + 100 // Mock amount
      });
    }
    
    return trend;
  }

  private calculateBookingStatus(bookings: any[]): Array<{ label: string; count: number; percentage: number; color: string }> {
    const statusCounts: { [key: string]: number } = {};
    
    bookings.forEach(booking => {
      const status = booking.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const total = bookings.length;
    const statusColors: { [key: string]: string } = {
      'completed': 'success',
      'confirmed': 'primary',
      'en-route': 'warning',
      'cancelled': 'error',
      'unknown': 'muted'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: statusColors[status] || 'muted'
    }));
  }

  private calculateTopRoutes(bookings: any[]): Array<{ from: string; to: string; bookings: number; revenue: number }> {
    const routeMap: { [key: string]: { bookings: number; revenue: number } } = {};
    
    bookings.forEach(booking => {
      const route = `${booking.pickupLocation} → ${booking.dropoffLocation}`;
      if (!routeMap[route]) {
        routeMap[route] = { bookings: 0, revenue: 0 };
      }
      routeMap[route].bookings++;
      routeMap[route].revenue += booking.amount || 0;
    });

    return Object.entries(routeMap)
      .map(([route, data]) => {
        const [from, to] = route.split(' → ');
        return { from, to, ...data };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private generateCSV(dashboardData: DashboardData, expenses: ExpenseData[]): string {
    const lines = [
      'Business Report',
      '',
      'Revenue Metrics',
      `Total Revenue,${dashboardData.revenue.total}`,
      `Total Bookings,${dashboardData.bookings.total}`,
      `Average Fare,${dashboardData.averageFare.toFixed(2)}`,
      '',
      'Recent Bookings',
      'Customer,From,To,Amount,Status,Date'
    ];

    dashboardData.recentBookings.forEach(booking => {
      lines.push(`${booking.customerName},${booking.pickupLocation},${booking.dropoffLocation},${booking.amount},${booking.status},${booking.date.toLocaleDateString()}`);
    });

    lines.push('');
    lines.push('Expenses');
    lines.push('Category,Description,Amount,Date');

    expenses.forEach(expense => {
      lines.push(`${expense.category},${expense.description},${expense.amount},${expense.date.toLocaleDateString()}`);
    });

    return lines.join('\n');
  }
}

export const businessDashboardService = new BusinessDashboardService(); 