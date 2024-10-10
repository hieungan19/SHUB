-- Tạo bảng Trạm xăng
CREATE TABLE GasStation (
    ID INT PRIMARY KEY IDENTITY(1,1),  -- Sử dụng IDENTITY cho SQL Server
    Name NVARCHAR(100) NOT NULL,
    Location NVARCHAR(255) NOT NULL,
    Phone VARCHAR(15) NOT NULL -- Số điện thoại
);

-- Tạo bảng Hàng hoá
CREATE TABLE Product (
    ID INT PRIMARY KEY IDENTITY(1,1),  -- Sử dụng IDENTITY cho SQL Server
    Name NVARCHAR(100) NOT NULL,
    ProductType NVARCHAR(10) NOT NULL CHECK (ProductType IN ('Xăng', 'Dầu')), -- Sử dụng CHECK cho SQL Server
    Price DECIMAL(10, 2) NOT NULL
);

-- Tạo bảng Trụ bơm
CREATE TABLE Pump (
    ID INT PRIMARY KEY IDENTITY(1,1),  -- Sử dụng IDENTITY cho SQL Server
    Number NVARCHAR(50) NOT NULL,
    GasStationID INT,
    ProductID INT,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Hoạt động',
    FOREIGN KEY (GasStationID) REFERENCES GasStation(ID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Product(ID) ON DELETE SET NULL
);

-- Tạo bảng Giao dịch
CREATE TABLE GasTransaction (
    ID INT PRIMARY KEY IDENTITY(1,1),  -- Sử dụng IDENTITY cho SQL Server
    GasStationID INT,
    PumpID INT,
    ProductID INT,
    DateTime DATETIME NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL,
    TotalValue DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (GasStationID) REFERENCES GasStation(ID),
    FOREIGN KEY (PumpID) REFERENCES Pump(ID),
    FOREIGN KEY (ProductID) REFERENCES Product(ID) 
);

