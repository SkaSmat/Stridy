# 🎨 Prompts Lovable - Stridy Dashboard Fixes

**Date**: 2024
**Branch**: claude/review-frontend-requirements-4karb
**App**: Stridy (rebrand complete ✅)

---

## 🐛 Bug Fixes Prompts

### Prompt 1: Fix "home.yourStats" Translation + Data Consistency

```
Fix bugs in Home dashboard stats section for Stridy app:

BUGS TO FIX:
1. Section heading shows "home.yourStats" instead of translated text
   - Replace with "Your Stats" in English
   - If i18n is configured, use {t('home.yourStats')}

2. "Streets Explored" card shows "+8 this week" when streetsExplored = 0
   - Only show "+X this week" when streetsExplored > 0
   - When streetsExplored === 0, show "Start exploring!" instead

3. Ensure all stats use real Supabase data
   - Display "0" for undefined/null values
   - Fetch: totalDistance, streetsExplored, citiesVisited, currentStreak

CODE EXAMPLE:
<Card>
  <CardHeader>
    <h2 className="text-lg font-semibold">Your Stats</h2>
  </CardHeader>
  <div className="grid grid-cols-2 gap-4">
    <StatCard
      icon={MapPin}
      value={streetsExplored || 0}
      label="Streets Explored"
      subtitle={streetsExplored > 0 ? `+${weeklyIncrease} this week` : "Start exploring!"}
    />
  </div>
</Card>

FILES TO UPDATE:
- src/pages/Home.tsx (main dashboard)
- Verify data comes from useEffect hook with Supabase queries
```

---

### Prompt 2: Fix Badges Progress Bar (0/10 showing 100%)

```
Fix badges progress bar bug in Home dashboard:

CURRENT BUG:
- Shows full green progress bar (100%) when 0/10 badges unlocked
- Progress calculation is incorrect

FIX:
1. Calculate progress correctly:
   progressPercent = (unlockedBadges / totalBadges) * 100
   Example: 0/10 = 0%, 3/10 = 30%, 10/10 = 100%

2. Update progress bar component:
   <div className="w-full bg-muted rounded-full h-2 mb-2">
     <div
       className="bg-primary h-full rounded-full transition-all"
       style={{ width: `${(unlockedBadges / totalBadges) * 100}%` }}
     />
   </div>

3. Update badge counter display:
   <div className="flex items-center justify-between">
     <span className="text-sm font-medium">Badges</span>
     <span className="text-sm text-muted-foreground">
       {unlockedBadges}/{totalBadges} unlocked
     </span>
   </div>
   <span className="text-xs text-muted-foreground">
     {((unlockedBadges / totalBadges) * 100).toFixed(0)}% complete
   </span>

FILES TO UPDATE:
- src/pages/Home.tsx (badges section around line 850+)
- Make sure to fetch real badge counts from Supabase
```

---

### Prompt 3: Add Smooth Progress Bar Animations

```
Add smooth animations to all progress bars on Home dashboard:

REQUIREMENTS:
1. Progress bars should animate from 0% to actual value on page load
2. Use smooth 500ms transition with easeOut timing
3. Apply to all progress bars:
   - Total Distance (to next level)
   - Streets Explored (% of city)
   - Badges (% unlocked)
   - Current Streak (to weekly goal)

IMPLEMENTATION OPTIONS:

Option A - CSS Transitions (Simple):
const [animated, setAnimated] = useState(false);

useEffect(() => {
  setAnimated(true);
}, []);

<div
  className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
  style={{ width: animated ? `${progressValue}%` : '0%' }}
/>

Option B - Framer Motion (Advanced):
import { motion } from 'framer-motion';

<motion.div
  initial={{ width: '0%' }}
  animate={{ width: `${progressValue}%` }}
  transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
  className="bg-primary h-full rounded-full"
/>

BONUS: Stagger animations with delay (0.1s between each bar)

FILES TO UPDATE:
- src/pages/Home.tsx (all stat cards with progress bars)
- Install framer-motion if using Option B: npm install framer-motion
```

---

## 🎨 Enhancement Prompts (Optional)

### Prompt 4: Add Daily Goal Card (Weward Style)

```
Add a Daily Goal card at the top of Home dashboard (Weward/Stepin style):

DESIGN:
┌────────────────────────────────────┐
│ 🎯 Today's Goal                    │
│ ████████████░░░░░░░░ 3.2 / 5.0 km │
│ 🔥 Keep going! 1.8km to go         │
└────────────────────────────────────┘

IMPLEMENTATION:
<Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10">
  <CardContent className="p-6">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold">🎯 Today's Goal</h3>
      <span className="text-sm font-medium">
        {currentDistance.toFixed(1)} / {dailyGoal} km
      </span>
    </div>
    <div className="w-full bg-muted rounded-full h-3 mb-2">
      <div
        className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all"
        style={{ width: `${(currentDistance / dailyGoal) * 100}%` }}
      />
    </div>
    <p className="text-sm text-muted-foreground">
      {currentDistance >= dailyGoal
        ? "🎉 Goal completed! Amazing work!"
        : `🔥 Keep going! ${(dailyGoal - currentDistance).toFixed(1)}km to go`}
    </p>
  </CardContent>
</Card>

FEATURES:
- Daily goal: 5km (configurable later)
- Progress bar with gradient
- Motivational message
- Celebration when goal reached

FILES TO UPDATE:
- src/pages/Home.tsx (add before stats grid)
```

---

### Prompt 5: Add Celebration Pulse to "New Badge!" Indicator

```
Add subtle pulse animation to "🏅 New badge!" indicator:

CURRENT STATE:
- Cities card shows "🏅 New badge!" but it's static

ENHANCEMENT:
Add pulse animation to draw attention

IMPLEMENTATION:
<div className="flex items-center gap-1">
  <span className="text-xs text-primary font-medium animate-pulse">
    🏅 New badge!
  </span>
</div>

// Or for custom animation:
@keyframes badge-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

<span className="badge-pulse-animation">🏅 New badge!</span>

BONUS: Auto-hide after 7 days
const isRecent = daysSinceBadge < 7;
{isRecent && <span>🏅 New badge!</span>}

FILES TO UPDATE:
- src/pages/Home.tsx (cities section)
- src/index.css (for custom animation)
```

---

## 📱 Mobile Optimization Prompt

### Prompt 6: Improve Mobile Spacing and Typography

```
Optimize Home dashboard for mobile devices:

IMPROVEMENTS:
1. Reduce padding on small screens
   - Cards: p-6 → p-4 on mobile
   - Container: px-6 → px-4 on mobile

2. Adjust typography
   - Stat numbers: text-2xl → text-xl on mobile
   - Section headings: text-xl → text-lg on mobile

3. Grid adjustments
   - Stats grid: Already 2 columns (good)
   - Badge grid: 3 columns → 2 columns on very small screens

IMPLEMENTATION:
<div className="px-4 sm:px-6 py-6 sm:py-8">
  <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Stats</h2>

  <div className="grid grid-cols-2 gap-3 sm:gap-4">
    <Card className="p-4 sm:p-6">
      <p className="text-xl sm:text-2xl font-bold">
        {stats.totalDistance}km
      </p>
    </Card>
  </div>
</div>

FILES TO UPDATE:
- src/pages/Home.tsx (responsive classes)
- Ensure consistent spacing across all sections
```

---

## 🎯 Quick Copy-Paste Fixes

### Fix 1: Translate "home.yourStats"
```tsx
// Replace this:
<h2>home.yourStats</h2>

// With this:
<h2 className="text-lg font-semibold mb-4">Your Stats</h2>
```

### Fix 2: Conditional "+8 this week"
```tsx
// Replace this:
<span className="text-sm text-muted-foreground">+8 this week</span>

// With this:
{streetsExplored > 0 && (
  <span className="text-sm text-muted-foreground">+8 this week</span>
)}
{streetsExplored === 0 && (
  <span className="text-sm text-muted-foreground">Start exploring!</span>
)}
```

### Fix 3: Badges Progress Bar
```tsx
// Replace this:
<ProgressBar value={100} />

// With this:
const badgeProgress = (unlockedBadges / totalBadges) * 100;
<div className="w-full bg-muted rounded-full h-2">
  <div
    className="bg-primary h-full rounded-full transition-all duration-500"
    style={{ width: `${badgeProgress}%` }}
  />
</div>
<span className="text-xs text-muted-foreground">
  {badgeProgress.toFixed(0)}% complete
</span>
```

---

## ✅ Checklist After Lovable Updates

- [ ] Verify "home.yourStats" is translated
- [ ] Confirm badges progress bar shows 0% when 0/10
- [ ] Check "+8 this week" only appears when streetsExplored > 0
- [ ] Test progress bar animations on page load
- [ ] Verify all data comes from Supabase (not hardcoded)
- [ ] Test mobile responsiveness
- [ ] Check bottom navigation works correctly

---

## 🚀 Additional Resources

**Design Reference**: See `DESIGN_IMPROVEMENTS.md` for full design system
**Rebranding**: App is now "Stridy" (not City Explorer)
**Color Palette**:
- Primary: #6366f1 (Indigo)
- Secondary: #10b981 (Emerald)
- Accent: #f59e0b (Amber)

**Landing Page**: Already redesigned with purple gradient ✅
**Next Focus**: Home dashboard bugs, then Map view enhancements
