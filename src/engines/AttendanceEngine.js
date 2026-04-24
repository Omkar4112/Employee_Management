// ── Attendance & Leave Engine ──────────────────────────────────────────────
export function calcAttendancePct(employeeId, attendance) {
  const rec = attendance.find(a => a.employeeId === employeeId);
  if (!rec || rec.totalDays === 0) return 0;
  return Math.round((rec.presentDays / rec.totalDays) * 100);
}

export function isOnLeaveToday(employeeId, leaves) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return leaves.some(l => {
    if (l.employeeId !== employeeId || l.status !== 'Approved') return false;
    const s = new Date(l.startDate); s.setHours(0,0,0,0);
    const e = new Date(l.endDate); e.setHours(0,0,0,0);
    return today >= s && today <= e;
  });
}

export function detectLeaveConflict(newLeave, existingLeaves) {
  return existingLeaves
    .filter(l => l.employeeId === newLeave.employeeId && l.status !== 'Rejected' && l.id !== newLeave.id)
    .some(l => {
      const newStart = new Date(newLeave.startDate);
      const newEnd = new Date(newLeave.endDate);
      const exStart = new Date(l.startDate);
      const exEnd = new Date(l.endDate);
      return newStart <= exEnd && newEnd >= exStart;
    });
}

export function calcLeaveBalance(employeeId, leaves) {
  const ANNUAL_LIMIT = 20;
  const used = leaves
    .filter(l => l.employeeId === employeeId && l.status === 'Approved')
    .reduce((sum, l) => {
      const diff = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      return sum + diff;
    }, 0);
  return Math.max(0, ANNUAL_LIMIT - used);
}
