import demoNorthwindSQL from '../data/demo-northwind.sql';

export class DemoDataService {
  static async loadDemoSQL(): Promise<string> {
    // Return the imported SQL directly
    return demoNorthwindSQL;
  }

  static getDemoMetadata() {
    return {
      name: 'Northwind Demo',
      description: 'A sample database with products, customers, orders, and employees',
      tables: [
        { name: 'Categories', recordCount: 8 },
        { name: 'Suppliers', recordCount: 8 },
        { name: 'Products', recordCount: 20 },
        { name: 'Customers', recordCount: 10 },
        { name: 'Employees', recordCount: 5 },
        { name: 'Orders', recordCount: 5 },
        { name: 'OrderDetails', recordCount: 11 }
      ],
      features: [
        'Foreign key relationships',
        'Indexes for performance',
        'Sample views',
        'Various data types'
      ]
    };
  }
}