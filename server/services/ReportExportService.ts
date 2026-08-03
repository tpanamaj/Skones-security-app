import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';

interface ReportData {
  title: string;
  generatedAt: Date;
  data: any[];
  columns: Array<{ key: string; label: string }>;
}

class ReportExportService {
  private static instance: ReportExportService;

  private constructor() {}

  static getInstance(): ReportExportService {
    if (!ReportExportService.instance) {
      ReportExportService.instance = new ReportExportService();
    }
    return ReportExportService.instance;
  }

  generatePDF(reportData: ReportData): Buffer {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(20).fontBold().text(reportData.title, 50, 50);
    doc.fontSize(10).fontNormal().text(`Generated: ${format(reportData.generatedAt, 'PPpp')}`, 50, 80);

    // Table
    let yPosition = 120;
    const columnWidth = (doc.page.width - 100) / reportData.columns.length;

    // Headers
    doc.fontSize(10).fontBold();
    reportData.columns.forEach((col, idx) => {
      doc.text(col.label, 50 + idx * columnWidth, yPosition, { width: columnWidth });
    });

    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(doc.page.width - 50, yPosition).stroke();
    yPosition += 10;

    // Data rows
    doc.fontSize(9).fontNormal();
    reportData.data.forEach((row) => {
      if (yPosition > doc.page.height - 50) {
        doc.addPage();
        yPosition = 50;
      }

      reportData.columns.forEach((col, idx) => {
        doc.text(String(row[col.key] || ''), 50 + idx * columnWidth, yPosition, { width: columnWidth });
      });

      yPosition += 20;
    });

    doc.end();

    return Buffer.concat(chunks);
  }

  async generateExcel(reportData: ReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Add title
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = reportData.title;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'center' };

    // Add generated date
    worksheet.mergeCells('A2:F2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Generated: ${format(reportData.generatedAt, 'PPpp')}`;
    dateCell.font = { size: 10, italic: true };

    // Add headers
    worksheet.addRow(reportData.columns.map((col) => col.label));
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    // Add data rows
    reportData.data.forEach((row) => {
      worksheet.addRow(reportData.columns.map((col) => row[col.key] || ''));
    });

    // Auto-fit columns
    reportData.columns.forEach((_, idx) => {
      worksheet.columns[idx].width = 15;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }

  async generatePayrollReport(
    cycleId: string,
    data: any[]
  ): Promise<{ pdf: Buffer; excel: Buffer }> {
    const reportData: ReportData = {
      title: `Payroll Report - ${cycleId}`,
      generatedAt: new Date(),
      data,
      columns: [
        { key: 'guardName', label: 'Guard Name' },
        { key: 'baseSalary', label: 'Base Salary' },
        { key: 'allowances', label: 'Allowances' },
        { key: 'deductions', label: 'Deductions' },
        { key: 'taxes', label: 'Taxes' },
        { key: 'netPay', label: 'Net Pay' },
      ],
    };

    return {
      pdf: this.generatePDF(reportData),
      excel: await this.generateExcel(reportData),
    };
  }

  async generateIncidentReport(
    startDate: Date,
    endDate: Date,
    data: any[]
  ): Promise<{ pdf: Buffer; excel: Buffer }> {
    const reportData: ReportData = {
      title: `Incident Report - ${format(startDate, 'PP')} to ${format(endDate, 'PP')}`,
      generatedAt: new Date(),
      data,
      columns: [
        { key: 'title', label: 'Incident' },
        { key: 'severity', label: 'Severity' },
        { key: 'location', label: 'Location' },
        { key: 'status', label: 'Status' },
        { key: 'reportedBy', label: 'Reported By' },
        { key: 'responseTime', label: 'Response Time (min)' },
      ],
    };

    return {
      pdf: this.generatePDF(reportData),
      excel: await this.generateExcel(reportData),
    };
  }
}

export default ReportExportService;
