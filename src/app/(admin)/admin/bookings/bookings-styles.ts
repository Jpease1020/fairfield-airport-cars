import styled from 'styled-components';

export const BookingCard = styled.div<{ $isException?: boolean }>`
  background: white;
  border: 1px solid ${(props) => (props.$isException ? '#f59e0b' : '#e5e7eb')};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  ${(props) =>
    props.$isException &&
    `
    border-left: 4px solid #f59e0b;
    background: #fffbeb;
  `}
`;

export const BookingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
`;

export const CustomerInfo = styled.div`
  flex: 1;
`;

export const CustomerName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

export const CustomerContact = styled.div`
  font-size: 14px;
  color: #6b7280;

  a {
    color: #2563eb;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const StatusBadge = styled.span<{ $variant: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;

  ${(props) => {
    switch (props.$variant) {
      case 'pending':
        return 'background: #fef3c7; color: #92400e;';
      case 'confirmed':
        return 'background: #d1fae5; color: #065f46;';
      case 'completed':
        return 'background: #dbeafe; color: #1e40af;';
      case 'cancelled':
        return 'background: #fee2e2; color: #991b1b;';
      case 'in-progress':
        return 'background: #e0e7ff; color: #3730a3;';
      case 'requires_approval':
        return 'background: #fef3c7; color: #92400e; border: 1px dashed #f59e0b;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  }}
`;

export const BookingDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const DetailSection = styled.div``;

export const DetailLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

export const DetailValue = styled.div`
  font-size: 15px;
  color: #111827;
`;

export const RouteDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const LocationRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

export const LocationIcon = styled.span`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  flex-shrink: 0;
`;

export const PickupIcon = styled(LocationIcon)`
  background: #d1fae5;
  color: #065f46;
`;

export const DropoffIcon = styled(LocationIcon)`
  background: #fee2e2;
  color: #991b1b;
`;

export const LocationText = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
`;

export const BookingFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
`;

export const FareDisplay = styled.div`
  text-align: right;
`;

export const FareAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

export const FareStatus = styled.div<{ $paid?: boolean }>`
  font-size: 12px;
  color: ${(props) => (props.$paid ? '#065f46' : '#dc2626')};
  font-weight: 500;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const PageContainer = styled.div`
  padding: 24px 0;
  max-width: 1200px;
  margin: 0 auto;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

export const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

export const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${(props) => (props.$active ? '#2563eb' : '#e5e7eb')};
  background: ${(props) => (props.$active ? '#2563eb' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#374151')};

  &:hover {
    border-color: #2563eb;
  }
`;

export const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

export const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`;

export const StatLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
`;

export const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

export const BookingsCount = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
`;

export const AIRPORTS = [
  { code: 'all', label: 'All airports' },
  { code: 'JFK', label: 'JFK' },
  { code: 'LGA', label: 'LGA' },
  { code: 'EWR', label: 'EWR' },
  { code: 'BDL', label: 'BDL' },
  { code: 'HVN', label: 'HVN' },
  { code: 'HPN', label: 'HPN' },
];
