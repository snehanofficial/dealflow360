import { InvoiceDto } from '@dealflow360/contracts';

export class InvoiceExportService {
  /**
   * Generates a valid PDF document buffer for a single invoice.
   */
  public generateInvoicePdfBuffer(invoice: any): Buffer {
    const lines = invoice.lines || [];
    const issueDateVal = invoice.issueDate instanceof Date ? invoice.issueDate : new Date(invoice.issueDate);
    const dueDateVal = invoice.dueDate ? (invoice.dueDate instanceof Date ? invoice.dueDate : new Date(invoice.dueDate)) : null;
    const formattedIssueDate = issueDateVal.toLocaleDateString();
    const formattedDueDate = dueDateVal ? dueDateVal.toLocaleDateString() : 'N/A';

    // Simple, robust PDF 1.4 binary document generator
    const pdfContent: string[] = [];
    pdfContent.push('%PDF-1.4');
    pdfContent.push('%🏼🏽🏿'); // Binary marker

    const objects: string[] = [];

    // Catalog (Obj 1)
    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    // Pages (Obj 2)
    objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
    // Page (Obj 3)
    objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj');
    // Font F1 (Helvetica - Regular)
    objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
    // Font F2 (Helvetica - Bold)
    objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');

    // Page Content Stream (Obj 6)
    const streamCommands: string[] = [];

    // Colors & Layout Setup
    streamCommands.push('0 0 0 rg'); // Text Color: Dark

    // Header Background Pill
    streamCommands.push('0.443 0.294 0.404 rg'); // #714B67 Brand Purple
    streamCommands.push('40 730 532 40 re f');

    // Header Title
    streamCommands.push('1 1 1 rg'); // White text
    streamCommands.push('BT /F2 16 Tf 50 745 Td (DEALFLOW360 - COMMERCIAL TAX INVOICE) Tj ET');

    // Invoice Metadata Block
    streamCommands.push('0.1 0.1 0.1 rg');
    streamCommands.push(`BT /F2 14 Tf 40 700 Td (Invoice #: ${invoice.invoiceNumber}) Tj ET`);
    streamCommands.push(`BT /F1 10 Tf 40 684 Td (Status: ${invoice.status}  |  Issue Date: ${formattedIssueDate}  |  Due Date: ${formattedDueDate}) Tj ET`);

    // Customer Info Box
    streamCommands.push('0.95 0.95 0.97 rg'); // Light gray bg
    streamCommands.push('40 595 532 75 re f');
    streamCommands.push('0.2 0.2 0.2 rg');
    streamCommands.push('BT /F2 11 Tf 50 653 Td (BILLED TO:) Tj ET');
    streamCommands.push(`BT /F2 11 Tf 120 653 Td (${invoice.customerName.substring(0, 45)}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 50 637 Td (Email: ${invoice.customerEmail}  |  Tier: ${invoice.customerTier}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 50 621 Td (Region: ${invoice.customerRegion}  |  Phone: ${invoice.customerPhone || 'N/A'}) Tj ET`);

    // Line Items Table Header
    streamCommands.push('0.443 0.294 0.404 rg');
    streamCommands.push('40 560 532 20 re f');
    streamCommands.push('1 1 1 rg');
    streamCommands.push('BT /F2 9 Tf 50 566 Td (Item Description & SKU) Tj ET');
    streamCommands.push('BT /F2 9 Tf 260 566 Td (Qty) Tj ET');
    streamCommands.push('BT /F2 9 Tf 310 566 Td (Unit Price) Tj ET');
    streamCommands.push('BT /F2 9 Tf 390 566 Td (Tax) Tj ET');
    streamCommands.push('BT /F2 9 Tf 440 566 Td (Discount) Tj ET');
    streamCommands.push('BT /F2 9 Tf 510 566 Td (Total) Tj ET');

    // Table Lines
    let currentY = 538;
    streamCommands.push('0.15 0.15 0.15 rg');

    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      const line = lines[i];
      // Alternate row background
      if (i % 2 === 1) {
        streamCommands.push(`0.97 0.97 0.98 rg 40 ${currentY - 4} 532 18 re f 0.15 0.15 0.15 rg`);
      }

      const prodName = (line.productName || 'Product').substring(0, 30);
      const sku = (line.productSku || 'SKU').substring(0, 15);
      const qtyStr = `${line.quantity}`;
      const unitPriceStr = `$${line.unitPrice.toFixed(2)}`;
      const taxStr = `$${line.taxAmount.toFixed(2)}`;
      const discStr = `${line.proposedDiscountPercent}%`;
      const totalStr = `$${line.lineTotal.toFixed(2)}`;

      streamCommands.push(`BT /F1 9 Tf 50 ${currentY} Td (${prodName} [${sku}]) Tj ET`);
      streamCommands.push(`BT /F1 9 Tf 265 ${currentY} Td (${qtyStr}) Tj ET`);
      streamCommands.push(`BT /F1 9 Tf 310 ${currentY} Td (${unitPriceStr}) Tj ET`);
      streamCommands.push(`BT /F1 9 Tf 390 ${currentY} Td (${taxStr}) Tj ET`);
      streamCommands.push(`BT /F1 9 Tf 440 ${currentY} Td (${discStr}) Tj ET`);
      streamCommands.push(`BT /F2 9 Tf 510 ${currentY} Td (${totalStr}) Tj ET`);

      currentY -= 20;
    }

    // Financial Summary Totals Block
    const summaryY = Math.max(currentY - 10, 180);
    streamCommands.push(`0.94 0.94 0.96 rg 340 ${summaryY - 90} 232 90 re f 0.2 0.2 0.2 rg`);

    const subtotalVal = (invoice.subtotal ?? 0).toFixed(2);
    const taxVal = (invoice.taxAmount ?? 0).toFixed(2);
    const discountVal = (invoice.totalDiscount ?? 0).toFixed(2);
    const totalVal = (invoice.totalAmount ?? 0).toFixed(2);

    streamCommands.push(`BT /F1 9 Tf 350 ${summaryY - 20} Td (Subtotal:) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 465 ${summaryY - 20} Td ($${subtotalVal}) Tj ET`);

    streamCommands.push(`BT /F1 9 Tf 350 ${summaryY - 35} Td (+ Total Tax:) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 465 ${summaryY - 35} Td ($${taxVal}) Tj ET`);

    streamCommands.push(`BT /F1 9 Tf 350 ${summaryY - 50} Td (- Total Discount:) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 465 ${summaryY - 50} Td ($${discountVal}) Tj ET`);

    streamCommands.push('0.443 0.294 0.404 rg');
    streamCommands.push(`BT /F2 10 Tf 350 ${summaryY - 75} Td (NET TOTAL AMOUNT:) Tj ET`);
    streamCommands.push(`BT /F2 11 Tf 465 ${summaryY - 75} Td ($${totalVal}) Tj ET`);

    // Footer Terms
    streamCommands.push('0.5 0.5 0.5 rg');
    streamCommands.push('BT /F1 8 Tf 40 50 Td (DealFlow360 Sales-to-Cash Platform  |  Governed Financial Invoice Snapshot  |  Page 1 of 1) Tj ET');

    const streamText = streamCommands.join('\n');
    objects.push(`6 0 obj\n<< /Length ${Buffer.byteLength(streamText)} >>\nstream\n${streamText}\nendstream\nendobj`);

    // Construct xref table & trailer
    let offset = pdfContent.join('\n').length + 1;
    const xrefs: string[] = ['0000000000 65535 f '];

    const body = objects.join('\n\n');
    for (const obj of objects) {
      xrefs.push(`${offset.toString().padStart(10, '0')} 00000 n `);
      offset += obj.length + 2; // account for newlines
    }

    const pdfString = `${pdfContent.join('\n')}\n${body}\nxref\n0 ${objects.length + 1}\n${xrefs.join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;

    return Buffer.from(pdfString, 'utf-8');
  }

  /**
   * Generates a structured Excel XML (.xlsx compatible) buffer for a single invoice.
   */
  public generateInvoiceXlsxBuffer(invoice: any): Buffer {
    const lines = invoice.lines || [];
    const issueDate = new Date(invoice.issueDate).toLocaleDateString();
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderTitle">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#714B67"/>
  </Style>
  <Style ss:ID="TableHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#714B67" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BoldCell">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="$#,##0.00"/>
  </Style>
  <Style ss:ID="Percent">
   <NumberFormat ss:Format="0.0%"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Invoice ${invoice.invoiceNumber}">
  <Table>
   <Column ss:Width="140"/>
   <Column ss:Width="160"/>
   <Column ss:Width="80"/>
   <Column ss:Width="100"/>
   <Column ss:Width="80"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>

   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderTitle"><Data ss:Type="String">DealFlow360 Tax Invoice</Data></Cell>
   </Row>
   <Row><Cell><Data ss:Type="String">Invoice Number:</Data></Cell><Cell ss:StyleID="BoldCell"><Data ss:Type="String">${invoice.invoiceNumber}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Status:</Data></Cell><Cell><Data ss:Type="String">${invoice.status}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Issue Date:</Data></Cell><Cell><Data ss:Type="String">${issueDate}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Due Date:</Data></Cell><Cell><Data ss:Type="String">${dueDate}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Customer Name:</Data></Cell><Cell ss:StyleID="BoldCell"><Data ss:Type="String">${invoice.customerName}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Customer Email:</Data></Cell><Cell><Data ss:Type="String">${invoice.customerEmail}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Customer Tier:</Data></Cell><Cell><Data ss:Type="String">${invoice.customerTier}</Data></Cell></Row>
   <Row></Row>

   <Row ss:Height="20">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Line #</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Product Name</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">SKU</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Quantity</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Unit Price ($)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tax Rate (%)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tax ($)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Discount (%)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Line Total ($)</Data></Cell>
   </Row>\n`;

    lines.forEach((line: any, index: number) => {
      xml += `   <Row>
    <Cell><Data ss:Type="Number">${index + 1}</Data></Cell>
    <Cell><Data ss:Type="String">${line.productName}</Data></Cell>
    <Cell><Data ss:Type="String">${line.productSku}</Data></Cell>
    <Cell><Data ss:Type="Number">${line.quantity}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${line.unitPrice}</Data></Cell>
    <Cell><Data ss:Type="Number">${line.taxRate}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${line.taxAmount}</Data></Cell>
    <Cell><Data ss:Type="Number">${line.proposedDiscountPercent}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${line.lineTotal}</Data></Cell>
   </Row>\n`;
    });

    xml += `   <Row></Row>
   <Row><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Gross Subtotal:</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${invoice.subtotal}</Data></Cell></Row>
   <Row><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell ss:StyleID="BoldCell"><Data ss:Type="String">+ Total Tax:</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${invoice.taxAmount}</Data></Cell></Row>
   <Row><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell ss:StyleID="BoldCell"><Data ss:Type="String">- Total Discount:</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${invoice.totalDiscount}</Data></Cell></Row>
   <Row><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell ss:StyleID="HeaderTitle"><Data ss:Type="String">NET TOTAL:</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${invoice.totalAmount}</Data></Cell></Row>
  </Table>
 </Worksheet>
</Workbook>`;

    return Buffer.from(xml, 'utf-8');
  }

  /**
   * Generates a multi-record Excel XML (.xlsx compatible) buffer for a list of invoices.
   */
  public generateInvoicesListXlsxBuffer(invoices: any[]): Buffer {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderTitle">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#714B67"/>
  </Style>
  <Style ss:ID="TableHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#714B67" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BoldCell">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="$#,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Commercial Invoices Registry">
  <Table>
   <Column ss:Width="130"/>
   <Column ss:Width="90"/>
   <Column ss:Width="180"/>
   <Column ss:Width="180"/>
   <Column ss:Width="90"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>

   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderTitle"><Data ss:Type="String">DealFlow360 Commercial Invoices Registry</Data></Cell>
   </Row>
   <Row><Cell><Data ss:Type="String">Exported On:</Data></Cell><Cell ss:StyleID="BoldCell"><Data ss:Type="String">${new Date().toLocaleString()}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Total Invoice Records:</Data></Cell><Cell ss:StyleID="BoldCell"><Data ss:Type="Number">${invoices.length}</Data></Cell></Row>
   <Row></Row>

   <Row ss:Height="22">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Invoice Number</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Customer Name</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Customer Email</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tier</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Issue Date</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Due Date</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Subtotal ($)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tax ($)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Discount ($)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Total Amount ($)</Data></Cell>
   </Row>\n`;

    let grandTotal = 0;

    invoices.forEach((inv: any) => {
      if (inv.status !== 'VOID') grandTotal += inv.totalAmount;
      const issueDate = new Date(inv.issueDate).toLocaleDateString();
      const dueDate = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A';

      xml += `   <Row>
    <Cell><Data ss:Type="String">${inv.invoiceNumber}</Data></Cell>
    <Cell><Data ss:Type="String">${inv.status}</Data></Cell>
    <Cell><Data ss:Type="String">${inv.customerName}</Data></Cell>
    <Cell><Data ss:Type="String">${inv.customerEmail}</Data></Cell>
    <Cell><Data ss:Type="String">${inv.customerTier}</Data></Cell>
    <Cell><Data ss:Type="String">${issueDate}</Data></Cell>
    <Cell><Data ss:Type="String">${dueDate}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${inv.subtotal}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${inv.taxAmount}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${inv.totalDiscount}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${inv.totalAmount}</Data></Cell>
   </Row>\n`;
    });

    xml += `   <Row></Row>
   <Row><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell/><Cell ss:StyleID="HeaderTitle"><Data ss:Type="String">GRAND TOTAL:</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${grandTotal}</Data></Cell></Row>
  </Table>
 </Worksheet>
</Workbook>`;

    return Buffer.from(xml, 'utf-8');
  }
}

export const invoiceExportService = new InvoiceExportService();
