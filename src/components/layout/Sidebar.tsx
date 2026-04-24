'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut, 
  ChevronDown,
  Building,
  FileInput,
  Mail,
  FileCheck,
  BarChart3,
  CreditCard as SubscriptionsIcon,
  Briefcase,
  Wrench,
  FileBarChart
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
  badge?: string;
}

// Custom Icons matching design specs exactly (18x18 for main, 16x16 for children)
const ExecutiveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.8" opacity="0.4"/>
    <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

const WorkforceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 15C2 12.5 3.5 11 5 11C6.5 11 8 12.5 8 15" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="13" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 15C10 12.5 11.5 11 13 11C14.5 11 16 12.5 16 15" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 14C6 11.5 7.5 10 9 10C10.5 10 12 11.5 12 14" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const W2Icon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="14" height="12" rx="1.5" stroke="#fb7185" strokeWidth="1.5"/>
    <line x1="5" y1="7" x2="13" y2="7" stroke="#fb7185" strokeWidth="1.5"/>
    <line x1="5" y1="11" x2="10" y2="11" stroke="#fb7185" strokeWidth="1.5"/>
  </svg>
);

const Portal1099Icon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 14V4C3 2.89543 3.89543 2 5 2H13C14.1046 2 15 2.89543 15 4V14C15 15.1046 14.1046 16 13 16H5C3.89543 16 3 15.1046 3 14Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 11L9 6M9 6L6.5 8.5M9 6L11.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IdCardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M3 11C3 9.5 4 8.5 5 8.5C6 8.5 7 9.5 7 11" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="9" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="9" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

const PayrollIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M4 6H12M4 9H9" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="11" cy="9" r="1" fill="currentColor"/>
  </svg>
);

const BoardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
  </svg>
);

const VaultIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M4 5V3C4 2.44772 4.44772 2 5 2H11C11.5523 2 12 2.44772 12 3V5" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="8" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="8" y1="11" x2="8" y2="12" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

const sidebarItems: SidebarItem[] = [
  {
    title: 'Executive',
    href: '/dashboard',
    icon: <ExecutiveIcon />,
  },
  {
    title: 'Workforce',
    icon: <WorkforceIcon />,
    children: [
      { title: 'Employees', href: '/dashboard/employees', icon: <IdCardIcon /> },
      { title: 'Payroll', href: '/dashboard/payroll', icon: <PayrollIcon /> },
    ],
  },
  {
    title: 'W-2 Generator',
    icon: <W2Icon />,
    children: [
      { title: 'W-2 Forms', href: '/dashboard/w2-forms', icon: <FileText className="w-4 h-4" /> },
      { title: 'W-3 Summary', href: '/dashboard/w3-summary', icon: <FileBarChart className="w-4 h-4" /> },
    ],
  },
  {
    title: '1099 Portal',
    icon: <Portal1099Icon />,
    children: [
      { title: 'Board', href: '/dashboard/1099/board', icon: <BoardIcon /> },
      { title: 'Vendors', href: '/dashboard/1099/vendors', icon: <Building className="w-4 h-4" /> },
      { title: 'Payments', href: '/dashboard/1099/payments', icon: <CreditCard className="w-4 h-4" /> },
      { title: 'W-9 Intake', href: '/dashboard/1099/w9-intake', icon: <FileInput className="w-4 h-4" /> },
      { title: 'Communication', href: '/dashboard/communication/form', icon: <Mail className="w-4 h-4" /> },
      { title: 'Form', href: '/dashboard/tax-forms', icon: <FileCheck className="w-4 h-4" /> },
      { title: 'Vault', href: '/dashboard/vault', icon: <VaultIcon /> },
    ],
  },
  {
    title: 'Tools',
    icon: <Wrench className="w-[18px] h-[18px]" />,
    children: [
      { title: 'Reports', href: '/dashboard/reports', icon: <BarChart3 className="w-4 h-4" /> },
      { title: 'Subscriptions', href: '/dashboard/subscriptions', icon: <SubscriptionsIcon className="w-4 h-4" /> },
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

  const NavButton = ({ item, isChild = false }: { item: SidebarItem; isChild?: boolean }) => {
    const active = isActive(item.href || '');
    const baseClasses = `w-full flex items-center gap-3 px-[14px] py-[10px] rounded-xl transition-all duration-200 group relative font-medium`;
    const activeClasses = `bg-[rgba(59,130,246,0.12)] text-[#60a5fa] before:content-[''] before:absolute before:left-0 before:top-[6px] before:bottom-[6px] before:w-[3px] before:bg-gradient-to-b before:from-[#60a5fa] before:to-[#3b82f6] before:rounded-r-md before:shadow-[0_0_12px_rgba(96,165,250,0.5)]`;
    const inactiveClasses = `text-[#94a3b8] hover:bg-white/[0.06] hover:text-white`;
    
    return (
      <Link
        href={item.href || '#'}
        className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${isChild ? 'pl-[32px]' : ''}`}
        style={{ fontFamily: 'Inter, sans-serif', fontSize: isChild ? '12.5px' : '13px' }}
      >
        {item.icon}
        <span>{item.title}</span>
        {item.badge && (
          <span className="ml-auto text-[10px] font-medium bg-[rgba(59,130,246,0.20)] text-[#60a5fa] px-2 py-0.5 rounded">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const ExpandableButton = ({ item }: { item: SidebarItem }) => {
    const expanded = expandedItems.includes(item.title);
    const parentActive = isParentActive(item.children);
    
    return (
      <div>
        <button
          onClick={() => toggleExpanded(item.title)}
          className={`w-full flex items-center justify-between px-[14px] py-[10px] rounded-xl transition-all duration-200 group relative font-medium
            ${parentActive 
              ? 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa] before:content-[""] before:absolute before:left-0 before:top-[6px] before:bottom-[6px] before:w-[3px] before:bg-gradient-to-b before:from-[#60a5fa] before:to-[#3b82f6] before:rounded-r-md before:shadow-[0_0_12px_rgba(96,165,250,0.5)]'
              : 'text-[#94a3b8] hover:bg-white/[0.06] hover:text-white'
            }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span className="text-[13px]">{item.title}</span>
          </div>
          <ChevronDown 
            className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
        
        {expanded && item.children && (
          <div className="pl-8 mt-0.5 space-y-0.5 overflow-hidden animate-slideDown">
            {item.children.map((child) => (
              <NavButton key={child.title} item={child} isChild />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-[280px] min-w-[280px] bg-gradient-to-b from-[#0a1628] via-[#0f1f38] via-[40%] to-[#101f3a] border-r border-white/[0.05] h-screen fixed left-0 top-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-50">
      {/* Logo Section - Exact specs: 40x40px with 12px rounded corners */}
      <div className="flex-none p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.4)] border border-white/[0.10]">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-[18px] tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>TaxCore360</h1>
            <p className="text-[#64748b] text-[10px] font-medium tracking-[0.05em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Tax Compliance</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable Content */}
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        {/* Main Section - spacing 24px (mb-6) */}
        <div className="mb-6">
          <h3 
            className="text-[10px] font-semibold text-[#475569] tracking-[0.16em] uppercase pb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Main
          </h3>
          <div className="space-y-0.5">
            <NavButton item={sidebarItems[0]} />
            <ExpandableButton item={sidebarItems[1]} />
          </div>
        </div>

        {/* Tax Filing Section - spacing 24px (mb-6) */}
        <div className="mb-6">
          <h3 
            className="text-[10px] font-semibold text-[#475569] tracking-[0.16em] uppercase pb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Tax Filing
          </h3>
          <div className="space-y-0.5">
            <ExpandableButton item={sidebarItems[2]} />
            <ExpandableButton item={sidebarItems[3]} />
          </div>
        </div>

        {/* Tools Section - spacing 24px (mb-6) */}
        <div className="mb-6">
          <h3 
            className="text-[10px] font-semibold text-[#475569] tracking-[0.16em] uppercase pb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Tools
          </h3>
          <div className="space-y-0.5">
            <ExpandableButton item={sidebarItems[4]} />
          </div>
        </div>
      </nav>

      {/* User Section - with 1px border-top at 6% opacity */}
      <div className="flex-none p-4 border-t border-white/[0.06]">
        <div className="bg-white/[0.04] rounded-xl p-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#3b82f6] to-[#4f46e5] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#e2e8f0] text-[13px] font-semibold truncate" style={{ fontFamily: 'Inter, sans-serif' }}>John Doe</p>
              <p className="text-[#64748b] text-[10px]" style={{ fontFamily: 'Inter, sans-serif' }}>Administrator</p>
            </div>
          </div>
          <button 
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-[#64748b] hover:text-[#94a3b8] hover:bg-white/[0.08] rounded-lg transition-all duration-200 border border-white/[0.08] hover:border-white/[0.12]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[11px] font-semibold">Log Out</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideDown {
          animation: slideDown 300ms ease-out;
        }
      `}</style>
    </aside>
  );
}
