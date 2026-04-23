# Banner Slots System - Documentation

## Overview

The Banner Slots system allows you to create multiple "slots" (locations) across your website and assign multiple rotating banners to each slot. Each banner can have a URL it directs to when clicked.

## Key Features

- **Multiple Slots**: Create as many banner slots as needed (homepage, sidebar, footer, etc.)
- **Rotating Banners**: Assign multiple banners to each slot with customizable rotation delays
- **URLs**: Each banner can link to a different URL
- **Active/Inactive**: Control which banners are displayed
- **Sort Order**: Control the rotation order of banners
- **Tracking**: Track click counts on each banner (for analytics)
- **Responsive**: Mobile-friendly banner display
- **Customizable**: Set max width, height, and aspect ratio per slot

## Database Tables

### `banner_slots`

Stores banner slot definitions:

```sql
CREATE TABLE banner_slots (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(100) UNIQUE NOT NULL,    -- e.g. "Homepage Hero"
  slug            VARCHAR(100) UNIQUE NOT NULL,    -- e.g. "homepage-hero"
  description     TEXT,                             -- Slot description
  location        VARCHAR(100),                     -- e.g. "homepage", "sidebar"
  max_width       INT DEFAULT 1200,                 -- Max width in pixels
  max_height      INT DEFAULT 300,                  -- Max height in pixels
  aspect_ratio    VARCHAR(20) DEFAULT '16:9',      -- e.g. '16:9', '4:3', '1:1'
  rotation_delay  INT DEFAULT 5000,                -- Milliseconds between rotations
  is_active       TINYINT(1) DEFAULT 1,            -- Active/inactive status
  sort_order      INT DEFAULT 0,                    -- Display order
  created_by      INT,                              -- User who created
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `banners`

Stores individual banners:

```sql
CREATE TABLE banners (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  banner_slot_id  INT NOT NULL,                     -- FK to banner_slots
  title           VARCHAR(255),                     -- Banner title
  image_url       VARCHAR(255) NOT NULL,            -- Banner image URL
  link_url        VARCHAR(500),                     -- URL to navigate to on click
  alt_text        VARCHAR(200),                     -- Accessibility alt text
  description     TEXT,                             -- Banner description
  is_active       TINYINT(1) DEFAULT 1,            -- Active/inactive
  sort_order      INT DEFAULT 0,                    -- Rotation order
  click_count     INT DEFAULT 0,                    -- Click tracking
  created_by      INT,                              -- User who created
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Banner Slots Management

**GET** `/api/admin/banner-slots`
- Fetch all banner slots with their banners
- Returns: Array of slot objects with banners array

**POST** `/api/admin/banner-slots`
- Create a new banner slot
- Body:
  ```json
  {
    "name": "Homepage Hero",
    "slug": "homepage-hero",
    "description": "Main banner on homepage",
    "location": "homepage",
    "max_width": 1200,
    "max_height": 300,
    "aspect_ratio": "16:9",
    "rotation_delay": 5000,
    "is_active": true,
    "sort_order": 0
  }
  ```

**GET** `/api/admin/banner-slots/:id`
- Fetch a specific slot with all its banners

**PUT** `/api/admin/banner-slots/:id`
- Update a slot
- Body: Same as POST (all fields optional except name/slug if required)

**DELETE** `/api/admin/banner-slots/:id`
- Delete a slot (cascades to delete all banners in the slot)

### Banners Management

**GET** `/api/admin/banner-slots/:slotId/banners`
- Fetch all banners for a slot
- Query params: `?activeOnly=true` (optional - only active banners)

**POST** `/api/admin/banner-slots/:slotId/banners`
- Create a new banner
- Body:
  ```json
  {
    "title": "Summer Sale",
    "image_url": "/uploads/banner.jpg",
    "link_url": "https://example.com/sale",
    "alt_text": "Summer Sale Banner",
    "description": "Check out our summer sale",
    "is_active": true,
    "sort_order": 0
  }
  ```

**GET** `/api/admin/banner-slots/:slotId/banners/:bannerId`
- Fetch a specific banner

**PUT** `/api/admin/banner-slots/:slotId/banners/:bannerId`
- Update a banner
- Body: Same as POST (all fields optional)

**DELETE** `/api/admin/banner-slots/:slotId/banners/:bannerId`
- Delete a banner

**PATCH** `/api/admin/banner-slots/:slotId/banners/:bannerId`
- Record a banner click (increments click_count)

**PUT** `/api/admin/banner-slots/:slotId/banners`
- Reorder banners
- Body:
  ```json
  {
    "bannerIds": [3, 1, 2]  // Array of banner IDs in desired order
  }
  ```

## Admin Interface

Navigate to `/admin/banner-slots` to manage banner slots and banners.

### Create a Banner Slot

1. Click "New Banner Slot"
2. Fill in the form:
   - **Name**: Unique name for the slot (e.g., "Homepage Hero")
   - **Slug**: URL-friendly identifier (e.g., "homepage-hero")
   - **Location**: Where the slot appears (e.g., "homepage", "sidebar")
   - **Aspect Ratio**: Choose from 16:9, 4:3, 1:1, 3:2
   - **Max Width/Height**: Size constraints in pixels
   - **Rotation Delay**: Time between banner rotations in milliseconds
   - **Active**: Toggle to activate/deactivate the slot
3. Click "Create Slot"

### Manage Banners

1. Find the slot in the list
2. Click "Manage Banners"
3. Click "Add Banner" to create a new banner
4. Fill in:
   - **Image**: Upload or select image (required)
   - **Title**: Banner title (optional)
   - **Link URL**: URL to navigate to on click (optional)
   - **Alt Text**: Accessibility text (optional)
   - **Description**: Banner description (optional)
   - **Active**: Toggle banner status
5. Click "Create" to save

## Using Banners on Your Website

### Display a Banner Slot

Use the `BannerSlotRenderer` component to display a banner slot anywhere on your site:

```jsx
import BannerSlotRenderer from '@/components/BannerSlotRenderer';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome</h1>
      
      {/* Display banner by slot slug */}
      <BannerSlotRenderer slotSlug="homepage-hero" />
      
      <p>Your content here...</p>
    </div>
  );
}
```

### Props

- **slotSlug** (required): The slug of the banner slot to display (e.g., "homepage-hero")
- **className** (optional): CSS class for styling

### Features

- Automatic banner rotation based on slot's rotation_delay
- Clickable rotation dots to jump to specific banners
- Click tracking on banners
- Responsive design
- Falls back gracefully if no banners available

### Example: Using in News Box

```jsx
// In a NewsBox component
import BannerSlotRenderer from '@/components/BannerSlotRenderer';

export default function NewsBox() {
  return (
    <div className={styles.newsBox}>
      {/* Display rotating banner */}
      <BannerSlotRenderer slotSlug="news-spot" className={styles.banner} />
      
      {/* Your news content */}
      <div className={styles.content}>
        {/* news items... */}
      </div>
    </div>
  );
}
```

## Library Functions

The banner system includes a complete library in `src/lib/banner-slots.js`:

### Slot Functions

```javascript
// Get all banner slots
const slots = await getBannerSlots(activeOnly = false);

// Get a single slot by ID or slug
const slot = await getBannerSlot(identifier);

// Create a new slot
const slot = await createBannerSlot(data, userId);

// Update a slot
const updated = await updateBannerSlot(id, data);

// Delete a slot (cascades to banners)
await deleteBannerSlot(id);

// Get slot with all its banners
const slot = await getBannerSlotWithBanners(identifier, activeOnly = false);
```

### Banner Functions

```javascript
// Get all banners for a slot
const banners = await getBannersBySlot(slotId, activeOnly = false);

// Get a single banner
const banner = await getBanner(id);

// Create a new banner
const banner = await createBanner(data, userId);

// Update a banner
const updated = await updateBanner(id, data);

// Delete a banner
await deleteBanner(id);

// Record a banner click
await recordBannerClick(bannerId);

// Reorder banners
await reorderBanners([id1, id2, id3]);
```

## Migration

To set up the database tables, run the migration:

```sql
-- Run this SQL to create the tables
-- File: migrations/add-banner-slots.sql
```

Or copy the SQL from the migration file and run it in your database.

## Admin Sidebar

The Banner Slots link has been added to the admin sidebar under "חריטות בנרים" (Banner Slots) in Hebrew.

## Examples

### Simple Homepage Hero

```jsx
// page.js
import BannerSlotRenderer from '@/components/BannerSlotRenderer';

export default function Home() {
  return (
    <>
      <BannerSlotRenderer slotSlug="homepage-hero" />
      {/* rest of home page */}
    </>
  );
}
```

### Multiple Slots

```jsx
export default function HomePage() {
  return (
    <div>
      <BannerSlotRenderer slotSlug="top-banner" />
      
      <div className="main-content">
        {/* content */}
      </div>
      
      <BannerSlotRenderer slotSlug="sidebar-banner" />
    </div>
  );
}
```

### With Custom Styling

```jsx
import BannerSlotRenderer from '@/components/BannerSlotRenderer';
import styles from './page.module.css';

export default function NewsPage() {
  return (
    <div className={styles.container}>
      <BannerSlotRenderer 
        slotSlug="news-featured" 
        className={styles.bannerSlot}
      />
    </div>
  );
}
```

## Click Tracking

Clicks on banners are automatically tracked. The `click_count` field in the banners table increments each time a banner is clicked.

To check analytics:
1. Go to the Banner Slots admin page
2. Click "Manage Banners" for a slot
3. Each banner shows its click count

## Troubleshooting

### Banners not displaying
- Check that the slot is active (`is_active = 1`)
- Check that banners are active
- Verify the slot slug is correct
- Check browser console for errors

### Rotation not working
- Verify rotation_delay is set (in milliseconds, default 5000)
- Check that there are multiple banners in the slot
- Ensure banners are active

### Images not loading
- Verify image_url is correct and accessible
- Check image file permissions
- Try re-uploading the image

## Performance Considerations

- Banner queries are indexed for fast lookups
- Banners are only fetched for active slots by default
- Click tracking uses a simple increment query
- Consider caching slot data if you have many slots

## Future Enhancements

Possible improvements:
- Banner scheduling (show between specific dates/times)
- Geolocation-based banner selection
- A/B testing variants
- Advanced analytics
- Banner groups/categories
- Transitions/animations options
