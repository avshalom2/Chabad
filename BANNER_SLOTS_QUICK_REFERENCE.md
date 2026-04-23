# 📋 BANNER SLOTS - QUICK REFERENCE CARD

## 🎯 3-Step Setup

```
1️⃣  RUN SQL
    └─ migrations/add-banner-slots.sql

2️⃣  CREATE SLOT
    └─ /admin/banner-slots → New Banner Slot

3️⃣  DISPLAY
    └─ <BannerSlotRenderer slotSlug="..." />
```

---

## 🔗 Key URLs

| Purpose | URL |
|---------|-----|
| Admin Panel | `/admin/banner-slots` |
| Sidebar Link | "חריטות בנרים" |

---

## 📦 Display Code

### Basic
```jsx
<BannerSlotRenderer slotSlug="homepage-hero" />
```

### With Class
```jsx
<BannerSlotRenderer slotSlug="homepage-hero" className={styles.banner} />
```

---

## 🔌 Library Functions

```javascript
import {
  getBannerSlots,           // Get all slots
  getBannerSlotWithBanners, // Get slot + banners
  createBanner,             // Create banner
  updateBanner,             // Update banner
  deleteBanner,             // Delete banner
  recordBannerClick         // Track click
} from '@/lib/banner-slots';
```

---

## 🛠️ API Endpoints

```
GET    /api/admin/banner-slots
POST   /api/admin/banner-slots
GET    /api/admin/banner-slots/:id
PUT    /api/admin/banner-slots/:id
DELETE /api/admin/banner-slots/:id

GET    /api/admin/banner-slots/:id/banners
POST   /api/admin/banner-slots/:id/banners
GET    /api/admin/banner-slots/:id/banners/:bannerId
PUT    /api/admin/banner-slots/:id/banners/:bannerId
DELETE /api/admin/banner-slots/:id/banners/:bannerId
PATCH  /api/admin/banner-slots/:id/banners/:bannerId
```

---

## 📁 File Locations

| What | Where |
|------|-------|
| Library | `src/lib/banner-slots.js` |
| Admin UI | `src/app/admin/banner-slots/page.js` |
| Component | `src/components/BannerSlotRenderer.js` |
| Database | `migrations/add-banner-slots.sql` |
| APIs | `src/app/api/admin/banner-slots/**` |

---

## 💡 Common Tasks

### Create Slot (API)
```javascript
fetch('/api/admin/banner-slots', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Homepage Hero',
    slug: 'homepage-hero',
    location: 'homepage',
    max_width: 1200,
    max_height: 300,
    is_active: true
  })
})
```

### Create Banner (API)
```javascript
fetch('/api/admin/banner-slots/1/banners', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image_url: '/uploads/banner.jpg',
    link_url: 'https://example.com',
    title: 'Sale Banner',
    is_active: true
  })
})
```

### Get Slot (Library)
```javascript
import { getBannerSlotWithBanners } from '@/lib/banner-slots';

const slot = await getBannerSlotWithBanners('homepage-hero', true);
```

---

## 📊 Database Schema

### banner_slots
```
name, slug, location
max_width, max_height, aspect_ratio
rotation_delay, is_active, sort_order
```

### banners
```
banner_slot_id, image_url ⭐, link_url ⭐
title, alt_text, description
is_active, sort_order, click_count
```

---

## 🎨 Component Props

```jsx
<BannerSlotRenderer 
  slotSlug="homepage-hero"     // Required
  className="custom-class"    // Optional
/>
```

---

## ✅ Admin Features

✓ Create/edit/delete slots  
✓ Manage banners in modal  
✓ Upload images  
✓ Set URLs  
✓ Control rotation  
✓ View click tracking  
✓ Toggle active/inactive  

---

## 🚀 Quick Integration

**Add to NewsBox.js:**
```jsx
import BannerSlotRenderer from '@/components/BannerSlotRenderer';

export default function NewsBox() {
  return (
    <>
      <BannerSlotRenderer slotSlug="news-featured" />
      {/* existing content */}
    </>
  );
}
```

---

## 📚 Documentation

1. `README_BANNER_SLOTS.md` - Master index
2. `BANNER_SLOTS_QUICK_START.md` - Setup guide
3. `BANNER_SLOTS_ARCHITECTURE.md` - System design
4. `BANNER_SLOTS_DOCUMENTATION.md` - Full reference
5. `BANNER_SLOTS_SETUP_CHECKLIST.md` - Testing

---

## ⚡ Features

✓ Multiple rotating banners per slot  
✓ Click tracking  
✓ Responsive design  
✓ Image upload  
✓ Custom URLs per banner  
✓ Active/inactive control  
✓ Auto-rotation  

---

## 🔍 Troubleshooting

**Not showing?**
- Check slot active
- Check banners active
- Check slug correct

**API errors?**
- Check tables exist
- Check API files created
- Check console for errors

**Display issues?**
- Check component slug
- Check browser console
- See full docs

---

## 📞 Quick Help

| Issue | See |
|-------|-----|
| Setup | BANNER_SLOTS_QUICK_START.md |
| API | BANNER_SLOTS_DOCUMENTATION.md |
| Admin | `/admin/banner-slots` |
| Component | BannerSlotRenderer.js |

---

## 🎯 Getting Started

1. Run: `migrations/add-banner-slots.sql`
2. Go to: `/admin/banner-slots`
3. Create slot
4. Add banners
5. Display: `<BannerSlotRenderer slotSlug="..." />`
6. ✅ Done!

---

## 📋 Checklist

- [ ] Database migration executed
- [ ] `/admin/banner-slots` loads
- [ ] Can create banner slot
- [ ] Can add banners
- [ ] Can display component
- [ ] Banners rotate
- [ ] Links work
- [ ] Click tracking works

---

**Setup Time: ~15 minutes**  
**Status: Production Ready ✅**

Print this card and keep it nearby!
