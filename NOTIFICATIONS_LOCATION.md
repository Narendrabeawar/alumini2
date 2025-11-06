# 📍 Notifications कहाँ जाएंगे - Complete Guide

## 🗄️ Database में Storage

**सबसे पहले:** Notifications database की `notifications` table में store होते हैं:

```sql
notifications table:
├── id (uuid)
├── user_id (uuid) ← Har user ke liye alag notification
├── type ('event_created')
├── title ('New Event: Event Name')
├── message ('A new event has been created...')
├── related_event_id (uuid)
├── is_read (boolean) ← Unread/Read status
└── created_at (timestamptz)
```

## 🎨 UI में कहाँ दिखेंगे

### 1️⃣ **Navbar में - Notification Bell Icon** 🔔

**Location:** Top-right corner, Profile button ke pehle

**कैसे दिखेगा:**
```
┌─────────────────────────────────────────────┐
│  Zexa Tech School    [🔔3] [👤 Profile] [Logout]  │
└─────────────────────────────────────────────┘
         ↑
    Red Badge (3 unread notifications)
```

**Features:**
- ✅ Bell icon dikhega
- ✅ Agar unread notifications hain, to **red badge** dikhega
- ✅ Badge me unread count dikhega (1-9 ya "9+")
- ✅ Click karne par `/notifications` page khulega
- ✅ Auto-refresh har 30 seconds me

**Code Location:**
- `src/components/Navbar.tsx` - Line 64
- `src/components/NotificationBell.tsx`

---

### 2️⃣ **Notifications Page** 📄

**URL:** `http://localhost:3000/notifications`

**कैसे दिखेगा:**
```
┌─────────────────────────────────────────────┐
│  Notifications                               │
│  3 unread notifications                      │
│  [Mark All as Read]                          │
├─────────────────────────────────────────────┤
│  📅 New Event: Annual Meet 2024              │
│  A new event "Annual Meet 2024" has been     │
│  created. Check it out!                      │
│  [View Details]  [Unread Badge]             │
├─────────────────────────────────────────────┤
│  📅 New Event: Alumni Gathering              │
│  ...                                         │
│  [View Details]  [Unread Badge]             │
└─────────────────────────────────────────────┘
```

**Features:**
- ✅ Sabhi notifications list me dikhenge
- ✅ Unread notifications **blue background** ke saath highlighted honge
- ✅ Har notification me:
  - Icon (Calendar, UserCheck, etc.)
  - Title
  - Message
  - Timestamp
  - "View Details" button
- ✅ Click karne par related event/profile page khulega
- ✅ Automatically mark as read ho jayega jab click karein

**Code Location:**
- `src/app/(app)/notifications/page.tsx`

---

## 🔄 Complete Flow

### Step 1: Event Create
```
Admin creates event (is_published = true)
↓
Database trigger fires
↓
Notifications table me sabhi users ke liye rows insert hote hain
```

### Step 2: User Login
```
User login karta hai
↓
Navbar me NotificationBell component load hota hai
↓
API call: /api/notifications/count
↓
Unread count fetch hota hai
↓
Bell icon par red badge dikhta hai
```

### Step 3: User Clicks Bell
```
User bell icon par click karta hai
↓
/notifications page khulta hai
↓
Sabhi notifications fetch hote hain
↓
List me dikhte hain
```

### Step 4: User Clicks Notification
```
User notification par click karta hai
↓
Notification mark as read ho jata hai
↓
Related page khulta hai (event detail, profile, etc.)
```

---

## 📱 Visual Representation

### Navbar (Logged In User)
```
┌────────────────────────────────────────────────────────────┐
│  Zexa Tech School, Ajmer Rajasthan                          │
│                                                             │
│                                    [🔔3] [👤 Profile] [Logout] │
│                                        ↑                    │
│                                   Notification              │
│                                   Bell with                 │
│                                   Red Badge                 │
└────────────────────────────────────────────────────────────┘
```

### Notifications Page
```
┌────────────────────────────────────────────────────────────┐
│  Notifications                    [Mark All as Read]        │
│  3 unread notifications                                      │
├────────────────────────────────────────────────────────────┤
│  📅  New Event: Annual Meet 2024                    [●]     │
│      A new event "Annual Meet 2024" has been created.      │
│      Check it out!                                          │
│      2 hours ago                                            │
│      [View Details]                                         │
├────────────────────────────────────────────────────────────┤
│  📅  New Event: Alumni Gathering                   [●]     │
│      A new event "Alumni Gathering" has been created.       │
│      Check it out!                                          │
│      1 day ago                                              │
│      [View Details]                                         │
├────────────────────────────────────────────────────────────┤
│  ✅  Profile Approved                               [●]     │
│      Your profile has been approved by admin.               │
│      3 days ago                                             │
│      [View Details]                                         │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Features Summary

### Navbar Bell
- ✅ Always visible (logged in users ke liye)
- ✅ Red badge with unread count
- ✅ Auto-refresh every 30 seconds
- ✅ Click to open notifications page

### Notifications Page
- ✅ Complete notification history
- ✅ Unread notifications highlighted
- ✅ Click to mark as read
- ✅ "Mark All as Read" button
- ✅ Direct links to related content
- ✅ Icons based on notification type

---

## 🧪 Testing

1. **Admin se event create karo**
2. **User account se login karo**
3. **Navbar me bell icon check karo** - red badge dikhna chahiye
4. **Bell icon par click karo** - notifications page khulna chahiye
5. **Notification par click karo** - event detail page khulna chahiye
6. **Badge count check karo** - unread count kam hona chahiye

---

## 📍 File Locations

- **Navbar Component:** `src/components/Navbar.tsx`
- **Notification Bell:** `src/components/NotificationBell.tsx`
- **Notifications Page:** `src/app/(app)/notifications/page.tsx`
- **Notification Item:** `src/app/(app)/notifications/notification-item.tsx`
- **API Route (Count):** `src/app/api/notifications/count/route.ts`
- **API Route (List/Update):** `src/app/api/notifications/route.ts`

---

## 🎯 Summary

**Notifications 2 jagah dikhenge:**
1. **Navbar me** - Bell icon with unread count badge
2. **Notifications Page** - Complete list with details

**Database me:** `notifications` table me store hote hain (har user ke liye alag rows)

**Auto-refresh:** Navbar bell har 30 seconds me automatically update hota hai

