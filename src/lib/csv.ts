
function escapeCsvCell(cell: any): string {
  if (cell === null || cell === undefined) {
    return '';
  }
  const str = String(cell);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('No data available to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const cellData = row[header];
      if (typeof cellData === 'object' && cellData !== null) {
        return escapeCsvCell(JSON.stringify(cellData));
      }
      return escapeCsvCell(cellData);
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
