-- SQLite Zen Demo Database
-- Northwind-style sample data for testing and demonstration

-- Categories table
CREATE TABLE Categories (
    CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    CategoryName TEXT NOT NULL,
    Description TEXT
);

-- Suppliers table
CREATE TABLE Suppliers (
    SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
    CompanyName TEXT NOT NULL,
    ContactName TEXT,
    ContactTitle TEXT,
    Address TEXT,
    City TEXT,
    Region TEXT,
    PostalCode TEXT,
    Country TEXT,
    Phone TEXT,
    Fax TEXT,
    HomePage TEXT
);

-- Products table
CREATE TABLE Products (
    ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
    ProductName TEXT NOT NULL,
    SupplierID INTEGER,
    CategoryID INTEGER,
    QuantityPerUnit TEXT,
    UnitPrice DECIMAL(10,2),
    UnitsInStock INTEGER DEFAULT 0,
    UnitsOnOrder INTEGER DEFAULT 0,
    ReorderLevel INTEGER DEFAULT 0,
    Discontinued INTEGER DEFAULT 0,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
);

-- Customers table
CREATE TABLE Customers (
    CustomerID TEXT PRIMARY KEY,
    CompanyName TEXT NOT NULL,
    ContactName TEXT,
    ContactTitle TEXT,
    Address TEXT,
    City TEXT,
    Region TEXT,
    PostalCode TEXT,
    Country TEXT,
    Phone TEXT,
    Fax TEXT
);

-- Employees table
CREATE TABLE Employees (
    EmployeeID INTEGER PRIMARY KEY AUTOINCREMENT,
    LastName TEXT NOT NULL,
    FirstName TEXT NOT NULL,
    Title TEXT,
    TitleOfCourtesy TEXT,
    BirthDate DATE,
    HireDate DATE,
    Address TEXT,
    City TEXT,
    Region TEXT,
    PostalCode TEXT,
    Country TEXT,
    HomePhone TEXT,
    Extension TEXT,
    Photo BLOB,
    Notes TEXT,
    ReportsTo INTEGER,
    PhotoPath TEXT,
    FOREIGN KEY (ReportsTo) REFERENCES Employees(EmployeeID)
);

-- Orders table
CREATE TABLE Orders (
    OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
    CustomerID TEXT,
    EmployeeID INTEGER,
    OrderDate DATE,
    RequiredDate DATE,
    ShippedDate DATE,
    ShipVia INTEGER,
    Freight DECIMAL(10,2) DEFAULT 0,
    ShipName TEXT,
    ShipAddress TEXT,
    ShipCity TEXT,
    ShipRegion TEXT,
    ShipPostalCode TEXT,
    ShipCountry TEXT,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
);

-- Order Details table
CREATE TABLE OrderDetails (
    OrderID INTEGER,
    ProductID INTEGER,
    UnitPrice DECIMAL(10,2) NOT NULL,
    Quantity INTEGER NOT NULL DEFAULT 1,
    Discount REAL DEFAULT 0,
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- Create indexes for better performance
CREATE INDEX idx_orders_customer ON Orders(CustomerID);
CREATE INDEX idx_orders_employee ON Orders(EmployeeID);
CREATE INDEX idx_orderdetails_product ON OrderDetails(ProductID);
CREATE INDEX idx_products_category ON Products(CategoryID);
CREATE INDEX idx_products_supplier ON Products(SupplierID);

-- Insert sample data

-- Categories
INSERT INTO Categories (CategoryName, Description) VALUES
('Beverages', 'Soft drinks, coffees, teas, beers, and ales'),
('Condiments', 'Sweet and savory sauces, relishes, spreads, and seasonings'),
('Confections', 'Desserts, candies, and sweet breads'),
('Dairy Products', 'Cheeses'),
('Grains/Cereals', 'Breads, crackers, pasta, and cereal'),
('Meat/Poultry', 'Prepared meats'),
('Produce', 'Dried fruit and bean curd'),
('Seafood', 'Seaweed and fish');

-- Suppliers
INSERT INTO Suppliers (CompanyName, ContactName, ContactTitle, Address, City, Country, Phone) VALUES
('Exotic Liquids', 'Charlotte Cooper', 'Purchasing Manager', '49 Gilbert St.', 'London', 'UK', '(171) 555-2222'),
('New Orleans Cajun Delights', 'Shelley Burke', 'Order Administrator', 'P.O. Box 78934', 'New Orleans', 'USA', '(100) 555-4822'),
('Grandma Kelly''s Homestead', 'Regina Murphy', 'Sales Representative', '707 Oxford Rd.', 'Ann Arbor', 'USA', '(313) 555-5735'),
('Tokyo Traders', 'Yoshi Nagase', 'Marketing Manager', '9-8 Sekimai', 'Tokyo', 'Japan', '(03) 3555-5011'),
('Cooperativa de Quesos', 'Antonio del Valle', 'Export Administrator', 'Calle del Rosal 4', 'Oviedo', 'Spain', '(98) 598 76 54'),
('Mayumi''s', 'Mayumi Ohno', 'Marketing Representative', '92 Setsuko', 'Osaka', 'Japan', '(06) 431-7877'),
('Pavlova, Ltd.', 'Ian Devling', 'Marketing Manager', '74 Rose St.', 'Melbourne', 'Australia', '(03) 444-2343'),
('Specialty Biscuits, Ltd.', 'Peter Wilson', 'Sales Representative', '29 King''s Way', 'Manchester', 'UK', '(161) 555-4448');

-- Products
INSERT INTO Products (ProductName, SupplierID, CategoryID, QuantityPerUnit, UnitPrice, UnitsInStock, UnitsOnOrder, ReorderLevel) VALUES
('Chai', 1, 1, '10 boxes x 20 bags', 18.00, 39, 0, 10),
('Chang', 1, 1, '24 - 12 oz bottles', 19.00, 17, 40, 25),
('Aniseed Syrup', 1, 2, '12 - 550 ml bottles', 10.00, 13, 70, 25),
('Chef Anton''s Cajun Seasoning', 2, 2, '48 - 6 oz jars', 22.00, 53, 0, 0),
('Chef Anton''s Gumbo Mix', 2, 2, '36 boxes', 21.35, 0, 0, 0),
('Grandma''s Boysenberry Spread', 3, 2, '12 - 8 oz jars', 25.00, 120, 0, 25),
('Uncle Bob''s Organic Dried Pears', 3, 7, '12 - 1 lb pkgs.', 30.00, 15, 0, 10),
('Northwoods Cranberry Sauce', 3, 2, '12 - 12 oz jars', 40.00, 6, 0, 0),
('Mishi Kobe Niku', 4, 6, '18 - 500 g pkgs.', 97.00, 29, 0, 0),
('Ikura', 4, 8, '12 - 200 ml jars', 31.00, 31, 0, 0),
('Queso Cabrales', 5, 4, '1 kg pkg.', 21.00, 22, 30, 30),
('Queso Manchego La Pastora', 5, 4, '10 - 500 g pkgs.', 38.00, 86, 0, 0),
('Konbu', 6, 8, '2 kg box', 6.00, 24, 0, 5),
('Tofu', 6, 7, '40 - 100 g pkgs.', 23.25, 35, 0, 0),
('Genen Shouyu', 6, 2, '24 - 250 ml bottles', 15.50, 39, 0, 5),
('Pavlova', 7, 3, '32 - 500 g boxes', 17.45, 29, 0, 10),
('Alice Mutton', 7, 6, '20 - 1 kg tins', 39.00, 0, 0, 0),
('Carnarvon Tigers', 7, 8, '16 kg pkg.', 62.50, 42, 0, 0),
('Teatime Chocolate Biscuits', 8, 3, '10 boxes x 12 pieces', 9.20, 25, 0, 5),
('Sir Rodney''s Marmalade', 8, 3, '30 gift boxes', 81.00, 40, 0, 0);

-- Customers
INSERT INTO Customers (CustomerID, CompanyName, ContactName, ContactTitle, Address, City, Country, Phone) VALUES
('ALFKI', 'Alfreds Futterkiste', 'Maria Anders', 'Sales Representative', 'Obere Str. 57', 'Berlin', 'Germany', '030-0074321'),
('ANATR', 'Ana Trujillo Emparedados', 'Ana Trujillo', 'Owner', 'Avda. de la Constitución 2222', 'México D.F.', 'Mexico', '(5) 555-4729'),
('ANTON', 'Antonio Moreno Taquería', 'Antonio Moreno', 'Owner', 'Mataderos 2312', 'México D.F.', 'Mexico', '(5) 555-3932'),
('AROUT', 'Around the Horn', 'Thomas Hardy', 'Sales Representative', '120 Hanover Sq.', 'London', 'UK', '(171) 555-7788'),
('BERGS', 'Berglunds snabbköp', 'Christina Berglund', 'Order Administrator', 'Berguvsvägen 8', 'Luleå', 'Sweden', '0921-12 34 65'),
('BLAUS', 'Blauer See Delikatessen', 'Hanna Moos', 'Sales Representative', 'Forsterstr. 57', 'Mannheim', 'Germany', '0621-08460'),
('BLONP', 'Blondesddsl père et fils', 'Frédérique Citeaux', 'Marketing Manager', '24, place Kléber', 'Strasbourg', 'France', '88.60.15.31'),
('BOLID', 'Bólido Comidas preparadas', 'Martín Sommer', 'Owner', 'C/ Araquil, 67', 'Madrid', 'Spain', '(91) 555 22 82'),
('BONAP', 'Bon app''', 'Laurence Lebihan', 'Owner', '12, rue des Bouchers', 'Marseille', 'France', '91.24.45.40'),
('BOTTM', 'Bottom-Dollar Markets', 'Elizabeth Lincoln', 'Accounting Manager', '23 Tsawassen Blvd.', 'Tsawassen', 'Canada', '(604) 555-4729');

-- Employees
INSERT INTO Employees (LastName, FirstName, Title, TitleOfCourtesy, BirthDate, HireDate, Address, City, Country, HomePhone, ReportsTo) VALUES
('Davolio', 'Nancy', 'Sales Representative', 'Ms.', '1948-12-08', '1992-05-01', '507 - 20th Ave. E.', 'Seattle', 'USA', '(206) 555-9857', 2),
('Fuller', 'Andrew', 'Vice President, Sales', 'Dr.', '1952-02-19', '1992-08-14', '908 W. Capital Way', 'Tacoma', 'USA', '(206) 555-9482', NULL),
('Leverling', 'Janet', 'Sales Representative', 'Ms.', '1963-08-30', '1992-04-01', '722 Moss Bay Blvd.', 'Kirkland', 'USA', '(206) 555-3412', 2),
('Peacock', 'Margaret', 'Sales Representative', 'Mrs.', '1937-09-19', '1993-05-03', '4110 Old Redmond Rd.', 'Redmond', 'USA', '(206) 555-8122', 2),
('Buchanan', 'Steven', 'Sales Manager', 'Mr.', '1955-03-04', '1993-10-17', '14 Garrett Hill', 'London', 'UK', '(71) 555-4848', 2);

-- Orders
INSERT INTO Orders (CustomerID, EmployeeID, OrderDate, RequiredDate, ShippedDate, ShipVia, Freight, ShipName, ShipCity, ShipCountry) VALUES
('ALFKI', 1, '2023-07-04', '2023-08-01', '2023-07-16', 3, 32.38, 'Alfreds Futterkiste', 'Berlin', 'Germany'),
('ANATR', 4, '2023-07-05', '2023-08-02', '2023-07-10', 1, 11.61, 'Ana Trujillo Emparedados', 'México D.F.', 'Mexico'),
('ANTON', 3, '2023-07-08', '2023-08-05', '2023-07-12', 2, 18.44, 'Antonio Moreno Taquería', 'México D.F.', 'Mexico'),
('AROUT', 2, '2023-07-08', '2023-08-05', '2023-07-15', 2, 33.93, 'Around the Horn', 'London', 'UK'),
('BERGS', 1, '2023-07-10', '2023-08-07', '2023-07-12', 3, 151.52, 'Berglunds snabbköp', 'Luleå', 'Sweden');

-- Order Details
INSERT INTO OrderDetails (OrderID, ProductID, UnitPrice, Quantity, Discount) VALUES
(1, 1, 18.00, 12, 0),
(1, 2, 19.00, 10, 0),
(1, 4, 22.00, 5, 0),
(2, 3, 10.00, 20, 0.05),
(2, 5, 21.35, 15, 0.05),
(3, 6, 25.00, 6, 0),
(3, 7, 30.00, 15, 0),
(4, 8, 40.00, 10, 0.1),
(4, 9, 97.00, 3, 0),
(5, 10, 31.00, 20, 0),
(5, 11, 21.00, 12, 0.1);

-- Create views for common queries

CREATE VIEW ProductsAboveAveragePrice AS
SELECT ProductName, UnitPrice
FROM Products
WHERE UnitPrice > (SELECT AVG(UnitPrice) FROM Products)
ORDER BY UnitPrice DESC;

CREATE VIEW OrderDetailsExtended AS
SELECT 
    od.OrderID,
    od.ProductID,
    p.ProductName,
    od.UnitPrice,
    od.Quantity,
    od.Discount,
    (od.UnitPrice * od.Quantity * (1 - od.Discount)) as ExtendedPrice
FROM OrderDetails od
JOIN Products p ON od.ProductID = p.ProductID;

CREATE VIEW CustomerOrderSummary AS
SELECT 
    c.CustomerID,
    c.CompanyName,
    COUNT(DISTINCT o.OrderID) as TotalOrders,
    SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) as TotalRevenue
FROM Customers c
LEFT JOIN Orders o ON c.CustomerID = o.CustomerID
LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
GROUP BY c.CustomerID, c.CompanyName;