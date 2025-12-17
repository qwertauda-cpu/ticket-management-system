# 🚀 دليل النشر الآلي

## 📋 المتطلبات الأساسية
- SSH key مُعدّ للسيرفر
- Git configured
- Node.js و npm مثبتين

---

## 🔄 عملية النشر (3 خطوات)

### الطريقة الآلية (سكريبت واحد):

```bash
cd /Users/amarmuzahem/Downloads/web
./deploy-all.sh
```

السكريبت سيسألك عن رسالة الـ commit، ثم سيقوم بـ:
1. ✅ رفع على GitHub
2. ✅ بناء Frontend + Backend + Admin
3. ✅ نقل للسيرفر
4. ✅ إيقاف وتشغيل Backend
5. ✅ اختبار جميع المواقع

---

### الطريقة اليدوية:

#### 1️⃣ **رفع على GitHub**
```bash
cd /Users/amarmuzahem/Downloads/web
git add .
git commit -m "وصف التحديث"
git push origin main
```

#### 2️⃣ **بناء المشروع**
```bash
# Frontend
cd frontend
npm run build
cd ..

# Admin Dashboard
cd admin-dashboard
npm run build
cd ..

# Backend
cd backend
npm run build
cd ..
```

#### 3️⃣ **نقل للسيرفر**
```bash
# ضغط الملفات
cd frontend && tar -czf /tmp/frontend-dist.tar.gz dist/ && cd ..
cd admin-dashboard && tar -czf /tmp/admin-dist.tar.gz dist/ && cd ..

# نقل للسيرفر
scp /tmp/frontend-dist.tar.gz /tmp/admin-dist.tar.gz qwertauda@136.111.97.150:~/
```

#### 4️⃣ **تطبيق على السيرفر**
```bash
ssh qwertauda@136.111.97.150 << 'ENDSSH'
# Frontend
cd ~/ticket-management-system/frontend
rm -rf dist
tar -xzf ~/frontend-dist.tar.gz

# Admin Dashboard
cd ~/admin-dashboard
rm -rf dist
tar -xzf ~/admin-dist.tar.gz

# إعادة تشغيل Backend
pm2 stop ticket-backend
sleep 2
pm2 start ticket-backend

# تنظيف
rm ~/frontend-dist.tar.gz ~/admin-dist.tar.gz
ENDSSH
```

#### 5️⃣ **اختبار**
```bash
# Frontend
curl -s -o /dev/null -w "Status: %{http_code}\n" http://136.111.97.150/

# Admin Dashboard
curl -s -o /dev/null -w "Status: %{http_code}\n" http://136.111.97.150/admin/

# Backend API
curl http://136.111.97.150/api/
```

---

## 📦 الملفات المهمة للنشر

### Frontend:
- ✅ `frontend/dist/` - الملفات المبنية
- ✅ يتم نقلها إلى: `/home/qwertauda/ticket-management-system/frontend/dist/`

### Admin Dashboard:
- ✅ `admin-dashboard/dist/` - الملفات المبنية
- ✅ يتم نقلها إلى: `/home/qwertauda/admin-dashboard/dist/`

### Backend:
- ✅ `backend/dist/` - الكود المبني
- ✅ `backend/generated/` - Prisma Client
- ✅ `backend/prisma/` - Database schema & migrations
- ✅ `backend/package.json` - Dependencies
- ✅ يتم نقلها إلى: `/home/qwertauda/ticket-management-system/backend/`

---

## 🔧 أوامر PM2 المفيدة

```bash
# عرض الحالة
pm2 status

# إيقاف
pm2 stop ticket-backend

# تشغيل
pm2 start ticket-backend

# إعادة تشغيل
pm2 restart ticket-backend

# عرض Logs
pm2 logs ticket-backend

# عرض آخر 50 سطر من الـ logs
pm2 logs ticket-backend --lines 50

# مسح الـ logs
pm2 flush
```

---

## 🌐 روابط الوصول

- **الموقع الرئيسي**: http://136.111.97.150/
- **لوحة السوبر أدمن**: http://136.111.97.150/admin/
- **Backend API**: http://136.111.97.150/api/

---

## ⚠️ ملاحظات مهمة

1. **دائماً** ارفع على GitHub أولاً
2. **اختبر محلياً** قبل الرفع
3. **تأكد من البناء بدون أخطاء**
4. **راجع PM2 status** بعد الرفع
5. **اختبر المواقع** بعد النشر

---

## 🐛 استكشاف الأخطاء

### إذا لم يعمل Frontend:
```bash
ssh qwertauda@136.111.97.150
ls -la ~/ticket-management-system/frontend/dist/
# تأكد من وجود index.html و assets/
```

### إذا لم يعمل Admin Dashboard:
```bash
ssh qwertauda@136.111.97.150
ls -la ~/admin-dashboard/dist/
# تأكد من وجود index.html و assets/
```

### إذا لم يعمل Backend:
```bash
ssh qwertauda@136.111.97.150
pm2 logs ticket-backend --lines 100
# راجع الأخطاء
```

### إذا كان Backend متوقف:
```bash
ssh qwertauda@136.111.97.150
pm2 restart ticket-backend
pm2 logs ticket-backend
```

---

## 📊 سجل النشر

- **2025-12-17**: إعداد النشر الآلي ✅
- **2025-12-17**: تحسين لوحة السوبر أدمن ✅

---

## 🎯 الخطوات التالية

بعد كل تحديث، ما عليك سوى:
```bash
./deploy-all.sh
```

**وتم! 🎉**

