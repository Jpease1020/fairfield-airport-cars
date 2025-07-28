
import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';

// Styled table container
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
`;

// Styled table component
const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
`;

// Styled table header
const StyledTableHeader = styled.thead`
  background-color: ${colors.gray[50]};
  border-bottom: 1px solid ${colors.border.light};
`;

// Styled table body
const StyledTableBody = styled.tbody`
  & > tr:nth-child(even) {
    background-color: ${colors.gray[50]};
  }
  
  & > tr:hover {
    background-color: ${colors.gray[100]};
  }
`;

// Styled table footer
const StyledTableFooter = styled.tfoot`
  background-color: ${colors.gray[50]};
  border-top: 1px solid ${colors.border.light};
`;

// Styled table row
const StyledTableRow = styled.tr`
  transition: ${transitions.default};
  border-bottom: 1px solid ${colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

// Styled table head cell
const StyledTableHead = styled.th.withConfig({
  shouldForwardProp: (prop) => !['align', 'size'].includes(prop)
})<{
  align: 'left' | 'center' | 'right';
  size: 'sm' | 'md' | 'lg';
}>`
  padding: ${spacing.md};
  text-align: ${({ align }) => align};
  font-weight: 600;
  color: ${colors.text.primary};
  border-bottom: 2px solid ${colors.border.default};
  
  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}
`;

// Styled table cell
const StyledTableCell = styled.td.withConfig({
  shouldForwardProp: (prop) => !['align', 'size'].includes(prop)
})<{
  align: 'left' | 'center' | 'right';
  size: 'sm' | 'md' | 'lg';
}>`
  padding: ${spacing.md};
  text-align: ${({ align }) => align};
  color: ${colors.text.primary};
  
  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}
`;

// Styled table caption
const StyledTableCaption = styled.caption`
  padding: ${spacing.md};
  font-size: ${fontSize.sm};
  color: ${colors.text.secondary};
  text-align: center;
  caption-side: bottom;
`;

export interface TableProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'striped' | 'bordered' | 'compact';
  
  // Rest props
  [key: string]: any;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(({ 
  // Core props
  children,
  
  // Appearance
  variant = 'default',
  
  // Rest props
  ...props 
}, ref) => (
  <TableContainer>
    <StyledTable
      ref={ref}
      {...props}
    >
      {children}
    </StyledTable>
  </TableContainer>
));

Table.displayName = 'Table';

export interface TableHeaderProps {
  // Core props
  children: React.ReactNode;
  
  // Rest props
  [key: string]: any;
}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ 
  // Core props
  children,
  
  // Rest props
  ...props 
}, ref) => (
  <StyledTableHeader
    ref={ref}
    {...props}
  >
    {children}
  </StyledTableHeader>
));

TableHeader.displayName = 'TableHeader';

export interface TableBodyProps {
  // Core props
  children: React.ReactNode;
  
  // Rest props
  [key: string]: any;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(({ 
  // Core props
  children,
  
  // Rest props
  ...props 
}, ref) => (
  <StyledTableBody
    ref={ref}
    {...props}
  >
    {children}
  </StyledTableBody>
));

TableBody.displayName = 'TableBody';

export interface TableFooterProps {
  // Core props
  children: React.ReactNode;
  
  // Rest props
  [key: string]: any;
}

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(({ 
  // Core props
  children,
  
  // Rest props
  ...props 
}, ref) => (
  <StyledTableFooter
    ref={ref}
    {...props}
  >
    {children}
  </StyledTableFooter>
));

TableFooter.displayName = 'TableFooter';

export interface TableRowProps {
  // Core props
  children: React.ReactNode;
  
  // States
  selected?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ 
  // Core props
  children,
  
  // States
  selected = false,
  
  // Rest props
  ...props 
}, ref) => (
  <StyledTableRow
    ref={ref}
    {...props}
  >
    {children}
  </StyledTableRow>
));

TableRow.displayName = 'TableRow';

export interface TableHeadProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
  
  // Rest props
  [key: string]: any;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(({ 
  // Core props
  children,
  
  // Appearance
  align = 'left',
  size = 'md',
  
  // Rest props
  ...props 
}, ref) => (
  <StyledTableHead
    ref={ref}
    align={align}
    size={size}
    {...props}
  >
    {children}
  </StyledTableHead>
));

TableHead.displayName = 'TableHead';

export interface TableCellProps {
  // Core props
  children: React.ReactNode;
  
  // Appearance
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
  
  // Rest props
  [key: string]: any;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(({ 
  // Core props
  children,
  
  // Appearance
  align = 'left',
  size = 'md',
  
  // Rest props
  ...props 
}, ref) => (
  <StyledTableCell
    ref={ref}
    align={align}
    size={size}
    {...props}
  >
    {children}
  </StyledTableCell>
));

TableCell.displayName = 'TableCell';

export interface TableCaptionProps {
  // Core props
  children: React.ReactNode;
  
  // Rest props
  [key: string]: any;
}

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(({ 
  // Core props
  children,
  
  // Rest props
  ...props 
}, ref) => (
  <StyledTableCaption
    ref={ref}
    {...props}
  >
    {children}
  </StyledTableCaption>
));

TableCaption.displayName = 'TableCaption';
