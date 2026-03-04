'use client';

import { Input } from '@/design/ui';
import { AIRPORTS, FilterBar, FilterButton } from './bookings-styles';
import type { Booking } from '@/lib/services/database-service';

interface BookingFiltersProps {
  bookings: Booking[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedAirport: string;
  onAirportChange: (airport: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
}

export function BookingFilters({
  bookings,
  selectedStatus,
  onStatusChange,
  selectedAirport,
  onAirportChange,
  searchQuery,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: BookingFiltersProps) {
  return (
    <FilterBar>
      <FilterButton $active={selectedStatus === 'all'} onClick={() => onStatusChange('all')}>
        All ({bookings.length})
      </FilterButton>
      <FilterButton $active={selectedStatus === 'pending'} onClick={() => onStatusChange('pending')}>
        Pending ({bookings.filter((b) => b.status === 'pending').length})
      </FilterButton>
      <FilterButton $active={selectedStatus === 'confirmed'} onClick={() => onStatusChange('confirmed')}>
        Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
      </FilterButton>
      <FilterButton $active={selectedStatus === 'requires_approval'} onClick={() => onStatusChange('requires_approval')}>
        Needs Approval ({bookings.filter((b) => b.status === 'requires_approval').length})
      </FilterButton>
      <FilterButton $active={selectedStatus === 'completed'} onClick={() => onStatusChange('completed')}>
        Completed ({bookings.filter((b) => b.status === 'completed').length})
      </FilterButton>
      <div style={{ flexGrow: 1 }} />
      <select
        value={selectedAirport}
        onChange={(e) => onAirportChange(e.target.value)}
        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
        aria-label="Filter by airport"
      >
        {AIRPORTS.map((a) => (
          <option key={a.code} value={a.code}>
            {a.label}
          </option>
        ))}
      </select>
      <Input
        type="search"
        placeholder="Search name, email, phone, route, ID"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ maxWidth: 260 }}
      />
      <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} aria-label="Start date" />
      <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} aria-label="End date" />
    </FilterBar>
  );
}
