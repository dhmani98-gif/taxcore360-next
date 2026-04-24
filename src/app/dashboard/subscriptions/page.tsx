'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CreditCard, Users, CheckCircle, X, Plus, Edit, Trash2, Crown, Star, Zap } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'annual';
  features: string[];
  popular?: boolean;
  icon?: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  plan: string;
  joinedDate: string;
  lastLogin: string;
}

export default function SubscriptionsPage() {
  const [selectedTab, setSelectedTab] = useState<'plans' | 'users'>('plans');
  // Define the three pricing plans
  const defaultPlans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      interval: 'monthly',
      features: [
        'Limited W-9 & 1099 forms (50/month)',
        'Basic tax reports',
        'Email support',
        'Single user access',
        'Standard data export'
      ],
      icon: <Star className="w-5 h-5" />
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      interval: 'monthly',
      features: [
        'Unlimited W-9 & 1099 forms',
        'QuickBooks & Xero integration',
        'Priority email & chat support',
        'Up to 5 team members',
        'Advanced analytics dashboard',
        'API access',
        'Bulk form generation'
      ],
      popular: true,
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 249,
      interval: 'monthly',
      features: [
        'Multi-company management',
        'Full W-2 & W-3 support',
        'Dedicated account manager',
        'Unlimited team members',
        'Custom report templates',
        'White-label options',
        'SLA guarantee',
        'On-premise deployment option'
      ],
      icon: <Crown className="w-5 h-5" />
    }
  ];

  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [users, setUsers] = useState<User[]>([]);
  const [companySubscription, setCompanySubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/subscriptions?includePlans=true');
        if (!res.ok) throw new Error('Failed to fetch subscription data');
        
        const data = await res.json();
        
        // Transform plans data
        const transformedPlans: Plan[] = data.plans?.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          interval: plan.billingInterval,
          features: plan.features || [],
          popular: plan.name === 'Professional',
          icon: plan.name === 'Starter' ? <Star className="w-5 h-5" /> : 
                 plan.name === 'Professional' ? <Zap className="w-5 h-5" /> : 
                 <Crown className="w-5 h-5" />
        })) || [];
        
        setPlans(transformedPlans);
        setCompanySubscription(data.companySubscription);
        
        // Transform users data
        const transformedUsers: User[] = data.companyUsers?.map((user: any) => ({
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          role: user.role,
          status: 'Active' as const,
          plan: data.companySubscription?.plan?.name || 'No Plan',
          joinedDate: user.createdAt?.split('T')[0] || '',
          lastLogin: '' // Would need to track this separately
        })) || [];
        
        setUsers(transformedUsers);
      } catch (err) {
        setError('Failed to load subscription data');
        console.error('Error fetching subscription data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    try {
      setMessage(`Processing subscription to ${planId} plan...`);
      
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, action: 'subscribe' })
      });

      if (!res.ok) throw new Error('Failed to subscribe');

      const data = await res.json();
      setCompanySubscription(data);
      setMessage(`Successfully subscribed to ${planId} plan!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to process subscription');
      console.error('Subscription error:', err);
    }
  };

  const handleAddUser = async (newUser: any) => {
    try {
      setMessage('Adding user to subscription...');
      
      const res = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newUser.id, action: 'add-user' })
      });

      if (!res.ok) throw new Error('Failed to add user');

      const updatedUser = {
        ...newUser,
        status: 'Active' as const,
        plan: companySubscription?.plan?.name || 'No Plan'
      };
      
      setUsers(prev => [...prev, updatedUser]);
      setShowAddUserModal(false);
      setMessage('User added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to add user');
      console.error('Add user error:', err);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      setMessage('Removing user from subscription...');
      
      const res = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'remove-user' })
      });

      if (!res.ok) throw new Error('Failed to remove user');

      setUsers(prev => prev.filter(user => user.id !== userId));
      setMessage('User removed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to remove user');
      console.error('Remove user error:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    return status === 'Active' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Inactive
      </span>
    );
  };

  return (
    <DashboardLayout 
      title="Subscriptions"
      description="Manage subscription plans and user accounts"
    >
      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6 shadow-sm">
        <div className="flex space-x-1">
          <button
            onClick={() => setSelectedTab('plans')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === 'plans'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Plans
          </button>
          <button
            onClick={() => setSelectedTab('users')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {/* Plans Tab */}
      {selectedTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border-2 ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/10' 
                  : 'border-gray-200 hover:border-gray-300'
              } p-6 relative transition-all duration-200`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-md">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`flex items-center justify-center space-x-2 mb-4 ${
                  plan.popular ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {plan.icon}
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                </div>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Billed monthly, cancel anytime
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.popular ? 'text-blue-500' : 'text-emerald-500'
                    }`} />
                    <span className="text-gray-600 text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {plan.popular ? 'Get Started' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <div>
          {/* Users Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 font-semibold mb-2">User Management</h3>
                <p className="text-gray-500 text-sm">
                  Manage user accounts and permissions
                </p>
              </div>
              
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.plan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.joinedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.lastLogin}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddUser({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as string,
                status: 'Active',
                plan: formData.get('plan') as string
              });
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select role</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  name="plan"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select plan</option>
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
