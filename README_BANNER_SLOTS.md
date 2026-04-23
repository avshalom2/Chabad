# 🎯 Banner Slots System - Master Index

Welcome! This is your entry point to the complete banner management system.

## 📚 Documentation Files (Read in Order)

### 1. **START HERE** → [BANNER_SLOTS_IMPLEMENTATION_SUMMARY.md](./BANNER_SLOTS_IMPLEMENTATION_SUMMARY.md)
   - What was built
   - File locations
   - Quick overview
   - **Read time: 5 minutes**

### 2. **THEN THIS** → [BANNER_SLOTS_QUICK_START.md](./BANNER_SLOTS_QUICK_START.md)
   - Setup steps
   - Common tasks
   - Integration examples
   - Quick reference
   - **Read time: 10 minutes**

### 3. **ARCHITECTURE** → [BANNER_SLOTS_ARCHITECTURE.md](./BANNER_SLOTS_ARCHITECTURE.md)
   - System architecture diagram
   - Data model
   - Usage flows
   - Quick reference guide
   - **Read time: 10 minutes**

### 4. **FULL REFERENCE** → [BANNER_SLOTS_DOCUMENTATION.md](./BANNER_SLOTS_DOCUMENTATION.md)
   - Complete API reference
   - All library functions
   - Database schema details
   - Advanced features
   - Troubleshooting
   - **Read time: 30 minutes**

### 5. **VERIFY SETUP** → [BANNER_SLOTS_SETUP_CHECKLIST.md](./BANNER_SLOTS_SETUP_CHECKLIST.md)
   - Setup verification checklist
   - Testing procedures
   - Functionality tests
   - Production readiness
   - **Use as: Testing guide**

## 🚀 Quick Start (3 Steps)

### Step 1: Database Migration
```sql
-- Execute: migrations/add-banner-slots.sql
-- Creates: banner_slots and banners tables
```

### Step 2: Create First Banner Slot
```
1. Go to /admin/banner-slots
2. Click "+ New Banner Slot"
3. Fill form:
   - Name: "Homepage Hero"
   - Slug: "homepage-hero"
   - Location: "homepage"
4. Click "Create Slot"
```

### Step 3: Display on Page
```jsx
import BannerSlotRenderer from '@/components/BannerSlotRenderer';

export default function HomePage() {
  return <BannerSlotRenderer slotSlug="homepage-hero" />;
}
```

**Done!** Banners now rotating on your page.

## 📂 File Structure

```
All files created in: c:/My/Projects/chabad2.0/chabadhnextjs/

Key locations:
├── Database         → migrations/add-banner-slots.sql
├── Library          → src/lib/banner-slots.js
├── Admin UI         → src/app/admin/banner-slots/
├── Components       → src/components/BannerSlotRenderer.js
├── API Routes       → src/app/api/admin/banner-slots/
├── Admin Link       → Updated: src/app/admin/layout.js
└── Docs             → BANNER_SLOTS_*.md (this folder)
```

## 🎨 Key Features

✓ Multiple rotating banners per slot  
✓ Unique URL per banner  
✓ Click tracking  
✓ Active/inactive control  
✓ Responsive design  
✓ Easy admin interface  
✓ Customizable timing  
✓ Image upload  
✓ Drag-to-reorder (dots)  

## 🔗 URLs

| Page | URL |
|------|-----|
| Admin Panel | `/admin/banner-slots` |
| Test Display | Add to any page: `<BannerSlotRenderer slotSlug="..." />` |
| Sidebar Link | "חריטות בנרים" (Banner Slots) in admin sidebar |

## 💡 Common Tasks

### Display a banner slot on a page
```jsx
<BannerSlotRenderer slotSlug="homepage-hero" />
```

### Add to existing component (like NewsBox)
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

### Create banner programmatically
```javascript
import { createBanner } from '@/lib/banner-slots';

await createBanner({
  banner_slot_id: 1,
  image_url: '/uploads/banner.jpg',
  link_url: 'https://example.com',
  title: 'Click here',
  is_active: true
}, userId);
```

### Get slot with all banners
```javascript
import { getBannerSlotWithBanners } from '@/lib/banner-slots';

const slot = await getBannerSlotWithBanners('homepage-hero', activeOnly = true);
```

## 📊 Data Model

### banner_slots table
- Stores locations for banners
- Fields: name, slug, description, location, max_width, max_height, rotation_delay, etc.

### banners table
- Stores individual banners
- Fields: image_url ⭐, link_url ⭐, title, alt_text, click_count, etc.

## 🛠️ API Endpoints Summary

```
GET  /api/admin/banner-slots              # Get all
POST /api/admin/banner-slots              # Create slot
GET  /api/admin/banner-slots/:id          # Get slot
PUT  /api/admin/banner-slots/:id          # Update slot
DELETE /api/admin/banner-slots/:id        # Delete slot

GET  /api/admin/banner-slots/:id/banners              # Get banners
POST /api/admin/banner-slots/:id/banners              # Create banner
PUT  /api/admin/banner-slots/:id/banners/:bannerId    # Update banner
DELETE /api/admin/banner-slots/:id/banners/:bannerId  # Delete banner
PATCH /api/admin/banner-slots/:id/banners/:bannerId   # Track click
```

## 📋 Library Functions

**20+ functions available:**

Slots: `getBannerSlots`, `getBannerSlot`, `createBannerSlot`, `updateBannerSlot`, `deleteBannerSlot`, `getBannerSlotWithBanners`

Banners: `getBannersBySlot`, `getBanner`, `createBanner`, `updateBanner`, `deleteBanner`, `recordBannerClick`, `reorderBanners`

See full list in: [BANNER_SLOTS_DOCUMENTATION.md](./BANNER_SLOTS_DOCUMENTATION.md#library-functions)

## ✅ Verification Steps

1. ✓ Run database migration
2. ✓ Check `/admin/banner-slots` loads
3. ✓ Create test banner slot
4. ✓ Add test banners
5. ✓ Display on test page
6. ✓ Verify rotation works
7. ✓ Test click tracking
8. ✓ Ready for production!

See detailed checklist: [BANNER_SLOTS_SETUP_CHECKLIST.md](./BANNER_SLOTS_SETUP_CHECKLIST.md)

## 🎓 Learning Path

**Beginner** (First Use):
1. Read: BANNER_SLOTS_QUICK_START.md
2. Do: Create first banner slot
3. Do: Add banners
4. Do: Display on page

**Intermediate** (Custom Integration):
1. Read: BANNER_SLOTS_ARCHITECTURE.md
2. Read: BANNER_SLOTS_DOCUMENTATION.md (sections 1-5)
3. Do: Integrate into components
4. Do: Customize styling
5. Do: Test functionality

**Advanced** (API Integration):
1. Read: Full BANNER_SLOTS_DOCUMENTATION.md
2. Study: API Endpoints section
3. Study: Library Functions section
4. Create: Custom admin pages
5. Create: Custom queries/mutations
6. Implement: Analytics features

## 🔧 Troubleshooting

**Banners not showing?**
- Check slot is active
- Check banners are active
- See: BANNER_SLOTS_DOCUMENTATION.md → Troubleshooting

**API errors?**
- Check database tables exist
- Check API routes are created
- See: BANNER_SLOTS_SETUP_CHECKLIST.md → Database Setup

**Display issues?**
- Check component slug matches
- Check browser console
- See: BANNER_SLOTS_DOCUMENTATION.md → Troubleshooting

## 📞 Support

- Full docs: [BANNER_SLOTS_DOCUMENTATION.md](./BANNER_SLOTS_DOCUMENTATION.md)
- Quick help: [BANNER_SLOTS_QUICK_START.md](./BANNER_SLOTS_QUICK_START.md)
- Architecture: [BANNER_SLOTS_ARCHITECTURE.md](./BANNER_SLOTS_ARCHITECTURE.md)
- Setup help: [BANNER_SLOTS_SETUP_CHECKLIST.md](./BANNER_SLOTS_SETUP_CHECKLIST.md)

## 📝 What's Included

✅ **Backend:**
- Database schema (2 tables)
- Library functions (20+)
- API endpoints (8 routes)
- Database migrations

✅ **Frontend:**
- Display component
- Admin interface
- Responsive CSS
- Rotation animations

✅ **Documentation:**
- Quick start guide
- Full API reference
- Architecture guide
- Setup checklist
- This master index

✅ **Admin:**
- New sidebar link
- Complete admin UI
- Banner management modal
- Image upload support

## 🎯 Next Steps

1. **Read** [BANNER_SLOTS_IMPLEMENTATION_SUMMARY.md](./BANNER_SLOTS_IMPLEMENTATION_SUMMARY.md) (5 min)
2. **Run** database migration (1 min)
3. **Visit** `/admin/banner-slots` in browser (1 min)
4. **Create** first banner slot (2 min)
5. **Add** first banners (2 min)
6. **Display** on a page (2 min)

**Total time to first working banner: ~15 minutes**

---

## 📚 Document Reference

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **BANNER_SLOTS_IMPLEMENTATION_SUMMARY.md** | Overview of what was built | 5 min |
| **BANNER_SLOTS_QUICK_START.md** | Get started quickly | 10 min |
| **BANNER_SLOTS_ARCHITECTURE.md** | Understand the system | 10 min |
| **BANNER_SLOTS_DOCUMENTATION.md** | Complete reference | 30 min |
| **BANNER_SLOTS_SETUP_CHECKLIST.md** | Verify everything works | 20 min |

---

**Start here:** [BANNER_SLOTS_IMPLEMENTATION_SUMMARY.md](./BANNER_SLOTS_IMPLEMENTATION_SUMMARY.md)

**Questions?** Check the appropriate documentation file above.

**Ready to build?** Go to `/admin/banner-slots` and create your first banner slot!

---

Created: 2026-04-13  
Status: ✅ Complete & Ready to Use  
Version: 1.0
