import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import { LoginRequestSchema, LoginRequest } from '@dealflow360/contracts';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Alert } from '../../components/ui/Alert.js';
import { ShieldCheck, FileText, CheckCircle, Truck, Globe, Box, Layers, ArrowRight } from 'lucide-react';
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
      const loggedUser = await login(data);
      if (loggedUser.role === 'CUSTOMER') {
        const isCustomerPath = from.startsWith('/portal');
        navigate(isCustomerPath ? from : '/portal', { replace: true });
      } else {
        const target = from === '/login' || from.startsWith('/portal') ? '/app' : from;
        navigate(target, { replace: true });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
        setApiError(err.response.data.error.message);
      } else {
        setApiError('Failed to log in. Please check your credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-white flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
      {/* Left Panel: Form Content */}
      <div className="w-full lg:w-1/2 xl:w-5/12 min-h-screen lg:min-h-0 lg:h-full flex flex-col justify-between p-6 lg:p-8 xl:p-12 bg-white z-10 overflow-y-auto custom-scrollbar">
        {/* Header Branding */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#714B67] flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">DealFlow<span className="text-[#714B67]">360</span></span>
            <p className="text-[9px] text-slate-500 font-medium leading-none">From Quote to Cash. In Control.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="my-auto py-4 w-full max-w-md mx-auto">
          <div className="mb-5">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3E9F1] text-[#714B67] mb-2">
              Enterprise Workspace
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5">Sign in to your account</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Access your DealFlow360 workspace to manage deals, risk evaluations, approvals, and billing.
            </p>
          </div>

          {apiError && (
            <div className="mb-4">
              <Alert type="danger" title="Authentication Error">
                {apiError}
              </Alert>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700">Password</label>
                <Link to="#" className="text-xs font-semibold text-[#714B67] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600">
                  Keep me signed in
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 text-sm font-semibold shadow-md bg-[#714B67] hover:bg-[#5F3D56] text-white flex items-center justify-center gap-2 transition-all mt-1"
              isLoading={isSubmitting}
            >
              Sign in to Workspace <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-5 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2.5 text-[10px] uppercase font-semibold tracking-wider text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <button type="button" className="inline-flex w-full justify-center items-center rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
              <Globe className="h-3.5 w-3.5 text-red-500 mr-1.5 flex-shrink-0" />
              Google
            </button>
            <button type="button" className="inline-flex w-full justify-center items-center rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
              <Box className="h-3.5 w-3.5 text-blue-500 mr-1.5 flex-shrink-0" />
              Microsoft
            </button>
            <button type="button" className="inline-flex w-full justify-center items-center rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-600 mr-1.5 flex-shrink-0" />
              SSO
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-[#714B67] hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 border-t border-slate-100 pt-4 gap-2">
          <p>© 2025 DealFlow360. Governance Platform.</p>
          <div className="flex space-x-3">
            <a href="#" className="hover:text-slate-600">Privacy</a>
            <a href="#" className="hover:text-slate-600">Terms</a>
            <a href="#" className="hover:text-slate-600">Support</a>
          </div>
        </div>
      </div>

      {/* Right Panel: Hero Banner Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 lg:h-full bg-[#714B67] text-white flex-col justify-between p-8 lg:p-10 xl:p-12 relative overflow-hidden">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        {/* Top Tagline */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-0.5 rounded-full text-xs font-medium text-white/90 mb-4">
            <span>B2B Sales-to-Cash Commercial Governance</span>
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-[2.6rem] font-extrabold tracking-tight leading-[1.15] text-white max-w-xl">
            Higher deals.<br />
            Lower risk.<br />
            <span className="text-[#F3E9F1]">Faster revenue.</span>
          </h2>
          <p className="text-xs sm:text-sm xl:text-base text-white/80 leading-relaxed max-w-md mt-2.5">
            DealFlow360 governs enterprise transactions with policy-driven risk evaluation, supersession approvals, multi-warehouse fulfillment, and automated billing.
          </p>
        </div>

        {/* 2x2 Feature Cards Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3 xl:gap-4 my-auto py-3 max-w-2xl">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 xl:p-4 hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center mb-2 text-white">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-0.5">Smart Quoting</h3>
            <p className="text-white/75 text-xs leading-snug">Configure products, apply policy rules, and generate quotes in seconds.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 xl:p-4 hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center mb-2 text-[#4ADE80]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-0.5">Explainable Risk</h3>
            <p className="text-white/75 text-xs leading-snug">Inspect margin impacts, risk scores, and exact policy rules for every decision.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 xl:p-4 hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center mb-2 text-[#60A5FA]">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-0.5">Automated Approvals</h3>
            <p className="text-white/75 text-xs leading-snug">Automatically route deal approvals to Sales Managers and Finance based on rules.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 xl:p-4 hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center mb-2 text-[#C084FC]">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-0.5">End-to-End Fulfillment</h3>
            <p className="text-white/75 text-xs leading-snug">Orchestrate inventory across multi-warehouse locations and manage billing schedules.</p>
          </div>
        </div>

        {/* Footer Stats & Social Proof */}
        <div className="relative z-10 border-t border-white/15 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-white/60 font-semibold mb-1.5 uppercase tracking-wider">Trusted by Enterprise Leaders</p>
            <div className="flex items-center space-x-4 text-white/90 font-bold text-xs">
              <div className="flex items-center space-x-1.5"><Box className="w-3.5 h-3.5 text-white/70"/> <span>ACME</span></div>
              <div className="flex items-center space-x-1.5"><Globe className="w-3.5 h-3.5 text-white/70"/> <span>Globex</span></div>
              <div className="flex items-center space-x-1.5"><Layers className="w-3.5 h-3.5 text-white/70"/> <span>Innotech</span></div>
            </div>
          </div>

          <div className="flex space-x-5 border-l border-white/15 pl-5">
            <div>
              <div className="text-lg xl:text-xl font-bold text-white">2.4x</div>
              <div className="text-[9px] text-white/70 uppercase tracking-wider font-medium">Faster cycle</div>
            </div>
            <div>
              <div className="text-lg xl:text-xl font-bold text-white">35%</div>
              <div className="text-[9px] text-white/70 uppercase tracking-wider font-medium">Risk reduction</div>
            </div>
            <div>
              <div className="text-lg xl:text-xl font-bold text-white">98%</div>
              <div className="text-[9px] text-white/70 uppercase tracking-wider font-medium">On-time billing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
