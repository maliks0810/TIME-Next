
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FormListPage from "./FormListPage";

const Dashboard: React.FC = () => {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <FormListPage />
        </QueryClientProvider>

    )
};
export default Dashboard;