# Gregg's project-x Setup Guide

## Step 1: Get Your API Key

1. **Contact project-x** to get your personal API key
2. **Save the key** in a secure location
3. **Never share** the key publicly

## Step 2: Configure Environment Variables

Create a `.env.local` file in the project root with:

```bash
# Gregg's project-x API Configuration
GREGG_API_KEY=your-actual-api-key-here

# project-x Backend URL (default to localhost:3001)
project-x_BACKEND_URL=http://localhost:3001

# Optional: Configure different environments
NODE_ENV=development
```

## Step 3: Start project-x Backend

Make sure project-x is running locally:

```bash
cd ../project-x
npm start
# or
node deploy.js gregg
```

project-x should be available at `http://localhost:3001`

## Step 4: Test the Connection

1. **Start the Fairfield Airport Cars app**:
   ```bash
   npm run dev
   ```

2. **Visit the web interface**:
   - Go to `http://localhost:3000/project-x`
   - Enter password: `gregg2024`
   - Click "Launch project-x Web"

3. **Test a message**:
   - Type: "Hello project-x, can you help me with work analysis?"
   - You should get a real response from project-x

## Troubleshooting

### If you get "API key not configured":
- Check that `.env.local` exists
- Verify `GREGG_API_KEY` is set correctly
- Restart the development server

### If you get "project-x backend unavailable":
- Make sure project-x is running on `localhost:3001`
- Check that the API key is valid
- Verify network connectivity

### If you get "project-x API error":
- Check the project-x logs for errors
- Verify the API endpoint is correct
- Ensure the API key has proper permissions

## Security Notes

- **Never commit** your API key to version control
- **Use environment variables** for sensitive data
- **Rotate keys** regularly for security
- **Monitor usage** to prevent abuse

## Advanced Configuration

### Custom project-x Backend URL
If project-x is running on a different port or host:

```bash
project-x_BACKEND_URL=http://your-project-x-host:port
```

### Multiple User Support
To support multiple users, modify the API route to use different keys:

```typescript
// In src/app/api/project-x/chat/route.ts
const userApiKeys = {
  gregg: process.env.GREGG_API_KEY,
  alice: process.env.ALICE_API_KEY,
  bob: process.env.BOB_API_KEY
};

const apiKey = userApiKeys[user] || process.env.DEFAULT_API_KEY;
```

## Success Indicators

✅ **Working correctly when:**
- Messages get real responses from project-x
- No "fallback" or "error" messages
- Responses are contextual and helpful
- Loading states work properly

## Next Steps

1. **Test with real questions** about work analysis
2. **Try file uploads** if implemented
3. **Explore project-x capabilities** through the interface
4. **Provide feedback** on the user experience

Your project-x web interface is now connected to the real project-x backend! 🚀 