declare module 'ics' {
  export interface EventAttributes {
    start: number[];
    duration?: { hours: number; minutes: number };
    title: string;
    description?: string;
    location?: string;
    organizer?: { name: string; email: string };
  }
  export function createEvent(event: EventAttributes, callback: (error: Error | null, value: string) => void): void;
} 