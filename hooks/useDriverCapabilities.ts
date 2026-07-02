import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useGetDriverDashboardQuery } from '../redux/slices/driverDashboardApi';
import { selectUser, setDriverServiceModes } from '../redux/slices/authSlice';
import type { DriverServiceMode } from '../services/authTypes';
import { showFoodTab, showParcelTab, showTaxiTab } from '../utils/driverServiceModes';

export function useDriverCapabilities() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser) as { driver_service_modes?: DriverServiceMode[] } | null;
  const modes = (user?.driver_service_modes ?? []) as DriverServiceMode[];

  const { data: dashboard } = useGetDriverDashboardQuery(undefined, {
    pollingInterval: 120000,
  });

  useEffect(() => {
    const nextModes = dashboard?.driver.enabledServiceModes;
    if (!nextModes?.length) return;
    dispatch(setDriverServiceModes(nextModes));
  }, [dashboard?.driver.enabledServiceModes, dispatch]);

  return {
    modes,
    approvedServiceUsages: dashboard?.driver.approvedServiceUsages ?? [],
    showFood: showFoodTab(modes),
    showParcel: showParcelTab(modes),
    showTaxi: showTaxiTab(modes),
    canOperate: dashboard?.driver.canOperate ?? false,
  };
}
