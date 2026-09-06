import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../lib/api/client.js';
import { Button, Input, Card, CardHeader, CardBody, CardFooter, Alert } from '../../components/ui/index.js';

const configSchema = z.object({
  discountThreshold: z.number().min(0).max(100, 'Must be between 0 and 100'),
  marginMinimum: z.number().min(0).max(100, 'Must be between 0 and 100'),
  marginWarning: z.number().min(0).max(100, 'Must be between 0 and 100'),
  stalledDaysThreshold: z.number().min(1, 'Must be at least 1'),
  minMarginThreshold: z.number().min(0).max(100, 'Must be between 0 and 100'),
});

type ConfigFormData = z.infer<typeof configSchema>;

export function AdminConfigPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      discountThreshold: 10,
      marginMinimum: 20,
      marginWarning: 30,
      stalledDaysThreshold: 7,
      minMarginThreshold: 25,
    },
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await api.get('/config');
        if (response.data.success) {
          reset(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load configuration');
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, [reset]);

  const onSubmit = async (data: ConfigFormData) => {
    const isConfirmed = window.confirm('Are you sure you want to update the business thresholds? This will immediately affect all new and re-evaluated quotations.');
    if (!isConfirmed) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.put('/config', data);
      if (response.data.success) {
        setSuccess('System configuration updated successfully.');
        reset(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 font-medium">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Configuration</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage global business thresholds and operational settings.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader 
            title="Commercial Governance Thresholds" 
            subtitle="These thresholds govern automated risk scoring and approval requirements."
          />
          <CardBody>
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div>
                <Input
                  label="Discount Warning Threshold (%)"
                  type="number"
                  step="0.1"
                  {...register('discountThreshold', { valueAsNumber: true })}
                  error={errors.discountThreshold?.message}
                />
                <p className="mt-1 text-xs text-slate-500">Triggers Sales Manager approval.</p>
              </div>

              <div>
                <Input
                  label="Margin Minimum Floor (%)"
                  type="number"
                  step="0.1"
                  {...register('marginMinimum', { valueAsNumber: true })}
                  error={errors.marginMinimum?.message}
                />
                <p className="mt-1 text-xs text-slate-500">Triggers Finance approval.</p>
              </div>

              <div>
                <Input
                  label="Margin Warning Threshold (%)"
                  type="number"
                  step="0.1"
                  {...register('marginWarning', { valueAsNumber: true })}
                  error={errors.marginWarning?.message}
                />
                <p className="mt-1 text-xs text-slate-500">Triggers Sales Manager review.</p>
              </div>
            </div>
            
            <div className="mt-10 mb-6 border-t border-slate-100" />
            
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 text-base tracking-tight">Control Tower & Operations</h3>
              <p className="text-xs text-slate-500 mt-0.5">Thresholds for operational alerts in the deal control tower.</p>
            </div>

            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div>
                <Input
                  label="Stalled Deal Days Threshold"
                  type="number"
                  {...register('stalledDaysThreshold', { valueAsNumber: true })}
                  error={errors.stalledDaysThreshold?.message}
                />
                <p className="mt-1 text-xs text-slate-500">Days inactive before triggering stalled alert.</p>
              </div>

              <div>
                <Input
                  label="Control Tower Margin Leakage (%)"
                  type="number"
                  step="0.1"
                  {...register('minMarginThreshold', { valueAsNumber: true })}
                  error={errors.minMarginThreshold?.message}
                />
                <p className="mt-1 text-xs text-slate-500">Detects deals leaking below healthy margin.</p>
              </div>
            </div>

            {error && (
              <div className="mt-8">
                <Alert type="danger" title="Error saving configuration">
                  {error}
                </Alert>
              </div>
            )}

            {success && (
              <div className="mt-8">
                <Alert type="success" title="Success">
                  {success}
                </Alert>
              </div>
            )}
          </CardBody>
          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSaving || !isDirty}
            >
              Discard Changes
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving || !isDirty}
              isLoading={isSaving}
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
