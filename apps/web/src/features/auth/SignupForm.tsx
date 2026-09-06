import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import { SignupRequestSchema, SignupRequest } from '@dealflow360/contracts';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Alert } from '../../components/ui/Alert.js';
import {
  ShieldCheck,
  FileText,
  CheckCircle,
  Truck,
  Globe,
  Box,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  X,
  Lock,
} from 'lucide-react';
import axios from 'axios';

export const SignupForm: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupRequest>({
    resolver: zodResolver(SignupRequestSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchPassword = watch('password', '');
  const watchConfirmPassword = watch('confirmPassword', '');

  const isPasswordMatching =
    watchConfirmPassword.length > 0 && watchPassword === watchConfirmPassword;
  const isPasswordMismatch =
    watchConfirmPassword.length > 0 && watchPassword !== watchConfirmPassword;

  const onSubmit = async (data: SignupRequest) => {
    if (!agreeTerms) {
      setApiError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      setApiError(null);
      const newUser = await signup(data);
      if (newUser.role === 'CUSTOMER') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
        setApiError(err.response.data.error.message);
      } else {
        setApiError('Registration failed. Please check your information and try again.');
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
            <span className="text-lg font-bold tracking-tight text-slate-900">
              DealFlow<span className="text-[#714B67]">360</span>
            </span>
            <p className="text-[9px] text-slate-500 font-medium leading-none">
              From Quote to Cash. In Control.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="my-auto py-4 w-full max-w-md mx-auto">
          <div className="mb-5">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3E9F1] text-[#714B67] mb-2">
              New Workspace Account
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Register as a Sales Representative to access commercial governance tools, quote builders, and approvals.
            </p>
          </div>

          {apiError && (
            <div className="mb-4">
              <Alert type="danger" title="Registration Error">
                {apiError}
              </Alert>
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div>
              <Input
                label="Corporate Email Address"
                type="email"
                placeholder="jane@company.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div className="relative">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Matching Status Indicator */}
              {isPasswordMatching && !errors.confirmPassword && (
                <div className="flex items-center text-emerald-600 text-xs mt-1 space-x-1 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Passwords match</span>
                </div>
              )}
              {isPasswordMismatch && (
                <div className="flex items-center text-rose-600 text-xs mt-1 space-x-1 font-medium">
                  <X className="w-3.5 h-3.5" />
                  <span>Passwords do not match</span>
                </div>
              )}
            </div>

            <div className="flex items-start pt-1">
              <div className="flex items-center h-5">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
                />
              </div>
              <label htmlFor="agree-terms" className="ml-2 block text-xs text-slate-600">
                I agree to the{' '}
                <a href="#" className="font-medium text-[#714B67] hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-[#714B67] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 text-sm font-semibold shadow-md bg-[#714B67] hover:bg-[#5F3D56] text-white flex items-center justify-center gap-2 transition-all mt-2"
              isLoading={isSubmitting}
            >
              Create Account <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#714B67] hover:underline">
              Sign in to Workspace
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 border-t border-slate-100 pt-4 gap-2">
          <p>© 2025 DealFlow360. Governance Platform.</p>
          <div className="flex space-x-3">
            <a href="#" className="hover:text-slate-600">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-600">
              Terms
            </a>
            <a href="#" className="hover:text-slate-600">
              Security
            </a>
          </div>
        </div>
      </div>

      {/* Right Panel: Hero Banner Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 lg:h-full bg-[#714B67] text-white flex-col justify-between p-8 lg:p-10 xl:p-12 relative overflow-hidden">
        {/* Subtle geometric grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        ></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        {/* Top Tagline */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-0.5 rounded-full text-xs font-medium text-white/90 mb-4">
            <Lock className="w-3 h-3 text-[#F3E9F1]" />
            <span>Policy-Driven Commercial Governance</span>
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-[2.6rem] font-extrabold tracking-tight leading-[1.15] text-white max-w-xl">
            Governed deals.<br />
            Protected margins.<br />
            <span className="text-[#F3E9F1]">Seamless execution.</span>
          </h2>
          <p className="text-xs sm:text-sm xl:text-base text-white/80 leading-relaxed max-w-md mt-2.5">
            Join thousands of enterprise sales leaders using DealFlow360 to build policy-checked quotes, enforce discounting matrices, and automate approval routing.
          </p>
        </div>

        {/* 2x2 Feature Cards Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3 xl:gap-4 my-auto py-3 max-w-2xl">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 xl:p-4 hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center mb-2 text-white">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-0.5">Catalog Pricing</h3>
            <p className="text-white/75 text-xs leading-snug">
              Access governed product tiers, line items, and dynamic discount structures.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 xl:p-4 hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center mb-2 text-[#4ADE80]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-0.5">Real-Time Risk</h3>
            <p className="text-white/75 text-xs leading-snug">
              Evaluate margin leakage and policy violations instantly as deals evolve.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 xl:p-4 hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center mb-2 text-[#60A5FA]">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-0.5">Approval Hierarchy</h3>
            <p className="text-white/75 text-xs leading-snug">
              Automated routing to Sales Managers and Finance with full supersession tracking.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 xl:p-4 hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center mb-2 text-[#C084FC]">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-0.5">Order Fulfillment</h3>
            <p className="text-white/75 text-xs leading-snug">
              Multi-warehouse inventory allocation and deterministic billing schedules.
            </p>
          </div>
        </div>

        {/* Footer Stats & Social Proof */}
        <div className="relative z-10 border-t border-white/15 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-white/60 font-semibold mb-1.5 uppercase tracking-wider">
              Governance Standard
            </p>
            <div className="flex items-center space-x-4 text-white/90 font-bold text-xs">
              <div className="flex items-center space-x-1.5">
                <Box className="w-3.5 h-3.5 text-white/70" /> <span>ACME</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-white/70" /> <span>Globex</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-white/70" /> <span>Innotech</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-5 border-l border-white/15 pl-5">
            <div>
              <div className="text-lg xl:text-xl font-bold text-white">100%</div>
              <div className="text-[9px] text-white/70 uppercase tracking-wider font-medium">
                Audited rules
              </div>
            </div>
            <div>
              <div className="text-lg xl:text-xl font-bold text-white">Zero</div>
              <div className="text-[9px] text-white/70 uppercase tracking-wider font-medium">
                Margin leakage
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
