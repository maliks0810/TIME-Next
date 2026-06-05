import { useUserInfo } from '@platform/utils';
import { useEffect, useState } from 'react'
import { useSecuritySetupStore } from '../../../stores/useSecuritySetupStore';
import { IdentityService } from '../../../services/IdentityService';

export const useIdentity = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { email } = useUserInfo();
  const setUserIdentity = useSecuritySetupStore((s) => s.setUserIdentity);

  useEffect(() => {
    if (!email) return;

    const fetchData = async () => {
      try {
        const identity = await IdentityService.fetchUserIdentity(email);
        setUserIdentity(identity);

      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Failed to load user identity'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();


  }, [email])

  return { loading, error };
}
