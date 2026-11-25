// Single source of truth for admin availability (SRS 3.2 / BR-07, BR-08).
// Every status display on the page must call getAdminStatus().

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Day of week (0=Sun) and hour (0–23) in the given IANA timezone, independent of the device timezone. */
export function zonedDayHour(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const day = WEEKDAYS[get('weekday')];
  const hour = Number(get('hour'));
  if (day === undefined || !Number.isInteger(hour)) throw new Error('Unable to resolve zoned time');
  return { day, hour };
}

const DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * P3-04: when the admin is offline, tell visitors when replies resume, e.g. "Besok 08.00 WIB",
 * "Senin 08.00 WIB" or "Hari ini 08.00 WIB". Returns null when online or unknown.
 */
export function nextOpenLabel(hoursConfig, date = new Date()) {
  let now;
  try { now = zonedDayHour(date, hoursConfig.timezone); } catch { return null; }
  const { days_open, open_hour, close_hour } = hoursConfig;
  const hh = `${String(open_hour).padStart(2, '0')}.00 WIB`;
  if (days_open.includes(now.day) && now.hour >= open_hour && now.hour < close_hour) return null;
  if (days_open.includes(now.day) && now.hour < open_hour) return `Hari ini ${hh}`;
  for (let offset = 1; offset <= 7; offset += 1) {
    const day = (now.day + offset) % 7;
    if (days_open.includes(day)) return `${offset === 1 ? 'Besok' : DAY_NAMES_ID[day]} ${hh}`;
  }
  return null;
}

/**
 * @returns {{ known: boolean, online: boolean, label: string }}
 * Fails closed: if the time cannot be resolved, it never claims the admin is online.
 */
export function getAdminStatus(hoursConfig, date = new Date()) {
  try {
    const { day, hour } = zonedDayHour(date, hoursConfig.timezone);
    const online =
      hoursConfig.days_open.includes(day) &&
      hour >= hoursConfig.open_hour &&
      hour < hoursConfig.close_hour;
    return { known: true, online, label: online ? 'Admin Online' : 'Di Luar Jam Operasional' };
  } catch {
    return { known: false, online: false, label: `Jam admin: ${hoursConfig.label}` };
  }
}
