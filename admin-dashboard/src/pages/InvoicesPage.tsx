import { useEffect, useState } from 'react';
import { Typography, Box, Chip, IconButton } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { CheckCircle } from '@mui/icons-material';
import { api } from '../services/api';
import type { Invoice } from '../types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await api.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await api.updateInvoiceStatus(id, 'PAID');
      loadInvoices();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const columns: GridColDef[] = [
    { field: 'tenantId', headerName: 'معرف الشركة', width: 250 },
    {
      field: 'amount',
      headerName: 'المبلغ',
      width: 120,
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.value === 'PAID'
              ? 'مدفوع'
              : params.value === 'PENDING'
              ? 'معلق'
              : 'متأخر'
          }
          color={
            params.value === 'PAID'
              ? 'success'
              : params.value === 'PENDING'
              ? 'warning'
              : 'error'
          }
          size="small"
        />
      ),
    },
    {
      field: 'dueDate',
      headerName: 'تاريخ الاستحقاق',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('ar-EG'),
    },
    {
      field: 'paidAt',
      headerName: 'تاريخ الدفع',
      width: 150,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString('ar-EG') : '-',
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 100,
      renderCell: (params) =>
        params.row.status === 'PENDING' || params.row.status === 'OVERDUE' ? (
          <IconButton onClick={() => handleMarkPaid(params.row.id)} color="success">
            <CheckCircle />
          </IconButton>
        ) : null,
    },
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        الفواتير
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        عرض وإدارة فواتير الشركات
      </Typography>

      <Box sx={{ flex: 1, width: '100%' }}>
        <DataGrid
          rows={invoices}
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

