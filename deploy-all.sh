#!/bin/bash

# ألوان للـ Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REMOTE_USER="qwertauda"
REMOTE_HOST="136.111.97.150"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🚀 بدء عملية النشر الشاملة${NC}"
echo -e "${BLUE}================================${NC}\n"

# 1. رفع على GitHub
echo -e "${YELLOW}📦 الخطوة 1: رفع التحديثات على GitHub...${NC}"
git add .
read -p "أدخل وصف التحديث (Commit message): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update: $(date '+%Y-%m-%d %H:%M')"
fi
git commit -m "$commit_msg"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم رفع التحديثات على GitHub بنجاح${NC}\n"
else
    echo -e "${RED}❌ فشل رفع التحديثات على GitHub${NC}"
    exit 1
fi

# 2. بناء Frontend
echo -e "${YELLOW}🔨 الخطوة 2: بناء Frontend...${NC}"
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ فشل بناء Frontend${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ تم بناء Frontend بنجاح${NC}\n"

# 3. بناء Admin Dashboard
echo -e "${YELLOW}🔨 الخطوة 3: بناء Admin Dashboard...${NC}"
cd admin-dashboard
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ فشل بناء Admin Dashboard${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ تم بناء Admin Dashboard بنجاح${NC}\n"

# 4. بناء Backend
echo -e "${YELLOW}🔨 الخطوة 4: بناء Backend...${NC}"
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ فشل بناء Backend${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ تم بناء Backend بنجاح${NC}\n"

# 5. نقل للسيرفر
echo -e "${YELLOW}📤 الخطوة 5: نقل الملفات للسيرفر...${NC}"

# رفع Frontend
echo "  → رفع Frontend..."
cd frontend
tar -czf frontend-dist.tar.gz dist/
scp frontend-dist.tar.gz $REMOTE_USER@$REMOTE_HOST:~/
rm frontend-dist.tar.gz
cd ..

# رفع Admin Dashboard
echo "  → رفع Admin Dashboard..."
cd admin-dashboard
tar -czf admin-dist.tar.gz dist/
scp admin-dist.tar.gz $REMOTE_USER@$REMOTE_HOST:~/
rm admin-dist.tar.gz
cd ..

# رفع Backend
echo "  → رفع Backend..."
cd backend
tar -czf backend-dist.tar.gz dist/ generated/ prisma/ package.json package-lock.json
scp backend-dist.tar.gz $REMOTE_USER@$REMOTE_HOST:~/
rm backend-dist.tar.gz
cd ..

echo -e "${GREEN}✅ تم نقل جميع الملفات بنجاح${NC}\n"

# 6. تطبيق التحديثات على السيرفر
echo -e "${YELLOW}⚙️  الخطوة 6: تطبيق التحديثات على السيرفر...${NC}"

ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
    echo "  → تحديث Frontend..."
    cd ~/ticket-management-system/frontend
    rm -rf dist
    tar -xzf ~/frontend-dist.tar.gz
    
    echo "  → تحديث Admin Dashboard..."
    cd ~/admin-dashboard
    rm -rf dist
    tar -xzf ~/admin-dist.tar.gz
    
    echo "  → تحديث Backend..."
    cd ~/ticket-management-system/backend
    tar -xzf ~/backend-dist.tar.gz
    
    echo "  → إعادة تشغيل Backend..."
    pm2 restart ticket-backend
    
    echo "  → تنظيف الملفات المؤقتة..."
    rm ~/frontend-dist.tar.gz ~/admin-dist.tar.gz ~/backend-dist.tar.gz
    
    echo "✅ تم تطبيق جميع التحديثات"
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم تطبيق التحديثات على السيرفر بنجاح${NC}\n"
else
    echo -e "${RED}❌ فشل تطبيق التحديثات على السيرفر${NC}"
    exit 1
fi

# 7. اختبار الموقع
echo -e "${YELLOW}🧪 الخطوة 7: اختبار الموقع...${NC}"
sleep 3

echo "  → اختبار Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$REMOTE_HOST/)
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "    ${GREEN}✅ Frontend يعمل${NC}"
else
    echo -e "    ${RED}❌ Frontend لا يعمل (Status: $FRONTEND_STATUS)${NC}"
fi

echo "  → اختبار Admin Dashboard..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$REMOTE_HOST/admin/)
if [ "$ADMIN_STATUS" == "200" ]; then
    echo -e "    ${GREEN}✅ Admin Dashboard يعمل${NC}"
else
    echo -e "    ${RED}❌ Admin Dashboard لا يعمل (Status: $ADMIN_STATUS)${NC}"
fi

echo "  → اختبار Backend API..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$REMOTE_HOST/api/)
if [ "$API_STATUS" == "200" ] || [ "$API_STATUS" == "404" ]; then
    echo -e "    ${GREEN}✅ Backend API يعمل${NC}"
else
    echo -e "    ${RED}❌ Backend API لا يعمل (Status: $API_STATUS)${NC}"
fi

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}🎉 تمت عملية النشر بنجاح!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "🌐 الموقع الرئيسي: ${BLUE}http://$REMOTE_HOST/${NC}"
echo -e "🛡️  لوحة السوبر أدمن: ${BLUE}http://$REMOTE_HOST/admin/${NC}"
echo ""

