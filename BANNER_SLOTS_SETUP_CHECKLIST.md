# Banner Slots System - Setup Checklist

## ✅ System Complete

This checklist helps you verify everything is in place and working.

## Database Setup

- [ ] **Run Migration SQL**
  - File: `migrations/add-banner-slots.sql`
  - Execute in your MySQL database
  - Verify 2 tables created:
    - `banner_slots`
    - `banners`
  - Verify columns exist (check schema in migration file)

## Code Files Created

### Library & Functions
- [ ] `src/lib/banner-slots.js` - Contains 20+ functions
- [ ] Check that functions are exported in `src/lib/index.js`

### API Endpoints
- [ ] `src/app/api/admin/banner-slots/route.js` - Main CRUD
- [ ] `src/app/api/admin/banner-slots/[id]/route.js` - Single slot
- [ ] `src/app/api/admin/banner-slots/[id]/banners/route.js` - Banners list
- [ ] `src/app/api/admin/banner-slots/[id]/banners/[bannerId]/route.js` - Single banner

### Admin Interface
- [ ] `src/app/admin/banner-slots/page.js` - Admin UI
- [ ] `src/app/admin/banner-slots/banner-slots.module.css` - Styles
- [ ] Check sidebar includes banner-slots link in `/admin/layout.js`

### Components
- [ ] `src/components/BannerSlotRenderer.js` - Display component
- [ ] `src/components/BannerSlotRenderer.module.css` - Component styles

### Documentation
- [ ] `BANNER_SLOTS_DOCUMENTATION.md` - Full docs
- [ ] `BANNER_SLOTS_QUICK_START.md` - Quick guide
- [ ] `BANNER_SLOTS_IMPLEMENTATION_SUMMARY.md` - Summary

## Functionality Tests

### Admin Panel Access
- [ ] Go to `/admin/banner-slots`
- [ ] Page loads without errors
- [ ] See "Banner Slots Management" heading
- [ ] See "+ New Banner Slot" button

### Create Banner Slot
- [ ] Click "+ New Banner Slot"
- [ ] Form appears with fields:
  - Name
  - Slug
  - Location
  - Max Width/Height
  - Aspect Ratio
  - Rotation Delay
  - Description
  - Active checkbox
- [ ] Fill form and click "Create Slot"
- [ ] Slot appears in the list below

### Manage Banners
- [ ] Find created slot in list
- [ ] Click "Manage Banners"
- [ ] Modal opens with empty banners list
- [ ] See "+ Add Banner" button
- [ ] Click "+ Add Banner"
- [ ] Form appears with fields:
  - Image upload
  - Title
  - Link URL
  - Alt Text
  - Description
  - Active checkbox
- [ ] Upload an image
- [ ] Enter optional details (URL, title, etc.)
- [ ] Click "Create"
- [ ] Banner appears in the list

### Test Display Component

**Create a test page:**

```jsx
// app/test-banners/page.js
import BannerSlotRenderer from '@/components/BannerSlotRenderer';

export default function TestPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Banner Test</h1>
      <BannerSlotRenderer slotSlug="your-slot-slug" />
      <p>Content below banner</p>
    </div>
  );
}
```

- [ ] Go to `/test-banners`
- [ ] Banner displays correctly
- [ ] Banner loads image
- [ ] If only 1 banner: no dots shown
- [ ] If 2+ banners: rotation dots appear
- [ ] Dots auto-rotate banner
- [ ] Can click dots to jump to banner
- [ ] Can click banner if URL set (opens in new tab)

### Test Rotation
- [ ] Add 2+ banners to a slot
- [ ] Set rotation_delay to 2000ms (2 seconds)
- [ ] Watch banners rotate automatically
- [ ] Can click dots to change banner
- [ ] Banner changes smoothly

### Test Image Upload
- [ ] Try uploading a banner image via admin
- [ ] Image uploads successfully
- [ ] Thumbnails preview in admin
- [ ] Images display on page correctly

### Test Link URLs
- [ ] Add a banner with a link URL
- [ ] Click banner on page
- [ ] Link opens in new tab
- [ ] Verify link is correct

### Test Active/Inactive
- [ ] Toggle banner "Active" → "Inactive"
- [ ] Save changes
- [ ] Refresh page
- [ ] Inactive banner disappears from display
- [ ] Toggle back to active
- [ ] Banner reappears

## Performance Checks

- [ ] Admin page loads quickly (< 2s)
- [ ] Creating banners is responsive
- [ ] Uploading images works smoothly
- [ ] Component renders without lag
- [ ] Rotation is smooth

## Browser Compatibility

- [ ] Desktop Chrome: Works
- [ ] Desktop Firefox: Works
- [ ] Safari: Works
- [ ] Mobile Chrome: Works
- [ ] Mobile Safari: Works

## Documentation Review

- [ ] Read `BANNER_SLOTS_QUICK_START.md`
- [ ] Understand basic usage
- [ ] Read full `BANNER_SLOTS_DOCUMENTATION.md`
- [ ] Understand all features
- [ ] Know how to use API endpoints
- [ ] Know all library functions

## Integration Readiness

### Can integrate with existing components:
- [ ] NewsBox component
- [ ] EventsBox component
- [ ] ShabbatBox component
- [ ] Custom pages
- [ ] Any other component

### Test Integration Example:

```jsx
// Modify existing component
import BannerSlotRenderer from '@/components/BannerSlotRenderer';

// Add in JSX:
<BannerSlotRenderer slotSlug="news-banner" />
```

- [ ] Add to test component
- [ ] Component still works
- [ ] Banner displays correctly
- [ ] No CSS conflicts

## Advanced Features

- [ ] Test click tracking (check database)
- [ ] Test banner reordering via API
- [ ] Test filtering active banners only
- [ ] Test aspect ratio changes
- [ ] Test different max width/height settings

## Troubleshooting Completed

If any issues found:

- [ ] Check console for JavaScript errors
- [ ] Check Network tab for API errors
- [ ] Verify database tables exist
- [ ] Verify API endpoints return data
- [ ] Check file permissions
- [ ] Verify images are accessible

## Production Ready Checklist

- [ ] All tests passed
- [ ] No errors in console
- [ ] No errors in server logs
- [ ] All documentation read
- [ ] Team trained on usage
- [ ] Admin interface matches requirements
- [ ] Component works as expected
- [ ] Ready for users to create banners

## First Real Usage

### Create production banners:

1. [ ] Create first banner slot for homepage
   - Name: "Homepage Hero"
   - Slug: "homepage-hero"
   - Location: "homepage"

2. [ ] Add 2-3 banners to homepage slot
   - Upload production images
   - Add marketing URLs if needed
   - Set rotation to 5000ms (5 seconds)

3. [ ] Add display component to homepage
   ```jsx
   <BannerSlotRenderer slotSlug="homepage-hero" />
   ```

4. [ ] Test on production site
   - Verify display
   - Verify rotation
   - Verify links
   - Check mobile display

5. [ ] Create additional slots as needed
   - Sidebar banners
   - Featured spots
   - Promotional areas

## Maintenance

- [ ] Check click tracking regularly
- [ ] Update banners seasonally
- [ ] Review analytics
- [ ] Test new features
- [ ] Keep documentation updated

## All Set! 🎉

Once all checkboxes are complete, your banner slots system is:
- ✅ Installed
- ✅ Tested
- ✅ Documented
- ✅ Ready for production use

**Start using it at:** `/admin/banner-slots`

**Display banners with:**
```jsx
<BannerSlotRenderer slotSlug="your-slot-slug" />
```

---

## Support

**Issues?** See `BANNER_SLOTS_DOCUMENTATION.md` Troubleshooting section

**Questions?** Check `BANNER_SLOTS_QUICK_START.md` for common tasks

**Need custom features?** Check "Future Enhancements" in full documentation
