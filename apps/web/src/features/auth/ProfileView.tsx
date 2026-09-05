import React from 'react';
import { useAuth } from './AuthContext.js';
import { Card, CardHeader, CardBody } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { User as UserIcon, Shield, CheckCircle2 } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, role, permissions } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Profile & Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authenticated session identity and server-side RBAC permissions
          </p>
        </div>
        <Badge variant="purple" size="md">
          {role?.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader title="User Details" />
          <CardBody className="space-y-4 text-sm">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-[#714B67] text-white flex items-center justify-center font-bold">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{user.name}</h4>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-700">Account ID:</span>{' '}
                <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                  {user.id}
                </code>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Status:</span>{' '}
                <span className="text-emerald-600 font-semibold">
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Created At:</span>{' '}
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader
            title="Granted Role Permissions"
            subtitle={`Role: ${role} - ${permissions.length} active permissions`}
          />
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {permissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center space-x-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-800 font-mono"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{permission}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Foundation Integration Status" />
        <CardBody className="text-xs text-slate-600 space-y-2">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#714B67]" />
            <span className="font-semibold text-slate-800">
              Authentication Foundation:
            </span>{' '}
            JWT Access Tokens + HttpOnly Refresh Cookie Rotation active.
          </div>
          <p className="text-slate-500 pl-6">
            Developer A (Customer, Product, Quotes, Approvals) and Developer B
            (Fulfillment, Billing, Portal, Control Tower) will bind their vertical module
            APIs to these exact permissions.
          </p>
        </CardBody>
      </Card>
    </div>
  );
};
