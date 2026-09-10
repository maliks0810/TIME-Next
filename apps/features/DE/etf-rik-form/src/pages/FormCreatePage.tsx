import React from "react";
import AllocationForm from "../components/forms/AllocationForm"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const FormCreatePage: React.FC = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AllocationForm />
    </QueryClientProvider>
  );
};

export default FormCreatePage;