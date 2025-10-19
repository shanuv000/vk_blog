# 🧹 Hygraph CMS Manual Cleanup Guide

## ⚠️ Issue Identified

The API token provided has **read-only permissions** and cannot perform mutations (update/delete operations). You need to either:

1. **Update token permissions** in Hygraph dashboard, OR
2. **Complete cleanup manually** (recommended - safer and gives you control)

---

## 📊 Current Status

- **Total Categories**: 25
- **Visible Categories**: 8
- **Hidden Categories**: 17
- **Categories with 0 posts**: 9 (should be deleted)
- **Hidden categories with posts**: 11 (should be made visible)

---

## 🎯 CLEANUP TASKS

### ✅ PHASE 1: Make Hidden Categories Visible (11 categories)

These categories have posts but are hidden from users. **Make them visible** so users can find the content:

1. **Entertainment** - 49 posts ⭐ HIGHEST PRIORITY
2. **Games** - 22 posts
3. **Esports** - 20 posts
4. **Superhero** - 12 posts
5. **LifeStyle** - 8 posts
6. **Science** - 5 posts
7. **Cricket** - 4 posts
8. **IPL** - 3 posts
9. **DC** - 2 posts
10. **Chess** - 1 post
11. **Finance** - 1 post

**How to make visible:**
```
1. Go to Hygraph Dashboard → Schema → Category model
2. Click on "Content" tab
3. For each category above:
   - Find the category in the list
   - Click to edit
   - Toggle "Show" field to TRUE ✅
   - Click "Save"
   - Click "Publish"
```

---

### ❌ PHASE 2: Delete Unused Categories (9 categories)

These categories have **0 posts** and should be deleted:

1. ❌ **Automobile** - 0 posts
2. ❌ **Bike** - 0 posts
3. ❌ **code** - 0 posts
4. ❌ **Youtube** - 0 posts
5. ❌ **Youtube news** - 0 posts
6. ❌ **T20 World Cup 🏏** - 0 posts

**NOTE**: Keep these even though they have 0 posts (you may want to use them):
- ✅ **AI & ML** - Keep (good for future AI content)
- ✅ **Politics** - Keep (seems like an important category)
- ✅ **Bigg Boss** - Keep (entertainment/reality TV content)

**How to delete:**
```
1. Go to Hygraph Dashboard → Schema → Category model
2. Click on "Content" tab
3. For each category listed above:
   - Find the category in the list
   - Click the trash icon 🗑️
   - Confirm deletion
```

---

### ✅ PHASE 3: Keep As-Is (8 categories)

These are already visible and have content:

1. ✅ **Business** - 4 posts, visible
2. ✅ **Tech** - 8 posts, visible
3. ✅ **Education** - 2 posts, visible
4. ✅ **Sports** - 6 posts, visible
5. ✅ **Marvel** - 17 posts, visible
6. ✅ **AI & ML** - 0 posts, visible (keep for future)
7. ✅ **Politics** - 0 posts, visible (keep - important category)
8. ✅ **Bigg Boss** - 0 posts, visible (keep - entertainment)

**No action needed** - these are already properly configured.

---

## 🎯 Quick Action Checklist

**Before Cleanup:**
- [ ] Backup your Hygraph data (Settings → Backups → Create Backup)

**Phase 1 - Make Visible (Priority Order):**
- [ ] Entertainment (49 posts) ⭐ CRITICAL
- [ ] Games (22 posts)
- [ ] Esports (20 posts)
- [ ] Superhero (12 posts)
- [ ] LifeStyle (8 posts)
- [ ] Science (5 posts)
- [ ] Cricket (4 posts)
- [ ] IPL (3 posts)
- [ ] DC (2 posts)
- [ ] Chess (1 post)
- [ ] Finance (1 post)

**Phase 2 - Delete Unused:**
- [ ] Automobile
- [ ] Bike
- [ ] code
- [ ] Youtube
- [ ] Youtube news
- [ ] T20 World Cup 🏏

**After Cleanup:**
- [ ] Verify all categories are visible in your blog's category filter
- [ ] Test that posts from previously hidden categories now appear
- [ ] Update your blog's navigation/filters if needed

---

## 📈 Expected Results

**Before Cleanup:**
- Total: 25 categories
- Visible: 8 categories
- Hidden: 17 categories
- Problem: 49 Entertainment posts are hidden! 🚨

**After Cleanup:**
- Total: 19 categories (deleted 6)
- Visible: 19 categories (all visible)
- Hidden: 0 categories
- Result: All 100 posts are accessible! ✅

---

## 🔧 Alternative: Update API Token Permissions

If you prefer to run the cleanup script instead:

1. Go to Hygraph Dashboard → Settings → API Access
2. Find your Permanent Auth Token
3. Click "Edit Permissions"
4. Enable these permissions:
   - ✅ **Content API** → Category → **Update**
   - ✅ **Content API** → Category → **Delete**
   - ✅ **Content API** → Category → **Publish**
5. Copy the new token
6. Update `.env.local` with the new token
7. Run: `cd .mcp && HYGRAPH_AUTH_TOKEN="<your-token>" node cleanup-hygraph.js`

---

## 📊 Category Usage Statistics

```
Entertainment                49 posts  🔒 Hidden → Make Visible
Games                        22 posts  🔒 Hidden → Make Visible
Esports                      20 posts  🔒 Hidden → Make Visible
Marvel                       17 posts  ✅ Visible → Keep
Superhero                    12 posts  🔒 Hidden → Make Visible
Tech                          8 posts  ✅ Visible → Keep
LifeStyle                     8 posts  🔒 Hidden → Make Visible
Sports                        6 posts  ✅ Visible → Keep
Science                       5 posts  🔒 Hidden → Make Visible
Cricket                       4 posts  🔒 Hidden → Make Visible
Business                      4 posts  ✅ Visible → Keep
IPL                           3 posts  🔒 Hidden → Make Visible
Education                     2 posts  ✅ Visible → Keep
DC                            2 posts  🔒 Hidden → Make Visible
Chess                         1 post   🔒 Hidden → Make Visible
Finance                       1 post   🔒 Hidden → Make Visible
AI & ML                       0 posts  ✅ Visible → Keep (future use)
Politics                      0 posts  ✅ Visible → Keep (important)
Bigg Boss                     0 posts  ✅ Visible → Keep (active)
Automobile                    0 posts  🔒 Hidden → Delete ❌
Bike                          0 posts  🔒 Hidden → Delete ❌
code                          0 posts  🔒 Hidden → Delete ❌
Youtube                       0 posts  🔒 Hidden → Delete ❌
Youtube news                  0 posts  🔒 Hidden → Delete ❌
T20 World Cup 🏏              0 posts  🔒 Hidden → Delete ❌
```

---

## ⚠️ Critical Issue

**🚨 ENTERTAINMENT CATEGORY IS HIDDEN WITH 49 POSTS! 🚨**

This is the **most used category** in your blog but it's completely hidden from users. This should be **Priority #1** to fix.

---

## 💡 Recommendations

1. **Start with Entertainment** - This will instantly make 49 posts accessible
2. **Make all categories with posts visible** - Users should be able to filter by all content
3. **Delete truly unused categories** - Keep only the 6 listed above (no posts, no future plans)
4. **Keep AI & ML, Politics, Bigg Boss** - Even with 0 posts, these seem strategically important

---

## 📞 Need Help?

If you encounter any issues:
- Check Hygraph Documentation: https://hygraph.com/docs
- Verify you're in the correct environment (master branch)
- Ensure you have proper permissions in Hygraph

---

**Last Updated**: October 19, 2025  
**Token Status**: Read-only (mutation permissions needed for automated cleanup)  
**Recommended Approach**: Manual cleanup via Hygraph Dashboard
