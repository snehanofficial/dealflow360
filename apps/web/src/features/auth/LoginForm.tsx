import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import { LoginRequestSchema, LoginRequest } from '@dealflow360/contracts';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Alert } from '../../components/ui/Alert.js';
import { ShieldCheck } from 'lucide-react';
import axios from 'axios';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      setApiError(null);
      await login(data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
        setApiError(err.response.data.error.message);
      } else {
        setApiError('Failed to log in. Please check your credentials.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-[#714B67] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to DealFlow360
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500">
          Commercial Governance & Sales-to-Cash Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-lg sm:px-10 space-y-6">
          {apiError && (
            <Alert type="danger" title="Authentication Error">
              {apiError}
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email Address"
              type="email"
              placeholder="user@dealflow360.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-[#714B67] hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 bg-slate-50 p-3 rounded">
            <p className="font-semibold text-slate-700 mb-1">Development Seed Users:</p>
            <ul className="space-y-0.5 font-mono text-[11px]">
              <li>sales.rep@dealflow360.com (Sales Rep)</li>
              <li>sales.manager@dealflow360.com (Sales Manager)</li>
              <li>finance@dealflow360.com (Finance)</li>
              <li>admin@dealflow360.com (Admin)</li>
            </ul>
            <p className="mt-1 text-[10px] text-slate-400">Password: Password123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
