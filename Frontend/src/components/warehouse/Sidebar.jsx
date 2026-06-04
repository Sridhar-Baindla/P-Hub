import { 
  LayoutDashboard, ShoppingCart, Truck, Package, Library, 
  Users, Briefcase, FileText, PieChart, QrCode, Building2, 
  Send, Globe, Smartphone, Link, Shield, Stethoscope, Sparkles
} from 'lucide-react';
import './WarehouseSidebar.css';

const TABS = [
  { id: 'dashboard', label: 'Business Overview', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales Management', icon: ShoppingCart },
  { id: 'purchase', label: 'Purchase Management', icon: Truck },
  { id: 'inventory', label: 'Inventory Management', icon: Package },
  { id: 'catalogue', label: 'Product Catalogue', icon: Library },
  { id: 'crm', label: 'CRM & Engagement', icon: Users },
  { id: 'distributor', label: 'Distributor Management', icon: Briefcase },
  { id: 'finance', label: 'Financial & Accounting', icon: FileText },
  { id: 'reports', label: 'Reports & MIS', icon: PieChart },
  { id: 'qr_barcode', label: 'QR & Barcode System', icon: QrCode },
  { id: 'multistore', label: 'Chain Management', icon: Building2 },
  { id: 'logistics', label: 'Delivery & Logistics', icon: Send },
  { id: 'marketplace', label: 'Marketplace', icon: Globe },
  { id: 'mobile', label: 'Mobile Application', icon: Smartphone },
  { id: 'integrations', label: 'Integrations', icon: Link },
  { id: 'security', label: 'Security & Admin', icon: Shield },
  { id: 'clinic', label: 'Clinic Features', icon: Stethoscope },
  { id: 'ai', label: 'SahaAI Automation', icon: Sparkles, highlight: true }
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="warehouse-sidebar">
      <div className="sidebar-header">
        <h3>Enterprise Hub</h3>
      </div>
      <nav className="sidebar-nav">
        {TABS.map((tab) => (
          <button 
            key={tab.id}
            className={`sidebar-link ${activeTab === tab.id ? 'active' : ''} ${tab.highlight ? 'highlight-ai' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
