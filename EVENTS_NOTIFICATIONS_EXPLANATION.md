# Events & Notifications System - कैसे काम करता है

## 📋 Overview
Jab admin ek event create karta hai aur `is_published = true` set karta hai, tab **automatically** sabhi users ko notification jata hai.

## 🔄 Automatic Notification Flow

### Step 1: Admin Event Create Karta Hai
```
Admin → /admin/events/create → Form Submit
↓
API Route: /api/events/create
↓
Database INSERT: events table me event insert hota hai
```

### Step 2: Database Trigger Automatically Fire Hota Hai
```
INSERT INTO events (is_published = true)
↓
Trigger: trigger_notify_on_event_create
↓
Function: handle_new_event() automatically call hota hai
```

### Step 3: Notification Function Sabhi Users Ko Notify Karta Hai
```
handle_new_event() function:
↓
notify_all_users_on_event() call hota hai
↓
Sabhi users (except event creator) ke liye notifications create hote hain
```

## 📊 Database Structure

### 1. Events Table
```sql
events
├── id (uuid)
├── title (text)
├── description (text)
├── event_date (timestamptz)
├── is_published (boolean) ← Important: Iske true hone par trigger fire hota hai
└── ...
```

### 2. Notifications Table
```sql
notifications
├── id (uuid)
├── user_id (uuid) ← Har user ke liye alag notification
├── type ('event_created')
├── title ('New Event: Event Name')
├── message ('A new event has been created...')
├── related_event_id (uuid) ← Click karne par event page khulega
├── is_read (boolean)
└── created_at (timestamptz)
```

## ⚙️ Technical Implementation

### Trigger Function
```sql
CREATE TRIGGER trigger_notify_on_event_create
  AFTER INSERT OR UPDATE ON public.events
  FOR EACH ROW
  WHEN (NEW.is_published = true)
  EXECUTE FUNCTION public.handle_new_event();
```

**Ye trigger:**
- ✅ `INSERT` par fire hota hai (naya event create)
- ✅ `UPDATE` par fire hota hai (event ko publish kiya gaya)
- ✅ Sirf tab fire hota hai jab `is_published = true` ho

### Notification Function
```sql
notify_all_users_on_event(event_id, title, message)
```

**Ye function:**
1. `profiles` table se **sabhi users** ka ID fetch karta hai
2. Event creator ko **exclude** karta hai (kuki wo already jaanta hai)
3. Har user ke liye `notifications` table me **alag row** insert karta hai

## 🎯 Real Example

### Scenario: Admin "Annual Meet 2024" Event Create Karta Hai

1. **Admin Form Submit:**
   ```json
   {
     "title": "Annual Meet 2024",
     "event_date": "2024-12-25",
     "is_published": true  ← Important!
   }
   ```

2. **Database Me Event Insert:**
   ```sql
   INSERT INTO events (title, is_published, ...) 
   VALUES ('Annual Meet 2024', true, ...);
   ```

3. **Trigger Automatically Fire:**
   - Trigger detect karta hai: `is_published = true`
   - `handle_new_event()` function call hota hai

4. **Notifications Create Hote Hain:**
   ```sql
   -- User 1 ke liye
   INSERT INTO notifications (user_id, type, title, message, related_event_id)
   VALUES (user1_id, 'event_created', 'New Event: Annual Meet 2024', '...', event_id);
   
   -- User 2 ke liye
   INSERT INTO notifications (user_id, type, title, message, related_event_id)
   VALUES (user2_id, 'event_created', 'New Event: Annual Meet 2024', '...', event_id);
   
   -- ... aur sabhi users ke liye
   ```

5. **Users Ko Notification Dikhta Hai:**
   - Navbar me notification bell par **red badge** dikhta hai
   - `/notifications` page par notification list dikhta hai
   - Click karne par event detail page khulta hai

## 🔔 Notification Display

### Navbar Bell Icon
- Unread notifications ka count show hota hai
- Real-time update (every 30 seconds)

### Notifications Page (`/notifications`)
- Sabhi notifications list me dikhte hain
- Unread notifications highlighted hote hain
- Click karne par related event page khulta hai

## ✅ Features

1. **Automatic**: Manual code likhne ki zarurat nahi
2. **Real-time**: Database trigger se instantly notifications create hote hain
3. **Scalable**: 1000 users ho ya 10000, sabko automatically notify hoga
4. **No Duplicates**: Agar event already published hai, to duplicate notifications nahi banenge

## 🧪 Testing

1. **Admin Login** karo
2. **Create Event** page par jao (`/admin/events/create`)
3. Event create karo with `is_published = true`
4. **Database check** karo:
   ```sql
   SELECT COUNT(*) FROM notifications WHERE type = 'event_created';
   ```
5. **User Account** se login karo
6. **Notification bell** check karo - unread count dikhna chahiye
7. **Notifications page** par jao - notification dikhna chahiye

## 📝 Notes

- **Event Creator** ko notification nahi jata (kuki wo already jaanta hai)
- **Draft events** (`is_published = false`) create karne par notifications nahi jate
- **Update** karne par (draft se published) bhi notifications jayenge
- Notifications **permanent** hote hain - user delete nahi kar sakta, sirf mark as read kar sakta hai

