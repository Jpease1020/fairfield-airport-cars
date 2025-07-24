# Import Patterns Guide

## New Organized Import Structure

### Lib Imports:
```typescript
// Services
import { authService } from '@/lib/services/auth-service';
import { bookingService } from '@/lib/services/booking-service';

// Utils
import { utils } from '@/lib/utils/utils';
import { firebase } from '@/lib/utils/firebase';

// Validation
import { validateBooking } from '@/lib/validation/booking-validation';

// Business Logic
import { costTracking } from '@/lib/business/cost-tracking';
```

### Component Imports:
```typescript
// UI Components
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Admin Components
import { AdminHamburgerMenu } from '@/components/admin/AdminHamburgerMenu';

// Form Components
import { EditableInput } from '@/components/forms/EditableInput';
```

### API Route Imports:
```typescript
// Booking APIs
import { createBooking } from '@/app/api/booking/create-booking-server/route';

// Payment APIs
import { processPayment } from '@/app/api/payment/complete-payment/route';

// Admin APIs
import { getAnalytics } from '@/app/api/admin/analytics/summary/route';
```
