declare module 'ics' {
  export interface EventAttributes {
    start: number[];
    startInputType?: 'local' | 'utc';
    startOutputType?: 'local' | 'utc';
    end?: number[];
    endInputType?: 'local' | 'utc';
    endOutputType?: 'local' | 'utc';
    duration?: { hours: number; minutes: number };
    title: string;
    description?: string;
    location?: string;
    organizer?: { name: string; email: string };
  }
  export function createEvent(event: EventAttributes, callback: (error: Error | null, value: string) => void): void;
} 
