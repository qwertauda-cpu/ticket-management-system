#!/bin/bash

echo "🚀 بدء تشغيل الموقع..."
echo ""

# التحقق من أن Backend يعمل
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Backend يعمل بالفعل على http://localhost:3000"
else
    echo "⚠️  Backend غير شغال - يجب تشغيله يدوياً في terminal منفصل:"
    echo "   cd /Users/amarmuzahem/Downloads/web/backend"
    echo "   DATABASE_URL=\"file:/Users/amarmuzahem/Downloads/web/backend/prisma/dev.db\" JWT_SECRET=\"demo\" PORT=3000 node dist/src/main.js"
    echo ""
fi

# التحقق من أن Frontend يعمل
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend يعمل بالفعل على http://localhost:5173"
else
    echo "⚠️  Frontend غير شغال - يجب تشغيله يدوياً في terminal منفصل:"
    echo "   cd /Users/amarmuzahem/Downloads/web/frontend"
    echo "   npm run dev"
    echo ""
fi

echo ""
echo "📊 إحصائيات الموقع:"
curl -s http://localhost:3000/tickets/summary | python3 -m json.tool 2>/dev/null || echo "لا يمكن الحصول على الإحصائيات"

echo ""
echo ""
echo "🌐 افتح المتصفح على:"
echo "   http://localhost:5173"
echo ""
echo "📖 للمزيد من المعلومات، اقرأ:"
echo "   - STATUS.md"
echo "   - INSTRUCTIONS.md"
echo ""

