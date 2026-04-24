'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  DollarSign, 
  FileText, 
  Building2, 
  CreditCard, 
  MessageSquare, 
  FolderOpen, 
  Wrench, 
  FileBarChart, 
  CreditCardIcon, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  UserCircle,
  Briefcase
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Executive',
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />,
  },
  {
    title: 'Workforce',
    icon: <Users className="w-5 h-5" />,
    children: [
      { title: 'Employees', href: '/dashboard/employees', icon: <UserCircle className="w-4 h-4" /> },
      { title: 'Payroll', href: '/dashboard/payroll', icon: <DollarSign className="w-4 h-4" /> },
    ],
  },
  {
    title: 'W-2 Generator',
    icon: <FileText className="w-5 h-5 text-rose-400" />,
    children: [
      { title: 'W-2 Forms', href: '/dashboard/w2-forms', icon: <FileText className="w-4 h-4" /> },
      { title: 'W-3 Summary', href: '/dashboard/w3-summary', icon: <FileBarChart className="w-4 h-4" /> },
    ],
  },
  {
    title: '1099 Portal',
    icon: <Building2 className="w-5 h-5" />,
    children: [
      { title: 'Board', href: '/dashboard/1099/board', icon: <TrendingUp className="w-4 h-4" /> },
      { title: 'Vendors', href: '/dashboard/1099/vendors', icon: <Building2 className="w-4 h-4" /> },
      { title: 'Payments', href: '/dashboard/1099/payments', icon: <CreditCard className="w-4 h-4" /> },
      { title: 'W-9 Intake', href: '/dashboard/1099/w9-intake', icon: <FileText className="w-4 h-4" /> },
      { title: 'Communication', href: '/dashboard/communication/form', icon: <MessageSquare className="w-4 h-4" /> },
      { title: 'Form', href: '/dashboard/communication/form', icon: <FileText className="w-4 h-4" /> },
      { title: 'Vault', href: '/dashboard/vault', icon: <FolderOpen className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Tools',
    icon: <Wrench className="w-5 h-5" />,
    children: [
      { title: 'Reports', href: '/dashboard/reports', icon: <FileBarChart className="w-4 h-4" /> },
      { title: 'Subscriptions', href: '/dashboard/subscriptions', icon: <CreditCardIcon className="w-4 h-4" /> },
      { title: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

export default function Sidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Workforce', 'W-2 Generator', '1099 Portal', 'Tools']);
  const pathname = usePathname();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href || pathname === '/dashboard/';
    }
    return pathname === href;
  };

  const isParentActive = (children?: SidebarItem[]) => {
    if (!children) return false;
    return children.some(child => child.href && isActive(child.href));
  };

  return (
    <div className="w-[280px] bg-gradient-to-b from-[#0a1628] via-[#0f1f38] to-[#101f3a] border-r border-white/5 h-full flex flex-col shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-[18px]">TaxCore360</h1>
            <p className="text-slate-400 text-[10px] tracking-wide">TAX COMPLIANCE</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {/* Main Section */}
        <div>
          <h3 className="text-[10px] font-semibold text-[#475569] tracking-wide uppercase mb-3">Main</h3>
          {sidebarItems.slice(0, 2).map((item) => (
          <div key={item.title}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={`w-full flex items-center justify-between px-[14px] py-[10px] rounded-xl transition-all duration-300 group ${
                    isParentActive(item.children)
                      ? 'bg-blue-500/12 text-blue-400 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-blue-500 before:to-blue-600 before:rounded-r-lg before:shadow-lg before:shadow-blue-500/50 relative'
                      : 'text-[#94a3b8] hover:bg-white/6 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="text-[13px] font-medium">{item.title}</span>
                  </div>
                  {expandedItems.includes(item.title) ? (
                    <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                  ) : (
                    <ChevronRight className="w-4 h-4 transition-transform duration-300" />
                  )}
                </button>
                
                {expandedItems.includes(item.title) && (
                  <div className="ml-8 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {item.children.map((child) => (
                      <Link
                        key={child.title}
                        href={child.href || '#'}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                          isActive(child.href || '')
                            ? 'bg-blue-500/12 text-blue-400'
                            : 'text-[#94a3b8] hover:bg-white/6 hover:text-white'
                        }`}
                      >
                        {child.icon}
                        <span className="text-[12.5px]">{child.title}</span>
                        {child.badge && (
                          <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href || '#'}
                className={`flex items-center space-x-3 px-[14px] py-[10px] rounded-xl transition-all duration-300 group ${
                  isActive(item.href || '')
                    ? 'bg-blue-500/12 text-blue-400 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-blue-500 before:to-blue-600 before:rounded-r-lg before:shadow-lg before:shadow-blue-500/50 relative'
                    : 'text-[#94a3b8] hover:bg-white/6 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-[13px] font-medium">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
        </div>
        {/* Tax Filing Section */}
        <div>
          <h3 className="text-[10px] font-semibold text-[#475569] tracking-wide uppercase mb-3">Tax Filing</h3>
          {sidebarItems.slice(2, 4).map((item) => (
            <div key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={`w-full flex items-center justify-between px-[14px] py-[10px] rounded-xl transition-all duration-300 group ${
                      isParentActive(item.children)
                        ? 'bg-blue-500/12 text-blue-400 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-blue-500 before:to-blue-600 before:rounded-r-lg before:shadow-lg before:shadow-blue-500/50 relative'
                        : 'text-[#94a3b8] hover:bg-white/6 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="text-[13px] font-medium">{item.title}</span>
                    </div>
                    {expandedItems.includes(item.title) ? (
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform duration-300" />
                    )}
                  </button>
                  
                  {expandedItems.includes(item.title) && (
                    <div className="ml-8 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                      {item.children.map((child) => (
                        <Link
                          key={child.title}
                          href={child.href || '#'}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                            isActive(child.href || '')
                              ? 'bg-blue-500/12 text-blue-400'
                              : 'text-[#94a3b8] hover:bg-white/6 hover:text-white'
                          }`}
                        >
                          {child.icon}
                          <span className="text-[12.5px]">{child.title}</span>
                          {child.badge && (
                            <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href || '#'}
                  className={`flex items-center space-x-3 px-[14px] py-[10px] rounded-xl transition-all duration-300 group ${
                    isActive(item.href || '')
                      ? 'bg-blue-500/12 text-blue-400 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-blue-500 before:to-blue-600 before:rounded-r-lg before:shadow-lg before:shadow-blue-500/50 relative'
                      : 'text-[#94a3b8] hover:bg-white/6 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="text-[13px] font-medium">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
        {/* Tools Section */}
        <div>
          <h3 className="text-[10px] font-semibold text-[#475569] tracking-wide uppercase mb-3">Tools</h3>
          {sidebarItems.slice(4).map((item) => (
            <div key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={`w-full flex items-center justify-between px-[14px] py-[10px] rounded-xl transition-all duration-300 group ${
                      isParentActive(item.children)
                        ? 'bg-blue-500/12 text-blue-400 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-blue-500 before:to-blue-600 before:rounded-r-lg before:shadow-lg before:shadow-blue-500/50 relative'
                        : 'text-[#94a3b8] hover:bg-white/6 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="text-[13px] font-medium">{item.title}</span>
                    </div>
                    {expandedItems.includes(item.title) ? (
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform duration-300" />
                    )}
                  </button>
                  
                  {expandedItems.includes(item.title) && (
                    <div className="ml-8 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                      {item.children.map((child) => (
                        <Link
                          key={child.title}
                          href={child.href || '#'}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                            isActive(child.href || '')
                              ? 'bg-blue-500/12 text-blue-400'
                              : 'text-[#94a3b8] hover:bg-white/6 hover:text-white'
                          }`}
                        >
                          {child.icon}
                          <span className="text-[12.5px]">{child.title}</span>
                          {child.badge && (
                            <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href || '#'}
                  className={`flex items-center space-x-3 px-[14px] py-[10px] rounded-xl transition-all duration-300 group ${
                    isActive(item.href || '')
                      ? 'bg-blue-500/12 text-blue-400 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-blue-500 before:to-blue-600 before:rounded-r-lg before:shadow-lg before:shadow-blue-500/50 relative'
                      : 'text-[#94a3b8] hover:bg-white/6 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="text-[13px] font-medium">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-white/4 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">JD</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">John Doe</p>
              <p className="text-slate-400 text-xs">Administrator</p>
            </div>
          </div>
          <button className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 border border-white/10">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
