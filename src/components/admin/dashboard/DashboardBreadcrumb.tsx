
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Building, LayoutDashboard } from 'lucide-react';

interface DashboardBreadcrumbProps {
  organizationName: string;
  currentPage?: string;
}

export const DashboardBreadcrumb: React.FC<DashboardBreadcrumbProps> = ({ 
  organizationName,
  currentPage = "Overview"
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin" className="flex items-center">
            <LayoutDashboard className="w-4 h-4 mr-1" />
            Admin
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink className="flex items-center">
            <Building className="w-4 h-4 mr-1" />
            {organizationName}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
