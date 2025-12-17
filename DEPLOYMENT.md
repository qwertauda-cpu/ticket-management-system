# دليل رفع نظام إدارة التذاكر إلى السيرفر

## المتطلبات على السيرفر

### 1. نظام التشغيل
- Ubuntu 20.04 / 22.04 أو أي Linux distribution
- CentOS / RHEL 8+

### 2. البرامج المطلوبة على السيرفر
```bash
# Node.js v18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (Process Manager)
sudo npm install -g pm2

# Nginx (اختياري - لـ reverse proxy)
sudo apt-get install -y nginx
```

---

## طريقة الرفع التلقائي (Automatic Deployment)

### 1. جعل السكريبت قابل للتنفيذ
```bash
chmod +x deploy.sh
```

### 2. تشغيل السكريبت
```bash
./deploy.sh user@your-server-ip
```

**مثال:**
```bash
./deploy.sh root@192.168.1.100
# أو
./deploy.sh ubuntu@example.com
```

---

## طريقة الرفع اليدوي (Manual Deployment)

### الخطوة 1: بناء المشروع

```bash
# بناء Frontend
cd frontend
npm run build
cd ..

# بناء Backend
cd backend
npm run build
cd ..
```

### الخطوة 2: نقل الملفات للسيرفر

```bash
# إنشاء مجلد على السيرفر
ssh user@server "mkdir -p /var/www/ticket-system"

# نقل Backend
scp -r backend/dist user@server:/var/www/ticket-system/
scp -r backend/node_modules user@server:/var/www/ticket-system/
scp -r backend/prisma user@server:/var/www/ticket-system/
scp -r backend/generated user@server:/var/www/ticket-system/
scp backend/package.json user@server:/var/www/ticket-system/

# نقل Frontend
scp -r frontend/dist user@server:/var/www/ticket-system/frontend-dist
```

### الخطوة 3: الإعداد على السيرفر

```bash
# الاتصال بالسيرفر
ssh user@server

# الانتقال للمجلد
cd /var/www/ticket-system

# تشغيل Prisma migrations
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate deploy --schema=./prisma/schema.prisma

# إنشاء ملف البيئة
cat > .env << EOF
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="super-secret-jwt-key-production-$(openssl rand -hex 32)"
PORT=3000
EOF

# تشغيل Backend مع PM2
pm2 start dist/src/main.js --name ticket-system-backend
pm2 save
pm2 startup
```

---

## إعداد Nginx (Reverse Proxy)

### 1. إنشاء ملف إعداد Nginx

```bash
sudo nano /etc/nginx/sites-available/ticket-system
```

### 2. إضافة الإعدادات التالية:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # غير هذا لنطاقك أو IP

    # Frontend
    location / {
        root /var/www/ticket-system/frontend-dist;
        try_files $uri $uri/ /index.html;
        
        # Headers for proper routing
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Backend API
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. تفعيل الإعداد

```bash
# ربط الملف
sudo ln -s /etc/nginx/sites-available/ticket-system /etc/nginx/sites-enabled/

# اختبار الإعداد
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

---

## إعداد SSL (HTTPS) باستخدام Let's Encrypt

```bash
# تثبيت Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com

# التجديد التلقائي
sudo certbot renew --dry-run
```

---

## أوامر مفيدة على السيرفر

### إدارة Backend (PM2)

```bash
# عرض حالة التطبيق
pm2 status

# عرض السجلات
pm2 logs ticket-system-backend

# عرض السجلات الحية
pm2 logs ticket-system-backend --lines 100

# إعادة تشغيل
pm2 restart ticket-system-backend

# إيقاف
pm2 stop ticket-system-backend

# حذف
pm2 delete ticket-system-backend

# عرض معلومات مفصلة
pm2 show ticket-system-backend
```

### إدارة Nginx

```bash
# اختبار الإعداد
sudo nginx -t

# إعادة تحميل
sudo systemctl reload nginx

# إعادة تشغيل
sudo systemctl restart nginx

# عرض الحالة
sudo systemctl status nginx

# عرض السجلات
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### إدارة قاعدة البيانات

```bash
# النسخ الاحتياطي
cd /var/www/ticket-system
cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d-%H%M%S)

# تشغيل migration جديد
npx prisma migrate deploy --schema=./prisma/schema.prisma

# إعادة توليد Prisma Client
npx prisma generate --schema=./prisma/schema.prisma
```

---

## حل المشاكل الشائعة

### المشكلة: Backend لا يعمل

```bash
# تحقق من السجلات
pm2 logs ticket-system-backend

# تحقق من البورت
netstat -tulpn | grep 3000

# تحقق من متغيرات البيئة
pm2 env 0
```

### المشكلة: Frontend لا يظهر

```bash
# تحقق من ملفات Frontend
ls -la /var/www/ticket-system/frontend-dist

# تحقق من إعدادات Nginx
sudo nginx -t

# تحقق من سجلات Nginx
sudo tail -f /var/log/nginx/error.log
```

### المشكلة: خطأ في الاتصال بقاعدة البيانات

```bash
# تحقق من ملف قاعدة البيانات
ls -la /var/www/ticket-system/prisma/dev.db

# تحقق من الصلاحيات
chmod 755 /var/www/ticket-system/prisma
chmod 644 /var/www/ticket-system/prisma/dev.db

# تشغيل migrations
cd /var/www/ticket-system
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

---

## تحديث التطبيق

```bash
# على جهازك المحلي
git pull  # أو احصل على آخر نسخة
./deploy.sh user@server

# أو يدوياً على السيرفر
ssh user@server
cd /var/www/ticket-system
# رفع الملفات الجديدة
pm2 restart ticket-system-backend
```

---

## الأمان

### 1. Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

### 2. تغيير JWT Secret

```bash
# توليد secret جديد
openssl rand -hex 32

# تحديث في PM2
pm2 stop ticket-system-backend
# غير JWT_SECRET في ecosystem.config.js أو .env
pm2 restart ticket-system-backend
```

### 3. النسخ الاحتياطي التلقائي

```bash
# إضافة cron job
crontab -e

# إضافة السطر التالي (نسخ احتياطي يومي الساعة 2 صباحاً)
0 2 * * * cp /var/www/ticket-system/prisma/dev.db /var/www/ticket-system/backups/dev.db.backup-$(date +\%Y\%m\%d)
```

---

## المنافذ المستخدمة

- **3000**: Backend API (داخلي)
- **80**: HTTP (Frontend + Nginx)
- **443**: HTTPS (إذا تم تفعيل SSL)

---

## معلومات الاتصال بعد الرفع

- **Frontend**: `http://your-server-ip` أو `http://your-domain.com`
- **Backend API**: `http://your-server-ip:3000` (مباشر)
- **Backend عبر Nginx**: `http://your-server-ip/api/`

---

## الدعم الفني

إذا واجهت أي مشاكل:
1. تحقق من السجلات: `pm2 logs`
2. تحقق من Nginx: `sudo nginx -t`
3. تحقق من قاعدة البيانات: `ls -la prisma/dev.db`

