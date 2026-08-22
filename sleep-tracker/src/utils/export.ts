import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import { ENTRY_DISPLAY } from '@/components/entryDisplay';
import type { LogEntry } from '@/types';
import { formatDateTime } from '@/utils/time';

interface ExportRow {
  date: string;
  type: string;
  details: string;
}

function toRows(entries: LogEntry[]): ExportRow[] {
  return entries.map((entry) => {
    const isMedication = entry.type === 'MEDICATION';
    const label = ENTRY_DISPLAY[entry.type].label;
    const details = isMedication
      ? [entry.medicationName, entry.dosage, entry.notes]
          .filter(Boolean)
          .join(' — ')
      : '';
    return {
      date: formatDateTime(entry.timestamp),
      type: label,
      details,
    };
  });
}

async function shareFile(uri: string, mimeType: string, dialogTitle: string) {
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle });
  }
}

export async function exportAsMarkdown(entries: LogEntry[]): Promise<void> {
  const rows = toRows(entries);
  const lines = [
    '# Sleep Tracker History',
    '',
    '| Date & time | Type | Details |',
    '| --- | --- | --- |',
    ...rows.map((r) => `| ${r.date} | ${r.type} | ${r.details} |`),
  ];
  const uri = `${FileSystem.cacheDirectory}sleep-tracker-history.md`;
  await FileSystem.writeAsStringAsync(uri, lines.join('\n'));
  await shareFile(uri, 'text/markdown', 'Export history as Markdown');
}

export async function exportAsExcel(entries: LogEntry[]): Promise<void> {
  const rows = toRows(entries);
  const worksheet = XLSX.utils.json_to_sheet(
    rows.map((r) => ({ 'Date & time': r.date, Type: r.type, Details: r.details }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'History');
  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

  const uri = `${FileSystem.cacheDirectory}sleep-tracker-history.xlsx`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  await shareFile(
    uri,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Export history as Excel'
  );
}

export async function exportAsPdf(entries: LogEntry[]): Promise<void> {
  const rows = toRows(entries);
  const html = `
    <html>
      <body style="font-family: -apple-system, sans-serif; padding: 24px;">
        <h1 style="font-size: 20px;">Sleep Tracker History</h1>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr>
              <th style="text-align:left; border-bottom: 1px solid #ccc; padding: 6px;">Date &amp; time</th>
              <th style="text-align:left; border-bottom: 1px solid #ccc; padding: 6px;">Type</th>
              <th style="text-align:left; border-bottom: 1px solid #ccc; padding: 6px;">Details</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) => `
              <tr>
                <td style="padding: 6px; border-bottom: 1px solid #eee;">${r.date}</td>
                <td style="padding: 6px; border-bottom: 1px solid #eee;">${r.type}</td>
                <td style="padding: 6px; border-bottom: 1px solid #eee;">${r.details}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  const { uri } = await Print.printToFileAsync({ html });
  await shareFile(uri, 'application/pdf', 'Export history as PDF');
}
