# Banner Slots - Quick Integration Guide

## Setup

### 1. Run Database Migration

Execute the SQL in `migrations/add-banner-slots.sql`:

```sql
-- Creates banner_slots and banners tables
```

### 2. Create Banner Slots

Go to `/admin/banner-slots` or use the API:

```javascript
// Create a slot via API
fetch('/api/admin/banner-slots', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Homepage Hero',
    slug: 'homepage-hero',
    location: 'homepage',
    max_width: 1200,
    max_height: 300,
    aspect_ratio: '16:9',
    rotation_delay: 5000,
    is_active: true
  })
})
```

### 3. Add Banners to Slots

Via admin interface: `/admin/banner-slots` → Click "Manage Banners"

Or via API:
```javascript
fetch('/api/admin/banner-slots/{slotId}/banners', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Summer Sale',
    image_url: '/uploads/banner.jpg',
    link_url: 'https://example.com/sale',
    alt_text: 'Summer Sale Banner',
    is_active: true
  })
})
```

### 4. Display on Your Pages

```jsx
import BannerSlotRenderer from '@/components/BannerSlotRenderer';

export default function HomePage() {
  return (
    <main>
      {/* Display banner with auto-rotation */}
      <BannerSlotRenderer slotSlug="homepage-hero" />
      
      {/* Your page content */}
    </main>
  );
}
```

## Common Tasks

### Add Banner to Existing Component

```jsx
// In NewsBox.js or EventsBox.js
import BannerSlotRenderer from '@/components/BannerSlotRenderer';
import styles from './NewsBox.module.css';

export default function NewsBox() {
  return (
    <div className={styles.newsBox}>
      <BannerSlotRenderer slotSlug="news-featured" />
      {/* existing news content */}
    </div>
  );
}
```

### Add Custom Styling

```jsx
// page.module.css
.banner {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-bottom: 2rem;
}

// page.js
<BannerSlotRenderer slotSlug="homepage-hero" className={styles.banner} />
```

### Use Library Functions

```javascript
import {
  getBannerSlots,
  getBannerSlotWithBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  recordBannerClick
} from '@/lib/banner-slots';

// Get a slot with all its banners
const slot = await getBannerSlotWithBanners('homepage-hero');

// Get only active banners
const slot = await getBannerSlotWithBanners('homepage-hero', true);

// Create new banner
await createBanner({
  banner_slot_id: 1,
  title: 'New Banner',
  image_url: '/uploads/new.jpg',
  link_url: 'https://example.com',
  is_active: true
}, userId);
```

## Key Features

✓ **Multiple rotating banners** per slot\
✓ **Click tracking** - see how many clicks each banner gets\
✓ **URL tracking** - each banner can link to different URLs\
✓ **Responsive design** - works on mobile/tablet/desktop\
✓ **Easy admin UI** - create/edit/delete from admin panel\
✓ **Customizable** - set width, height, rotation speed\
✓ **Active/Inactive** - control visibility\
✓ **Sort order** - control banner rotation order

## File Structure

```
src/
├── lib/
│   └── banner-slots.js          # Library functions
├── components/
│   ├── BannerSlotRenderer.js    # Display component
│   └── BannerSlotRenderer.module.css
├── app/
│   ├── admin/
│   │   └── banner-slots/
│   │       ├── page.js          # Admin UI
│   │       └── banner-slots.module.css
│   └── api/
│       └── admin/
│           └── banner-slots/    # API endpoints
│               ├── route.js
│               ├── [id]/
│               │   ├── route.js
│               │   └── banners/
│               │       ├── route.js
│               │       └── [bannerId]/
│               │           └── route.js
└── migrations/
    └── add-banner-slots.sql     # Database schema
```

## Admin Panel

**URL**: `/admin/banner-slots`

**Features**:
- Create/edit/delete banner slots
- Manage banners within each slot
- Upload banner images
- Set URLs for banners
- Control rotation settings
- Toggle active status
- View banner click counts

## Styling Tips

### Make banners full-width

```css
.banner {
  width: 100%;
  margin: 0;
}
```

### Add spacing

```css
.banner {
  margin: 2rem 0;
}
```

### Custom button styling

```css
.banner :global(.dots button) {
  width: 14px;
  height: 14px;
}
```

## Troubleshooting

**Banners not showing?**
- Check slot is active
- Check banners are active
- Check console for errors
- Verify slot slug matches

**Images not loading?**
- Check image URL is correct
- Check image file exists
- Try uploading via admin UI

**Rotation not working?**
- Need 2+ banners in slot
- Check rotation_delay value
- Verify banners are active

## Next Steps

1. **Test it**: Create a test slot in admin panel
2. **Add a banner**: Upload an image and set a URL
3. **Display it**: Add `<BannerSlotRenderer slotSlug="..." />` to a page
4. **Customize**: Adjust colors, sizes, rotation speed as needed

## Need Help?

See full documentation: `BANNER_SLOTS_DOCUMENTATION.md`

API Reference: See `/api/admin/banner-slots` comments

Component Props: See `BannerSlotRenderer.js` comments
