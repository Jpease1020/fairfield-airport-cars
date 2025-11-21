# 📱 Mobile Testing Setup Guide

## 🚇 Using ngrok for Mobile Testing

To test the Google Autocomplete dropdown on your mobile device, you need to expose your localhost:3000 through a public HTTPS URL that Google Places API will accept.

### **Step 1: Start Your Dev Server**

```bash
npm run dev
```

Make sure it's running on `http://localhost:3000`

### **Step 2: Start the Tunnel**

In a **new terminal window**, run:

```bash
npm run tunnel
```

Or directly:
```bash
./scripts/tunnel.sh
```

You'll see output like:
```
Forwarding   https://abc123-def456-ghi789.ngrok-free.app -> http://localhost:3000
```

### **Step 3: Add URL to Google Cloud Console (One-Time Setup)**

**Important**: ngrok free tier gives you a **new random URL each time** you restart the tunnel. However, you can use **wildcards** to cover all ngrok URLs, so you only need to add this **once**!

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your `NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY`
4. Under **Application restrictions** → **HTTP referrers (web sites)**
5. Click **+ ADD AN ITEM**
6. Add these wildcard patterns (covers all ngrok URLs):
   ```
   https://*.ngrok-free.app/*
   https://*.ngrok.io/*
   ```
   The wildcard `*` means **any** ngrok subdomain will work, so you never need to update this again!

7. Click **SAVE**

✅ **Done!** Now any ngrok URL will work, even if it changes each time.

### **Step 4: Test on Mobile**

1. Open the ngrok URL on your phone: `https://abc123-def456-ghi789.ngrok-free.app`
2. The Google Autocomplete dropdown should now work!

### **⚠️ Important Notes**

- **ngrok free tier**: URLs change each time you restart ngrok
- **Wildcards solve this**: Using `https://*.ngrok-free.app/*` in Google Console means you **never need to update it** - any ngrok URL will work automatically
- **Keep tunnel running**: Don't close the terminal running `npm run tunnel` while testing
- **HTTPS required**: Google Places API requires HTTPS, which ngrok provides automatically

### **🎯 Want a Static URL? (Optional)**

If you want the **same URL every time** (so you don't have to copy it to your phone each time):

1. Sign up for a free ngrok account at [ngrok.com](https://ngrok.com) (no credit card required)
2. Get your authtoken from the dashboard
3. Configure ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
4. Start tunnel with a static domain:
   ```bash
   ngrok http 3000 --domain=your-static-domain.ngrok-free.app
   ```
   
   (Free accounts get one static domain)

This way you get the same URL every time, but the wildcard approach works just fine too!

### **Alternative: Cloudflare Tunnel (Free, No Signup)**

If you prefer not to use ngrok:

```bash
# Install cloudflared
brew install cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3000
```

Then add the Cloudflare tunnel URL to Google Cloud Console the same way.

### **Alternative: Add Your Local IP (Less Secure)**

You can also add your local IP address to Google Cloud Console:

1. Find your local IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Or on Mac:
   ```bash
   ipconfig getifaddr en0
   ```

2. Start dev server with IP binding:
   ```bash
   npm run dev:ip
   ```

3. Add to Google Cloud Console:
   ```
   http://YOUR_IP:3000/*
   ```

⚠️ **Warning**: This is less secure and may not work reliably with Google's API restrictions.

