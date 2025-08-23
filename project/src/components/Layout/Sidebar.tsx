import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Clipboard, 
  BarChart3, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['claims']);

  const menuItems = [
    {
      section: 'claims',
      title: 'Claims Management',
      items: [
        {
          path: '/claims',
          icon: Clipboard,
          label: 'All Claims',
          description: 'View and manage all claims',
          roles: ['data_entry', 'manager']
        }
      ]
    },
    {
      section: 'analytics',
      title: 'Analytics & Reports',
      items: [
        {
          path: '/dashboard',
          icon: BarChart3,
          label: 'Dashboard',
          description: 'Overview and key metrics',
          roles: ['manager']
        }
      ]
    },
    {
      section: 'management',
      title: 'System Management',
      items: [
        {
          path: '/users',
          icon: Users,
          label: 'User Management',
          description: 'Manage system users',
          roles: ['manager']
        }
      ]
    }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const filteredMenuItems = menuItems.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.roles.includes(user?.role || '')
    )
  })).filter(section => section.items.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        sidebar w-72
        ${isOpen ? 'sidebar-open' : 'sidebar-closed'}
        md:translate-x-0 md:relative md:z-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-primary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Clipboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Hospital CMS</h1>
              <p className="text-sm text-white text-opacity-80 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {filteredMenuItems.map((section) => (
              <div key={section.section} className="space-y-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span>{section.title}</span>
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform ${
                      expandedSections.includes(section.section) ? 'rotate-90' : ''
                    }`} 
                  />
                </button>

                {/* Section Items */}
                {expandedSections.includes(section.section) && (
                  <div className="ml-4 space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => window.innerWidth < 768 && toggleSidebar()}
                          className={`
                            nav-item group
                            ${isActive ? 'nav-item-active' : ''}
                          `}
                          title={item.description}
                        >
                          <Icon className="w-5 h-5" />
                          <div className="flex-1 text-left">
                            <span className="font-medium">{item.label}</span>
                            <p className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {/* User Info */}
          <div className="flex items-center space-x-3 px-3 py-3 mb-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
              <p className="text-xs text-gray-600 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button 
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* System Status */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 font-medium">System Online</span>
            </div>
            <p className="text-xs text-green-600 mt-1">All services operational</p>
          </div>
        </div>
      </div>
    </>
  );
};