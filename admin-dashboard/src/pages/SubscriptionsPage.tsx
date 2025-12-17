import { useEffect, useState } from 'react';
import { Typography, Box, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { api } from '../services/api';
import type { Subscription } from '../types';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const data = await api.getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'tenantId', headerName: 'معرف الشركة', width: 250 },
    {
      field: 'plan',
      headerName: 'الخطة',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'MONTHLY' ? 'شهري' : 'سنوي'}
          color="primary"
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.value === 'ACTIVE'
              ? 'نشط'
              : params.value === 'EXPIRED'
              ? 'منتهي'
              : 'ملغي'
          }
          color={
            params.value === 'ACTIVE'
              ? 'success'
              : params.value === 'EXPIRED'
              ? 'error'
              : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'المبلغ',
      width: 120,
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
    },
    {
      field: 'startDate',
      headerName: 'تاريخ البدء',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('ar-EG'),
    },
    {
      field: 'endDate',
      headerName: 'تاريخ الانتهاء',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('ar-EG'),
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        الاشتراكات
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        عرض وإدارة اشتراكات الشركات
      </Typography>

      <Box sx={{ flex: 1, width: '100%' }}>
        <DataGrid
          rows={subscriptions}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
        />
      </Box>
    </Box>
  );
}

