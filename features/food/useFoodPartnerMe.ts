import { useCallback, useEffect, useState } from 'react';
import { fetchFoodPartnerMe } from './api/foodPartnerApi';
import type { FoodPartnerMe } from './api/foodTypes';
import { extractApiErrorDetail, isNotFoodMemberError } from './foodHelpers';

export type FoodPartnerMeState = {
  me: FoodPartnerMe | null;
  loading: boolean;
  /** The account has no restaurant workspace (403/404); callers fall back to their legacy UI. */
  notMember: boolean;
  error: string | null;
  reload: () => void;
};

export function useFoodPartnerMe(enabled = true): FoodPartnerMeState {
  const [me, setMe] = useState<FoodPartnerMe | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [notMember, setNotMember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFoodPartnerMe()
      .then((data) => {
        if (cancelled) return;
        setMe(data);
        setNotMember(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setMe(null);
        if (isNotFoodMemberError(err)) {
          setNotMember(true);
        } else {
          setError(extractApiErrorDetail(err, ''));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { me, loading, notMember, error, reload };
}
