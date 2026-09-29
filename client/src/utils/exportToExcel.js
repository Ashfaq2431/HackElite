import * as XLSX from 'xlsx';

/**
 * Exports an array of attendee registrations to an Excel (.xlsx) file.
 * @param {Array} attendees - Array of event registration objects with user details
 * @param {string} eventTitle - The title of the event
 */
export const exportAttendeesToExcel = (attendees = [], eventTitle = 'Event') => {
  if (!attendees || attendees.length === 0) {
    alert('No student registration records available to export.');
    return;
  }

  const rows = attendees.map((reg, idx) => ({
    'S.No': idx + 1,
    'Ticket ID': reg.ticketId || 'N/A',
    'Student Name': reg.user?.name || 'N/A',
    'Email': reg.user?.email || 'N/A',
    'Department': reg.user?.department || 'N/A',
    'Academic Year': reg.user?.year || 'N/A',
    'Student / Roll ID': reg.user?.studentId || 'N/A',
    'Registered Date': reg.registeredAt ? new Date(reg.registeredAt).toLocaleString() : 'N/A',
    'Attendance Status': reg.status === 'attended' ? 'Attended' : 'Registered',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Column width formatting
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 25 },
    { wch: 30 },
    { wch: 28 },
    { wch: 16 },
    { wch: 20 },
    { wch: 24 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

  const cleanName = (eventTitle || 'Event')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  const dateStr = new Date().toISOString().slice(0, 10);

  XLSX.writeFile(workbook, `${cleanName}_Registrations_${dateStr}.xlsx`);
};
