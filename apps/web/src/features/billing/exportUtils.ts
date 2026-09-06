import { api } from '../../lib/api/client.js';

/**
 * Triggers browser file download from a Blob object
 */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Downloads a single invoice formatted as a PDF document.
 */
export async function downloadInvoicePdf(invoiceId: string, invoiceNumber: string): Promise<void> {
  const res = await api.get(`/invoices/${invoiceId}/export/pdf`, {
    responseType: 'blob',
  });

  const blob = new Blob([res.data], { type: 'application/pdf' });
  const filename = `Invoice-${invoiceNumber || invoiceId}.pdf`;
  triggerBlobDownload(blob, filename);
}

/**
 * Downloads a single invoice formatted as an Excel (.xlsx) file.
 */
export async function downloadInvoiceXlsx(invoiceId: string, invoiceNumber: string): Promise<void> {
  const res = await api.get(`/invoices/${invoiceId}/export/xlsx`, {
    responseType: 'blob',
  });

  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const filename = `Invoice-${invoiceNumber || invoiceId}.xlsx`;
  triggerBlobDownload(blob, filename);
}

/**
 * Downloads bulk list of commercial invoices as an Excel (.xlsx) spreadsheet.
 */
export async function downloadInvoicesListXlsx(params?: Record<string, string>): Promise<void> {
  const res = await api.get('/invoices/export/xlsx', {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Invoices-Export-${dateStr}.xlsx`;
  triggerBlobDownload(blob, filename);
}
