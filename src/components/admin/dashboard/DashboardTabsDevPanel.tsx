
import React from "react";
import { type DashboardModuleKey } from "./DashboardTabs";

interface DashboardTabsDevPanelProps {
  isDev: boolean;
  organization: any;
  tabs: { id: string; label: string; module: DashboardModuleKey }[];
  hasModuleAccess: (module: DashboardModuleKey) => boolean;
}

export const DashboardTabsDevPanel: React.FC<DashboardTabsDevPanelProps> = ({
  isDev,
  organization,
  tabs,
  hasModuleAccess,
}) => {
  if (!isDev) return null;

  return (
    <div className="mb-3 text-xs px-2 py-2 bg-yellow-50 border border-yellow-200 rounded flex flex-col gap-2">
      {/* Organization info */}
      <div>
        <span className="font-bold">DEBUG:</span> plan_type: <span className="font-mono">{organization?.plan_type ?? "N/A"}</span>
        {' | '}
        features_config: <span className="font-mono break-all">{organization?.features_config ? JSON.stringify(organization.features_config) : "N/A"}</span>
      </div>
      {/* Table for module access */}
      <div className="mt-2">
        <table className="table-auto w-full border text-[11px]">
          <thead>
            <tr>
              <th className="border px-2 py-1">Tab</th>
              <th className="border px-2 py-1">Module Key</th>
              <th className="border px-2 py-1">Accessible?</th>
              <th className="border px-2 py-1">hasModuleAccess Result</th>
            </tr>
          </thead>
          <tbody>
            {tabs.map(tab => (
              <tr key={tab.id}>
                <td className="border px-2 py-1">{tab.label} ({tab.id})</td>
                <td className="border px-2 py-1">{tab.module}</td>
                <td className={`border px-2 py-1 font-bold ${hasModuleAccess(tab.module) ? 'text-green-700' : 'text-red-700'}`}>
                  {hasModuleAccess(tab.module) ? 'YES' : 'NO'}
                </td>
                <td className="border px-2 py-1">
                  <code>{String(hasModuleAccess(tab.module))}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
