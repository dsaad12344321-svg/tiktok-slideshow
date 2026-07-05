---
name: tiktok-slideshow-generator
description: >
  Generates TikTok Content Rewards (Slideshows) campaign slides in Arabic. 
  Creates 6-slide photo slideshows with luxury imagery, Arabic text, glass morphism 
  design cards and a canvas-based 1080x1920 PNG export engine. No filming, 
  no voiceover, no face needed. Follows all Content Rewards rules including 
  mandatory Content Rewards slide (Slide 4), CTA comment-to-DM flow, 
  and #contentrewardspartner hashtag.
---

# TikTok Content Rewards Arabic Slideshow Generator Skill

This skill enables building a React Vite web application that creates, customizes, and exports 
high-quality Arabic-language TikTok slideshows for the Content Rewards campaign.

## Campaign Rules (Always Enforced)
- `#contentrewardspartner` hashtag must appear on every post
- **Slide 4 is mandatory** — missing it = rejection
- CTA must appear BOTH in video AND caption
- Comment-to-DM flow required (ManyChat/CommentShark automation)
- Custom referral link must be in bio
- Submit every video (no submission = no payout)

## Slideshow Structure

| Slide | Type | Content |
|-------|------|---------|
| 1 | Hook | Strong Arabic hook + luxury scroll-stopper image (Cars, Watches, Yacht, Lifestyle) |
| 2 | Opportunity | Explain clipping/slideshow opportunity overlaid on luxury image |
| 3 | Details | How it works (beginner-friendly, phone only) |
| 4 | **Content Rewards** | **CRITICAL** — Explains the specific Content Rewards program and its payout mechanism |
| 5 | Why Clipping | Benefits: $0 start, no investment, high margins, beginner, social media only |
| 6 | CTA | Comment keyword (e.g. "CR") → automated DM with referral link |

## Image Categories
- **Slide 1 (Scroll Stopper):** hypercars, luxury watches, yachts, mirror selfies, luxury lifestyle
- **Slides 2–6:** infinity pools, tropical resorts, Dubai/NYC/Tokyo skylines, laptops, modern workspaces

## Arabic Content Templates
Templates are stored in `src/data/arabicContent.js` with arrays for:
- `slide1Hooks` — 5+ diverse Arabic hooks
- `slide2Opportunity` — 3 variants explaining clipping
- `slide3Details` — 3 variants on how to start
- `slide4ContentRewards` — 3 variants explaining the program
- `slide5Benefits` — 2 variants with bullet points
- `slide6CTA` — 3 variants with different keywords (CR, مهتم, رابط)

## Technical Implementation
- **Framework:** React + Vite
- **Fonts:** Cairo, Tajawal (Google Fonts — Arabic), Outfit (English UI)
- **Canvas:** HTML5 Canvas API for 1080×1920px PNG export
  - Draws background (cover fit), dark overlay, hashtag box, glass card, title, subtitle, body, points list, CTA pill
  - RTL text direction: `ctx.direction = 'rtl'`
  - Custom `wrapCanvasText()` function handles Arabic word wrapping
- **CORS Fix:** Images fetched as Blobs via `corsproxy.io` before drawing to canvas (prevents tainted canvas issue)
- **Download:** `canvas.toBlob()` → `URL.createObjectURL()` → `<a>` programmatic click → `document.body.appendChild/removeChild` pattern

## Key Design Decisions
1. Each click of "Generate" picks random templates from all arrays AND random image selections
2. CORS proxy (corsproxy.io) with direct-fetch fallback ensures download always works
3. `triggerDownload()` appends `<a>` to body before clicking — required for Firefox compatibility
4. `canvas.toBlob()` preferred over `toDataURL()` — avoids memory spikes with large images
5. 1200ms delay between slide downloads allows browser to register each file sequentially

## Deployment
- Hosted on Vercel (auto-deploy from GitHub)
- No backend needed — fully static (client-side only)
- `npm run build` → `dist/` folder is the deployable artifact
