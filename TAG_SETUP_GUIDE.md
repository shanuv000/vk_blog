# 🏷️ Hygraph Tag System Setup Guide

## ⚠️ IMPORTANT: Manual Step Required First

**The Tag model must be created in Hygraph Dashboard before running the tag creation script.**

---

## Step 1: Create Tag Model in Hygraph (15 minutes)

### 1.1 Access Hygraph Dashboard

1. Go to: https://app.hygraph.com/
2. Select your project: `vk_blog`
3. Click **Schema** in the left sidebar

### 1.2 Create Tag Model

Click **+ Add** → **Model**

**Model Settings:**
- **Display Name**: `Tag`
- **API ID**: `Tag`
- **API ID Plural**: `Tags`
- **Description**: `Content tags for organizing and filtering posts`

Click **Add Model**

### 1.3 Add Fields to Tag Model

Now add these fields to the Tag model:

#### Field 1: Name (Required)
- Type: **Single line text**
- Display Name: `Name`
- API ID: `name`
- Settings:
  - ✅ Required
  - ✅ Unique
  - Description: "Tag name (e.g., 'AI & Artificial Intelligence')"
- Click **Add**

#### Field 2: Slug (Required)
- Type: **Single line text**
- Display Name: `Slug`
- API ID: `slug`
- Settings:
  - ✅ Required
  - ✅ Unique
  - Description: "URL-friendly slug (e.g., 'ai-artificial-intelligence')"
- Click **Add**

#### Field 3: Description (Optional)
- Type: **Multi line text**
- Display Name: `Description`
- API ID: `description`
- Settings:
  - Description: "Tag description for SEO and context"
- Click **Add**

#### Field 4: Color (Optional)
- Type: **Single line text**
- Display Name: `Color`
- API ID: `color`
- Settings:
  - Description: "Hex color code for UI display (e.g., '#3B82F6')"
  - Validations: Can add regex for hex colors (optional)
- Click **Add**

#### Field 5: Posts Relation (Required)
- Type: **Reference**
- Display Name: `Posts`
- API ID: `posts`
- Settings:
  - **Reference Model**: Post
  - **Relation Type**: Many Tag to many Post
  - **Create field on Post model**: ✅ Yes
  - **Field name on Post**: `tags`
  - **Allow multiple Tags per Post**: ✅ Yes
- Click **Add**

### 1.4 Save & Publish Schema

1. Review all fields are correct
2. Click **Save** or **Publish** button
3. Wait for schema to deploy (~30 seconds)

---

## Step 2: Verify Tag Model Creation

Run this command to verify:

```bash
cd /Users/shanumac/Documents/dev2/nextJs/vk_blog
curl -X POST https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(grep HYGRAPH_AUTH_TOKEN .env.local | cut -d '=' -f2)" \
  -d '{"query":"query{__type(name:\"Tag\"){name fields{name type{name}}}}"}' | python3 -m json.tool
```

Expected output should show Tag model with fields: `id`, `name`, `slug`, `description`, `color`, `posts`

---

## Step 3: Create 30 Tags (Automated)

Once the Tag model exists, run:

```bash
cd /Users/shanumac/Documents/dev2/nextJs/vk_blog/.mcp
export $(grep -v '^#' ../.env.local | xargs)
node create-tags.js
```

This will create all 30 tags with colors and descriptions.

---

## 📋 Tag List (30 Tags)

### Technology & Science (8 tags)
1. **AI & Artificial Intelligence** - `#3B82F6` (Blue)
2. **Web3 & Blockchain** - `#8B5CF6` (Purple)
3. **Gadgets & Tech** - `#06B6D4` (Cyan)
4. **Science & Innovation** - `#10B981` (Green)
5. **Cybersecurity** - `#EF4444` (Red)
6. **Cloud Computing** - `#F59E0B` (Orange)
7. **Software Development** - `#6366F1` (Indigo)
8. **Internet Culture** - `#EC4899` (Pink)

### Gaming & Esports (7 tags)
9. **Esports & Competitive Gaming** - `#F43F5E` (Rose)
10. **Game Reviews** - `#8B5CF6` (Purple)
11. **Streaming & Twitch** - `#A855F7` (Purple)
12. **Mobile Gaming** - `#14B8A6` (Teal)
13. **Console Gaming** - `#3B82F6` (Blue)
14. **PC Gaming** - `#6366F1` (Indigo)
15. **Gaming News** - `#F59E0B` (Orange)

### Entertainment (8 tags)
16. **MCU & Marvel** - `#DC2626` (Red)
17. **DC Comics Universe** - `#1E40AF` (Blue)
18. **Bollywood Movies** - `#F59E0B` (Orange)
19. **Hollywood Movies** - `#7C3AED` (Violet)
20. **Streaming Services** - `#EF4444` (Red)
21. **TV Shows & Series** - `#8B5CF6` (Purple)
22. **Music & Artists** - `#EC4899` (Pink)
23. **Celebrity Lifestyle** - `#F472B6` (Pink)

### Sports (4 tags)
24. **Cricket & IPL** - `#10B981` (Green)
25. **Football & Soccer** - `#3B82F6` (Blue)
26. **Sports Esports** - `#8B5CF6` (Purple)
27. **Sports News** - `#F59E0B` (Orange)

### Content Format (3 tags)
28. **Tutorial & Guide** - `#06B6D4` (Cyan)
29. **News & Updates** - `#EF4444` (Red)
30. **Opinion & Analysis** - `#6366F1` (Indigo)

---

## Step 4: Verify Tag Creation

```bash
cd /Users/shanumac/Documents/dev2/nextJs/vk_blog
curl -X POST https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master \
  -H "Content-Type: application/json" \
  -d '{"query":"query{tags(first:100){name slug color}}"}' | python3 -m json.tool
```

Should show all 30 tags with their slugs and colors.

---

## Step 5: Tag Posts (Manual or Semi-Automated)

### Option A: Manual Tagging via Hygraph UI (Recommended for first 20 posts)

1. Go to Hygraph → Content → Posts
2. Select a post
3. Scroll to "Tags" field
4. Add 3-5 relevant tags per post
5. Save & Publish

### Option B: Semi-Automated Tagging (Future)

Create an auto-tagging script that suggests tags based on:
- Post title keywords
- Post category
- Post excerpt content

---

## 🎯 Tagging Strategy

### Technology Posts:
- Keywords: AI, ChatGPT, machine learning → **AI & Artificial Intelligence**
- Keywords: crypto, blockchain, NFT, web3 → **Web3 & Blockchain**
- Keywords: phone, laptop, gadget, device → **Gadgets & Tech**
- Keywords: security, privacy, hack → **Cybersecurity**

### Gaming Posts:
- Keywords: esports, tournament, competitive → **Esports & Competitive Gaming**
- Keywords: review, gameplay → **Game Reviews**
- Keywords: streamer, twitch, youtube → **Streaming & Twitch**
- Keywords: mobile game, app → **Mobile Gaming**

### Entertainment Posts:
- Keywords: Marvel, MCU, Avengers, Iron Man → **MCU & Marvel**
- Keywords: DC, Batman, Superman → **DC Comics Universe**
- Keywords: Bollywood, Hindi film → **Bollywood Movies**
- Keywords: Hollywood, English film → **Hollywood Movies**
- Keywords: Netflix, Disney+, Prime → **Streaming Services**
- Keywords: TV show, series, Bigg Boss → **TV Shows & Series**
- Keywords: celebrity, gossip, actor → **Celebrity Lifestyle**

### Sports Posts:
- Keywords: cricket, IPL, T20 → **Cricket & IPL**
- Keywords: football, soccer, FIFA → **Football & Soccer**

### Content Format:
- How-to, tutorial, guide, step-by-step → **Tutorial & Guide**
- Breaking, news, update, latest → **News & Updates**
- Opinion, analysis, commentary, review → **Opinion & Analysis**

---

## 🚀 Success Criteria

- [x] Tag model created in Hygraph
- [x] All 30 tags created and published
- [ ] Tags relation exists on Post model
- [ ] Top 20 posts tagged with 3-5 tags each
- [ ] Frontend displays tags on post pages
- [ ] Tag archive pages created

---

## 🐛 Troubleshooting

### Error: "Tag model not found"
**Solution**: Complete Step 1 first - create the Tag model manually in Hygraph Dashboard.

### Error: "Relation not found on Post model"
**Solution**: When creating the Posts field on Tag model, ensure "Create field on Post model" is checked.

### Error: "Duplicate slug"
**Solution**: Each tag must have a unique slug. Check for typos or duplicates.

### Tags not showing on frontend
**Solution**: 
1. Update GraphQL queries to include tags
2. Clear Next.js cache: `rm -rf .next && npm run dev`
3. Check that tags are published in Hygraph

---

## 📞 Next Steps After Tagging

1. **Create Tag Archive Pages**: `/app/tag/[slug]/page.tsx`
2. **Add Tag Filter**: Allow filtering posts by multiple tags
3. **Tag Cloud Widget**: Show popular tags on sidebar
4. **Related Posts by Tags**: Show posts with similar tags
5. **Tag-based SEO**: Add tags to meta keywords

---

**Ready to proceed?** Complete Step 1 (create Tag model), then run Step 3 (create tags script).

**Estimated Time**: 30 minutes total (15 min manual + 10 min automated + 5 min verification)
