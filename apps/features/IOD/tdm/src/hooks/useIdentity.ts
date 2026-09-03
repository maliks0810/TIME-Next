import { useUserInfo } from '@platform/utils';
import { useEffect, useState } from 'react'
import { useIdentityStore } from '../stores/useIdentityStore';
import { IdentityService } from '../services/IdentityService';

export const useIdentity = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { name, email, accessToken } = useUserInfo();
  const setUserIdentity = useIdentityStore((s) => s.setUserIdentity);
  const setIdentityLoaded = useIdentityStore((s) => s.setIdentityLoaded);

  useEffect(() => {
    if (!name || !email || !accessToken) return;

    const fetchData = async () => {
      try {
        const userIdentity = await IdentityService.fetchUserIdentity(name, email, accessToken);
        setUserIdentity(userIdentity);
        setIdentityLoaded(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Failed to load user auth'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name, email, accessToken]);

  return { loading, error };
}
