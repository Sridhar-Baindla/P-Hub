const fs = require('fs');
const path = require('path');

const components = [
  'DashboardOverview', 'SalesManagement', 'PurchaseManagement', 
  'ProductCatalogue', 'CRM', 'DistributorManagement', 'FinancialAccounting', 
  'ReportsMIS', 'QRBarcode', 'MultiStore', 'Marketplace', 'MobileAppSync', 
  'Integrations', 'SecurityAdmin', 'ClinicFeatures', 'SahaAI'
];

const template = (name) => `import React from 'react';
import { Construction } from 'lucide-react';

const ${name} = () => {
  return (
    <div className="module-container" style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Construction size={64} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
      <h2 style={{ marginBottom: '1rem' }}>${name} Module</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
        This module is currently under development. Once completed, it will provide enterprise-grade capabilities for ${name.replace(/([A-Z])/g, ' $1').trim()}.
      </p>
    </div>
  );
};

export default ${name};
`;

const dir = path.join(__dirname, 'Frontend', 'src', 'components', 'warehouse');

components.forEach(comp => {
  fs.writeFileSync(path.join(dir, comp + '.jsx'), template(comp));
  console.log('Created ' + comp + '.jsx');
});
