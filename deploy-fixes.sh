#!/bin/bash

# سكريبت شامل لتطبيق جميع الإصلاحات على السيرفر

echo "🚀 === تطبيق الإصلاحات على السيرفر ==="
echo ""

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. سحب آخر التحديثات
echo -e "${YELLOW}📥 سحب آخر التحديثات من GitHub...${NC}"
cd ~/ticket-management-system
git pull origin main || {
    echo -e "${RED}❌ فشل في سحب التحديثات${NC}"
    exit 1
}
echo -e "${GREEN}✅ تم سحب التحديثات${NC}"
echo ""

# 2. إصلاح Backend
echo -e "${YELLOW}🔧 إصلاح Backend...${NC}"
cd backend

# تثبيت الحزم المفقودة
echo "📦 تثبيت الحزم..."
npm install

# توليد Prisma Client
echo "🔄 توليد Prisma Client..."
npx prisma generate

# بناء Backend
echo "🔨 بناء Backend..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ فشل في بناء Backend${NC}"
    exit 1
fi

echo -e "${GREEN}✅ تم بناء Backend بنجاح${NC}"
echo ""

# 3. إعادة تشغيل Backend
echo -e "${YELLOW}🔄 إعادة تشغيل Backend...${NC}"
pm2 delete ticket-backend 2>/dev/null || true
pm2 start ecosystem.config.js || pm2 start dist/src/main.js --name ticket-backend

# انتظار قليل
sleep 5

# التحقق من الحالة
echo "🔍 التحقق من حالة Backend..."
pm2 list

# فحص الأخطاء
echo "📜 آخر 10 أسطر من logs:"
pm2 logs ticket-backend --lines 10 --nostream | tail -10

echo -e "${GREEN}✅ تم إعادة تشغيل Backend${NC}"
echo ""

# 4. إصلاح Admin Dashboard
echo -e "${YELLOW}🔧 إصلاح Admin Dashboard...${NC}"
cd ../admin-dashboard

# تثبيت الحزم
echo "📦 تثبيت الحزم..."
npm install

# بناء Dashboard
echo "🔨 بناء Admin Dashboard..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ فشل في بناء Admin Dashboard${NC}"
    exit 1
fi

# رفع الملفات
echo "📦 رفع الملفات إلى السيرفر..."
sudo rm -rf /var/www/html/admin/*
sudo cp -r dist/* /var/www/html/admin/
sudo chown -R www-data:www-data /var/www/html/admin

echo -e "${GREEN}✅ تم تحديث Admin Dashboard${NC}"
echo ""

# 5. التحقق النهائي
echo -e "${YELLOW}🔍 التحقق النهائي...${NC}"

# اختبار Backend
echo "🧪 اختبار Backend..."
sleep 2
curl -s http://localhost:3001/super-admin/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin123"}' | head -5

echo ""
echo ""

# التحقق من الملفات
echo "📋 التحقق من الملفات المرفوعة:"
ls -lh /var/www/html/admin/assets/*.js 2>/dev/null | head -1

echo ""
echo -e "${GREEN}✅ === تم تطبيق جميع الإصلاحات بنجاح ===${NC}"
echo ""
echo "📋 معلومات تسجيل الدخول:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "🌐 الروابط:"
echo "  Admin Dashboard: http://136.111.97.150/admin/login"
echo "  Backend API: http://136.111.97.150:3001"
echo ""

