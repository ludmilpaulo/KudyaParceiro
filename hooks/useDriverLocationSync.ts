import { useEffect } from "react";
import * as Location from "expo-location";
import { updateDriverRideLocation } from "../services/ridesService";

/** Push GPS to `/api/rides/driver/location/` while the driver is online. */
export function useDriverLocationSync(isOnline: boolean, token: string | undefined) {
  useEffect(() => {
    if (!isOnline || !token) return;

    let cancelled = false;

    const pushLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || cancelled) return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await updateDriverRideLocation(token, loc.coords.latitude, loc.coords.longitude);
      } catch {
        // ignore transient GPS/network errors
      }
    };

    void pushLocation();
    const interval = setInterval(pushLocation, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOnline, token]);
}
