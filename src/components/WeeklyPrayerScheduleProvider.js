'use client';

import { createContext } from 'react';

export const WeeklyPrayerScheduleContext = createContext(undefined);

export default function WeeklyPrayerScheduleProvider({ schedule, children }) {
  return <WeeklyPrayerScheduleContext.Provider value={schedule}>{children}</WeeklyPrayerScheduleContext.Provider>;
}
