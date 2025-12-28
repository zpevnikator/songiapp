# Offline Support

## Overview

This app now has full offline support enabled through a Service Worker. Once you've visited the app and it has loaded, it will continue to work even when you lose internet connectivity.

## What Works Offline

- **All static assets**: HTML, CSS, JavaScript files are cached automatically
- **Navigation**: You can navigate between different pages in the app
- **Images**: Images are cached with a "Cache First" strategy
- **Google Fonts**: Font files are cached for offline use
- **Local database**: Since the app uses Dexie (IndexedDB), your local data works completely offline

## How It Works

### Service Worker
The app uses Workbox to generate a service worker that:
1. **Precaches** all static assets during the first visit
2. **Caches** images and fonts on-demand as you use the app
3. **Provides** offline fallback for navigation requests

### Caching Strategies

1. **Precaching**: All app shell resources (HTML, CSS, JS) are cached on first load
2. **Cache First**: Images and fonts are served from cache when available
3. **Runtime Caching**: Resources are cached as they're requested

## Testing Offline Mode

1. **Build the app**: `npm run build`
2. **Serve it**: `npx serve -s build -l 3000`
3. **Open in browser**: Navigate to http://localhost:3000
4. **Wait for caching**: Open DevTools > Application > Service Workers and ensure the service worker is activated
5. **Go offline**: In Chrome DevTools, check "Offline" in the Network tab
6. **Test**: Navigate around the app - it should still work!

## Service Worker Registration

The service worker is automatically registered in production mode. In development mode (`npm start`), it's only registered on localhost to help with testing.

### Code Location
- Service worker registration: `src/serviceWorkerRegistration.ts`
- Service worker configuration: `craco.config.js`
- Registration call: `src/index.tsx` (calls `serviceWorkerRegistration.register()`)

## Updating the App

When you deploy a new version:
1. The service worker will detect the update
2. It will download new assets in the background
3. Users will get the update the next time they fully close and reopen the app
4. Alternatively, they can force-refresh (Cmd+Shift+R / Ctrl+Shift+R)

## Configuration

The offline configuration can be customized in `craco.config.js`:

```javascript
new GenerateSW({
  clientsClaim: true,        // Take control immediately
  skipWaiting: true,         // Activate new SW immediately
  navigateFallback: '/index.html',
  runtimeCaching: [...]      // Custom caching strategies
})
```

## Data Considerations

- **Remote databases**: Data from remote databases will need internet connectivity to sync
- **Local databases**: Using Dexie means all local data works offline automatically
- Consider implementing a sync queue for data changes made while offline

## Browser Support

Service Workers are supported in:
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

The app will work in older browsers, just without offline support.

## Deployment

For production deployment:
1. Build the app: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Ensure your hosting serves the app over HTTPS (required for Service Workers)

Note: Service Workers only work on HTTPS sites (or localhost for development).
