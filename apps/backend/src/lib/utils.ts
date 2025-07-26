// Date utilities for Eastern time handling
export function createEasternDate(dateString: string): Date {
  // Parse YYYY-MM-DD format and create date at 5 AM Eastern time
  // This avoids midnight UTC issues that cause date rollback
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create date at 5 AM Eastern (UTC-5 in standard time, UTC-4 in daylight time)
  // We'll use 9 AM UTC (5 AM Eastern standard time) as a safe offset
  const date = new Date();
  date.setUTCFullYear(year);
  date.setUTCMonth(month - 1); // Month is 0-indexed
  date.setUTCDate(day);
  date.setUTCHours(9, 0, 0, 0); // 9 AM UTC = 5 AM Eastern (EST) or 4 AM Eastern (EDT)
  
  return date;
}

export function createTodayEasternDateString(): string {
  // Get today's date in Eastern time as YYYY-MM-DD string
  const now = new Date();
  
  // Convert to Eastern time
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  
  const year = easternTime.getFullYear();
  const month = String(easternTime.getMonth() + 1).padStart(2, '0');
  const day = String(easternTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function createFutureDateString(daysFromNow: number): string {
  // Get future date in Eastern time as YYYY-MM-DD string
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  
  // Convert to Eastern time
  const easternTime = new Date(futureDate.toLocaleString("en-US", {timeZone: "America/New_York"}));
  
  const year = easternTime.getFullYear();
  const month = String(easternTime.getMonth() + 1).padStart(2, '0');
  const day = String(easternTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
} 