'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth/auth.service';
import { ApiError } from '@/libs/api/api-error';

export function useLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setValidationErrors([]);
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      if (response.accessToken) {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors && err.validationErrors.length > 0) {
          setValidationErrors(err.validationErrors);
        }
      } else {
        setError((err instanceof Error ? err.message : undefined) || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    validationErrors,
    handleSubmit,
  };
}

