#!/bin/bash

# Script لإضافة ticket جديد بسهولة
# الاستخدام: ./ADD_TICKET.sh

echo "=== إضافة Ticket جديد ==="
echo ""

# قراءة البيانات
read -p "نوع التكت (FTTH_NEW, ONU_CHANGE, RX_ISSUE, PPPOE, WIFI_SIMPLE, etc): " TICKET_TYPE
read -p "رقم الهاتف: " PHONE
read -p "المنطقة: " ZONE
read -p "الوصف: " DESCRIPTION
read -p "SLA وطني؟ (true/false): " IS_NATIONAL_SLA
read -p "الإجراء (schedule/assign): " ACTION

if [ "$ACTION" == "schedule" ]; then
  read -p "موعد الجدولة (مثال: 2025-12-17T10:00:00.000Z): " SCHEDULED_AT
  
  curl -X POST http://localhost:3000/tickets \
    -H "Content-Type: application/json" \
    -d "{
      \"ticketType\": \"$TICKET_TYPE\",
      \"phone\": \"$PHONE\",
      \"zone\": \"$ZONE\",
      \"description\": \"$DESCRIPTION\",
      \"isNationalSla\": $IS_NATIONAL_SLA,
      \"action\": \"$ACTION\",
      \"scheduledAt\": \"$SCHEDULED_AT\"
    }"
else
  read -p "نوع المكلف (team/technician): " ASSIGNEE_TYPE
  read -p "معرف المكلف: " ASSIGNEE_ID
  
  curl -X POST http://localhost:3000/tickets \
    -H "Content-Type: application/json" \
    -d "{
      \"ticketType\": \"$TICKET_TYPE\",
      \"phone\": \"$PHONE\",
      \"zone\": \"$ZONE\",
      \"description\": \"$DESCRIPTION\",
      \"isNationalSla\": $IS_NATIONAL_SLA,
      \"action\": \"$ACTION\",
      \"assigneeType\": \"$ASSIGNEE_TYPE\",
      \"assigneeId\": \"$ASSIGNEE_ID\"
    }"
fi

echo ""
echo ""
echo "✅ تم إضافة التكت بنجاح!"

