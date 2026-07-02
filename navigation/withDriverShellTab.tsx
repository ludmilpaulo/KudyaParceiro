import React from "react";
import type { DriverShellTab } from "../types/driverDashboard";
import DriverShellLayout from "../components/driver/dashboard/DriverShellLayout";

export function withDriverShellTab<P extends object>(
  Component: React.ComponentType<P>,
  activeTab: DriverShellTab,
) {
  function Wrapped(props: P) {
    return (
      <DriverShellLayout activeTab={activeTab}>
        <Component {...props} />
      </DriverShellLayout>
    );
  }
  Wrapped.displayName = `WithDriverShellTab(${Component.displayName ?? Component.name ?? "Screen"})`;
  return Wrapped;
}
