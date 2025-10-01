# Keep-Alive Configuration Guide

## Overview

The Placement Portal includes a configurable keep-alive system that prevents the server from sleeping on free hosting platforms (like Render, Heroku, etc.) that automatically shut down inactive services.

## Problem Solved

**Before:** Hardcoded URL to `placementportal-ktlv.onrender.com` caused issues when:
- Deploying to different servers
- Running locally for development
- Using different hosting providers
- Needing to disable keep-alive functionality

**After:** Fully configurable via environment variables with sensible defaults.

---

## Configuration Options

### 1. Enable/Disable Keep-Alive

```env
KEEP_ALIVE_ENABLED=true    # Enable keep-alive (default)
KEEP_ALIVE_ENABLED=false   # Disable keep-alive
```

**When to disable:**
- Local development (not needed)
- Paid hosting with always-on servers
- Development/testing environments

### 2. Set Keep-Alive URL

```env
# For production deployment (Render example)
KEEP_ALIVE_URL=https://your-app.onrender.com/ping

# For local development
KEEP_ALIVE_URL=http://localhost:3000/ping

# For custom port
KEEP_ALIVE_URL=http://localhost:5000/ping
```

**Default:** If not specified, uses `http://localhost:${PORT}/ping`

### 3. Configure Ping Interval

```env
KEEP_ALIVE_INTERVAL=300000   # 5 minutes (default, in milliseconds)
KEEP_ALIVE_INTERVAL=600000   # 10 minutes
KEEP_ALIVE_INTERVAL=180000   # 3 minutes
```

**Recommended intervals:**
- **Free tier hosting:** 5 minutes (300000ms)
- **Development:** 10 minutes or disabled
- **Production:** Based on hosting provider sleep policy

---

## Usage Examples

### Example 1: Local Development (Disabled)

```env
# .env
PORT=3000
KEEP_ALIVE_ENABLED=false
```

**Output:** `Keep-alive ping disabled via KEEP_ALIVE_ENABLED=false`

### Example 2: Render Deployment

```env
# .env
PORT=3000
KEEP_ALIVE_ENABLED=true
KEEP_ALIVE_URL=https://placementportal.onrender.com/ping
KEEP_ALIVE_INTERVAL=300000
```

**Output:**
```
Keep-alive enabled: pinging https://placementportal.onrender.com/ping every 300s
Ping response: pong
Server keep-alive successful (2025-09-30T14:30:00.000Z)
```

### Example 3: Heroku Deployment

```env
# .env
PORT=5000
KEEP_ALIVE_ENABLED=true
KEEP_ALIVE_URL=https://your-app.herokuapp.com/ping
KEEP_ALIVE_INTERVAL=600000
```

### Example 4: Custom Server

```env
# .env
PORT=8080
KEEP_ALIVE_ENABLED=true
KEEP_ALIVE_URL=https://custom-domain.com/ping
KEEP_ALIVE_INTERVAL=420000
```

### Example 5: Auto-detection (Default)

```env
# .env
PORT=3000
# Keep-alive uses defaults
```

**Behavior:** Automatically pings `http://localhost:3000/ping` every 5 minutes

---

## How It Works

1. **Server starts** and checks `KEEP_ALIVE_ENABLED`
2. If enabled, reads `KEEP_ALIVE_URL` (or generates from `PORT`)
3. Sets up interval based on `KEEP_ALIVE_INTERVAL`
4. Pings `/ping` endpoint periodically
5. Logs success/failure for monitoring

**Flow Diagram:**
```
Server Start
    ↓
Check KEEP_ALIVE_ENABLED
    ↓
If false → Skip (log message)
    ↓
If true → Read KEEP_ALIVE_URL
    ↓
Fallback to localhost:{PORT}/ping if not set
    ↓
Start interval timer
    ↓
Every X seconds:
  - Ping URL
  - Log response
  - Handle errors gracefully
```

---

## Protocol Detection

The system automatically detects whether to use HTTP or HTTPS:

```javascript
const protocol = keepAliveUrl.startsWith('https') ? https : require('http');
```

- URLs starting with `https://` use HTTPS
- URLs starting with `http://` use HTTP
- Localhost defaults to HTTP

---

## Monitoring & Logs

### Success Logs

```
Keep-alive enabled: pinging https://your-app.com/ping every 300s
Ping response: pong
Server keep-alive successful (2025-09-30T14:30:00.000Z)
```

### Error Logs

```
Error pinging the server: ECONNREFUSED
Error pinging the server: getaddrinfo ENOTFOUND your-app.com
```

**Common errors:**
- `ECONNREFUSED`: Server not reachable
- `ENOTFOUND`: Invalid URL/DNS issue
- `ETIMEDOUT`: Network timeout

---

## Deployment-Specific Guides

### Render.com

```env
KEEP_ALIVE_ENABLED=true
KEEP_ALIVE_URL=https://<your-service-name>.onrender.com/ping
KEEP_ALIVE_INTERVAL=300000
```

**Note:** Render free tier sleeps after 15 minutes of inactivity. Keep-alive prevents this.

### Heroku

```env
KEEP_ALIVE_ENABLED=true
KEEP_ALIVE_URL=https://<your-app-name>.herokuapp.com/ping
KEEP_ALIVE_INTERVAL=300000
```

**Note:** Heroku free dynos sleep after 30 minutes of inactivity.

### Railway

```env
KEEP_ALIVE_ENABLED=true
KEEP_ALIVE_URL=https://<your-service>.railway.app/ping
KEEP_ALIVE_INTERVAL=300000
```

### Vercel/Netlify (Serverless)

```env
KEEP_ALIVE_ENABLED=false
```

**Note:** Serverless platforms don't need keep-alive as they spin up on demand.

### Self-hosted/VPS

```env
KEEP_ALIVE_ENABLED=false
```

**Note:** Always-on servers don't need keep-alive.

---

## Best Practices

### 1. Environment-Specific Configuration

**Development (.env.development):**
```env
KEEP_ALIVE_ENABLED=false
```

**Production (.env.production):**
```env
KEEP_ALIVE_ENABLED=true
KEEP_ALIVE_URL=https://your-production-url.com/ping
```

### 2. Avoid Over-Pinging

- Don't set interval below 3 minutes (180000ms)
- Respect rate limits of hosting providers
- Consider server load and costs

### 3. Use External Monitoring (Alternative)

Instead of self-ping, use external services:
- **UptimeRobot** (free, 5-minute intervals)
- **Pingdom**
- **StatusCake**
- **Cron-job.org**

To use external monitoring:
```env
KEEP_ALIVE_ENABLED=false
```

Then configure external service to ping your `/ping` endpoint.

### 4. Security Considerations

- The `/ping` endpoint is public and unauthenticated
- Returns simple "pong" response
- No sensitive data exposed
- Consider rate limiting if abused

---

## Troubleshooting

### Issue 1: Keep-alive not working

**Check:**
1. Is `KEEP_ALIVE_ENABLED=true`?
2. Is the URL correct and reachable?
3. Check server logs for error messages
4. Test URL manually: `curl https://your-url.com/ping`

### Issue 2: Too many ping logs

**Solution:** Disable verbose logging in production:
```javascript
// In server.js, comment out success logs if needed
// console.log(`Ping response: ${chunk}`);
```

### Issue 3: Server still sleeping

**Reasons:**
- Hosting platform has stricter sleep policy
- URL pointing to wrong server
- Interval too long (try 3-4 minutes)
- External firewall blocking requests

### Issue 4: HTTPS errors in localhost

**Solution:** Use HTTP for localhost:
```env
KEEP_ALIVE_URL=http://localhost:3000/ping
```

---

## Migration Guide

### Updating from Old Hardcoded Version

**Old code:**
```javascript
https.get('https://placementportal-ktlv.onrender.com/ping', ...)
```

**New code:**
```javascript
const keepAliveUrl = process.env.KEEP_ALIVE_URL || `http://localhost:${process.env.PORT || 3000}/ping`;
const protocol = keepAliveUrl.startsWith('https') ? https : require('http');
protocol.get(keepAliveUrl, ...)
```

**Migration steps:**
1. Update `server.js` (already done)
2. Add new env variables to `.env`:
   ```env
   KEEP_ALIVE_ENABLED=true
   KEEP_ALIVE_URL=https://your-actual-url.com/ping
   KEEP_ALIVE_INTERVAL=300000
   ```
3. Update deployment configurations
4. Test locally with `KEEP_ALIVE_ENABLED=false`
5. Deploy and verify logs

---

## Testing

### Test 1: Verify Keep-Alive Enabled
```bash
# Start server
npm start

# Expected log:
# Keep-alive enabled: pinging http://localhost:3000/ping every 300s
```

### Test 2: Verify Ping Works
```bash
# Wait 5 minutes or check logs
# Expected:
# Ping response: pong
# Server keep-alive successful (2025-09-30T14:30:00.000Z)
```

### Test 3: Test with Custom URL
```bash
# Set env
export KEEP_ALIVE_URL=http://localhost:3000/ping

# Start server
npm start

# Check logs for custom URL
```

### Test 4: Test Disabled State
```bash
export KEEP_ALIVE_ENABLED=false
npm start

# Expected:
# Keep-alive ping disabled via KEEP_ALIVE_ENABLED=false
```

---

## Environment Variable Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `KEEP_ALIVE_ENABLED` | boolean | `true` | Enable/disable keep-alive system |
| `KEEP_ALIVE_URL` | string | `http://localhost:{PORT}/ping` | URL to ping |
| `KEEP_ALIVE_INTERVAL` | number (ms) | `300000` (5 min) | Time between pings |

---

## Summary

✅ **Fixed:** No more hardcoded URLs
✅ **Flexible:** Works with any hosting provider
✅ **Configurable:** Adjust interval and URL per environment
✅ **Optional:** Easy to disable when not needed
✅ **Smart defaults:** Works out-of-the-box for local development

The keep-alive system is now production-ready and can be deployed anywhere without code changes!