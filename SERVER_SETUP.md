# إعداد السيرفر - خطوة بخطوة

## 🔧 على السيرفر، نفذ هذه الأوامر:

### 1. تثبيت Node.js

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# التحقق
node --version
npm --version
```

### 2. تثبيت PM2

```bash
sudo npm install -g pm2
```

### 3. استنساخ المشروع من GitHub

```bash
# تثبيت Git إذا لم يكن موجود
sudo apt install -y git

# استنساخ المشروع
cd ~
git clone https://github.com/qwertauda-cpu/ticket-management-system.git
cd ticket-management-system
```

### 4. إعداد Backend

```bash
cd ~/ticket-management-system/backend

# تثبيت الحزم
npm install

# إنشاء ملف البيئة
cat > .env << EOF
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="super-secret-jwt-key-$(openssl rand -hex 16)"
PORT=3000
EOF

# إعداد قاعدة البيانات
npx prisma generate
npx prisma migrate deploy

# بناء المشروع
npm run build

# تشغيل Backend
pm2 start dist/src/main.js --name ticket-backend
pm2 save
pm2 startup
```

### 5. إعداد Nginx (للـ Frontend)

```bash
# تثبيت Nginx
sudo apt install -y nginx

# إنشاء ملف إعداد
sudo nano /etc/nginx/sites-available/ticket-system
```

**الصق هذا المحتوى:**

```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /home/qwertauda/ticket-management-system/frontend/dist;
        try_files $uri $uri/ /index.html;
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
        proxy_cache_bypass $http_upgrade;
    }
}
```

**ثم:**

```bash
# تفعيل الإعداد
sudo ln -s /etc/nginx/sites-available/ticket-system /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# اختبار وإعادة تشغيل Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### 6. فتح Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## ✅ التحقق من التشغيل

```bash
# حالة Backend
pm2 status

# سجلات Backend
pm2 logs ticket-backend

# حالة Nginx
sudo systemctl status nginx
```

## 🌐 الوصول للموقع

- **Frontend**: http://136.111.97.150
- **Backend API**: http://136.111.97.150/api/

## 🔄 لإعادة النشر بعد التحديث

```bash
cd ~/ticket-management-system
git pull
cd backend
npm run build
pm2 restart ticket-backend
```

