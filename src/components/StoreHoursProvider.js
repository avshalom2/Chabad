'use client';

import { createContext } from 'react';
export const StoreHoursContext = createContext(undefined);
export default function StoreHoursProvider({ details, children }) {
  return <StoreHoursContext.Provider value={details}>{children}</StoreHoursContext.Provider>;
}
