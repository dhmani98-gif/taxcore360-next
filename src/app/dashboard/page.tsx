'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, TrendingUp, DollarSign, Users, AlertTriangle, Building2 } from 'lucide-react';

interface Department {
  name: string;
  grossPayroll: number;
  taxBurden: number;
  activeCount: number;
  color: string;
}

interface Deadline {
  form: string;
  daysUntil: number;
  type: 'warning' | 'danger' | 'safe';
}

export default function ExecutiveDashboard() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([
    { form: 'Form 941', daysUntil: 15, type: 'safe' },
    { form: '1099-NEC', daysUntil: 45, type: 'safe' },
  ]);

  const [departments, setDepartments] = useState<Department[]>([
    { name: 'Engineering', grossPayroll: 450000, taxBurden: 135000, activeCount: 12, color: 'bg-blue-500' },
    { name: 'Sales', grossPayroll: 320000, taxBurden: 96000, activeCount: 8, color: 'bg-green-500' },
    { name: 'Marketing', grossPayroll: 180000, taxBurden: 54000, activeCount: 5, color: 'bg-purple-500' },
    { name: 'Operations', grossPayroll: 280000, taxBurden: 84000, activeCount: 7, color: 'bg-orange-500' },
  ]);

  const [chartData, setChartData] = useState([
    { month: 'Jan', value: 120000 },
    { month: 'Feb', value: 135000 },
    { month: 'Mar', value: 128000 },
    { month: 'Apr', value: 142000 },
    { month: 'May', value: 138000 },
    { month: 'Jun', value: 145000 },
  ]);

  const totalGrossPayroll = departments.reduce((sum, dept) => sum + dept.grossPayroll, 0);
  const monthlyAverage = Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length);
  const growth = 8.5; // Mock growth percentage

  const getDeadlineColor = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getDeadlineIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  return (
    <DashboardLayout 
      title="Executive Dashboard"
      description="Monitor payroll performance and tax compliance"
      badges={["Acme Corporation", "Professional Plan"]}
      banner={{
        type: 'success',
        message: 'All systems operational - Last sync: 2 minutes ago'
      }}
    >
      {/* Deadlines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {deadlines.map((deadline, index) => (
          <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${getDeadlineColor(deadline.type)}/20 rounded-lg flex items-center justify-center`}>
                  {getDeadlineIcon(deadline.type)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{deadline.form}</h3>
                  <p className="text-slate-400 text-sm">
                    {deadline.daysUntil > 0 ? `${deadline.daysUntil} days until deadline` : 'Overdue'}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                deadline.type === 'danger' ? 'bg-red-500/20 text-red-400' :
                deadline.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {deadline.type === 'danger' ? 'Urgent' : deadline.type === 'warning' ? 'Attention' : 'On Track'}
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  deadline.type === 'danger' ? 'bg-red-500' :
                  deadline.type === 'warning' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.max(10, 100 - (deadline.daysUntil / 90) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Gross Payroll Disbursement</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Live Sync</span>
          </div>
        </div>
        
        {/* Simple Chart */}
        <div className="h-64 flex items-end justify-between space-x-2 mb-6">
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                style={{ height: `${(item.value / 150000) * 100}%` }}
                title={`${item.month}: $${item.value.toLocaleString()}`}
              ></div>
              <span className="text-slate-400 text-xs mt-2">{item.month}</span>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
          <div>
            <p className="text-slate-400 text-sm">Monthly Average</p>
            <p className="text-white font-semibold">${monthlyAverage.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total YTD</p>
            <p className="text-white font-semibold">${totalGrossPayroll.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Growth</p>
            <p className="text-green-400 font-semibold">+{growth}%</p>
          </div>
        </div>
      </div>

      {/* Cost Distribution */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
        <h3 className="text-white font-semibold text-lg mb-6">Cost Distribution</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart (Simplified) */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90">
                {departments.map((dept, index) => {
                  const percentage = (dept.grossPayroll / totalGrossPayroll) * 100;
                  const circumference = 2 * Math.PI * 80;
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                  const offset = departments.slice(0, index).reduce((sum, d) => sum + (d.grossPayroll / totalGrossPayroll) * 100, 0) / 100 * circumference;
                  
                  return (
                    <circle
                      key={index}
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke={dept.color.replace('bg-', '#').replace('500', '500')}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={-offset}
                      className="opacity-80"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-slate-400 text-sm">Top Dept</p>
                <p className="text-white font-semibold">{departments[0].name}</p>
                <p className="text-blue-400">{Math.round((departments[0].grossPayroll / totalGrossPayroll) * 100)}%</p>
              </div>
            </div>
          </div>

          {/* Department List */}
          <div className="space-y-3">
            {departments.map((dept, index) => {
              const percentage = Math.round((dept.grossPayroll / totalGrossPayroll) * 100);
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${dept.color} rounded-full`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{dept.name}</span>
                      <span className="text-slate-400 text-sm">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`${dept.color} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((dept, index) => (
          <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">{dept.name}</h4>
              <div className={`w-8 h-8 ${dept.color} rounded-full opacity-20`}></div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Gross Payroll</p>
                <p className="text-white font-semibold">${dept.grossPayroll.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Tax Burden</p>
                <p className="text-slate-300">${dept.taxBurden.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Active count</p>
                <p className="text-white font-medium">{dept.activeCount}</p>
              </div>
            </div>

            {/* Visual Employee Representation */}
            <div className="mt-4 flex -space-x-2">
              {Array.from({ length: Math.min(dept.activeCount, 5) }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-6 h-6 ${dept.color} rounded-full border-2 border-slate-800 opacity-60`}
                ></div>
              ))}
              {dept.activeCount > 5 && (
                <div className="w-6 h-6 bg-slate-600 rounded-full border-2 border-slate-800 flex items-center justify-center">
                  <span className="text-xs text-slate-300">+{dept.activeCount - 5}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
