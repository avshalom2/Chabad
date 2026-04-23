# Banner Slots in Admin Settings/Templates

## Setup

The banner slot integration is now complete. Here's how to use it:

## 1. Create Banner Slots

First, create banner slots with IDs:
- Go to `/admin/banner-slots`
- Create slots (note their numeric IDs)
- Add banners to each slot

Example slots:
- ID: 1 → "Homepage Hero"
- ID: 2 → "News Featured"
- ID: 3 → "Sidebar Promo"

## 2. Add Banners to Templates

When editing a template/settings page:

### Option A: Via Admin Settings
1. Go to `/admin/settings`
2. Click on a template to edit
3. Look for divs with `data-type="CONTROL_BANNER"`
4. Click on such a div to edit
5. Select your banner slot from the dropdown
6. Click "Insert Banner Slot"
7. The code `<banner_slot id="X"/>` is generated

### Option B: Direct HTML Entry
1. Go to `/admin/settings`
2. Click "Edit HTML" (in toolbar)
3. Inside any `<div class="content-placeholder">`, add:
   ```html
   <banner_slot id="1"/>
   ```
4. Click "Apply Changes"

## 3. Frontend Setup

### For Homepage/Templates
If using DynamicPageRenderer or similar:

```jsx
import BannerSlotProcessor from '@/components/BannerSlotProcessor';

export default function HomePage() {
  const templateHtml = `
    <div class="content-placeholder"><banner_slot id="1"/></div>
    <!-- other content -->
  `;

  return <BannerSlotProcessor html={templateHtml} />;
}
```

### For Other Pages
Use BannerSlotRenderer directly:

```jsx
import BannerSlotRenderer from '@/components/BannerSlotRenderer';

export default function NewsPage() {
  return (
    <div>
      {/* By ID */}
      <BannerSlotRenderer slotId={1} />
      
      {/* OR by slug */}
      <BannerSlotRenderer slotSlug="homepage-hero" />
    </div>
  );
}
```

## 4. Mark Template Divs

To make banner slot editing available in admin settings:

Edit your template HTML and add `data-type="CONTROL_BANNER"` to placeholders:

```html
<div class="content-placeholder" data-type="CONTROL_BANNER">
  <banner_slot id="1"/>
</div>
```

Then when you click on that div in settings, the banner slot selector appears.

## How It Works

1. **Admin**: Selects banner slot → code `<banner_slot id="1"/>` is inserted
2. **Frontend**: `BannerSlotProcessor` finds all `<banner_slot id="X"/>` tags
3. **Display**: Each tag is replaced with `<BannerSlotRenderer slotId={X}/>`
4. **Component**: BannerSlotRenderer fetches the slot data and displays rotating banners

## Supported Formats

All these work:

```html
<!-- Self-closing -->
<banner_slot id="1"/>

<!-- With spaces -->
<banner_slot  id="1"  />

<!-- Single quotes -->
<banner_slot id='1'/>

<!-- Double quotes -->
<banner_slot id="1"/>

<!-- Can be nested in divs -->
<div class="wrapper">
  <banner_slot id="1"/>
</div>
```

## API Endpoints Used

The component automatically uses:
- `GET /api/admin/banner-slots/:id` - Fetch slot by ID
- `GET /api/admin/banner-slots/:slug` - Fetch slot by slug (shows active banners)

## BannerSlotRenderer Props

```jsx
<BannerSlotRenderer
  slotId={1}              // Numeric slot ID (recommended for templates)
  slotSlug="homepage-hero" // OR slug identifier (recommended for direct use)
  className="custom-class" // Optional CSS class
/>
```

**Choose one:**
- Use `slotId` when inserting from templates (`<banner_slot id="1"/>`)
- Use `slotSlug` when using directly in code

## Files Involved

- **Editor**: `src/components/editors/BannerSlotControlEditor.js`
- **Processor**: `src/components/BannerSlotProcessor.js`
- **Renderer**: `src/components/BannerSlotRenderer.js`
- **Template Editor**: `src/components/TemplateEditor.js` (updated)

## Workflow Example

1. Admin creates slot with ID=1, name="Homepage Hero"
2. Admin adds 2 banners to the slot with URLs
3. Admin goes to settings, edits template
4. Admin clicks on CONTROL_BANNER div
5. Banner slot selector opens
6. Admin selects slot ID=1
7. Code `<banner_slot id="1"/>` is inserted
8. Admin saves template
9. Frontend renders the template
10. `BannerSlotProcessor` finds `<banner_slot id="1"/>`
11. Creates `<BannerSlotRenderer slotId={1}/>`
12. Banners rotate automatically

## CSS Customization

Style the banner container:

```css
.banner-slot-container {
  margin: 1rem 0;
  border-radius: 8px;
}
```

The `BannerSlotRenderer` component itself can be styled via props:

```jsx
<BannerSlotRenderer slotId={1} className="my-custom-banner" />
```

## Troubleshooting

**Banners not showing?**
- Check banner slot is active
- Check banners are active
- Check slot ID is correct in template
- Check console for errors

**Selector not appearing in admin?**
- Make sure div has `data-type="CONTROL_BANNER"`
- Make sure it's a `.content-placeholder` div
- Try refreshing the page

**Wrong banner showing?**
- Verify the slot ID in the template
- Check which banners are active in that slot

## Next Steps

You mentioned wanting to show how the carousel should be designed. When you're ready, we can:
1. Customize the rotation animations
2. Adjust the navigation dots styling
3. Add different carousel layouts
4. Implement different transition effects

Just show me the design you want!
