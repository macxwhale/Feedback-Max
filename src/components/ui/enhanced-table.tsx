
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface EnhancedTableProps {
  data: any[];
  columns: Column[];
  isLoading?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (row: any) => void;
  className?: string;
}

export const EnhancedTable: React.FC<EnhancedTableProps> = ({
  data,
  columns,
  isLoading = false,
  onSort,
  sortKey,
  sortDirection,
  onRowClick,
  className
}) => {
  const { isMobile } = useResponsiveDesign();

  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <SkeletonLoader type="table" />
      </div>
    );
  }

  // Mobile card layout
  if (isMobile) {
    return (
      <div className={cn('space-y-3', className)}>
        {data.map((row, index) => (
          <Card
            key={index}
            className={cn(
              'p-4 space-y-3 transition-all duration-200',
              onRowClick && 'cursor-pointer hover:shadow-md active:scale-[0.98]'
            )}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600">
                  {column.header}
                </span>
                <div className="text-sm text-right flex-1 ml-2">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div className={cn('rounded-lg border overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  'font-semibold',
                  column.width && `w-${column.width}`,
                  column.sortable && 'cursor-pointer hover:bg-gray-100 select-none'
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortKey === column.key && (
                    <div className="flex flex-col">
                      {sortDirection === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              className={cn(
                'transition-colors duration-150',
                onRowClick && 'cursor-pointer hover:bg-gray-50 active:bg-gray-100'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
