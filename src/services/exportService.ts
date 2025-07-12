
export interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  includeAnalytics?: boolean;
}

export const exportFeedbackData = async (
  data: any[],
  options: ExportOptions
): Promise<void> => {
  const { format, dateRange } = options;
  
  // Filter data by date range if provided
  let filteredData = data;
  if (dateRange?.from || dateRange?.to) {
    filteredData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      if (dateRange.from && itemDate < dateRange.from) return false;
      if (dateRange.to && itemDate > dateRange.to) return false;
      return true;
    });
  }

  switch (format) {
    case 'csv':
      return exportAsCSV(filteredData);
    case 'excel':
      return exportAsExcel(filteredData);
    case 'json':
      return exportAsJSON(filteredData);
    case 'pdf':
      return exportAsPDF(filteredData);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

const exportAsCSV = (data: any[]) => {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  downloadFile(csvContent, 'feedback-data.csv', 'text/csv');
};

const exportAsJSON = (data: any[]) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, 'feedback-data.json', 'application/json');
};

const exportAsExcel = (data: any[]) => {
  // Simplified Excel export - in real implementation, use a library like xlsx
  exportAsCSV(data);
};

const exportAsPDF = (data: any[]) => {
  // Simplified PDF export - in real implementation, use a library like jsPDF
  const textContent = data.map(item => JSON.stringify(item)).join('\n');
  downloadFile(textContent, 'feedback-report.txt', 'text/plain');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
