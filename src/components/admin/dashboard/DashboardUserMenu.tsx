
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthWrapper";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

export const DashboardUserMenu: React.FC = () => {
  const { user, isAdmin, isOrgAdmin, signOut } = useAuth();

  let role = "Member";
  if (isAdmin) role = "System Admin";
  else if (isOrgAdmin) role = "Organization Admin";

  const handleLogout = async () => {
    await signOut();
    toast.success("Successfully signed out.");
  };

  return (
    <div className="flex items-center gap-3 ml-3">
      <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <User className="w-5 h-5 text-orange-500" />
        <div className="flex flex-col text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {user?.email || "—"}
          </span>
          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
            {role}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        title="Sign out"
        onClick={handleLogout}
        className="rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
};
