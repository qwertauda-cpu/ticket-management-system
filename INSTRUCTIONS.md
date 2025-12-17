# 🎉 تعليمات تشغيل الموقع

## ✅ الموقع جاهز ويعمل!

### 📍 الروابط:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## 🚀 كيفية التشغيل:

### 1️⃣ تشغيل Backend:
```bash
cd /Users/amarmuzahem/Downloads/web/backend
DATABASE_URL="file:/Users/amarmuzahem/Downloads/web/backend/prisma/dev.db" JWT_SECRET="demo" PORT=3000 node dist/src/main.js
```

### 2️⃣ تشغيل Frontend:
```bash
cd /Users/amarmuzahem/Downloads/web/frontend
npm run dev
```

---

## 📝 إضافة بيانات جديدة:

### الطريقة الأولى: استخدام Script:
```bash
cd /Users/amarmuzahem/Downloads/web
./ADD_TICKET.sh
```

### الطريقة الثانية: استخدام curl مباشرة:
```bash
curl -X POST http://localhost:3000/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "ticketType": "FTTH_NEW",
    "phone": "07701234567",
    "zone": "Baghdad",
    "description": "وصف التكت",
    "isNationalSla": false,
    "action": "schedule",
    "scheduledAt": "2025-12-17T10:00:00.000Z"
  }'
```

### الطريقة الثالثة: من الموقع مباشرة:
1. افتح http://localhost:5173
2. اضغط على زر "Create Ticket"
3. املأ البيانات
4. اضغط "Create"

---

## 📊 أنواع التكتات المتاحة:
- `FTTH_NEW` - تركيب جديد
- `ONU_CHANGE` - تغيير ONU
- `RX_ISSUE` - مشكلة استقبال
- `PPPOE` - مشكلة PPPOE
- `WIFI_SIMPLE` - مشكلة WiFi بسيطة
- `REACTIVATE_SERVICE` - إعادة تفعيل الخدمة
- `CHECK_ONLY` - فحص فقط
- `EXTERNAL_MAINTENANCE` - صيانة خارجية
- `FIBER_CUT` - قطع فايبر
- `ACTIVATION_NO_CABLE` - تفعيل بدون كابل
- `CUSTOM` - مخصص

---

## 🗄️ Database:
- **النوع**: SQLite
- **المكان**: `/Users/amarmuzahem/Downloads/web/backend/prisma/dev.db`
- **عرض البيانات**:
```bash
cd /Users/amarmuzahem/Downloads/web/backend
sqlite3 prisma/dev.db "SELECT * FROM tickets;"
```

---

## ⚙️ ملاحظات مهمة:

### ✅ تم إزالة نظام المصادقة:
- لا حاجة لتسجيل دخول
- جميع APIs مفتوحة
- يستخدم tenant تجريبي: `demo-tenant-123`

### ✅ البيانات الحالية:
- يوجد **6 tickets** تجريبية
- جميعها بحالة `SCHEDULED`

### ✅ إضافة المزيد من البيانات:
استخدم أي من الطرق الثلاث أعلاه لإضافة tickets جديدة!

---

## 🔧 استكشاف الأخطاء:

### إذا لم يعمل Backend:
```bash
# تحقق من أن Backend يعمل
curl http://localhost:3000

# إذا لم يعمل، أعد تشغيله
cd /Users/amarmuzahem/Downloads/web/backend
DATABASE_URL="file:/Users/amarmuzahem/Downloads/web/backend/prisma/dev.db" JWT_SECRET="demo" PORT=3000 node dist/src/main.js
```

### إذا لم يعمل Frontend:
```bash
# أعد تشغيل Frontend
cd /Users/amarmuzahem/Downloads/web/frontend
npm run dev
```

---

## 📞 الدعم:
الموقع جاهز للاستخدام! إذا واجهت أي مشكلة، تأكد من:
1. Backend يعمل على port 3000
2. Frontend يعمل على port 5173
3. Database موجود في المسار الصحيح

**استمتع! 🎊**

