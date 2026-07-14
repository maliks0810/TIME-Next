import { Loader2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

type FeatureAccessResponse = {
  featureCode: string;
  isAllowed: boolean;
  userUpn?: string | null;
  message?: string | null;
};

type OktaTokenStorage = {
  accessToken?: {
    accessToken?: string;
  };
};

type RatesWaterfallAccessGateProps = {
  children: ReactNode;
};

const AUTH_PATH = '/pdm/auth/features/rates-waterfall-manager';
const API_BASE_URL = import.meta.env.VITE_PDM_API_BASE ?? '';
// const API_BASE_URL = 'http://localhost:5000';

const RATES_WATERFALL_AUTH_URL = `${API_BASE_URL}${AUTH_PATH}`;

export function RatesWaterfallAccessGate({ children }: RatesWaterfallAccessGateProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function checkAccess() {
      try {
        setIsLoading(true);

        const accessToken = getOktaAccessToken();

        if (!accessToken) {
          setIsAllowed(false);
          return;
        }

        const response = await fetch(RATES_WATERFALL_AUTH_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          setIsAllowed(false);
          return;
        }

        const access = (await response.json()) as FeatureAccessResponse;
        setIsAllowed(Boolean(access.isAllowed));
      } catch {
        if (!controller.signal.aborted) {
          setIsAllowed(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void checkAccess();

    return () => controller.abort();
  }, []);

  if (isLoading) {
    return <AccessLoading />;
  }

  if (!isAllowed) {
    return <AccessNotAvailable />;
  }

  return <>{children}</>;
}

function getOktaAccessToken(): string | null {
  try {
    const rawTokenStorage = window.localStorage.getItem('okta-token-storage');
    if (!rawTokenStorage) return null;

    const tokenStorage = JSON.parse(rawTokenStorage) as OktaTokenStorage;
    return tokenStorage.accessToken?.accessToken ?? null;
  } catch {
    return null;
  }
}

function AccessLoading() {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-8 text-sm text-slate-600">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Checking access...
    </div>
  );
}

function AccessNotAvailable() {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-8">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="text-base font-semibold text-slate-900">Access not available</div>
        <div className="mt-2 text-sm text-slate-600">
          You do not currently have permission to access this PDM feature.
        </div>
      </div>
    </div>
  );
}
