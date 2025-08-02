# 🛫 Aviation Stack API Setup Guide

## Overview
We've switched from FlightAware ($50/month) to Aviation Stack API for flight tracking to reduce costs while maintaining functionality.

## Cost Comparison
- **FlightAware**: $50/month
- **Aviation Stack FREE**: $0/month (100 requests)
- **Aviation Stack Pro**: $10/month (1,000 requests)
- **Savings**: $40-50/month ($480-600/year)

## Setup Instructions

### 1. Get Aviation Stack API Key
1. Go to [aviationstack.com](https://aviationstack.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 100 requests/month

### 2. Environment Variables
Add to your `.env.local` file:
```bash
# Aviation Stack API (replaces FLIGHTAWARE_API_KEY)
AVIATION_STACK_API_KEY=your_api_key_here
```

### 3. API Usage
The service will automatically:
- Track flight delays
- Adjust pickup times based on delays
- Send notifications to customers
- Update booking status

## API Endpoints Used

### Flight Status Check
```
GET http://api.aviationstack.com/v1/flights?access_key={API_KEY}&flight_iata={FLIGHT_NUMBER}
```

### Response Format
```json
{
  "data": [
    {
      "flight": {
        "iata": "AA123"
      },
      "airline": {
        "iata": "AA",
        "name": "American Airlines"
      },
      "departure": {
        "iata": "JFK",
        "scheduled": "2024-01-15T10:00:00+00:00",
        "actual": "2024-01-15T10:30:00+00:00",
        "delay": 1800,
        "gate": "A5",
        "terminal": "1"
      },
      "arrival": {
        "iata": "LAX",
        "scheduled": "2024-01-15T13:00:00+00:00",
        "estimated": "2024-01-15T13:30:00+00:00"
      },
      "flight_status": "delayed"
    }
  ]
}
```

## Flight Status Mapping
- `scheduled` → Scheduled
- `active` → Scheduled
- `delayed` → Delayed
- `landed` → Arrived
- `arrived` → Arrived
- `cancelled` → Cancelled
- `diverted` → Cancelled

## Usage Limits
- **Free Tier**: 100 requests/month
- **Pro Tier**: 1,000 requests/month ($10/month)
- **Business Tier**: 10,000 requests/month ($25/month)

## Monitoring Usage
Check your Aviation Stack dashboard for:
- Request count
- API response times
- Error rates
- Usage patterns

## Upgrade Path
1. **Start with FREE tier** (100 requests/month)
2. **Monitor usage** for 2 weeks
3. **Upgrade to PRO** if needed ($10/month)
4. **Scale as business grows**

## Error Handling
The service includes fallback mechanisms:
- If API is unavailable, continue without flight tracking
- If rate limit exceeded, use cached data
- If flight not found, notify customer to check manually

## Testing
Test with real flight numbers:
- American Airlines: AA123
- Delta: DL456
- United: UA789
- Southwest: WN101

## Support
- Aviation Stack Documentation: [docs.aviationstack.com](https://docs.aviationstack.com)
- API Status: [status.aviationstack.com](https://status.aviationstack.com)
- Support: support@aviationstack.com

## Migration Notes
- Replaced FlightAware API calls
- Updated response parsing
- Maintained same functionality
- Reduced costs by 80% 