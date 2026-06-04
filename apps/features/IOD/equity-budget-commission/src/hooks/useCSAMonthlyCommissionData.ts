import { useState, useCallback, useEffect } from 'react';
import { fetchCSAMonthlyComm } from '../services/csa-monthly-service';
import { CSAMonthlyCommission
} from '../datatypes/tcw-commission-types';

interface UseCSAMonthlyCommProps {
  month: number
}

export function useCSAMonthlyCommission({ month }: UseCSAMonthlyCommProps) {
    const [csaMonthlyComms, setCSAMonthlyComms] = useState<CSAMonthlyCommission[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const reload = useCallback(async () => {
        try{
            if (!month) {  
                setCSAMonthlyComms([]);  
                return;  
            }

            setIsLoading(true);
            const [csaMonthlyData] = await Promise.all([
                fetchCSAMonthlyComm(month),
            ]);

            setCSAMonthlyComms(csaMonthlyData);
        }        
        finally{
            setIsLoading(false);
        }
    }, [month]);

    useEffect(() => {  
        reload();  
    }, []);    
  
    return {
      isLoading,
      csaMonthlyComms,
      reload
    };
};