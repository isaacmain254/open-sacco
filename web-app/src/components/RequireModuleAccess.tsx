import { ReactNode } from "react";
import Spinner from "@/components/Spinner";
import { AppModule, hasModuleAccess } from "@/lib/access-control";
import { useUserProfileInfo } from "@/hooks/useUserProfile";

interface RequireModuleAccessProps {
  module: AppModule;
  children: ReactNode;
}

const RequireModuleAccess = ({ module, children }: RequireModuleAccessProps) => {
  const { profile, isLoading } = useUserProfileInfo();

  if (isLoading) {
    return <div className="flex min-h-full items-center justify-center"><Spinner /></div>;
  }

  if (!hasModuleAccess(profile?.role, module)) {
    return (
      <section className="flex min-h-full items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            You do not have permission to use this module.
          </p>
        </div>
      </section>
    );
  }

  return <>{children}</>;
};

export default RequireModuleAccess;
