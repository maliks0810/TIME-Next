// useSendEmail.ts
import { useMutation } from '@tanstack/react-query';
import { sendEmail } from './api';

export const useSendEmail = () => {
  return useMutation({
    mutationFn: sendEmail,
  });
};
