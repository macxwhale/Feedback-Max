
import React from "react";
import { EnhancedUserManagement } from '../../admin/EnhancedUserManagement';

interface MembersTabProps {
  organization: any;
}

const MembersTab: React.FC<MembersTabProps> = ({ organization }) => (
  <EnhancedUserManagement
    organizationId={organization.id}
    organizationName={organization.name}
  />
);

export default MembersTab;
