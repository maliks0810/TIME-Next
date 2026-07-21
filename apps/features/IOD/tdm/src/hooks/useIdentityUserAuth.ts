import { useUserInfo } from '@platform/utils';
import { useEffect, useState } from 'react'
import { useIdentityStore } from '../stores/useIdentityStore';
import { IdentityService } from '../services/IdentityService';

export const useIdentityUserAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { name, email, accessToken } = useUserInfo();
  const setUserAuth = useIdentityStore((s) => s.setUserAuth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userFullName = name || '';
        const userEmail = email;
        const userToken = accessToken || '';
        
        const userAuth = await IdentityService.fetchUserAuth(
          userFullName,
          userEmail,
          userToken);
        setUserAuth(userAuth);

      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Failed to load user auth'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [name, email, accessToken])

  return { loading, error };
}