const express = require('express');
const sql = require('mssql'); // Đảm bảo import mssql
const cors = require('cors');
const passport = require('passport'); // Thêm dòng này
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy; // Thêm Facebook Strategy
const session = require('express-session');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js'); // Import CryptoJS
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sendEmail = require('./utils/sendEmail'); // Thêm dòng này vào phần import
const moment = require('moment-timezone');
const nodemailer = require('nodemailer'); 
const { poolPromise } = require('./db');
require('dotenv').config();
const verifyAdmin = require('./middleware/verifyAdmin'); 
const router = express.Router();
const http = require('http');
const { Server } = require('socket.io');
const app = express();


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://b767-2405-4802-c0f3-faa0-8cb0-6540-ac31-5a2c.ngrok-free.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
// Cấu hình CORS
app.use(cors({
  origin: ['http://localhost:3000','https://b767-2405-4802-c0f3-faa0-8cb0-6540-ac31-5a2c.ngrok-free.app'], // Cho phép cả localhost và ngrok
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Thêm middleware log request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request received: ${req.method} ${req.url}`);
  next();
});
// Middleware để parse JSON
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Cấu hình session (phải đặt trước passport)
app.use(session({
  secret: process.env.SESSION_SECRET || '8f64a1e9d2b5c6f7d8e9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1', // Khóa bí mật cho session
  resave: false, // Không lưu lại session nếu không có thay đổi
  saveUninitialized: false, // Không tạo session cho request chưa xác thực
  cookie: { secure: false } // Set thành true nếu dùng HTTPS trong production
}));

// Khởi tạo Passport sau session
app.use(passport.initialize());
app.use(passport.session());
// Middleware xác thực token

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('authenticateToken - No token provided');
    return res.status(401).json({ success: false, message: 'Không tìm thấy token' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      console.log('authenticateToken - Invalid token:', err);
      return res.status(403).json({ success: false, message: 'Token không hợp lệ' });
    }
    console.log('authenticateToken - Decoded user:', user);
    // Chuẩn hóa key từ userId thành UserId
    req.user = {
      UserId: user.userId || user.UserId, // Hỗ trợ cả hai trường hợp
      Username: user.username || user.Username,
      Role: user.role || user.Role,
    };
    next();
  });
};

// Passport serialize/deserialize user
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.UserId);
  done(null, user.UserId);
});

passport.deserializeUser(async (id, done) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.Int, id)
      .query('SELECT * FROM Users WHERE UserId = @UserId');
    done(null, result.recordset[0]);
  } catch (err) {
    done(err, null);
  }
});
// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm gửi mã xác nhận qua email
const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Mã xác nhận khôi phục mật khẩu',
    html: `
      <h2>Khôi phục mật khẩu</h2>
      <p>Mã xác nhận của bạn là: <strong>${code}</strong></p>
      <p>Mã này có hiệu lực trong 10 phút.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Hàm gửi thông báo cho admin
const notifyAdmin = async (title, message) => {
  try {
    const pool = await poolPromise;
    const adminResult = await pool.request()
      .query("SELECT UserId FROM Users WHERE Role = 'Admin'");
    
    const admins = adminResult.recordset;
    if (admins.length > 0) {
      for (const admin of admins) {
        await pool.request()
          .input('UserId', sql.Int, admin.UserId)
          .input('Title', sql.NVarChar, title)
          .input('Message', sql.NVarChar, message)
          .query(`
            INSERT INTO Notifications (UserId, Title, Message, CreatedAt)
            VALUES (@UserId, @Title, @Message, GETDATE())
          `);
      }
      io.emit('adminNotification', {
        title,
        message,
        createdAt: moment().tz('Asia/Ho_Chi_Minh').toDate(),
        type: title.includes('hết hàng') ? 'Stock' : 'Order',
      });
      console.log('[notifyAdmin] Notification sent:', { title, message });
    }
  } catch (err) {
    console.error('[notifyAdmin] Error:', err.message);
  }
};

// API Gửi mã xác nhận qua email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const pool = await poolPromise; // Sử dụng poolPromise từ db.js
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại' });
    }

    // Tạo mã xác nhận ngẫu nhiên
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = jwt.sign({ email, code }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '10m' });

    // Gửi email
    await sendVerificationCode(email, code);

    res.json({ success: true, token, message: 'Mã xác nhận đã được gửi tới email của bạn' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API Xác nhận mã và đổi mật khẩu (không mã hóa mật khẩu)
router.post('/reset-password', async (req, res) => {
  const { token, code, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (decoded.code !== code) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận không đúng' });
    }

    // Lưu mật khẩu dưới dạng plain text
    const pool = await poolPromise; // Sử dụng poolPromise từ db.js
    await pool.request()
      .input('email', sql.NVarChar, decoded.email)
      .input('password', sql.NVarChar, newPassword)
      .query('UPDATE Users SET Password = @password, UpdatedAt = GETDATE() WHERE Email = @email');

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: 'Mã xác nhận hết hạn hoặc không hợp lệ' });
  }
});

// Gắn router vào app
app.use('/api/auth', router);

// API Phone Match AI
router.post('/phone-match', async (req, res) => {
  const { budget, brand, ageGroup, preference, deviceType, purpose } = req.body;
  console.log('Received request body:', { budget, brand, ageGroup, preference, deviceType, purpose });

  try {
    const pool = await poolPromise;
    let query = `
      SELECT p.ProductId, p.Name, p.Price, p.BrandId,
      (SELECT TOP 1 ImageUrl FROM ProductImages pi WHERE pi.ProductId = p.ProductId) AS ImageUrl
      FROM Products p
      WHERE 1=1
    `;
    const params = {};

    // Lọc theo ngân sách
    if (budget) {
      if (budget === 'under10') query += ' AND p.Price < 10000000';
      else if (budget === '10to20') query += ' AND p.Price BETWEEN 10000000 AND 20000000';
      else if (budget === 'over20') query += ' AND p.Price > 20000000';
    }
    console.log('Budget filter applied:', budget);

    // Lọc theo thương hiệu
    let brandId = null;
    if (brand && brand !== 'any') {
      if (brand === 'apple') brandId = 1;
      else if (brand === 'samsung') brandId = 2;
      if (brandId) {
        query += ' AND p.BrandId = @brandId';
        params.brandId = brandId;
      }
    }
    console.log('Brand filter applied:', { brand, brandId });

    // Lọc theo độ tuổi (dựa vào giá)
    if (ageGroup) {
      if (ageGroup === 'under18') {
        // Người trẻ thường thích thiết bị giá rẻ
        query += ' AND p.Price < 15000000';
      } else if (ageGroup === '18to30') {
        // Người trẻ tuổi thích thiết bị tầm trung
        query += ' AND p.Price BETWEEN 10000000 AND 25000000';
      } else if (ageGroup === 'over30') {
        // Người lớn tuổi thích thiết bị cao cấp
        query += ' AND p.Price > 20000000';
      }
    }
    console.log('Age group filter applied:', ageGroup);

    // Lọc theo sở thích (dựa vào tên sản phẩm)
    if (preference) {
      if (preference === 'camera') {
        // Giả định các sản phẩm có từ "Pro" hoặc "Ultra" thường có camera tốt
        query += " AND (p.Name LIKE '%Pro%' OR p.Name LIKE '%Ultra%')";
      } else if (preference === 'gaming') {
        // Giả định các sản phẩm có từ "Gaming" hoặc giá cao thường phù hợp chơi game
        query += " AND (p.Name LIKE '%Gaming%' OR p.Price > 20000000)";
      } else if (preference === 'battery') {
        // Giả định các sản phẩm của Samsung hoặc có từ "Plus" thường có pin tốt
        query += " AND (p.BrandId = 2 OR p.Name LIKE '%Plus%')";
      }
    }
    console.log('Preference filter applied:', preference);

    // Lọc theo loại thiết bị (dựa vào tên sản phẩm)
    if (deviceType) {
      if (deviceType === 'phone') {
        query += " AND (p.Name LIKE '%Phone%' OR p.Name LIKE '%Galaxy%')";
      } else if (deviceType === 'tablet') {
        query += " AND p.Name LIKE '%Tab%'";
      } else if (deviceType === 'laptop') {
        query += " AND p.Name LIKE '%Laptop%'";
      } else if (deviceType === 'macbook') {
        query += " AND p.Name LIKE '%MacBook%'";
      }
    }
    console.log('Device type filter applied:', deviceType);

    // Lọc theo mục đích sử dụng (dựa vào giá và tên)
    if (purpose) {
      if (purpose === 'work') {
        // Thiết bị làm việc thường là MacBook hoặc laptop cao cấp
        query += " AND (p.Name LIKE '%MacBook%' OR p.Name LIKE '%Laptop%' OR p.Price > 20000000)";
      } else if (purpose === 'entertainment') {
        // Giải trí thường là điện thoại hoặc tablet
        query += " AND (p.Name LIKE '%Phone%' OR p.Name LIKE '%Tab%')";
      } else if (purpose === 'study') {
        // Học tập thường là thiết bị giá tầm trung
        query += ' AND p.Price BETWEEN 10000000 AND 20000000';
      }
    }
    console.log('Purpose filter applied:', purpose);

    // Nhóm sản phẩm để tránh trùng lặp
    query += ' GROUP BY p.ProductId, p.Name, p.Price, p.BrandId';

    console.log('Final SQL query:', query);
    console.log('Query parameters:', params);

    const request = pool.request();
    Object.keys(params).forEach(key => request.input(key, sql.Int, params[key]));
    const result = await request.query(query);

    console.log('Query result:', result.recordset);

    if (result.recordset.length === 0) {
      console.log('No products found matching the criteria');
      return res.json({ suggestions: [], message: 'Không tìm thấy sản phẩm phù hợp' });
    }

    const suggestions = result.recordset.map(product => ({
      ...product,
      Brand: product.BrandId === 1 ? 'Apple' : product.BrandId === 2 ? 'Samsung' : 'Unknown',
    }));

    console.log('Suggestions to return:', suggestions);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error in /phone-match API:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});
// API kiểm tra kết nối
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Cấu hình ZaloPay với App ID, Key1, Key2 bạn cung cấp
// Cấu hình ZaloPay
const ZLP_CONFIG = {
  app_id: '2553',
  key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
  key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
  endpoint: 'https://sb-openapi.zalopay.vn/v2/',
  callback_url: 'https://1188-2405-4802-c315-cd00-ace9-8bc2-cf33-b98a.ngrok-free.app/api/zalopay-callback',
};

// Hàm lấy URL công khai từ ngrok
async function getNgrokUrl() {
  try {
    const response = await axios.get('http://localhost:4040/api/tunnels');
    const publicUrl = response.data.tunnels[0].public_url;
    console.log('Ngrok public URL:', publicUrl);
    return publicUrl;
  } catch (err) {
    console.error('Error fetching ngrok URL:', err.message);
    return null;
  }
}

// Cập nhật callback_url của ZaloPay với ngrok
(async () => {
  const ngrokUrl = await getNgrokUrl();
  if (ngrokUrl) {
    ZLP_CONFIG.callback_url = `${ngrokUrl}/api/zalopay-callback`;
    console.log('Updated ZLP_CONFIG.callback_url:', ZLP_CONFIG.callback_url);
  } else {
    console.error('Could not fetch ngrok URL. Using fallback callback_url.');
    ZLP_CONFIG.callback_url = 'http://localhost:5000/api/zalopay-callback';
  }
})();


//API Upload avt
// Cấu hình multer chung
const createStorage = (destinationPath) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = destinationPath;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Tạo storage cho avatars (cấu hình hiện có của bạn)
const avatarStorage = createStorage('uploads/avatars/');

// Tạo storage cho brands
const brandStorage = createStorage('uploads/brands/');

// Cấu hình multer cho avatars
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Chỉ hỗ trợ file ảnh (jpeg, jpg, png)!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

// Cấu hình multer cho brands
const uploadBrandLogo = multer({
  storage: brandStorage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Chỉ hỗ trợ file ảnh (jpeg, jpg, png)!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

module.exports = { uploadAvatar, uploadBrandLogo };
// Phục vụ file tĩnh từ thư mục uploads
app.use('/uploads', express.static('uploads'));

app.get('/api/products1', async (req, res) => {
  const { category } = req.query; // Lấy category từ query parameter

  try {
    const pool = await poolPromise;

    // Query SQL để lấy sản phẩm và thông tin danh mục
    let query = `
      SELECT 
        p.ProductId AS id,
        p.Name AS name,
        p.Price AS price,
        p.Description AS description,
        p.Stock AS stock,
        p.DiscountPercentage,
        c.Name AS category,
        b.Name AS brand,
        (SELECT TOP 1 ImageUrl FROM ProductImages pi WHERE pi.ProductId = p.ProductId AND pi.IsPrimary = 1) AS image,
        CASE 
          WHEN p.Stock > 0 THEN N'Còn hàng'
          ELSE N'Hết hàng'
        END AS status
      FROM Products p
      JOIN Categories c ON p.CategoryId = c.CategoryId
      JOIN Brands b ON p.BrandId = b.BrandId
    `;

    // Nếu có category, thêm điều kiện WHERE
    const params = [];
    if (category) {
      query += ` WHERE c.Name = @Category`;
      params.push({ name: 'Category', type: sql.NVarChar(50), value: category });
    }

    // Thực hiện query
    const request = pool.request();
    params.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);
    const products = result.recordset;

    res.json({ success: true, products });
  } catch (err) {
    console.error('[GET /api/products] Error:', err.message);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});
//API Product
app.get('/api/categories1', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        CategoryId,
        Name
      FROM Categories
    `);
    const categories = result.recordset;
    res.json(categories);
  } catch (err) {
    console.error('[GET /api/categories] Error:', err.message);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});

// API đăng nhập
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.log(`[POST /api/login] Missing credentials: username=${username}, password=${password}`);
    return res.status(400).json({ success: false, message: 'Thiếu tên đăng nhập hoặc mật khẩu' });
  }

  console.log(`[POST /api/login] Attempting login for username: ${username}`);
  console.log('Server time:', new Date().toISOString());

  try {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .query('SELECT UserId, Username, Password, FullName, Email, Phone, Address, AvatarUrl, Role FROM Users WHERE Username = @username AND Password = @password');

    const user = result.recordset[0];
    if (!user) {
      console.log(`[POST /api/login] Invalid credentials for username: ${username}`);
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Cập nhật cột LastLogin (UTC+7)
    await pool.request()
      .input('UserId', sql.Int, user.UserId)
      .query('UPDATE Users SET LastLogin = DATEADD(HOUR, 7, GETDATE()) WHERE UserId = @UserId');

    // Tạo JWT token
    const token = jwt.sign(
      { UserId: user.UserId, Username: user.Username, Role: user.Role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    // Xóa mật khẩu khỏi dữ liệu trả về
    delete user.Password;

    console.log(`[POST /api/login] User logged in successfully: userId=${user.UserId}, username=${user.Username}, role=${user.Role}, token=${token}`);
    res.json({ success: true, user, token });
  } catch (err) {
    console.error(`[POST /api/login] Error: ${err.message}`);
    console.error(`[POST /api/login] Stack: ${err.stack}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng nhập' });
  }
});
// API đăng ký
app.post('/api/register', async (req, res) => {
  const { username, fullName, email, password } = req.body;

  if (!username || !fullName || !email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
  }

  try {
    const pool = await poolPromise;

    // Kiểm tra username hoặc email đã tồn tại
    const checkResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .query('SELECT Username, Email FROM Users WHERE Username = @username OR Email = @email');

    if (checkResult.recordset.length > 0) {
      const existing = checkResult.recordset[0];
      if (existing.Username === username) {
        return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
      }
      if (existing.Email === email) {
        return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
      }
    }

    // Thêm user mới với Role mặc định là 'Customer'
    const insertResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .input('fullName', sql.NVarChar, fullName)
      .input('email', sql.NVarChar, email)
      .input('authProvider', sql.NVarChar, 'Local')
      .input('role', sql.NVarChar, 'Customer') // Thêm Role
      .query(`
        INSERT INTO Users (Username, Password, FullName, Email, AuthProvider, Role, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.UserId, INSERTED.Username, INSERTED.FullName, INSERTED.Email, INSERTED.Role
        VALUES (@username, @password, @fullName, @email, @authProvider, @role, GETDATE(), GETDATE())
      `);

    const user = insertResult.recordset[0];
    const token = jwt.sign(
      { userId: user.UserId, username: user.Username, role: user.Role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ success: true, message: 'Đăng ký thành công', user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký: ' + err.message });
  }
});

// API endpoint để lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        p.ProductId AS id,
        p.Name AS name,
        p.Price AS price,
        p.Description AS description,
        p.Stock,
        p.DiscountPercentage,
        c.Name AS category,
        b.Name AS brand,
        (SELECT TOP 1 ImageUrl FROM ProductImages pi WHERE pi.ProductId = p.ProductId AND pi.IsPrimary = 1) AS image
      FROM Products p
      LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
      LEFT JOIN Brands b ON p.BrandId = b.BrandId
    `);

    const products = result.recordset.map(product => ({
      ...product,
      status: product.Stock > 0 ? 'Còn hàng' : 'Hết hàng',
    }));

    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
});

// API lấy chi tiết sản phẩm
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // Lấy thông tin sản phẩm
    const productResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT ProductId, Name, BrandId, CategoryId, Price, Description, Stock, DetailedSpecs, DiscountPercentage
        FROM Products 
        WHERE ProductId = @id
      `);

    if (productResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const product = productResult.recordset[0];
    product.status = product.Stock > 0 ? 'Còn hàng' : 'Hết hàng';
    // Tính DiscountedPrice nếu có DiscountPercentage
    product.DiscountedPrice = product.DiscountPercentage > 0 ? product.Price * (1 - product.DiscountPercentage / 100) : null;

    // Lấy danh sách ảnh của sản phẩm
    const imagesResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT ImageUrl 
        FROM ProductImages 
        WHERE ProductId = @id 
        ORDER BY DisplayOrder ASC
      `);

    const images = imagesResult.recordset.map(img => img.ImageUrl);

    res.json({
      success: true,
      product: {
        ...product,
        images, // Trả về mảng URL ảnh
      },
    });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
});


// Gắn router vào ứng dụng với tiền tố /api
app.use('/api', router);

// POST /api/wishlist - Thêm sản phẩm vào wishlist
app.post('/api/wishlist', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;
  const { productId } = req.body;

  console.log(`[${new Date().toISOString()}] [POST /api/wishlist] Adding product ${productId} to wishlist for userId: ${userId}`);

  if (!productId) {
    console.log(`[${new Date().toISOString()}] [POST /api/wishlist] Missing productId in request body`);
    return res.status(400).json({ success: false, message: 'Thiếu productId' });
  }

  try {
    const pool = await poolPromise;

    // Kiểm tra xem sản phẩm đã có trong wishlist chưa
    console.log(`[${new Date().toISOString()}] [POST /api/wishlist] Checking if product ${productId} already exists in wishlist for userId: ${userId}`);
    const existingItem = await pool.request()
      .input('UserId', sql.Int, userId)
      .input('ProductId', sql.Int, productId)
      .query(`
        SELECT * FROM Wishlist
        WHERE UserId = @UserId AND ProductId = @ProductId
      `);

    if (existingItem.recordset.length > 0) {
      console.log(`[${new Date().toISOString()}] [POST /api/wishlist] Product ${productId} already in wishlist for userId: ${userId}`);
      return res.status(400).json({ success: false, message: 'Sản phẩm đã có trong danh sách yêu thích' });
    }

    // Thêm sản phẩm vào wishlist
    console.log(`[${new Date().toISOString()}] [POST /api/wishlist] Inserting product ${productId} into wishlist for userId: ${userId}`);
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .input('ProductId', sql.Int, productId)
      .query(`
        INSERT INTO Wishlist (UserId, ProductId)
        VALUES (@UserId, @ProductId);
        SELECT SCOPE_IDENTITY() AS WishlistId;
      `);

    const wishlistId = result.recordset[0].WishlistId;
    console.log(`[${new Date().toISOString()}] [POST /api/wishlist] Successfully added product ${productId} to wishlist with wishlistId: ${wishlistId}`);

    res.status(201).json({ success: true, message: 'Đã thêm sản phẩm vào danh sách yêu thích', wishlistId });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] [POST /api/wishlist] Error adding product ${productId} for userId: ${userId}:`, err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});

// GET /api/wishlist - Lấy danh sách wishlist
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;
  console.log(`[${new Date().toISOString()}] [GET /api/wishlist] Fetching wishlist for userId: ${userId}`);

  try {
    const pool = await poolPromise;

    // Bước 1: Lấy danh sách sản phẩm trong wishlist
    const wishlistResult = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT w.WishlistId, p.ProductId, p.Name, p.Price, 
               p.DiscountPercentage, p.Stock,
               CASE 
                 WHEN p.DiscountPercentage > 0 
                 THEN p.Price * (1 - p.DiscountPercentage / 100) 
                 ELSE p.Price 
               END AS DiscountedPrice
        FROM Wishlist w
        JOIN Products p ON w.ProductId = p.ProductId
        WHERE w.UserId = @UserId
      `);

    const wishlistItems = wishlistResult.recordset;

    if (wishlistItems.length === 0) {
      console.log(`[${new Date().toISOString()}] [GET /api/wishlist] No items found in wishlist for userId: ${userId}`);
      return res.json({ success: true, wishlist: [] });
    }

    // Bước 2: Lấy danh sách ProductId từ kết quả
    const productIds = wishlistItems.map(item => item.ProductId);

    // Bước 3: Lấy hình ảnh từ bảng ProductImages
    const imagesResult = await pool.request()
      .query(`
        SELECT ProductId, ImageUrl
        FROM ProductImages
        WHERE ProductId IN (${productIds.join(',')})
        ORDER BY ProductId, DisplayOrder, IsPrimary DESC
      `);

    const imagesByProduct = {};
    imagesResult.recordset.forEach(image => {
      if (!imagesByProduct[image.ProductId]) {
        imagesByProduct[image.ProductId] = [];
      }
      imagesByProduct[image.ProductId].push(image.ImageUrl);
    });

    // Bước 4: Kết hợp dữ liệu
    const wishlist = wishlistItems.map(item => ({
      wishlistId: item.WishlistId,
      productId: item.ProductId,
      name: item.Name,
      price: item.Price,
      discountedPrice: item.DiscountedPrice,
      discountPercentage: item.DiscountPercentage,
      stock: item.Stock,
      images: imagesByProduct[item.ProductId] || ['https://via.placeholder.com/150?text=No+Image'],
    }));

    console.log(`[${new Date().toISOString()}] [GET /api/wishlist] Fetched ${wishlist.length} items for userId: ${userId}`);
    res.json({ success: true, wishlist });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] [GET /api/wishlist] Error fetching wishlist for userId: ${userId}:`, err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});
// DELETE /api/wishlist/:wishlistId - Xóa sản phẩm khỏi wishlist
app.delete('/api/wishlist/:wishlistId', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;
  const wishlistId = parseInt(req.params.wishlistId);

  console.log(`[${new Date().toISOString()}] [DELETE /api/wishlist/${wishlistId}] Removing wishlist item for userId: ${userId}`);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WishlistId', sql.Int, wishlistId)
      .input('UserId', sql.Int, userId)
      .query(`
        DELETE FROM Wishlist
        WHERE WishlistId = @WishlistId AND UserId = @UserId
      `);

    if (result.rowsAffected[0] === 0) {
      console.log(`[${new Date().toISOString()}] [DELETE /api/wishlist/${wishlistId}] Wishlist item not found for userId: ${userId}`);
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong danh sách yêu thích' });
    }

    console.log(`[${new Date().toISOString()}] [DELETE /api/wishlist/${wishlistId}] Successfully removed wishlist item for userId: ${userId}`);
    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi danh sách yêu thích' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] [DELETE /api/wishlist/${wishlistId}] Error removing wishlist item for userId: ${userId}:`, err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});
//API  GET đánh dấu sản phẩm đã xem
app.get('/api/recently-viewed', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;
  console.log(`[GET /api/recently-viewed] Fetching recently viewed products for userId: ${userId}`);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT rv.ProductId, p.Name, p.Price, p.DiscountPercentage, p.Stock,
               (SELECT TOP 1 ImageUrl FROM ProductImages pi WHERE pi.ProductId = p.ProductId AND pi.IsPrimary = 1) AS ImageUrl
        FROM RecentlyViewed rv
        JOIN Products p ON rv.ProductId = p.ProductId
        WHERE rv.UserId = @UserId
        ORDER BY rv.ViewedAt DESC
      `);

    const recentlyViewed = result.recordset.map(product => ({
      ProductId: product.ProductId,
      Name: product.Name,
      Price: product.Price,
      DiscountPercentage: product.DiscountPercentage,
      DiscountedPrice: product.DiscountPercentage > 0 ? product.Price * (1 - product.DiscountPercentage / 100) : null,
      Stock: product.Stock,
      images: product.ImageUrl ? [product.ImageUrl] : ['https://via.placeholder.com/150?text=No+Image'],
    }));

    res.json({ success: true, recentlyViewed });
  } catch (err) {
    console.error(`[GET /api/recently-viewed] Error:`, err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});
//API POST đánh dấu sản phẩm đã xem
app.post('/api/recently-viewed', authenticateToken, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.UserId;
  console.log(`[POST /api/recently-viewed] Adding productId: ${productId} for userId: ${userId}`);

  try {
    const pool = await poolPromise;

    // Kiểm tra sản phẩm có tồn tại không
    const productCheck = await pool.request()
      .input('ProductId', sql.Int, productId)
      .query('SELECT ProductId FROM Products WHERE ProductId = @ProductId');
    if (productCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Cập nhật hoặc thêm mới bản ghi trong RecentlyViewed
    await pool.request()
      .input('UserId', sql.Int, userId)
      .input('ProductId', sql.Int, productId)
      .query(`
        IF EXISTS (SELECT 1 FROM RecentlyViewed WHERE UserId = @UserId AND ProductId = @ProductId)
          UPDATE RecentlyViewed
          SET ViewedAt = GETDATE()
          WHERE UserId = @UserId AND ProductId = @ProductId
        ELSE
          INSERT INTO RecentlyViewed (UserId, ProductId, ViewedAt)
          VALUES (@UserId, @ProductId, GETDATE())
      `);

    res.json({ success: true, message: 'Đã lưu sản phẩm vào danh sách đã xem' });
  } catch (err) {
    console.error(`[POST /api/recently-viewed] Error:`, err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});
//API sản phẩm liên quan
app.get('/api/products/related/:productId', async (req, res) => {
  const { productId } = req.params;
  console.log(`[GET /api/products/related/${productId}] Fetching related products`);

  try {
    const pool = await poolPromise;

    // Kiểm tra sản phẩm có tồn tại không và lấy CategoryId
    const productResult = await pool.request()
      .input('ProductId', sql.Int, parseInt(productId))
      .query('SELECT CategoryId FROM Products WHERE ProductId = @ProductId');
    if (productResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }
    const categoryId = productResult.recordset[0].CategoryId;

    // Lấy danh sách người dùng đã mua sản phẩm này
    const usersResult = await pool.request()
      .input('ProductId', sql.Int, parseInt(productId))
      .query(`
        SELECT DISTINCT o.UserId
        FROM Orders o
        JOIN OrderItems oi ON o.OrderId = oi.OrderId
        WHERE oi.ProductId = @ProductId
      `);
    const userIds = usersResult.recordset.map(user => user.UserId);

    let relatedProducts = [];
    if (userIds.length > 0) {
      const relatedResult = await pool.request()
        .query(`
          SELECT DISTINCT p.*
          FROM Products p
          JOIN OrderItems oi ON p.ProductId = oi.ProductId
          JOIN Orders o ON oi.OrderId = o.OrderId
          WHERE o.UserId IN (${userIds.join(',')})
            AND p.ProductId != ${parseInt(productId)}
            AND p.Stock > 0
          ORDER BY p.ProductId
          OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY
        `);
      relatedProducts = relatedResult.recordset;
    }

    if (relatedProducts.length < 5) {
      const categoryResult = await pool.request()
        .input('CategoryId', sql.Int, categoryId)
        .input('ProductId', sql.Int, parseInt(productId))
        .query(`
          SELECT *
          FROM Products
          WHERE CategoryId = @CategoryId
            AND ProductId != @ProductId
            AND Stock > 0
          ORDER BY ProductId
          OFFSET 0 ROWS FETCH NEXT ${5 - relatedProducts.length} ROWS ONLY
        `);
      relatedProducts = [...relatedProducts, ...categoryResult.recordset];
    }

    // Lấy hình ảnh cho từng sản phẩm liên quan từ bảng ProductImages
    for (let product of relatedProducts) {
      const imagesResult = await pool.request()
        .input('ProductId', sql.Int, product.ProductId)
        .query(`
          SELECT ImageUrl
          FROM ProductImages
          WHERE ProductId = @ProductId
          ORDER BY IsPrimary DESC, DisplayOrder ASC
        `);
      product.images = imagesResult.recordset.map(img => img.ImageUrl);
      if (product.images.length === 0) {
        product.images = ['https://via.placeholder.com/150?text=No+Image'];
      }
      product.DiscountedPrice =
        product.DiscountPercentage > 0
          ? product.Price * (1 - product.DiscountPercentage / 100)
          : null;
    }

    res.json({ success: true, relatedProducts });
  } catch (err) {
    console.error(`[GET /api/products/related/${productId}] Error:`, err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});
// API cập nhật thông tin người dùng
app.put('/api/users/update', authenticateToken, async (req, res) => {
  const { UserId, FullName, Email, Phone, Address, AvatarUrl } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('UserId', sql.Int, UserId)
      .input('FullName', sql.NVarChar, FullName)
      .input('Email', sql.NVarChar, Email)
      .input('Phone', sql.NVarChar, Phone)
      .input('Address', sql.NVarChar, Address)
      .input('AvatarUrl', sql.NVarChar(sql.MAX), AvatarUrl) // Hỗ trợ chuỗi dài
      .query(`
        UPDATE Users 
        SET FullName = @FullName, Email = @Email, Phone = @Phone, Address = @Address, AvatarUrl = @AvatarUrl
        WHERE UserId = @UserId
      `);

    res.json({ success: true, message: 'Cập nhật thông tin thành công' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thông tin' });
  }
});

// API đổi mật khẩu
app.put('/api/users/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId; // Lấy từ token

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .input('Password', sql.NVarChar, oldPassword)
      .query('SELECT Password FROM Users WHERE UserId = @UserId');

    const user = result.recordset[0];
    if (!user || user.Password !== oldPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu cũ không đúng' });
    }

    await pool.request()
      .input('UserId', sql.Int, userId)
      .input('NewPassword', sql.NVarChar, newPassword)
      .query('UPDATE Users SET Password = @NewPassword WHERE UserId = @UserId');

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi đổi mật khẩu' });
  }
});

// Lấy danh sách categories
app.get('/api/categories', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT CategoryId, Name FROM Categories');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách loại sản phẩm' });
  }
});

// Lấy danh sách brands
app.get('/api/brands', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT BrandId, Name FROM Brands');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách thương hiệu' });
  }
});

// API lấy danh sách bình luận của sản phẩm
app.get('/api/reviews/:productId', async (req, res) => {
  const { productId } = req.params;
  console.log(`[GET /api/reviews/${productId}] Fetching reviews for productId: ${productId}`);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductId', sql.Int, parseInt(productId))
      .query(`
        SELECT r.ReviewId, r.ProductId, r.UserId, r.Rating, r.Comment, r.CreatedAt, u.Username,
               rr.ReplyId, rr.UserId AS ReplyUserId, rr.ReplyText, rr.CreatedAt AS ReplyCreatedAt, 
               ru.Username AS ReplyUsername, ru.Role AS ReplyUserRole
        FROM Reviews r
        JOIN Users u ON r.UserId = u.UserId
        LEFT JOIN ReviewReplies rr ON r.ReviewId = rr.ReviewId
        LEFT JOIN Users ru ON rr.UserId = ru.UserId
        WHERE r.ProductId = @ProductId
        ORDER BY r.CreatedAt DESC, rr.CreatedAt ASC
      `);

    const reviewsMap = new Map();
    result.recordset.forEach(row => {
      const reviewId = row.ReviewId;
      if (!reviewsMap.has(reviewId)) {
        reviewsMap.set(reviewId, {
          reviewId: row.ReviewId,
          productId: row.ProductId,
          userId: row.UserId,
          username: row.Username,
          rating: row.Rating,
          comment: row.Comment,
          createdAt: moment(row.CreatedAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss'),
          replies: [],
        });
      }

      if (row.ReplyId) {
        console.log(`[GET /api/reviews/${productId}] Processing reply: replyId=${row.ReplyId}, userId=${row.ReplyUserId}, role=${row.ReplyUserRole}`);
        reviewsMap.get(reviewId).replies.push({
          replyId: row.ReplyId,
          userId: row.ReplyUserId,
          username: row.ReplyUsername,
          replyText: row.ReplyText,
          createdAt: moment(row.ReplyCreatedAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss'),
          role: row.ReplyUserRole,
        });
      }
    });

    const reviews = Array.from(reviewsMap.values());
    console.log(`[GET /api/reviews/${productId}] Found ${reviews.length} reviews`);
    res.json({ success: true, reviews });
  } catch (err) {
    console.error(`[GET /api/reviews/${productId}] Error: ${err.message}`);
    console.error(`[GET /api/reviews/${productId}] Stack: ${err.stack}`);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});
// API thêm bình luận mới
app.post('/api/reviews', authenticateToken, async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.UserId;

  console.log('[POST /api/reviews] Received request:', { productId, userId, rating, comment });

  if (!productId || !rating || rating < 1 || rating > 5) {
    console.error('[POST /api/reviews] Error: Invalid input', { productId, rating });
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
  }

  try {
    const pool = await poolPromise;

    // Kiểm tra sản phẩm có tồn tại không
    const productCheck = await pool.request()
      .input('ProductId', sql.Int, productId)
      .query('SELECT ProductId FROM Products WHERE ProductId = @ProductId');
    if (productCheck.recordset.length === 0) {
      console.error('[POST /api/reviews] Error: Product not found', { productId });
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Thêm bình luận vào database
    const result = await pool.request()
      .input('ProductId', sql.Int, productId)
      .input('UserId', sql.Int, userId)
      .input('Rating', sql.Int, rating)
      .input('Comment', sql.NVarChar(1000), comment || null)
      .input('CreatedAt', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate())
      .query(`
        INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt)
        VALUES (@ProductId, @UserId, @Rating, @Comment, @CreatedAt);
        SELECT SCOPE_IDENTITY() AS ReviewId;
      `);

    const reviewId = result.recordset[0].ReviewId;
    console.log(`[POST /api/reviews] Review added successfully with ReviewId: ${reviewId}`);

    res.json({ success: true, message: 'Bình luận đã được gửi', reviewId });
  } catch (err) {
    console.error('[POST /api/reviews] Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});

//API reply bình luận
app.post('/api/reviews/reply', authenticateToken, async (req, res) => {
  const { reviewId, replyText } = req.body;
  const userId = req.user.UserId;

  // Log thông tin đầu vào
  console.log(`[POST /api/reviews/reply] Received request: reviewId=${reviewId}, userId=${userId}, replyText="${replyText}"`);

  // Kiểm tra dữ liệu đầu vào
  if (!reviewId || !replyText || replyText.trim().length === 0) {
    console.error(`[POST /api/reviews/reply] Invalid input: reviewId=${reviewId}, replyText="${replyText}"`);
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
  }

  try {
    const pool = await poolPromise;
    console.log(`[POST /api/reviews/reply] Database connection established for userId: ${userId}`);

    // Kiểm tra xem đánh giá có tồn tại không
    console.log(`[POST /api/reviews/reply] Checking if review exists: reviewId=${reviewId}`);
    const reviewCheck = await pool.request()
      .input('ReviewId', sql.Int, reviewId)
      .query('SELECT ReviewId, UserId FROM Reviews WHERE ReviewId = @ReviewId');
    
    if (reviewCheck.recordset.length === 0) {
      console.error(`[POST /api/reviews/reply] Review not found: reviewId=${reviewId}`);
      return res.status(404).json({ success: false, message: 'Đánh giá không tồn tại' });
    }

    const reviewOwnerId = reviewCheck.recordset[0].UserId;
    console.log(`[POST /api/reviews/reply] Review found: reviewId=${reviewId}, ownerId=${reviewOwnerId}`);

    // Kiểm tra vai trò người dùng
    const userRole = req.user.Role;
    console.log(`[POST /api/reviews/reply] Checking user role: userId=${userId}, role=${userRole}`);
    if (userRole !== 'Admin' && userRole !== 'Customer') {
      console.error(`[POST /api/reviews/reply] Unauthorized: userId=${userId}, role=${userRole}`);
      return res.status(403).json({ success: false, message: 'Bạn không có quyền trả lời' });
    }

    // Thêm phản hồi vào database
    console.log(`[POST /api/reviews/reply] Inserting reply: reviewId=${reviewId}, userId=${userId}, replyText="${replyText}"`);
    const result = await pool.request()
      .input('ReviewId', sql.Int, reviewId)
      .input('UserId', sql.Int, userId)
      .input('ReplyText', sql.NVarChar(500), replyText)
      .input('CreatedAt', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate())
      .query(`
        INSERT INTO ReviewReplies (ReviewId, UserId, ReplyText, CreatedAt)
        VALUES (@ReviewId, @UserId, @ReplyText, @CreatedAt);
        SELECT SCOPE_IDENTITY() AS ReplyId;
      `);

    const replyId = result.recordset[0].ReplyId;
    console.log(`[POST /api/reviews/reply] Reply inserted successfully: replyId=${replyId}`);

    // Gửi thông báo cho người sở hữu đánh giá (nếu có)
    if (reviewOwnerId !== userId) {
      console.log(`[POST /api/reviews/reply] Sending notification to review owner: ownerId=${reviewOwnerId}`);
      await pool.request()
        .input('UserId', sql.Int, reviewOwnerId)
        .input('Title', sql.NVarChar(100), 'Phản hồi mới cho đánh giá của bạn')
        .input('Message', sql.NVarChar(255), `Đánh giá của bạn đã được trả lời bởi ${req.user.Username}.`)
        .input('CreatedAt', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate())
        .query(`
          INSERT INTO Notifications (UserId, Title, Message, CreatedAt)
          VALUES (@UserId, @Title, @Message, @CreatedAt);
        `);
      console.log(`[POST /api/reviews/reply] Notification sent to ownerId: ${reviewOwnerId}`);
    } else {
      console.log(`[POST /api/reviews/reply] No notification sent: userId=${userId} is the review owner`);
    }

    // Trả về phản hồi thành công
    console.log(`[POST /api/reviews/reply] Success: Reply added with replyId=${replyId}`);
    res.json({ success: true, message: 'Phản hồi đã được gửi', replyId });
  } catch (err) {
    // Log lỗi chi tiết
    console.error(`[POST /api/reviews/reply] Error: ${err.message}`);
    console.error(`[POST /api/reviews/reply] Stack: ${err.stack}`);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});

//API lấy thông báo
app.get('/api/notifications', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;
  console.log(`[GET /api/notifications] Fetching notifications for userId: ${userId}`);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT NotificationId, UserId, Title, Message, CreatedAt, IsRead
        FROM Notifications
        WHERE UserId = @UserId
        ORDER BY CreatedAt DESC
      `);

    const notifications = result.recordset.map(notification => ({
      notificationId: notification.NotificationId,
      userId: notification.UserId,
      title: notification.Title,
      message: notification.Message,
      createdAt: moment(notification.CreatedAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss'),
      isRead: !!notification.IsRead,
    }));

    console.log(`[GET /api/notifications] Found ${notifications.length} notifications for userId: ${userId}`);
    res.json({ success: true, notifications });
  } catch (err) {
    console.error(`[GET /api/notifications] Error: ${err.message}`);
    console.error(`[GET /api/notifications] Stack: ${err.stack}`);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});

//
// Kiểm tra và áp dụng mã giảm giá
app.post('/api/discount/apply', async (req, res) => {
  const { code } = req.body;

  try {
    const pool = await poolPromise; // Giả sử bạn đã cấu hình poolPromise
    const result = await pool.request()
      .input('Code', sql.NVarChar, code)
      .query(`
        SELECT Code, DiscountPercentage, IsActive, ExpiryDate
        FROM DiscountCodes
        WHERE Code = @Code
      `);

    const discount = result.recordset[0];
    if (!discount) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá không hợp lệ!' });
    }

    const now = new Date();
    if (!discount.IsActive) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá không còn hoạt động!' });
    }

    if (discount.ExpiryDate && now > new Date(discount.ExpiryDate)) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn!' });
    }

    res.json({
      success: true,
      message: 'Áp dụng mã giảm giá thành công!',
      discountPercentage: discount.DiscountPercentage,
    });
  } catch (err) {
    console.error('Error applying discount:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi áp dụng mã giảm giá' });
  }
});
// API lấy giỏ hàng
app.get('/api/cart', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT 
          c.ProductId, 
          c.Quantity, 
          p.Name, 
          p.Price, 
          p.DiscountPercentage, 
          pi.ImageUrl
        FROM Cart c
        LEFT JOIN Products p ON c.ProductId = p.ProductId
        LEFT JOIN ProductImages pi ON p.ProductId = pi.ProductId AND pi.IsPrimary = 1
        WHERE c.UserId = @UserId
      `);

    console.log('[GET /api/cart] Raw data from database:', result.recordset);

    const cart = result.recordset.map(item => {
      const hasDiscount = item.DiscountPercentage !== null && item.DiscountPercentage > 0;
      const discountedPrice = hasDiscount ? item.Price * (1 - item.DiscountPercentage / 100) : undefined;
      return {
        id: item.ProductId,
        name: item.Name || 'Sản phẩm không xác định',
        price: item.Price || 0,
        discountedPrice: discountedPrice,
        quantity: item.Quantity,
        image: item.ImageUrl || null,
      };
    });

    console.log('[GET /api/cart] Transformed cart data:', cart);
    res.json({ success: true, cart });
  } catch (err) {
    console.error('[GET /api/cart] Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});
// API thêm/cập nhật giỏ hàng
app.post('/api/cart/add', authenticateToken, async (req, res) => {
  const { productId, quantity, discountCode } = req.body;
  const userId = req.user.UserId;

  console.log('Received request body:', { productId, quantity, discountCode });

  if (!productId || !quantity) {
    return res.status(400).json({ success: false, message: 'Thiếu ProductId hoặc Quantity' });
  }

  const parsedProductId = parseInt(productId, 10);
  const parsedQuantity = parseInt(quantity, 10);

  if (isNaN(parsedProductId) || isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ success: false, message: 'ProductId hoặc Quantity không hợp lệ' });
  }

  try {
    const pool = await poolPromise;

    // Kiểm tra sản phẩm và tồn kho
    const productCheck = await pool.request()
      .input('ProductId', sql.Int, parsedProductId)
      .query(`SELECT Stock, Price FROM Products WHERE ProductId = @ProductId`);

    if (productCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }
    if (productCheck.recordset[0].Stock < parsedQuantity) {
      return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });
    }

    let finalPrice = productCheck.recordset[0].Price;
    let validDiscountCode = null;

    // Kiểm tra mã giảm giá nếu có
    if (discountCode && discountCode.trim() !== '') {
      const discountCheck = await pool.request()
        .input('Code', sql.NVarChar, discountCode)
        .query(`
          SELECT DiscountPercentage, IsActive, ExpiryDate
          FROM DiscountCodes
          WHERE Code = @Code
        `);

      if (discountCheck.recordset.length === 0) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá không tồn tại' });
      }

      const discount = discountCheck.recordset[0];
      if (!discount.IsActive || (discount.ExpiryDate && new Date() > new Date(discount.ExpiryDate))) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
      }

      finalPrice = finalPrice * (1 - discount.DiscountPercentage / 100);
      validDiscountCode = discountCode;
    }

    // Kiểm tra giỏ hàng
    const checkResult = await pool.request()
      .input('UserId', sql.Int, userId)
      .input('ProductId', sql.Int, parsedProductId)
      .query(`SELECT Quantity FROM Cart WHERE UserId = @UserId AND ProductId = @ProductId`);

    if (checkResult.recordset.length > 0) {
      // Cập nhật số lượng và mã giảm giá nếu đã có trong giỏ
      await pool.request()
        .input('UserId', sql.Int, userId)
        .input('ProductId', sql.Int, parsedProductId)
        .input('Quantity', sql.Int, parsedQuantity)
        .input('DiscountCode', sql.NVarChar, validDiscountCode)
        .query(`
          UPDATE Cart 
          SET Quantity = @Quantity, AddedAt = GETDATE(), DiscountCode = @DiscountCode
          WHERE UserId = @UserId AND ProductId = @ProductId
        `);
    } else {
      // Thêm mới nếu chưa có
      await pool.request()
        .input('UserId', sql.Int, userId)
        .input('ProductId', sql.Int, parsedProductId)
        .input('Quantity', sql.Int, parsedQuantity)
        .input('DiscountCode', sql.NVarChar, validDiscountCode)
        .query(`
          INSERT INTO Cart (UserId, ProductId, Quantity, AddedAt, DiscountCode) 
          VALUES (@UserId, @ProductId, @Quantity, GETDATE(), @DiscountCode)
        `);
    }

    console.log(`[POST /api/cart/add] Added/Updated product ${parsedProductId} for UserId: ${userId}, DiscountCode: ${validDiscountCode}`);
    res.json({ success: true, message: 'Đã cập nhật giỏ hàng', discountedPrice: finalPrice });
  } catch (err) {
    console.error('[POST /api/cart/add] Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server khi thêm vào giỏ hàng: ${err.message}` });
  }
});
// API xóa sản phẩm khỏi giỏ hàng
app.delete('/api/cart/remove', authenticateToken, async (req, res) => {
  const { userId, productId } = req.body;
  console.log('[DELETE /api/cart/remove] Request received:', { userId, productId });

  const authenticatedUserId = req.user.UserId;
  if (!userId || parseInt(userId, 10) !== authenticatedUserId) {
    console.error('[DELETE /api/cart/remove] Invalid or unauthorized userId:', { userId, authenticatedUserId });
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập hoặc userId không hợp lệ' });
  }

  if (!productId) {
    console.error('[DELETE /api/cart/remove] Missing productId:', { userId, productId });
    return res.status(400).json({ success: false, message: 'Thiếu ProductId' });
  }

  const parsedUserId = parseInt(userId, 10);
  const parsedProductId = parseInt(productId, 10);

  if (isNaN(parsedUserId) || isNaN(parsedProductId)) {
    console.error('[DELETE /api/cart/remove] Invalid userId or productId:', { userId, productId });
    return res.status(400).json({ success: false, message: 'UserId hoặc ProductId không hợp lệ' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('UserId', sql.Int, parsedUserId)
      .input('ProductId', sql.Int, parsedProductId)
      .query(`DELETE FROM Cart WHERE UserId = @UserId AND ProductId = @ProductId`);

    const cartResult = await pool.request()
      .input('UserId', sql.Int, parsedUserId)
      .query(`
        SELECT 
          c.ProductId, 
          c.Quantity, 
          p.Name, 
          p.Price, 
          p.DiscountPercentage,
          pi.ImageUrl
        FROM Cart c
        LEFT JOIN Products p ON c.ProductId = p.ProductId
        LEFT JOIN ProductImages pi ON p.ProductId = pi.ProductId AND pi.IsPrimary = 1
        WHERE c.UserId = @UserId
      `);

    const cart = cartResult.recordset.map(item => ({
      id: item.ProductId,
      name: item.Name || 'Sản phẩm không xác định',
      price: item.Price || 0,
      discountedPrice: item.DiscountPercentage > 0 ? item.Price * (1 - item.DiscountPercentage / 100) : undefined,
      quantity: item.Quantity,
      image: item.ImageUrl || null,
    }));

    if (result.rowsAffected[0] === 0) {
      console.warn('[DELETE /api/cart/remove] Cart item not found for UserId:', parsedUserId, 'ProductId:', parsedProductId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng', cart });
    }

    console.log('[DELETE /api/cart/remove] Cart item removed successfully for UserId:', parsedUserId, 'ProductId:', parsedProductId);
    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng', cart });
  } catch (err) {
    console.error('[DELETE /api/cart/remove] Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server khi xóa khỏi giỏ hàng: ${err.message}` });
  }
});
// API tính giá sản phẩm
app.post('/api/cart/calculate-price', authenticateToken, async (req, res) => {
  const { items, userId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Danh sách sản phẩm không hợp lệ' });
  }

  try {
    const pool = await poolPromise;
    const calculatedItems = [];

    for (const item of items) {
      const productRequest = pool.request();
      const productCheck = await productRequest
        .input('ProductId', sql.Int, item.id)
        .query('SELECT Name, Price, DiscountPercentage, Image FROM Products WHERE ProductId = @ProductId');

      if (productCheck.recordset.length === 0) {
        return res.status(404).json({ success: false, message: `Sản phẩm với ID ${item.id} không tồn tại` });
      }

      const product = productCheck.recordset[0];
      let calculatedPrice = product.Price;

      // Áp dụng DiscountPercentage từ bảng Products (nếu có)
      if (product.DiscountPercentage && product.DiscountPercentage > 0) {
        calculatedPrice = calculatedPrice * (1 - product.DiscountPercentage / 100);
      }

      // Áp dụng DiscountCode từ bảng Cart (nếu có)
      const cartRequest = pool.request();
      const cartCheck = await cartRequest
        .input('UserId', sql.Int, userId)
        .input('ProductId', sql.Int, item.id)
        .query('SELECT DiscountCode FROM Cart WHERE UserId = @UserId AND ProductId = @ProductId');

      if (cartCheck.recordset.length > 0 && cartCheck.recordset[0].DiscountCode) {
        const discountCode = cartCheck.recordset[0].DiscountCode;
        const discountRequest = pool.request();
        const discountCheck = await discountRequest
          .input('Code', sql.NVarChar, discountCode)
          .query(`
            SELECT DiscountPercentage, IsActive, ExpiryDate
            FROM DiscountCodes
            WHERE Code = @Code
          `);

        if (discountCheck.recordset.length > 0) {
          const discount = discountCheck.recordset[0];
          if (discount.IsActive && (!discount.ExpiryDate || new Date() <= new Date(discount.ExpiryDate))) {
            calculatedPrice = calculatedPrice * (1 - discount.DiscountPercentage / 100);
          }
        }
      }

      calculatedItems.push({
        productId: item.id,
        name: product.Name,
        calculatedPrice,
        image: product.Image,
        quantity: item.quantity,
      });
    }

    res.json({ success: true, items: calculatedItems });
  } catch (err) {
    console.error('[POST /api/cart/calculate-price] Error:', err.message);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});
// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('GoogleId', sql.VarChar, profile.id)
      .query('SELECT * FROM Users WHERE GoogleId = @GoogleId');

    let user = result.recordset[0];
    if (!user) {
      const newUser = await pool.request()
        .input('Username', sql.NVarChar, profile.emails[0].value.split('@')[0])
        .input('Email', sql.NVarChar, profile.emails[0].value)
        .input('FullName', sql.NVarChar, profile.displayName)
        .input('GoogleId', sql.VarChar, profile.id)
        .input('AuthProvider', sql.NVarChar, 'google')
        .input('Role', sql.NVarChar, 'Customer') // Thêm Role
        .query(`
          INSERT INTO Users (Username, Email, FullName, GoogleId, AuthProvider, Role, CreatedAt, UpdatedAt)
          OUTPUT INSERTED.*
          VALUES (@Username, @Email, @FullName, @GoogleId, @AuthProvider, @Role, GETDATE(), GETDATE())
        `);
      user = newUser.recordset[0];
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
// SSO Routes
app.get('/auth/google', (req, res, next) => {
  console.log('Google auth route accessed'); // Thêm log để debug
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.UserId, username: req.user.Username, role: req.user.Role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Redirecting to login with token:', token);
    res.redirect(`http://localhost:3000/login?token=${token}`);
  }
);

//API lấy thông tin người dùng
app.get('/api/me', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;

  console.log(`API /me accessed with UserId: ${userId}`);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT UserId, Username, Role
        FROM Users
        WHERE UserId = @UserId
      `);

    if (result.recordset.length === 0) {
      console.log(`User not found for UserId: ${userId}`);
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const user = result.recordset[0];
    console.log(`User found:`, user);
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});



// Cấu hình Passport cho Facebook
passport.use(new FacebookStrategy({
    clientID: '1020458919619197', // Thay bằng App ID từ Facebook Developer
    clientSecret: 'c7e345d9e6da130a93b0ce381c6bbcc1', // Thay bằng App Secret
    callbackURL: 'http://localhost:5000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email'], // Lấy các trường cần thiết
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('FacebookId', sql.VarChar(50), profile.id)
        .query(`
          SELECT * FROM Users WHERE FacebookId = @FacebookId
        `);

      let user = result.recordset[0];
      if (!user) {
        // Tạo user mới với FullName và Email
        const fullName = profile.displayName || `FB User ${profile.id}`;
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `fb_${profile.id}@example.com`; // Giá trị mặc định nếu không có email
        const insertResult = await pool.request()
          .input('FacebookId', sql.VarChar(50), profile.id)
          .input('Username', sql.NVarChar(50), profile.displayName || `fb_${profile.id}`)
          .input('FullName', sql.NVarChar(100), fullName)
          .input('Email', sql.NVarChar(100), email) // Thêm Email
          .input('Role', sql.NVarChar(20), 'Customer')
          .query(`
            INSERT INTO Users (FacebookId, Username, FullName, Email, Role)
            OUTPUT INSERTED.*
            VALUES (@FacebookId, @Username, @FullName, @Email, @Role)
          `);
        user = insertResult.recordset[0];
      }

      return done(null, user);
    } catch (err) {
      console.error('Facebook auth error:', err);
      return done(err, null);
    }
  }
));

// Route khởi đầu xác thực Facebook
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Route callback từ Facebook
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user;
    console.log('Serializing Facebook user:', user.UserId);

    const token = jwt.sign(
      { UserId: user.UserId, Username: user.Username, Role: user.Role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    console.log('Redirecting to login with token:', token);
    res.redirect(`http://localhost:3000/login?token=${token}`);
  }
);
// API tạo đơn hàng (Được di chuyển đến đây, ngay sau các API giỏ hàng)
app.post('/api/orders', authenticateToken, async (req, res) => {
  console.log('[POST /api/orders] Received request body:', req.body);

  if (!req.body.orderId) {
    console.error('[POST /api/orders] Error: OrderId is missing in request body');
    return res.status(400).json({ success: false, message: 'OrderId là bắt buộc và không được để trống' });
  }

  const { orderId, total, address, fullName, phone, email, paymentMethod, estimatedDeliveryDate, items } = req.body;

  console.log('[POST /api/orders] Extracted orderId:', orderId);

  if (!orderId || typeof orderId !== 'string') {
    console.error('[POST /api/orders] Error: OrderId is invalid:', orderId);
    return res.status(400).json({ success: false, message: 'OrderId không hợp lệ' });
  }

  if (!total || !address || !paymentMethod || !items?.length) {
    console.error('[POST /api/orders] Error: Missing required fields:', { total, address, paymentMethod, items });
    return res.status(400).json({ success: false, message: 'Thiếu thông tin cần thiết' });
  }

  if (!email) {
    console.error('[POST /api/orders] Error: Email is missing in request body');
    return res.status(400).json({ success: false, message: 'Email là bắt buộc để gửi thông báo' });
  }

  const userId = req.user.UserId;
  console.log('[POST /api/orders] Processing order for userId:', userId);

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();

    try {
      await transaction.begin();
      console.log('[POST /api/orders] Transaction started');

      const userRequest = transaction.request();
      const userCheck = await userRequest
        .input('UserId', sql.Int, userId)
        .query('SELECT UserId FROM Users WHERE UserId = @UserId');
      if (userCheck.recordset.length === 0) {
        console.error('[POST /api/orders] Error: User does not exist - userId:', userId);
        throw new Error('Người dùng không tồn tại');
      }
      console.log('[POST /api/orders] User verified:', userId);

      for (const item of items) {
        console.log('[POST /api/orders] Checking product - productId:', item.productId);
        const productRequest = transaction.request();
        const productCheck = await productRequest
          .input('ProductId', sql.Int, item.productId)
          .query('SELECT Stock, Price, DiscountPercentage, Name FROM Products WHERE ProductId = @ProductId');
        if (productCheck.recordset.length === 0) {
          console.error('[POST /api/orders] Error: Product does not exist - productId:', item.productId);
          throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại`);
        }
        const product = productCheck.recordset[0];
        console.log('[POST /api/orders] Product found:', product);

        if (product.Stock < item.quantity) {
          console.error(
            '[POST /api/orders] Error: Insufficient stock for product - productId:',
            item.productId,
            'Requested quantity:',
            item.quantity,
            'Available stock:',
            product.Stock
          );
          throw new Error(`Sản phẩm ${item.productId} không đủ tồn kho (còn lại: ${product.Stock})`);
        }

        const cartRequest = transaction.request();
        const cartCheck = await cartRequest
          .input('UserId', sql.Int, userId)
          .input('ProductId', sql.Int, item.productId)
          .query('SELECT DiscountCode FROM Cart WHERE UserId = @UserId AND ProductId = @ProductId');

        let expectedPrice = product.Price;
        let appliedDiscountCode = null;

        if (product.DiscountPercentage && product.DiscountPercentage > 0) {
          expectedPrice = expectedPrice * (1 - product.DiscountPercentage / 100);
          console.log(
            '[POST /api/orders] Applied product discount - productId:',
            item.productId,
            'DiscountPercentage:',
            product.DiscountPercentage,
            'New price:',
            expectedPrice
          );
        }

        if (cartCheck.recordset.length > 0 && cartCheck.recordset[0].DiscountCode) {
          const discountCode = cartCheck.recordset[0].DiscountCode;
          console.log('[POST /api/orders] Found discount code in cart - productId:', item.productId, 'DiscountCode:', discountCode);
          const discountRequest = transaction.request();
          const discountCheck = await discountRequest
            .input('Code', sql.NVarChar, discountCode)
            .query(`
              SELECT DiscountPercentage, IsActive, ExpiryDate
              FROM DiscountCodes
              WHERE Code = @Code
            `);

          if (discountCheck.recordset.length > 0) {
            const discount = discountCheck.recordset[0];
            if (discount.IsActive && (!discount.ExpiryDate || new Date() <= new Date(discount.ExpiryDate))) {
              expectedPrice = expectedPrice * (1 - discount.DiscountPercentage / 100);
              appliedDiscountCode = discountCode;
              console.log(
                '[POST /api/orders] Applied discount code - productId:',
                item.productId,
                'DiscountCode:',
                discountCode,
                'DiscountPercentage:',
                discount.DiscountPercentage,
                'New price:',
                expectedPrice
              );
            } else {
              console.log(
                '[POST /api/orders] Discount code not applicable - productId:',
                item.productId,
                'DiscountCode:',
                discountCode,
                'IsActive:',
                discount.IsActive,
                'ExpiryDate:',
                discount.ExpiryDate
              );
            }
          } else {
            console.log('[POST /api/orders] Discount code not found - productId:', item.productId, 'DiscountCode:', discountCode);
          }
        }

        if (Math.abs(expectedPrice - item.price) > 0.01) {
          console.error(
            '[POST /api/orders] Error: Price mismatch for product - productId:',
            item.productId,
            'Expected price:',
            expectedPrice,
            'Provided price:',
            item.price
          );
          throw new Error(`Giá của sản phẩm ${item.productId} không khớp (giá thực tế: ${expectedPrice})`);
        }

        item.name = product.Name;
      }

      console.log('[POST /api/orders] Inserting order with OrderId:', orderId);

      const orderRequest = transaction.request();
      const orderDate = moment().tz('Asia/Ho_Chi_Minh').toDate();
      const estimatedDate = estimatedDeliveryDate
        ? moment(estimatedDeliveryDate).tz('Asia/Ho_Chi_Minh').toDate()
        : null;

      await orderRequest
        .input('OrderId', sql.VarChar(50), orderId)
        .input('UserId', sql.Int, userId)
        .input('OrderDate', sql.DateTime, orderDate)
        .input('Status', sql.NVarChar(50), 'Chờ xác nhận')
        .input('Total', sql.Decimal(18, 2), total)
        .input('Address', sql.NVarChar(255), address)
        .input('FullName', sql.NVarChar(100), fullName || null)
        .input('Phone', sql.NVarChar(20), phone || null)
        .input('Email', sql.NVarChar(100), email || null)
        .input('PaymentMethod', sql.NVarChar(50), paymentMethod)
        .input('EstimatedDeliveryDate', sql.DateTime, estimatedDate)
        .query(`
          INSERT INTO Orders (OrderId, UserId, OrderDate, Status, Total, Address, FullName, Phone, Email, PaymentMethod, EstimatedDeliveryDate)
          VALUES (@OrderId, @UserId, @OrderDate, @Status, @Total, @Address, @FullName, @Phone, @Email, @PaymentMethod, @EstimatedDeliveryDate)
        `);
      console.log('[POST /api/orders] Order inserted successfully:', orderId);

      for (const item of items) {
        console.log('[POST /api/orders] Inserting order item - productId:', item.productId);
        const orderItemRequest = transaction.request();
        await orderItemRequest
          .input('OrderId', sql.VarChar(50), orderId)
          .input('ProductId', sql.Int, item.productId)
          .input('Quantity', sql.Int, item.quantity)
          .input('Price', sql.Decimal(18, 2), item.price)
          .query(`
            INSERT INTO OrderItems (OrderId, ProductId, Quantity, Price)
            VALUES (@OrderId, @ProductId, @Quantity, @Price)
          `);
        console.log('[POST /api/orders] Order item inserted - productId:', item.productId);

        console.log('[POST /api/orders] Updating stock - productId:', item.productId);
        const stockRequest = transaction.request();
        await stockRequest
          .input('ProductId', sql.Int, item.productId)
          .input('Quantity', sql.Int, item.quantity)
          .query('UPDATE Products SET Stock = Stock - @Quantity WHERE ProductId = @ProductId');
        console.log('[POST /api/orders] Stock updated - productId:', item.productId);
      }

      console.log('[POST /api/orders] Inserting payment record for orderId:', orderId);
      const paymentRequest = transaction.request();
      const initialPaymentStatus = paymentMethod === 'Thanh toán khi nhận hàng' ? 'Chưa thanh toán' : 'Đang xử lý';
      await paymentRequest
        .input('OrderId', sql.VarChar(50), orderId)
        .input('Amount', sql.Decimal(18, 2), total)
        .input('Status', sql.NVarChar(50), initialPaymentStatus)
        .input('PaymentMethod', sql.NVarChar(50), paymentMethod)
        .input('PaymentDate', sql.DateTime, null)
        .query(`
          INSERT INTO Payments (OrderId, Amount, Status, PaymentMethod, PaymentDate)
          VALUES (@OrderId, @Amount, @Status, @PaymentMethod, @PaymentDate)
        `);
      console.log('[POST /api/orders] Payment record inserted for orderId:', orderId);

      // Commit transaction
      await transaction.commit();
      console.log('[POST /api/orders] Transaction committed successfully for orderId:', orderId);

      // Chỉ gửi email nếu phương thức thanh toán là COD
      if (paymentMethod === 'Thanh toán khi nhận hàng') {
        console.log('[POST /api/orders] Payment method is COD, sending email to:', email);
        const subject = `Xác Nhận Đơn Hàng #${orderId} - NeoPlaton Shop`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4A90E2;">Xác Nhận Đơn Hàng</h2>
            <p>Xin chào ${fullName || 'Khách hàng'},</p>
            <p>Cảm ơn bạn đã đặt hàng tại NeoPlaton Shop! Đơn hàng của bạn đã được ghi nhận thành công với mã số: <strong>${orderId}</strong>.</p>
            
            <h3 style="color: #4A90E2;">Thông Tin Đơn Hàng</h3>
            <p><strong>Mã đơn hàng:</strong> ${orderId}</p>
            <p><strong>Ngày đặt hàng:</strong> ${moment(orderDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}</p>
            <p><strong>Tổng tiền:</strong> ${total.toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Phương thức thanh toán:</strong> ${paymentMethod}</p>
            <p><strong>Địa chỉ giao hàng:</strong> ${address}</p>
            <p><strong>Dự kiến giao hàng:</strong> ${
              estimatedDate ? moment(estimatedDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY') : 'Chưa xác định'
            }</p>
            
            <h3 style="color: #4A90E2;">Chi Tiết Sản Phẩm</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: left;">Sản phẩm</th>
                  <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: center;">Số lượng</th>
                  <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: right;">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item) => `
                      <tr>
                        <td style="border: 1px solid #e0e0e0; padding: 8px;">${item.name}</td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: center;">${item.quantity}</td>
                        <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right;">${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>
            
            <p style="margin-top: 20px;">Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất có thể. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>.</p>
            <p>Trân trọng,<br/><strong>NeoPlaton Shop</strong></p>
          </div>
        `;

        const emailSent = await sendEmail(email, subject, htmlContent);

        if (!emailSent) {
          console.warn(`[POST /api/orders] Warning: Order ${orderId} created, but failed to send email to ${email}`);
        } else {
          console.log(`[POST /api/orders] Email sent successfully to ${email} for orderId: ${orderId}`);
        }
      } else {
        console.log('[POST /api/orders] Payment method is online, email will be sent after successful payment');
      }

      res.json({ success: true, message: 'Đơn hàng đã được tạo', orderId });
    } catch (err) {
      await transaction.rollback();
      console.error('[POST /api/orders] Transaction rolled back due to error:', err.message, err.stack);
      throw err;
    }
  } catch (err) {
    console.error('[POST /api/orders] Error creating order:', {
      message: err.message,
      stack: err.stack,
      requestBody: req.body,
      userId: userId,
    });
    res.status(500).json({ success: false, message: `Lỗi server khi tạo đơn hàng: ${err.message}` });
  }
});
// API xem lịch sử đơn hàng
app.get('/api/orders/history', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT 
          o.OrderId,
          o.OrderDate,
          o.Status,
          o.Total,
          o.Address,
          o.FullName,
          o.Phone,
          o.Email,
          o.PaymentMethod,
          o.EstimatedDeliveryDate,
          o.CreatedAt,
          o.UpdatedAt,
          p.Status AS PaymentStatus
        FROM Orders o
        LEFT JOIN Payments p ON o.OrderId = p.OrderId
        WHERE o.UserId = @UserId
        ORDER BY o.OrderDate DESC
      `);

    const orders = result.recordset.map(order => ({
      ...order,
      OrderDate: moment(order.OrderDate).tz('Asia/Ho_Chi_Minh').format(),
      EstimatedDeliveryDate: order.EstimatedDeliveryDate
        ? moment(order.EstimatedDeliveryDate).tz('Asia/Ho_Chi_Minh').format()
        : null,
      CreatedAt: moment(order.CreatedAt).tz('Asia/Ho_Chi_Minh').format(),
      UpdatedAt: order.UpdatedAt ? moment(order.UpdatedAt).tz('Asia/Ho_Chi_Minh').format() : null,
    }));

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error('Error fetching order history:', err);
    res.status(500).json({ success: false, message: `Lỗi server khi lấy lịch sử đơn hàng: ${err.message}` });
  }
});

// API lấy chi tiết đơn hàng
app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.UserId;

  console.log(`[GET /api/orders/${orderId}] - Request received`);
  console.log(`OrderId: ${orderId}, UserId: ${userId}`);

  if (!orderId || typeof orderId !== 'string') {
    console.log(`[GET /api/orders/${orderId}] - Invalid OrderId: ${orderId}`);
    return res.status(400).json({ success: false, message: 'OrderId không hợp lệ' });
  }

  try {
    const pool = await poolPromise;

    console.log(`[GET /api/orders/${orderId}] - Querying Orders table...`);
    const orderResult = await pool.request()
      .input('OrderId', sql.VarChar(50), orderId)
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT 
          OrderId, 
          UserId, 
          OrderDate, 
          Status, 
          Total, 
          Address, 
          FullName,
          Phone,
          Email,
          PaymentMethod, 
          EstimatedDeliveryDate,
          CreatedAt,
          UpdatedAt
        FROM Orders
        WHERE OrderId = @OrderId AND UserId = @UserId
      `);

    console.log(`[GET /api/orders/${orderId}] - Order query result:`, orderResult.recordset);

    if (orderResult.recordset.length === 0) {
      console.log(`[GET /api/orders/${orderId}] - No order found or unauthorized access for OrderId: ${orderId}, UserId: ${userId}`);
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền xem' });
    }

    let order = orderResult.recordset[0];
    order = {
      ...order,
      OrderDate: moment(order.OrderDate).tz('Asia/Ho_Chi_Minh').format(),
      EstimatedDeliveryDate: order.EstimatedDeliveryDate
        ? moment(order.EstimatedDeliveryDate).tz('Asia/Ho_Chi_Minh').format()
        : null,
      CreatedAt: moment(order.CreatedAt).tz('Asia/Ho_Chi_Minh').format(),
      UpdatedAt: order.UpdatedAt ? moment(order.UpdatedAt).tz('Asia/Ho_Chi_Minh').format() : null,
    };

    console.log(`[GET /api/orders/${orderId}] - Querying OrderItems...`);
    const itemsResult = await pool.request()
      .input('OrderId', sql.VarChar(50), orderId)
      .query(`
        SELECT 
          oi.OrderItemId, 
          oi.ProductId, 
          oi.Quantity, 
          oi.Price, 
          p.Name AS ProductName,
          (SELECT TOP 1 ImageUrl FROM ProductImages pi WHERE pi.ProductId = oi.ProductId AND pi.IsPrimary = 1) AS ImageUrl
        FROM OrderItems oi
        JOIN Products p ON oi.ProductId = p.ProductId
        WHERE oi.OrderId = @OrderId
      `);

    console.log(`[GET /api/orders/${orderId}] - OrderItems result:`, itemsResult.recordset);

    const items = itemsResult.recordset;

    console.log(`[GET /api/orders/${orderId}] - Querying Payments...`);
    const paymentResult = await pool.request()
      .input('OrderId', sql.VarChar(50), orderId)
      .query(`
        SELECT 
          PaymentId, 
          PaymentMethod, 
          Amount, 
          Status AS PaymentStatus, 
          TransactionId, 
          PaymentDate
        FROM Payments
        WHERE OrderId = @OrderId
      `);

    console.log(`[GET /api/orders/${orderId}] - Payments result:`, paymentResult.recordset);

    let payment = paymentResult.recordset[0];
    if (payment) {
      payment = {
        ...payment,
        PaymentDate: payment.PaymentDate ? moment(payment.PaymentDate).tz('Asia/Ho_Chi_Minh').format() : null,
      };
    }

    console.log(`[GET /api/orders/${orderId}] - Sending response...`);
    res.json({
      success: true,
      order: {
        ...order,
        items,
        payment,
      },
    });
  } catch (err) {
    console.error(`[GET /api/orders/${orderId}] - Error:`, err);
    res.status(500).json({ success: false, message: `Lỗi server khi lấy chi tiết đơn hàng: ${err.message}` });
  }
});
// API hủy đơn hàng
app.post('/api/orders/:orderId/cancel', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.UserId;

  console.log(`[POST /api/orders/${orderId}/cancel] - Request received`);
  console.log(`OrderId: ${orderId}, UserId: ${userId}`);

  if (!orderId || typeof orderId !== 'string') {
    console.log(`[POST /api/orders/${orderId}/cancel] - Invalid OrderId: ${orderId}`);
    return res.status(400).json({ success: false, message: 'OrderId không hợp lệ' });
  }

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();

    await transaction.begin();

    try {
      const orderRequest = transaction.request();
      const orderResult = await orderRequest
        .input('OrderId', sql.VarChar(50), orderId)
        .input('UserId', sql.Int, userId)
        .query(`
          SELECT Status, Total
          FROM Orders
          WHERE OrderId = @OrderId AND UserId = @UserId
        `);

      console.log(`[POST /api/orders/${orderId}/cancel] - Order query result:`, orderResult.recordset);

      if (orderResult.recordset.length === 0) {
        console.log(`[POST /api/orders/${orderId}/cancel] - Order not found or unauthorized`);
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền hủy' });
      }

      const order = orderResult.recordset[0];
      const currentStatus = order.Status;

      if (!['Chờ xác nhận', 'Đang xử lý'].includes(currentStatus)) {
        console.log(`[POST /api/orders/${orderId}/cancel] - Cannot cancel order with status: ${currentStatus}`);
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Không thể hủy đơn hàng ở trạng thái "${currentStatus}"`,
        });
      }

      // Cập nhật trạng thái đơn hàng
      const updateRequest = transaction.request();
      const updatedAt = moment().tz('Asia/Ho_Chi_Minh').toDate();
      await updateRequest
        .input('OrderId', sql.VarChar(50), orderId)
        .input('UserId', sql.Int, userId)
        .input('UpdatedAt', sql.DateTime, updatedAt)
        .query(`
          UPDATE Orders
          SET Status = N'Đã hủy', UpdatedAt = @UpdatedAt
          WHERE OrderId = @OrderId AND UserId = @UserId
        `);

      // Cập nhật trạng thái thanh toán
      const paymentUpdateRequest = transaction.request();
      await paymentUpdateRequest
        .input('OrderId', sql.VarChar(50), orderId)
        .query(`
          UPDATE Payments
          SET Status = N'Đã hủy'
          WHERE OrderId = @OrderId
        `);

      const itemsRequest = transaction.request();
      const itemsResult = await itemsRequest
        .input('OrderId', sql.VarChar(50), orderId)
        .query(`
          SELECT ProductId, Quantity
          FROM OrderItems
          WHERE OrderId = @OrderId
        `);

      const items = itemsResult.recordset;
      console.log(`[POST /api/orders/${orderId}/cancel] - Items to restock:`, items);

      for (const item of items) {
        const stockRequest = transaction.request();
        await stockRequest
          .input('ProductId', sql.Int, item.ProductId)
          .input('Quantity', sql.Int, item.Quantity)
          .query(`
            UPDATE Products
            SET Stock = Stock + @Quantity
            WHERE ProductId = @ProductId
          `);
      }

      await transaction.commit();
      console.log(`[POST /api/orders/${orderId}/cancel] - Order cancelled successfully`);

      // Gửi thông báo cho admin khi đơn hàng bị hủy
      await notifyAdmin(
        'Đơn hàng bị hủy',
        `Đơn hàng #${orderId} với tổng tiền ${order.Total.toLocaleString('vi-VN')} VNĐ đã bị hủy bởi người dùng`
      );

      res.json({ success: true, message: 'Đơn hàng đã được hủy thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error(`[POST /api/orders/${orderId}/cancel] - Error:`, err);
    res.status(500).json({ success: false, message: `Lỗi server khi hủy đơn hàng: ${err.message}` });
  }
});
// API lấy chi tiết đơn hàng
app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.UserId;

  console.log(`[GET /api/orders/${orderId}] - Request received`);
  console.log(`OrderId: ${orderId}, UserId: ${userId}`);

  if (!orderId || typeof orderId !== 'string') {
    console.log(`[GET /api/orders/${orderId}] - Invalid OrderId: ${orderId}`);
    return res.status(400).json({ success: false, message: 'OrderId không hợp lệ' });
  }

  try {
    const pool = await poolPromise;

    console.log(`[GET /api/orders/${orderId}] - Querying Orders table...`);
    const orderResult = await pool.request()
      .input('OrderId', sql.VarChar(50), orderId)
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT 
          OrderId, 
          UserId, 
          OrderDate, 
          Status, 
          Total, 
          Address, 
          FullName,
          Phone,
          Email,
          PaymentMethod, 
          EstimatedDeliveryDate,
          CreatedAt,
          UpdatedAt
        FROM Orders
        WHERE OrderId = @OrderId AND UserId = @UserId
      `);

    console.log(`[GET /api/orders/${orderId}] - Order query result:`, orderResult.recordset);

    if (orderResult.recordset.length === 0) {
      console.log(`[GET /api/orders/${orderId}] - No order found or unauthorized access for OrderId: ${orderId}, UserId: ${userId}`);
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền xem' });
    }

    const order = orderResult.recordset[0];

    console.log(`[GET /api/orders/${orderId}] - Querying OrderItems...`);
    const itemsResult = await pool.request()
      .input('OrderId', sql.VarChar(50), orderId)
      .query(`
        SELECT 
          oi.OrderItemId, 
          oi.ProductId, 
          oi.Quantity, 
          oi.Price, 
          p.Name AS ProductName,
          (SELECT TOP 1 ImageUrl FROM ProductImages pi WHERE pi.ProductId = oi.ProductId AND pi.IsPrimary = 1) AS ImageUrl
        FROM OrderItems oi
        JOIN Products p ON oi.ProductId = p.ProductId
        WHERE oi.OrderId = @OrderId
      `);

    console.log(`[GET /api/orders/${orderId}] - OrderItems result:`, itemsResult.recordset);

    const items = itemsResult.recordset;

    console.log(`[GET /api/orders/${orderId}] - Querying Payments...`);
    const paymentResult = await pool.request()
      .input('OrderId', sql.VarChar(50), orderId)
      .query(`
        SELECT 
          PaymentId, 
          PaymentMethod, 
          Amount, 
          Status AS PaymentStatus, 
          TransactionId, 
          PaymentDate
        FROM Payments
        WHERE OrderId = @OrderId
      `);

    console.log(`[GET /api/orders/${orderId}] - Payments result:`, paymentResult.recordset);

    const payment = paymentResult.recordset[0];

    // Đồng bộ trạng thái đơn hàng với trạng thái thanh toán
    if (payment && payment.PaymentStatus === 'Đã thanh toán' && order.Status !== 'Đã thanh toán') {
      await pool.request()
        .input('OrderId', sql.VarChar(50), orderId)
        .query(`
          UPDATE Orders
          SET Status = N'Đã thanh toán'
          WHERE OrderId = @OrderId
        `);
      order.Status = 'Đã thanh toán';
    }

    console.log(`[GET /api/orders/${orderId}] - Sending response...`);
    res.json({
      success: true,
      order: {
        ...order,
        items,
        payment,
      },
    });
  } catch (err) {
    console.error(`[GET /api/orders/${orderId}] - Error:`, err);
    res.status(500).json({ success: false, message: `Lỗi server khi lấy chi tiết đơn hàng: ${err.message}` });
  }
});

// API liên quan đến thanh toán chung
app.get('/api/payments/status', async (req, res) => {
  const { transactionId } = req.query;

  if (!transactionId) {
    console.error('[GET /api/payments/status] Missing TransactionId');
    return res.status(400).json({ success: false, message: 'Thiếu TransactionId' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TransactionId', sql.NVarChar(100), transactionId)
      .query(`
        SELECT Status
        FROM Payments
        WHERE TransactionId = @TransactionId
      `);

    if (result.recordset.length === 0) {
      console.error('[GET /api/payments/status] Payment not found for TransactionId:', transactionId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
    }

    console.log('[GET /api/payments/status] Found payment for TransactionId:', transactionId, 'Status:', result.recordset[0].Status);
    res.json({
      success: true,
      status: result.recordset[0].Status,
    });
  } catch (err) {
    console.error('[GET /api/payments/status] Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server: ${err.message}` });
  }
});
//API Zalopay
app.post('/api/zalopay/create-order', async (req, res) => {
  console.log('[POST /api/zalopay/create-order] Received request:', req.body);

  const { total, orderId } = req.body;

  if (!total || !orderId) {
    console.error('[POST /api/zalopay/create-order] Missing required fields:', { total, orderId });
    return res.status(400).json({ success: false, message: 'Thiếu thông tin cần thiết (total hoặc orderId)' });
  }

  if (isNaN(total) || total <= 0) {
    console.error('[POST /api/zalopay/create-order] Invalid total:', total);
    return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
  }

  try {
    const pool = await poolPromise;

    console.log('[POST /api/zalopay/create-order] Checking order existence for OrderId:', orderId);
    const orderCheck = await pool.request()
      .input('OrderId', sql.VarChar(50), orderId)
      .query(`
        SELECT OrderId, Total, Status
        FROM Orders
        WHERE OrderId = @OrderId
      `);

    if (orderCheck.recordset.length === 0) {
      console.error('[POST /api/zalopay/create-order] Order not found for OrderId:', orderId);
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    const order = orderCheck.recordset[0];
    console.log('[POST /api/zalopay/create-order] Order found:', order);

    if (order.Status !== 'Chờ xác nhận') {
      console.error('[POST /api/zalopay/create-order] Order cannot be processed. Current status:', order.Status);
      return res.status(400).json({ success: false, message: 'Đơn hàng không ở trạng thái "Chờ xác nhận"' });
    }

    if (Math.abs(order.Total - total) > 0.01) {
      console.error(
        '[POST /api/zalopay/create-order] Total mismatch for OrderId:',
        orderId,
        'Order Total:',
        order.Total,
        'Provided Total:',
        total
      );
      return res.status(400).json({ success: false, message: 'Số tiền không khớp với tổng đơn hàng' });
    }

    const config = {
      app_id: parseInt(process.env.ZALOPAY_APP_ID),
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create',
    };

    if (!config.app_id || !config.key1 || !config.key2) {
      console.error('[POST /api/zalopay/create-order] Missing ZaloPay configuration:', {
        app_id: config.app_id,
        key1: config.key1,
        key2: config.key2,
      });
      return res.status(500).json({ success: false, message: 'Cấu hình ZaloPay không đầy đủ, vui lòng kiểm tra biến môi trường' });
    }

    const embed_data = {
      redirecturl: process.env.ZALOPAY_REDIRECT_URL || 'http://localhost:3000/payment-callback',
      orderId: orderId,
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const transactionId = `${moment().format('YYMMDD')}_${transID}`; // Thay appTransId bằng transactionId

    const orderData = {
      app_id: config.app_id,
      app_trans_id: transactionId, // ZaloPay vẫn yêu cầu app_trans_id trong payload
      app_user: 'user123',
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: parseInt(total),
      description: `NeoPlaton Shop - Thanh toán đơn hàng #${orderId}`,
      bank_code: 'zalopayapp',
      callback_url: process.env.ZALOPAY_CALLBACK_URL || 'https://f62c-2405-4802-c0f3-faa0-8cb0-6540-ac31-5a2c.ngrok-free.app/api/zalopay-callback',
    };

    console.log('[POST /api/zalopay/create-order] Callback URL sent to ZaloPay:', orderData.callback_url);

    console.log('[POST /api/zalopay/create-order] Order data before creating mac:', orderData);
    const data = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
    console.log('[POST /api/zalopay/create-order] Data string for mac:', data);

    orderData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    console.log('[POST /api/zalopay/create-order] Generated order data for ZaloPay:', orderData);

    const response = await axios.post(config.endpoint, orderData);
    const result = response.data;
    console.log('[POST /api/zalopay/create-order] ZaloPay response:', result);

    if (result.return_code !== 1) {
      console.error('[POST /api/zalopay/create-order] ZaloPay creation failed:', result);
      return res.status(500).json({ success: false, message: 'Tạo thanh toán ZaloPay thất bại', error: result });
    }

    console.log('[POST /api/zalopay/create-order] Updating Payments table with TransactionId:', transactionId);
    await pool.request()
      .input('OrderId', sql.VarChar(50), orderId)
      .input('TransactionId', sql.NVarChar(100), transactionId)
      .query(`
        UPDATE Payments
        SET TransactionId = @TransactionId
        WHERE OrderId = @OrderId
      `);
    console.log('[POST /api/zalopay/create-order] Payments table updated successfully');

    res.json({
      success: true,
      message: 'Tạo thanh toán ZaloPay thành công',
      orderUrl: result.order_url,
      zpTransToken: result.zp_trans_token,
      transactionId: transactionId, // Trả về transactionId thay vì appTransId
    });
  } catch (err) {
    console.error('[POST /api/zalopay/create-order] Error:', err.response?.data || err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server khi tạo thanh toán ZaloPay: ${err.message}` });
  }
});
// API kiểm tra trạng thái thanh toán ZaloPay
app.post('/api/zalopay/check-status', async (req, res) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    console.error('[POST /api/zalopay/check-status] Missing TransactionId');
    return res.status(400).json({ success: false, message: 'Thiếu TransactionId' });
  }

  try {
    const config = {
      app_id: parseInt(process.env.ZALOPAY_APP_ID),
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: 'https://sb-openapi.zalopay.vn/v2/query',
    };

    if (!config.app_id || !config.key1) {
      console.error('[POST /api/zalopay/check-status] Missing ZaloPay configuration:', {
        app_id: config.app_id,
        key1: config.key1,
      });
      return res.status(500).json({ success: false, message: 'Cấu hình ZaloPay không đầy đủ' });
    }

    const data = `${config.app_id}|${transactionId}|${config.key1}`;
    const mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const queryData = {
      app_id: config.app_id,
      app_trans_id: transactionId,
      mac: mac,
    };

    const response = await axios.post(config.endpoint, queryData);
    const result = response.data;
    console.log('[POST /api/zalopay/check-status] ZaloPay response:', result);

    if (result.return_code === 1) {
      const pool = await poolPromise;
      const paymentCheck = await pool.request()
        .input('TransactionId', sql.NVarChar(100), transactionId)
        .query(`
          SELECT OrderId
          FROM Payments
          WHERE TransactionId = @TransactionId
        `);

      if (paymentCheck.recordset.length > 0) {
        const orderId = paymentCheck.recordset[0].OrderId;
        const transactionStatus = result.status !== undefined ? result.status : (result.return_code === 1 && result.sub_return_code === 1 ? 1 : -1);

        await pool.request()
          .input('OrderId', sql.VarChar(50), orderId)
          .input('Status', sql.NVarChar(50), transactionStatus === 1 ? 'Đã thanh toán' : 'Thất bại')
          .input('PaymentDate', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate())
          .query(`
            UPDATE Payments
            SET Status = @Status,
                PaymentDate = @PaymentDate
            WHERE OrderId = @OrderId
          `);

        if (transactionStatus === 1) {
          await pool.request()
            .input('OrderId', sql.VarChar(50), orderId)
            .query(`
              UPDATE Orders
              SET Status = N'Chờ xác nhận'
              WHERE OrderId = @OrderId
            `);
        }

        console.log('[POST /api/zalopay/check-status] Transaction status:', transactionStatus);
        res.json({
          success: true,
          message: 'Kiểm tra trạng thái thành công',
          status: transactionStatus,
          result: result,
        });
      } else {
        console.error('[POST /api/zalopay/check-status] Payment not found for TransactionId:', transactionId);
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy thanh toán cho TransactionId này',
        });
      }
    } else {
      console.error('[POST /api/zalopay/check-status] Check status failed:', result);
      res.status(400).json({
        success: false,
        message: 'Kiểm tra trạng thái thất bại',
        error: result,
      });
    }
  } catch (err) {
    console.error('[POST /api/zalopay/check-status] Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server khi kiểm tra trạng thái ZaloPay: ${err.message}` });
  }
});
// API xử lý callback từ ZaloPay
app.post('/api/zalopay-callback', async (req, res) => {
  console.log('[POST /api/zalopay-callback] Callback received:', req.body);

  const { data, mac } = req.body;

  if (!data || !mac) {
    console.error('[POST /api/zalopay-callback] Missing data or mac:', req.body);
    return res.status(400).json({ success: false, message: 'Thiếu data hoặc mac' });
  }

  try {
    const config = {
      app_id: parseInt(process.env.ZALOPAY_APP_ID),
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: 'https://sb-openapi.zalopay.vn/v2/query',
    };

    if (!config.key2) {
      console.error('[POST /api/zalopay-callback] Missing ZaloPay key2');
      return res.status(500).json({ success: false, message: 'Cấu hình ZaloPay không đầy đủ' });
    }

    const expectedMac = CryptoJS.HmacSHA256(data, config.key2).toString();
    if (expectedMac !== mac) {
      console.error('[POST /api/zalopay-callback] Invalid MAC:', { expectedMac, receivedMac: mac });
      return res.status(400).json({ success: false, message: 'MAC không hợp lệ' });
    }

    const dataObj = JSON.parse(data);
    const transactionId = dataObj.app_trans_id;

    console.log('[POST /api/zalopay-callback] Parsed data:', dataObj);

    const queryData = {
      app_id: config.app_id,
      app_trans_id: transactionId,
      mac: CryptoJS.HmacSHA256(`${config.app_id}|${transactionId}|${config.key1}`, config.key1).toString(),
    };

    const response = await axios.post(config.endpoint, queryData);
    const result = response.data;
    console.log('[POST /api/zalopay-callback] ZaloPay query response:', result);

    if (result.return_code !== 1) {
      console.error('[POST /api/zalopay-callback] Failed to query transaction status:', result);
      return res.status(500).json({ success: false, message: 'Không thể kiểm tra trạng thái giao dịch' });
    }

    // Sử dụng return_code và sub_return_code để xác định trạng thái giao dịch
    const transactionStatus = result.status !== undefined ? result.status : (result.return_code === 1 && result.sub_return_code === 1 ? 1 : -1);

    const pool = await poolPromise;
    const paymentCheck = await pool.request()
      .input('TransactionId', sql.NVarChar(100), transactionId)
      .query(`
        SELECT OrderId
        FROM Payments
        WHERE TransactionId = @TransactionId
      `);

    if (paymentCheck.recordset.length === 0) {
      console.error('[POST /api/zalopay-callback] Payment not found for TransactionId:', transactionId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
    }

    const orderId = paymentCheck.recordset[0].OrderId;
    console.log('[POST /api/zalopay-callback] Found OrderId:', orderId);

    const orderCheck = await pool.request()
      .input('OrderId', sql.VarChar(50), orderId)
      .query(`
        SELECT Email, FullName, Total, Address, EstimatedDeliveryDate, OrderDate
        FROM Orders
        WHERE OrderId = @OrderId
      `);

    if (orderCheck.recordset.length === 0) {
      console.error('[POST /api/zalopay-callback] Order not found for OrderId:', orderId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const order = orderCheck.recordset[0];
    console.log('[POST /api/zalopay-callback] Order details:', order);

    await pool.request()
      .input('OrderId', sql.VarChar(50), orderId)
      .input('Status', sql.NVarChar(50), transactionStatus === 1 ? 'Đã thanh toán' : 'Thất bại')
      .input('PaymentDate', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate())
      .query(`
        UPDATE Payments
        SET Status = @Status,
            PaymentDate = @PaymentDate
        WHERE OrderId = @OrderId
      `);
    console.log('[POST /api/zalopay-callback] Payment status updated:', transactionStatus === 1 ? 'Đã thanh toán' : 'Thất bại');

    if (transactionStatus === 1) {
      await pool.request()
        .input('OrderId', sql.VarChar(50), orderId)
        .query(`
          UPDATE Orders
          SET Status = N'Chờ xác nhận'
          WHERE OrderId = @OrderId
        `);
      console.log('[POST /api/zalopay-callback] Order status updated to "Chờ xác nhận"');

      const itemsResult = await pool.request()
        .input('OrderId', sql.VarChar(50), orderId)
        .query(`
          SELECT oi.ProductId, oi.Quantity, oi.Price, p.Name
          FROM OrderItems oi
          JOIN Products p ON oi.ProductId = p.ProductId
          WHERE oi.OrderId = @OrderId
        `);

      const items = itemsResult.recordset;
      console.log('[POST /api/zalopay-callback] Order items:', items);

      const subject = `Xác Nhận Thanh Toán Đơn Hàng #${orderId} - NeoPlaton Shop`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4A90E2;">Xác Nhận Thanh Toán Đơn Hàng</h2>
          <p>Xin chào ${order.FullName || 'Khách hàng'},</p>
          <p>Chúng tôi đã nhận được thanh toán cho đơn hàng của bạn với mã số: <strong>${orderId}</strong>. Cảm ơn bạn đã mua sắm tại NeoPlaton Shop!</p>
          
          <h3 style="color: #4A90E2;">Thông Tin Đơn Hàng</h3>
          <p><strong>Mã đơn hàng:</strong> ${orderId}</p>
          <p><strong>Ngày đặt hàng:</strong> ${moment(order.OrderDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}</p>
          <p><strong>Tổng tiền:</strong> ${order.Total.toLocaleString('vi-VN')} VNĐ</p>
          <p><strong>Phương thức thanh toán:</strong> ZaloPay</p>
          <p><strong>Địa chỉ giao hàng:</strong> ${order.Address}</p>
          <p><strong>Dự kiến giao hàng:</strong> ${
            order.EstimatedDeliveryDate
              ? moment(order.EstimatedDeliveryDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')
              : 'Chưa xác định'
          }</p>
          
          <h3 style="color: #4A90E2;">Chi Tiết Sản Phẩm</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: left;">Sản phẩm</th>
                <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: center;">Số lượng</th>
                <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: right;">Giá</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                    <tr>
                      <td style="border: 1px solid #e0e0e0; padding: 8px;">${item.Name}</td>
                      <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: center;">${item.Quantity}</td>
                      <td style="border: 1px solid #e0e0e0; padding: 8px; text-align: right;">${(item.Price * item.Quantity).toLocaleString('vi-VN')} VNĐ</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
          
          <p style="margin-top: 20px;">Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>.</p>
          <p>Trân trọng,<br/><strong>NeoPlaton Shop</strong></p>
        </div>
      `;

      const emailSent = await sendEmail(order.Email, subject, htmlContent);
      if (!emailSent) {
        console.warn(`[POST /api/zalopay-callback] Warning: Payment processed for Order ${orderId}, but failed to send email to ${order.Email}`);
      } else {
        console.log(`[POST /api/zalopay-callback] Email sent successfully to ${order.Email} for OrderId: ${orderId}`);
      }
    }

    res.json({ success: true, message: 'Callback xử lý thành công', return_code: 1 });
  } catch (err) {
    console.error('[POST /api/zalopay-callback] Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: `Lỗi server khi xử lý callback ZaloPay: ${err.message}`, return_code: -1 });
  }
});


// API lấy sản phẩm hot
app.get('/api/hot-products', async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        p.ProductId,
        p.Name,
        p.Price,
        p.Description,
        pi.ImageUrl,
        SUM(oi.Quantity) as TotalSold
      FROM Products p
      JOIN OrderItems oi ON p.ProductId = oi.ProductId
      JOIN Orders o ON oi.OrderId = o.OrderId
      LEFT JOIN ProductImages pi ON p.ProductId = pi.ProductId AND pi.IsPrimary = 1
      WHERE o.Status = N'Đã giao'
      GROUP BY p.ProductId, p.Name, p.Price, p.Description, pi.ImageUrl
      HAVING SUM(oi.Quantity) > 10
      ORDER BY TotalSold DESC
    `);

    const hotProducts = result.recordset;

    res.json({
      success: true,
      products: hotProducts,
    });
  } catch (err) {
    console.error('Error fetching hot products:', err);
    res.status(500).json({ success: false, message: `Lỗi server khi lấy sản phẩm hot: ${err.message}` });
  }
});
//API Sale sản phẩm
app.get('/api/sale-products', async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        p.ProductId,
        p.Name,
        p.Price,
        p.Description,
        p.DiscountPercentage,
        p.Stock,  -- Thêm trường Stock
        pi.ImageUrl
      FROM Products p
      LEFT JOIN ProductImages pi ON p.ProductId = pi.ProductId AND pi.IsPrimary = 1
      WHERE p.DiscountPercentage > 0
      ORDER BY p.DiscountPercentage DESC
    `);

    const saleProducts = result.recordset.map(product => ({
      ...product,
      DiscountedPrice: product.Price * (1 - product.DiscountPercentage / 100),
    }));

    res.json({
      success: true,
      products: saleProducts,
    });
  } catch (err) {
    console.error('Error fetching sale products:', err);
    res.status(500).json({ success: false, message: `Lỗi server khi lấy sản phẩm sale: ${err.message}` });
  }
});





//ADMIN
// API đếm thông báo chưa đọc
app.get('/api/admin/notifications', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT COUNT(*) as count
        FROM Notifications
        WHERE UserId = @UserId AND IsRead = 0
      `);
    res.json({ success: true, count: result.recordset[0].count });
  } catch (err) {
    console.error('[GET /api/admin/notifications] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// API lấy danh sách thông báo
app.get('/api/admin/notifications/list', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT NotificationId, Title, Message, CreatedAt, IsRead, 'Order' as Type
        FROM Notifications
        WHERE UserId = @UserId
        ORDER BY CreatedAt DESC
      `);
    res.json({ success: true, notifications: result.recordset });
  } catch (err) {
    console.error('[GET /api/admin/notifications/list] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// API đánh dấu thông báo đã đọc
app.put('/api/admin/notifications/:id/mark-read', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.UserId;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('NotificationId', sql.Int, id)
      .input('UserId', sql.Int, userId)
      .query(`
        UPDATE Notifications
        SET IsRead = 1
        WHERE NotificationId = @NotificationId AND UserId = @UserId
      `);
    res.json({ success: true, message: 'Đã đánh dấu là đã đọc' });
  } catch (err) {
    console.error('[PUT /api/admin/notifications/:id/mark-read] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// API đánh dấu tất cả đã đọc
app.put('/api/admin/notifications/mark-all-read', authenticateToken, async (req, res) => {
  const userId = req.user.UserId;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        UPDATE Notifications
        SET IsRead = 1
        WHERE UserId = @UserId AND IsRead = 0
      `);
    res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (err) {
    console.error('[PUT /api/admin/notifications/mark-all-read] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

//2.4. Cải tiến API /api/admin/search (Tìm kiếm)
app.get('/api/admin/search', verifyAdmin, async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return res.status(400).json({ success: false, message: 'Yêu cầu từ khóa tìm kiếm' });
  }

  try {
    const pool = await poolPromise;
    const searchTerm = `%${query}%`;

    // Tìm kiếm sản phẩm
    const productsResult = await pool.request()
      .input('SearchTerm', sql.NVarChar, searchTerm)
      .query(`
        SELECT ProductId AS id, Name AS title, 'Product' AS type
        FROM Products
        WHERE Name LIKE @SearchTerm
      `);

    // Tìm kiếm đơn hàng
    const ordersResult = await pool.request()
      .input('SearchTerm', sql.NVarChar, searchTerm)
      .query(`
        SELECT OrderId AS id, OrderId AS title, 'Order' AS type
        FROM Orders
        WHERE OrderId LIKE @SearchTerm
      `);

    // Tìm kiếm người dùng
    const usersResult = await pool.request()
      .input('SearchTerm', sql.NVarChar, searchTerm)
      .query(`
        SELECT UserId AS id, FullName AS title, 'User' AS type
        FROM Users
        WHERE FullName LIKE @SearchTerm OR Email LIKE @SearchTerm
      `);

    const results = [
      ...productsResult.recordset,
      ...ordersResult.recordset,
      ...usersResult.recordset,
    ].slice(0, 10); // Giới hạn 10 kết quả

    res.json({ success: true, results });
  } catch (err) {
    console.error('Error searching:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tìm kiếm' });
  }
});


// API lấy danh sách sản phẩm (hỗ trợ tìm kiếm và phân trang)
app.get('/api/admin/products', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { search, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Kiểm tra tham số page và limit
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ success: false, message: 'Tham số page hoặc limit không hợp lệ' });
    }

    const offset = (pageNum - 1) * limitNum;

    const pool = await poolPromise;

    // Truy vấn danh sách sản phẩm
    const productRequest = pool.request();
    let query = `
      SELECT 
        p.ProductId, p.Name, p.Price, p.Stock, p.DiscountPercentage,
        b.Name as BrandName, c.Name as CategoryName,
        (SELECT TOP 1 ImageUrl FROM ProductImages WHERE ProductId = p.ProductId AND IsPrimary = 1) as PrimaryImage
      FROM Products p
      LEFT JOIN Brands b ON p.BrandId = b.BrandId
      LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
    `;

    if (search && search.trim() !== '') {
      query += ` WHERE p.Name LIKE @Search OR b.Name LIKE @Search OR c.Name LIKE @Search`;
      productRequest.input('Search', sql.NVarChar, `%${search.trim()}%`);
    }

    query += ` ORDER BY p.ProductId OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY`;
    productRequest.input('Offset', sql.Int, offset).input('Limit', sql.Int, limitNum);

    const result = await productRequest.query(query);

    // Truy vấn tổng số sản phẩm
    const countRequest = pool.request();
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM Products p
      LEFT JOIN Brands b ON p.BrandId = b.BrandId
      LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
    `;

    if (search && search.trim() !== '') {
      countQuery += ` WHERE p.Name LIKE @Search OR b.Name LIKE @Search OR c.Name LIKE @Search`;
      countRequest.input('Search', sql.NVarChar, `%${search.trim()}%`);
    }

    const countResult = await countRequest.query(countQuery);

    const total = countResult.recordset[0].total;
    res.json({
      success: true,
      products: result.recordset,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error('API /api/admin/products - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách sản phẩm', error: err.message });
  }
});

// API thêm sản phẩm mới
app.post('/api/admin/products', authenticateToken, async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Bắt đầu xử lý request thêm sản phẩm - Data: ${JSON.stringify(req.body)}`);

    if (req.user.Role !== 'Admin') {
      console.warn(`[${new Date().toISOString()}] Truy cập không được phép - User: ${req.user?.Email || "Unknown"}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const {
      Name,
      BrandId,
      CategoryId,
      Price,
      Description,
      Stock,
      DetailedSpecs,
      DiscountPercentage,
      Images,
    } = req.body;

    // Chuyển đổi các giá trị thành số
    const BrandIdNum = Number(BrandId);
    const CategoryIdNum = Number(CategoryId);
    const PriceNum = Number(Price);
    const StockNum = Number(Stock);
    const DiscountPercentageNum = Number(DiscountPercentage);

    // Kiểm tra các trường bắt buộc
    if (
      !Name ||
      isNaN(BrandIdNum) ||
      BrandIdNum <= 0 ||
      isNaN(CategoryIdNum) ||
      CategoryIdNum <= 0 ||
      isNaN(PriceNum) ||
      StockNum === undefined ||
      isNaN(StockNum)
    ) {
      console.warn(`[${new Date().toISOString()}] Thiếu thông tin bắt buộc - Admin: ${req.user?.Email || "Unknown"} - Data: ${JSON.stringify(req.body)}`);
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    // Kiểm tra tính hợp lệ của dữ liệu
    if (PriceNum < 0 || StockNum < 0 || (DiscountPercentageNum && DiscountPercentageNum < 0)) {
      console.warn(`[${new Date().toISOString()}] Giá, tồn kho hoặc phần trăm giảm giá không được âm - Admin: ${req.user?.Email || "Unknown"}`);
      return res.status(400).json({ success: false, message: 'Giá, tồn kho và phần trăm giảm giá không được âm' });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Kiểm tra BrandId có tồn tại không
      const brandRequest = new sql.Request(transaction); // Tạo request mới
      const brandCheck = await brandRequest
        .input('BrandId', sql.Int, BrandIdNum)
        .query(`SELECT COUNT(*) as count FROM Brands WHERE BrandId = @BrandId`);
      if (brandCheck.recordset[0].count === 0) {
        throw new Error('Thương hiệu không tồn tại');
      }

      // Kiểm tra CategoryId có tồn tại không
      const categoryRequest = new sql.Request(transaction); // Tạo request mới
      const categoryCheck = await categoryRequest
        .input('CategoryId', sql.Int, CategoryIdNum)
        .query(`SELECT COUNT(*) as count FROM Categories WHERE CategoryId = @CategoryId`);
      if (categoryCheck.recordset[0].count === 0) {
        throw new Error('Danh mục không tồn tại');
      }

      // Thêm sản phẩm vào bảng Products
      const productRequest = new sql.Request(transaction); // Tạo request mới
      const productResult = await productRequest
        .input('Name', sql.NVarChar, Name)
        .input('BrandId', sql.Int, BrandIdNum)
        .input('CategoryId', sql.Int, CategoryIdNum)
        .input('Price', sql.Decimal(18, 2), PriceNum)
        .input('Description', sql.NVarChar, Description || null)
        .input('Stock', sql.Int, StockNum)
        .input('DetailedSpecs', sql.NVarChar, DetailedSpecs || null)
        .input('DiscountPercentage', sql.Decimal(5, 2), DiscountPercentageNum || 0)
        .query(`
          INSERT INTO Products (Name, BrandId, CategoryId, Price, Description, Stock, DetailedSpecs, DiscountPercentage)
          OUTPUT INSERTED.ProductId
          VALUES (@Name, @BrandId, @CategoryId, @Price, @Description, @Stock, @DetailedSpecs, @DiscountPercentage)
        `);

      const productId = productResult.recordset[0].ProductId;

      // Thêm hình ảnh vào bảng ProductImages (nếu có)
      if (Images && Images.length > 0) {
        for (const image of Images) {
          if (!image.ImageUrl) {
            throw new Error('URL hình ảnh không hợp lệ');
          }
          const imageRequest = new sql.Request(transaction); // Tạo request mới
          await imageRequest
            .input('ProductId', sql.Int, productId)
            .input('ImageUrl', sql.NVarChar, image.ImageUrl)
            .input('IsPrimary', sql.Bit, image.IsPrimary || false)
            .input('DisplayOrder', sql.Int, image.DisplayOrder || 0)
            .query(`
              INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, DisplayOrder)
              VALUES (@ProductId, @ImageUrl, @IsPrimary, @DisplayOrder)
            `);
        }
      }

      await transaction.commit();

      console.log(`[${new Date().toISOString()}] Thêm sản phẩm thành công - ProductId: ${productId} - Name: ${Name} - Admin: ${req.user?.Email || "Unknown"}`);

      res.json({ success: true, message: 'Thêm sản phẩm thành công', productId });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Lỗi khi thêm sản phẩm - Admin: ${req.user?.Email || "Unknown"} - Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm sản phẩm', error: err.message });
  }
});
// API sửa sản phẩm
app.put('/api/admin/products/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }

    const { Name, BrandId, CategoryId, Price, Description, Stock, DetailedSpecs, DiscountPercentage, Images } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!Name || isNaN(BrandId) || isNaN(CategoryId) || isNaN(Price) || isNaN(Stock)) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc hoặc thông tin không hợp lệ' });
    }

    // Kiểm tra tính hợp lệ của dữ liệu
    if (Price < 0 || Stock < 0 || (DiscountPercentage && DiscountPercentage < 0)) {
      return res.status(400).json({ success: false, message: 'Giá, tồn kho và phần trăm giảm giá không được âm' });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Kiểm tra BrandId có tồn tại không
      const brandRequest = new sql.Request(transaction);
      const brandCheck = await brandRequest
        .input('BrandId', sql.Int, BrandId)
        .query(`SELECT COUNT(*) as count FROM Brands WHERE BrandId = @BrandId`);
      if (brandCheck.recordset[0].count === 0) {
        throw new Error('Thương hiệu không tồn tại');
      }

      // Kiểm tra CategoryId có tồn tại không
      const categoryRequest = new sql.Request(transaction);
      const categoryCheck = await categoryRequest
        .input('CategoryId', sql.Int, CategoryId)
        .query(`SELECT COUNT(*) as count FROM Categories WHERE CategoryId = @CategoryId`);
      if (categoryCheck.recordset[0].count === 0) {
        throw new Error('Danh mục không tồn tại');
      }

      // Cập nhật sản phẩm
      const updateRequest = new sql.Request(transaction);
      const result = await updateRequest
        .input('ProductId', sql.Int, productId)
        .input('Name', sql.NVarChar, Name)
        .input('BrandId', sql.Int, BrandId)
        .input('CategoryId', sql.Int, CategoryId)
        .input('Price', sql.Decimal(18, 2), Price)
        .input('Description', sql.NVarChar, Description || null)
        .input('Stock', sql.Int, Stock)
        .input('DetailedSpecs', sql.NVarChar, DetailedSpecs || null)
        .input('DiscountPercentage', sql.Decimal(5, 2), DiscountPercentage || 0)
        .query(`
          UPDATE Products
          SET Name = @Name, BrandId = @BrandId, CategoryId = @CategoryId, Price = @Price, 
              Description = @Description, Stock = @Stock, DetailedSpecs = @DetailedSpecs, 
              DiscountPercentage = @DiscountPercentage, UpdatedAt = GETDATE()
          WHERE ProductId = @ProductId
        `);

      if (result.rowsAffected[0] === 0) {
        throw new Error('Không tìm thấy sản phẩm');
      }

      // Xử lý hình ảnh: Chỉ xóa và thêm mới nếu Images được gửi lên
      if (Images && Images.length > 0) {
        const deleteImagesRequest = new sql.Request(transaction);
        await deleteImagesRequest
          .input('ProductId', sql.Int, productId)
          .query(`DELETE FROM ProductImages WHERE ProductId = @ProductId`);

        for (let i = 0; i < Images.length; i++) {
          const image = Images[i];
          if (!image.ImageUrl) {
            throw new Error('URL hình ảnh không hợp lệ');
          }
          const insertImageRequest = new sql.Request(transaction);
          await insertImageRequest
            .input('ProductId', sql.Int, productId)
            .input('ImageUrl', sql.NVarChar, image.ImageUrl)
            .input('IsPrimary', sql.Bit, image.IsPrimary ? 1 : 0)
            .input('DisplayOrder', sql.Int, image.DisplayOrder || i)
            .query(`
              INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, DisplayOrder, CreatedAt)
              VALUES (@ProductId, @ImageUrl, @IsPrimary, @DisplayOrder, GETDATE())
            `);
        }
      }

      await transaction.commit();
      res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/products/:id - Error:', err);
    res.status(err.message === 'Không tìm thấy sản phẩm' ? 404 : 400).json({
      success: false,
      message: err.message === 'Không tìm thấy sản phẩm' ? 'Không tìm thấy sản phẩm' : err.message,
      error: err.message,
    });
  }
});

// API xóa sản phẩm
app.delete('/api/admin/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    console.log(`Bắt đầu xử lý request xóa sản phẩm - ProductId: ${productId}`);

    if (req.user.Role !== 'Admin') {
      console.warn(`[${new Date().toISOString()}] Truy cập không được phép - User: ${req.user?.Username || "Unknown"}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    if (isNaN(productId) || productId <= 0) {
      console.warn(`[${new Date().toISOString()}] ProductId không hợp lệ - ProductId: ${productId}`);
      return res.status(400).json({ success: false, message: 'ProductId không hợp lệ' });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const checkRequest = new sql.Request(transaction);
      const productCheck = await checkRequest
        .input('ProductId', sql.Int, productId)
        .query(`SELECT COUNT(*) as count FROM Products WHERE ProductId = @ProductId`);
      if (productCheck.recordset[0].count === 0) {
        console.warn(`[${new Date().toISOString()}] Sản phẩm không tồn tại - ProductId: ${productId}`);
        return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
      }

      const deleteImagesRequest = new sql.Request(transaction);
      await deleteImagesRequest
        .input('ProductId', sql.Int, productId)
        .query(`DELETE FROM ProductImages WHERE ProductId = @ProductId`);

      const deleteProductRequest = new sql.Request(transaction);
      await deleteProductRequest
        .input('ProductId', sql.Int, productId)
        .query(`DELETE FROM Products WHERE ProductId = @ProductId`);

      await transaction.commit();

      console.log(`[${new Date().toISOString()}] Xóa sản phẩm thành công - ProductId: ${productId} - Admin: ${req.user?.Username || "Unknown"}`);
      res.json({ success: true, message: 'Xóa sản phẩm thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    const productId = req.params.id || 'Unknown'; // Lấy productId từ req.params nếu không khai báo được
    console.error(`[${new Date().toISOString()}] Lỗi khi xóa sản phẩm - ProductId: ${productId} - Admin: ${req.user?.Username || "Unknown"} - Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa sản phẩm', error: err.message });
  }
});

//API lấy danh sách thương hiệu và danh mục (dùng cho form thêm/sửa)
app.get('/api/admin/brands-categories', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const pool = await poolPromise;
    const brands = await pool.request().query(`SELECT BrandId, Name FROM Brands`);
    const categories = await pool.request().query(`SELECT CategoryId, Name FROM Categories`);

    res.json({
      success: true,
      brands: brands.recordset,
      categories: categories.recordset,
    });
  } catch (err) {
    console.error('API /api/admin/brands-categories - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách thương hiệu và danh mục' });
  }
});

// API lấy chi tiết sản phẩm theo ProductId (dùng cho xem chi tiết và sửa)
app.get('/api/admin/products/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }

    const pool = await poolPromise;

    // Lấy thông tin sản phẩm
    const productResult = await pool.request()
      .input('ProductId', sql.Int, productId)
      .query(`
        SELECT 
          p.ProductId, p.Name, p.Price, p.Stock, p.DiscountPercentage,
          p.Description, p.DetailedSpecs, p.BrandId, p.CategoryId,
          b.Name as BrandName, c.Name as CategoryName
        FROM Products p
        LEFT JOIN Brands b ON p.BrandId = b.BrandId
        LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
        WHERE p.ProductId = @ProductId
      `);

    if (productResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const product = productResult.recordset[0];

    // Lấy danh sách hình ảnh của sản phẩm
    const imagesResult = await pool.request()
      .input('ProductId', sql.Int, productId)
      .query(`
        SELECT ImageId, ImageUrl, IsPrimary, DisplayOrder
        FROM ProductImages
        WHERE ProductId = @ProductId
        ORDER BY DisplayOrder
      `);

    res.json({
      success: true,
      product,
      images: imagesResult.recordset,
    });
  } catch (err) {
    console.error('API /api/admin/products/:id - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết sản phẩm', error: err.message });
  }
});


// API lấy danh sách loại sản phẩm
app.get('/api/admin/categories', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const pool = await poolPromise;
    const request = pool.request();

    // Đếm tổng số loại sản phẩm
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Categories
      WHERE Name LIKE @search
    `;
    request.input('search', sql.NVarChar, `%${search}%`);
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Lấy danh sách loại sản phẩm
    const query = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM Products p WHERE p.CategoryId = c.CategoryId) as ProductCount
      FROM Categories c
      WHERE c.Name LIKE @search
      ORDER BY c.CategoryId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));
    const result = await request.query(query);

    res.json({
      success: true,
      categories: result.recordset,
      total,
    });
  } catch (err) {
    console.error('API /api/admin/categories - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách loại sản phẩm', error: err.message });
  }
});

// API thêm loại sản phẩm mới
app.post('/api/admin/categories', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { Name, Description } = req.body;

    if (!Name) {
      return res.status(400).json({ success: false, message: 'Tên loại sản phẩm là bắt buộc' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    // Kiểm tra trùng lặp tên
    const checkDuplicate = await request
      .input('Name', sql.NVarChar, Name)
      .query(`SELECT COUNT(*) as count FROM Categories WHERE Name = @Name`);
    if (checkDuplicate.recordset[0].count > 0) {
      return res.status(400).json({ success: false, message: 'Tên loại sản phẩm đã tồn tại' });
    }

    const result = await request
      .input('Name', sql.NVarChar, Name)
      .input('Description', sql.NVarChar, Description || null)
      .query(`
        INSERT INTO Categories (Name, Description)
        OUTPUT INSERTED.CategoryId
        VALUES (@Name, @Description)
      `);

    res.json({ success: true, message: 'Thêm loại sản phẩm thành công', categoryId: result.recordset[0].CategoryId });
  } catch (err) {
    console.error('API /api/admin/categories - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm loại sản phẩm', error: err.message });
  }
});

// API sửa loại sản phẩm
app.put('/api/admin/categories/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { Name, Description } = req.body;

    if (!Name) {
      return res.status(400).json({ success: false, message: 'Tên loại sản phẩm là bắt buộc' });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);

      // Kiểm tra trùng lặp tên (trừ chính danh mục đang sửa)
      const checkDuplicate = await request
        .input('Name', sql.NVarChar, Name)
        .input('CategoryId', sql.Int, id)
        .query(`SELECT COUNT(*) as count FROM Categories WHERE Name = @Name AND CategoryId != @CategoryId`);
      if (checkDuplicate.recordset[0].count > 0) {
        throw new Error('Tên loại sản phẩm đã tồn tại');
      }

      await request
        .input('CategoryId', sql.Int, id)
        .input('Name', sql.NVarChar, Name)
        .input('Description', sql.NVarChar, Description || null)
        .query(`
          UPDATE Categories
          SET Name = @Name, Description = @Description, UpdatedAt = GETDATE()
          WHERE CategoryId = @CategoryId
        `);

      await transaction.commit();
      res.json({ success: true, message: 'Cập nhật loại sản phẩm thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/categories/:id - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật loại sản phẩm', error: err.message });
  }
});

// API xóa loại sản phẩm
app.delete('/api/admin/categories/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`Bắt đầu xóa loại sản phẩm với ID: ${req.params.id}, User: ${req.user?.UserId}`);

    // Kiểm tra quyền truy cập
    if (req.user.Role !== 'Admin') {
      console.log(`Người dùng ${req.user.UserId} không có quyền xóa loại sản phẩm. Role: ${req.user.Role}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    console.log(`ID loại sản phẩm cần xóa: ${id}`);

    const pool = await poolPromise;
    console.log('Kết nối database thành công');

    const transaction = new sql.Transaction(pool);
    console.log('Bắt đầu giao dịch');

    try {
      await transaction.begin();
      console.log('Giao dịch đã bắt đầu');

      // Kiểm tra xem loại sản phẩm có sản phẩm liên quan không
      const checkRequest = new sql.Request(transaction); // Tạo request mới
      console.log('Kiểm tra sản phẩm liên quan...');
      const checkProducts = await checkRequest
        .input('CategoryId', sql.Int, id)
        .query('SELECT COUNT(*) as count FROM Products WHERE CategoryId = @CategoryId');
      console.log(`Số sản phẩm liên quan: ${checkProducts.recordset[0].count}`);

      if (checkProducts.recordset[0].count > 0) {
        console.log('Không thể xóa vì loại sản phẩm có sản phẩm liên quan');
        throw new Error('Không thể xóa loại sản phẩm vì vẫn còn sản phẩm liên quan');
      }

      // Xóa loại sản phẩm
      const deleteRequest = new sql.Request(transaction); // Tạo request mới
      console.log('Thực hiện xóa loại sản phẩm...');
      const deleteResult = await deleteRequest
        .input('CategoryId', sql.Int, id)
        .query('DELETE FROM Categories WHERE CategoryId = @CategoryId');
      console.log(`Số hàng bị ảnh hưởng: ${deleteResult.rowsAffected}`);

      await transaction.commit();
      console.log('Giao dịch đã commit thành công');

      res.json({ success: true, message: 'Xóa loại sản phẩm thành công' });
    } catch (err) {
      console.log('Lỗi trong giao dịch, thực hiện rollback...');
      await transaction.rollback();
      console.error('Lỗi trong giao dịch:', err.message);
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/categories/:id - Error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// API lấy danh sách thương hiệu
app.get('/api/admin/brands', authenticateToken, async (req, res) => {
  try {
    console.log(`Bắt đầu lấy danh sách thương hiệu, User: ${req.user?.UserId}`);

    if (req.user.Role !== 'Admin') {
      console.log(`Người dùng ${req.user.UserId} không có quyền truy cập. Role: ${req.user.Role}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const pool = await poolPromise;
    const request = pool.request();

    // Đếm tổng số thương hiệu
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Brands
      WHERE Name LIKE @search
    `;
    request.input('search', sql.NVarChar, `%${search}%`);
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Lấy danh sách thương hiệu
    const query = `
      SELECT b.*, 
             (SELECT COUNT(*) FROM Products p WHERE p.BrandId = b.BrandId) as ProductCount
      FROM Brands b
      WHERE b.Name LIKE @search
      ORDER BY b.BrandId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));
    const result = await request.query(query);

    res.json({
      success: true,
      brands: result.recordset,
      total,
    });
  } catch (err) {
    console.error('API /api/admin/brands - Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách thương hiệu', error: err.message });
  }
});

// API thêm thương hiệu mới
app.post('/api/admin/brands', authenticateToken, async (req, res) => {
  try {
    console.log(`Bắt đầu thêm thương hiệu mới, User: ${req.user?.UserId}`);

    if (req.user.Role !== 'Admin') {
      console.log(`Người dùng ${req.user.UserId} không có quyền thêm thương hiệu. Role: ${req.user.Role}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { Name, Description } = req.body;
    console.log(`Dữ liệu nhận được: Name=${Name}, Description=${Description}`);

    if (!Name) {
      console.log('Tên thương hiệu không được cung cấp');
      return res.status(400).json({ success: false, message: 'Tên thương hiệu là bắt buộc' });
    }

    const pool = await poolPromise;
    console.log('Kết nối database thành công');

    const request = pool.request();

    // Kiểm tra trùng lặp tên
    console.log(`Kiểm tra trùng lặp tên thương hiệu: ${Name}`);
    const checkDuplicate = await request
      .input('Name', sql.NVarChar, Name)
      .query(`SELECT COUNT(*) as count FROM Brands WHERE Name = @Name`);
    console.log(`Số thương hiệu trùng tên: ${checkDuplicate.recordset[0].count}`);

    if (checkDuplicate.recordset[0].count > 0) {
      console.log('Tên thương hiệu đã tồn tại');
      return res.status(400).json({ success: false, message: 'Tên thương hiệu đã tồn tại' });
    }

    // Thêm thương hiệu mới
    console.log('Thực hiện thêm thương hiệu mới...');
    const result = await request
      .input('Name', sql.NVarChar, Name)
      .input('Description', sql.NVarChar, Description || null)
      .query(`
        INSERT INTO Brands (Name, Description)
        OUTPUT INSERTED.BrandId
        VALUES (@Name, @Description)
      `);
    console.log(`Thêm thương hiệu thành công, BrandId: ${result.recordset[0].BrandId}`);

    res.json({ success: true, message: 'Thêm thương hiệu thành công', brandId: result.recordset[0].BrandId });
  } catch (err) {
    console.error('API /api/admin/brands - Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm thương hiệu', error: err.message });
  }
});

// API sửa thương hiệu
app.put('/api/admin/brands/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`Bắt đầu sửa thương hiệu với ID: ${req.params.id}, User: ${req.user?.UserId}`);

    if (req.user.Role !== 'Admin') {
      console.log(`Người dùng ${req.user.UserId} không có quyền sửa thương hiệu. Role: ${req.user.Role}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { Name, Description } = req.body;
    console.log(`Dữ liệu nhận được: Name=${Name}, Description=${Description}`);

    if (!Name) {
      console.log('Tên thương hiệu không được cung cấp');
      return res.status(400).json({ success: false, message: 'Tên thương hiệu là bắt buộc' });
    }

    const pool = await poolPromise;
    console.log('Kết nối database thành công');

    const transaction = new sql.Transaction(pool);
    console.log('Bắt đầu giao dịch');

    try {
      await transaction.begin();
      console.log('Giao dịch đã bắt đầu');

      const request = new sql.Request(transaction);

      // Kiểm tra trùng lặp tên (trừ chính thương hiệu đang sửa)
      console.log(`Kiểm tra trùng lặp tên thương hiệu: ${Name}`);
      const checkDuplicate = await request
        .input('Name', sql.NVarChar, Name)
        .input('BrandId', sql.Int, id)
        .query(`SELECT COUNT(*) as count FROM Brands WHERE Name = @Name AND BrandId != @BrandId`);
      console.log(`Số thương hiệu trùng tên: ${checkDuplicate.recordset[0].count}`);

      if (checkDuplicate.recordset[0].count > 0) {
        console.log('Tên thương hiệu đã tồn tại');
        throw new Error('Tên thương hiệu đã tồn tại');
      }

      // Cập nhật thương hiệu
      console.log('Thực hiện cập nhật thương hiệu...');
      const updateResult = await request
        .input('BrandId', sql.Int, id)
        .input('Name', sql.NVarChar, Name)
        .input('Description', sql.NVarChar, Description || null)
        .query(`
          UPDATE Brands
          SET Name = @Name, Description = @Description, UpdatedAt = GETDATE()
          WHERE BrandId = @BrandId
        `);
      console.log(`Số hàng bị ảnh hưởng: ${updateResult.rowsAffected}`);

      await transaction.commit();
      console.log('Giao dịch đã commit thành công');

      res.json({ success: true, message: 'Cập nhật thương hiệu thành công' });
    } catch (err) {
      console.log('Lỗi trong giao dịch, thực hiện rollback...');
      await transaction.rollback();
      console.error('Lỗi trong giao dịch:', err.message);
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/brands/:id - Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thương hiệu', error: err.message });
  }
});

// API xóa thương hiệu
app.delete('/api/admin/brands/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`Bắt đầu xóa thương hiệu với ID: ${req.params.id}, User: ${req.user?.UserId}`);

    if (req.user.Role !== 'Admin') {
      console.log(`Người dùng ${req.user.UserId} không có quyền xóa thương hiệu. Role: ${req.user.Role}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    console.log(`ID thương hiệu cần xóa: ${id}`);

    const pool = await poolPromise;
    console.log('Kết nối database thành công');

    const transaction = new sql.Transaction(pool);
    console.log('Bắt đầu giao dịch');

    try {
      await transaction.begin();
      console.log('Giao dịch đã bắt đầu');

      const request = new sql.Request(transaction);

      // Kiểm tra xem thương hiệu có sản phẩm liên quan không
      console.log('Kiểm tra sản phẩm liên quan...');
      const checkProducts = await request
        .input('BrandId', sql.Int, id)
        .query('SELECT COUNT(*) as count FROM Products WHERE BrandId = @BrandId');
      console.log(`Số sản phẩm liên quan: ${checkProducts.recordset[0].count}`);

      if (checkProducts.recordset[0].count > 0) {
        console.log('Không thể xóa vì thương hiệu có sản phẩm liên quan');
        throw new Error('Không thể xóa thương hiệu vì vẫn còn sản phẩm liên quan');
      }

      // Xóa thương hiệu
      console.log('Thực hiện xóa thương hiệu...');
      const deleteResult = await request
        .input('BrandId', sql.Int, id)
        .query('DELETE FROM Brands WHERE BrandId = @BrandId');
      console.log(`Số hàng bị ảnh hưởng: ${deleteResult.rowsAffected}`);

      await transaction.commit();
      console.log('Giao dịch đã commit thành công');

      res.json({ success: true, message: 'Xóa thương hiệu thành công' });
    } catch (err) {
      console.log('Lỗi trong giao dịch, thực hiện rollback...');
      await transaction.rollback();
      console.error('Lỗi trong giao dịch:', err.message);
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/brands/:id - Error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});
// API lấy danh sách đơn hàng
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
  try {
    console.log(`Bắt đầu tìm kiếm đơn hàng, User: ${req.user?.UserId}`);

    if (req.user.Role !== 'Admin') {
      console.log(`Người dùng ${req.user.UserId} không có quyền truy cập. Role: ${req.user.Role}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { search = '', orderStatus = '', paymentStatus = '', page = 1, limit = 10, sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;

    console.log(`Tham số tìm kiếm: search=${search}, orderStatus=${orderStatus}, paymentStatus=${paymentStatus}, page=${page}, limit=${limit}, sort=${sort}`);

    const pool = await poolPromise;
    console.log('Kết nối database thành công');

    const request = pool.request();

    // Đếm tổng số đơn hàng
    let countQuery = `
      SELECT COUNT(DISTINCT o.OrderId) as total
      FROM Orders o
      LEFT JOIN (
        SELECT OrderId, Status
        FROM Payments p1
        WHERE p1.CreatedAt = (
          SELECT MAX(p2.CreatedAt)
          FROM Payments p2
          WHERE p2.OrderId = p1.OrderId
        )
      ) p ON o.OrderId = p.OrderId
      WHERE 1=1
    `;
    if (search) {
      countQuery += ` AND (o.OrderId LIKE @search OR o.FullName LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }
    if (orderStatus && orderStatus !== 'all') {
      countQuery += ` AND o.Status = @orderStatus`;
      request.input('orderStatus', sql.NVarChar, orderStatus);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      countQuery += ` AND p.Status = @paymentStatus`;
      request.input('paymentStatus', sql.NVarChar, paymentStatus);
    }

    console.log('Truy vấn đếm tổng số đơn hàng:', countQuery);
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;
    console.log(`Tổng số đơn hàng: ${total}`);

    // Lấy danh sách đơn hàng
    let query = `
      SELECT 
        o.OrderId,
        o.FullName,
        o.OrderDate,
        o.Status,
        o.Total,
        p.Status as PaymentStatus,
        (SELECT COUNT(*) FROM OrderItems oi WHERE oi.OrderId = o.OrderId) as ProductCount
      FROM Orders o
      LEFT JOIN (
        SELECT OrderId, Status
        FROM Payments p1
        WHERE p1.CreatedAt = (
          SELECT MAX(p2.CreatedAt)
          FROM Payments p2
          WHERE p2.OrderId = p1.OrderId
        )
      ) p ON o.OrderId = p.OrderId
      WHERE 1=1
    `;
    if (search) {
      query += ` AND (o.OrderId LIKE @search OR o.FullName LIKE @search)`;
    }
    if (orderStatus && orderStatus !== 'all') {
      query += ` AND o.Status = @orderStatus`;
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query += ` AND p.Status = @paymentStatus`;
    }

    // Sắp xếp
    if (sort === 'newest') {
      query += ` ORDER BY o.CreatedAt DESC`;
    } else if (sort === 'oldest') {
      query += ` ORDER BY o.CreatedAt ASC`;
    } else if (sort === 'highestAmount') {
      query += ` ORDER BY o.Total DESC`;
    } else if (sort === 'lowestAmount') {
      query += ` ORDER BY o.Total ASC`;
    }

    query += `
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));

    console.log('Truy vấn lấy danh sách đơn hàng:', query);
    const result = await request.query(query);
    console.log(`Số đơn hàng trả về: ${result.recordset.length}`);

    res.json({
      success: true,
      orders: result.recordset,
      total,
    });
  } catch (err) {
    console.error('API /api/admin/orders - Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách đơn hàng', error: err.message });
  }
});
// API lấy chi tiết đơn hàng
app.get('/api/admin/orders/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;

    // Kiểm tra id
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'OrderId không hợp lệ' });
    }

    const pool = await poolPromise;

    // Lấy thông tin đơn hàng và khách hàng
    const orderRequest = pool.request();
    const orderQuery = `
      SELECT 
        o.OrderId,
        o.OrderDate,
        o.Status,
        o.Total,
        o.Address,
        o.PaymentMethod,
        o.EstimatedDeliveryDate,
        p.Status AS PaymentStatus,
        u.UserId,
        u.FullName,
        u.Email,
        u.Phone
      FROM Orders o
      JOIN Users u ON o.UserId = u.UserId
      LEFT JOIN Payments p ON o.OrderId = p.OrderId
      WHERE o.OrderId = @OrderId
    `;
    orderRequest.input('OrderId', sql.VarChar, id);
    const orderResult = await orderRequest.query(orderQuery);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const order = orderResult.recordset[0];

    // Lấy danh sách sản phẩm trong đơn hàng
    const itemsRequest = pool.request();
    const itemsQuery = `
      SELECT 
        oi.OrderItemId,
        oi.ProductId,
        oi.Quantity,
        oi.Price,
        p.Name AS ProductName
      FROM OrderItems oi
      JOIN Products p ON oi.ProductId = p.ProductId
      WHERE oi.OrderId = @OrderId
    `;
    itemsRequest.input('OrderId', sql.VarChar, id);
    const itemsResult = await itemsRequest.query(itemsQuery);

    res.json({
      success: true,
      order: {
        ...order,
        items: itemsResult.recordset,
      },
    });
  } catch (err) {
    console.error('API /api/admin/orders/:id - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết đơn hàng', error: err.message });
  }
});

//API chỉnh sửa đơn hàng
app.put('/api/admin/orders/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    // Kiểm tra id
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'OrderId không hợp lệ' });
    }

    // Kiểm tra status và paymentStatus
    if (!status && !paymentStatus) {
      return res.status(400).json({ success: false, message: 'Cần cung cấp ít nhất một trạng thái để cập nhật' });
    }

    const pool = await poolPromise;
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // Cập nhật trạng thái đơn hàng (nếu có)
      if (status) {
        const validOrderStatuses = ['Chờ xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Đã giao', 'Đã hủy'];
        if (!validOrderStatuses.includes(status)) {
          throw new Error('Trạng thái đơn hàng không hợp lệ. Trạng thái phải là một trong: ' + validOrderStatuses.join(', '));
        }

        const orderRequest = transaction.request();
        const orderQuery = `
          UPDATE Orders
          SET Status = @Status, UpdatedAt = GETDATE()
          WHERE OrderId = @OrderId
        `;
        orderRequest.input('OrderId', sql.VarChar, id);
        orderRequest.input('Status', sql.NVarChar, status);
        const orderResult = await orderRequest.query(orderQuery);

        if (orderResult.rowsAffected[0] === 0) {
          throw new Error('Không tìm thấy đơn hàng');
        }
      }

      // Cập nhật trạng thái thanh toán (nếu có)
      if (paymentStatus) {
        const validPaymentStatuses = ['Chưa thanh toán', 'Đang xử lý', 'Đã thanh toán'];
        if (!validPaymentStatuses.includes(paymentStatus)) {
          throw new Error('Trạng thái thanh toán không hợp lệ. Trạng thái phải là một trong: ' + validPaymentStatuses.join(', '));
        }

        const paymentRequest = transaction.request();
        const paymentQuery = `
          UPDATE Payments
          SET Status = @PaymentStatus, PaymentDate = CASE WHEN @PaymentStatus = 'Đã thanh toán' THEN GETDATE() ELSE PaymentDate END
          WHERE OrderId = @OrderId
        `;
        paymentRequest.input('OrderId', sql.VarChar, id);
        paymentRequest.input('PaymentStatus', sql.NVarChar, paymentStatus);
        const paymentResult = await paymentRequest.query(paymentQuery);

        if (paymentResult.rowsAffected[0] === 0) {
          throw new Error('Không tìm thấy thông tin thanh toán cho đơn hàng này');
        }
      }

      await transaction.commit();
      res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/orders/:id - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái: ' + err.message });
  }
});

//API xóa đơn hàng
app.delete('/api/admin/orders/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;

    // Kiểm tra id
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'OrderId không hợp lệ' });
    }

    const pool = await poolPromise;
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // Xóa các mục trong OrderItems
      const orderItemsRequest = transaction.request();
      await orderItemsRequest
        .input('OrderId', sql.VarChar, id)
        .query('DELETE FROM OrderItems WHERE OrderId = @OrderId');

      // Xóa bản ghi trong Payments
      const paymentsRequest = transaction.request();
      await paymentsRequest
        .input('OrderId', sql.VarChar, id)
        .query('DELETE FROM Payments WHERE OrderId = @OrderId');

      // Xóa đơn hàng trong Orders
      const orderRequest = transaction.request();
      const orderResult = await orderRequest
        .input('OrderId', sql.VarChar, id)
        .query('DELETE FROM Orders WHERE OrderId = @OrderId');

      if (orderResult.rowsAffected[0] === 0) {
        throw new Error('Không tìm thấy đơn hàng');
      }

      await transaction.commit();
      res.json({ success: true, message: 'Xóa đơn hàng thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/orders/:id - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa đơn hàng: ' + err.message });
  }
});
// API lấy danh sách mã giảm giá
app.get('/api/admin/discount-codes', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const pool = await poolPromise;
    const request = pool.request();

    // Đếm tổng số mã giảm giá
    const countQuery = `
      SELECT COUNT(*) as total
      FROM DiscountCodes
      WHERE Code LIKE @search
    `;
    request.input('search', sql.NVarChar, `%${search}%`);
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Lấy danh sách mã giảm giá
    const query = `
      SELECT *
      FROM DiscountCodes
      WHERE Code LIKE @search
      ORDER BY DiscountCodeId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));
    const result = await request.query(query);

    res.json({
      success: true,
      discountCodes: result.recordset,
      total,
    });
  } catch (err) {
    console.error('API /api/admin/discount-codes - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách mã giảm giá', error: err.message });
  }
});

// API thêm mã giảm giá mới
app.post('/api/admin/discount-codes', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { Code, DiscountPercentage, ExpiryDate } = req.body;

    if (!Code || !DiscountPercentage) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá và phần trăm giảm giá là bắt buộc' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    // Kiểm tra trùng lặp mã
    const checkDuplicate = await request
      .input('Code', sql.NVarChar, Code)
      .query(`SELECT COUNT(*) as count FROM DiscountCodes WHERE Code = @Code`);
    if (checkDuplicate.recordset[0].count > 0) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã tồn tại' });
    }

    const result = await request
      .input('Code', sql.NVarChar, Code)
      .input('DiscountPercentage', sql.Decimal(5, 2), DiscountPercentage)
      .input('ExpiryDate', sql.DateTime, ExpiryDate || null)
      .query(`
        INSERT INTO DiscountCodes (Code, DiscountPercentage, ExpiryDate)
        OUTPUT INSERTED.DiscountCodeId
        VALUES (@Code, @DiscountPercentage, @ExpiryDate)
      `);

    res.json({ success: true, message: 'Thêm mã giảm giá thành công', discountCodeId: result.recordset[0].DiscountCodeId });
  } catch (err) {
    console.error('API /api/admin/discount-codes - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm mã giảm giá', error: err.message });
  }
});

// API sửa mã giảm giá
app.put('/api/admin/discount-codes/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { Code, DiscountPercentage, ExpiryDate, IsActive } = req.body;

    if (!Code || !DiscountPercentage) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá và phần trăm giảm giá là bắt buộc' });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);

      // Kiểm tra trùng lặp mã (trừ chính mã đang sửa)
      const checkDuplicate = await request
        .input('Code', sql.NVarChar, Code)
        .input('DiscountCodeId', sql.Int, id)
        .query(`SELECT COUNT(*) as count FROM DiscountCodes WHERE Code = @Code AND DiscountCodeId != @DiscountCodeId`);
      if (checkDuplicate.recordset[0].count > 0) {
        throw new Error('Mã giảm giá đã tồn tại');
      }

      await request
        .input('DiscountCodeId', sql.Int, id)
        .input('Code', sql.NVarChar, Code)
        .input('DiscountPercentage', sql.Decimal(5, 2), DiscountPercentage)
        .input('ExpiryDate', sql.DateTime, ExpiryDate || null)
        .input('IsActive', sql.Bit, IsActive !== undefined ? IsActive : 1)
        .query(`
          UPDATE DiscountCodes
          SET Code = @Code, DiscountPercentage = @DiscountPercentage, ExpiryDate = @ExpiryDate, IsActive = @IsActive, CreatedAt = GETDATE()
          WHERE DiscountCodeId = @DiscountCodeId
        `);

      await transaction.commit();
      res.json({ success: true, message: 'Cập nhật mã giảm giá thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/discount-codes/:id - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật mã giảm giá', error: err.message });
  }
});

// API xóa mã giảm giá
app.delete('/api/admin/discount-codes/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);

      const deleteResult = await request
        .input('DiscountCodeId', sql.Int, id)
        .query('DELETE FROM DiscountCodes WHERE DiscountCodeId = @DiscountCodeId');

      if (deleteResult.rowsAffected[0] === 0) {
        throw new Error('Mã giảm giá không tồn tại');
      }

      await transaction.commit();
      res.json({ success: true, message: 'Xóa mã giảm giá thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/discount-codes/:id - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa mã giảm giá', error: err.message });
  }
});

//API danh sách người dùng
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    console.log(`Bắt đầu lấy danh sách người dùng, User: ${req.user?.UserId}`);

    // Kiểm tra quyền truy cập
    if (req.user.Role !== 'Admin') {
      console.log(`Người dùng ${req.user.UserId} không có quyền truy cập. Role: ${req.user.Role}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { search = '', sort = 'idAsc', page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      console.log(`Tham số không hợp lệ: page=${page}, limit=${limit}`);
      return res.status(400).json({ success: false, message: 'Tham số page hoặc limit không hợp lệ' });
    }

    const offset = (pageNum - 1) * limitNum;
    console.log(`Tham số: search=${search}, sort=${sort}, page=${pageNum}, limit=${limitNum}, offset=${offset}`);

    const pool = await poolPromise;
    console.log('Kết nối database thành công');

    const request = pool.request();

    let searchCondition = 'WHERE 1=1';
    if (search) {
      searchCondition += ` AND (FullName LIKE @search OR Email LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM Users
      ${searchCondition}
    `;
    console.log('Truy vấn đếm tổng số người dùng:', countQuery);
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;
    console.log(`Tổng số người dùng: ${total}`);

    let orderBy = 'UserId ASC';
    switch (sort) {
      case 'idAsc':
        orderBy = 'UserId ASC';
        break;
      case 'newest':
        orderBy = 'CreatedAt DESC';
        break;
      case 'oldest':
        orderBy = 'CreatedAt ASC';
        break;
      case 'nameAsc':
        orderBy = 'FullName ASC';
        break;
      case 'nameDesc':
        orderBy = 'FullName DESC';
        break;
      default:
        console.log(`Giá trị sort không hợp lệ: ${sort}, sử dụng mặc định: idAsc`);
        orderBy = 'UserId ASC';
    }

    const query = `
      SELECT 
        UserId AS Id,
        FullName AS Name,
        Email AS Email,
        Role AS Role,
        Status AS Status,
        LastLogin AS LastLogin
      FROM Users
      ${searchCondition}
      ORDER BY ${orderBy}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limitNum);
    console.log('Truy vấn lấy danh sách người dùng:', query);
    const result = await request.query(query);
    console.log(`Số người dùng trả về: ${result.recordset.length}`);

    res.json({
      success: true,
      users: result.recordset,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error('API /api/admin/users - Detailed Error:', {
      message: err.message,
      stack: err.stack,
      queryParams: req.query,
    });
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách người dùng', error: err.message });
  }
});
//API thêm người dùng
app.post('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    console.log(`Bắt đầu thêm người dùng mới, User: ${req.user?.UserId}`);

    // Kiểm tra quyền truy cập
    if (req.user.Role !== 'Admin') {
      console.log(`Người dùng ${req.user.UserId} không có quyền truy cập. Role: ${req.user.Role}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { fullName, email, password, role, status, phone } = req.body;
    console.log(`Dữ liệu nhận được: fullName=${fullName}, email=${email}, role=${role}, status=${status}, phone=${phone}`);

    if (!fullName || !email || !password || !role || !status) {
      console.log('Thiếu thông tin bắt buộc');
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc: fullName, email, password, role, status' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`Email không hợp lệ: ${email}`);
      return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
    }

    const validRoles = ['Admin', 'Quản lý', 'Nhân viên', 'Khách hàng'];
    const validStatuses = ['Hoạt động', 'Không hoạt động', 'Tạm khóa'];
    if (!validRoles.includes(role)) {
      console.log(`Vai trò không hợp lệ: ${role}`);
      return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ. Vai trò phải là: ' + validRoles.join(', ') });
    }
    if (!validStatuses.includes(status)) {
      console.log(`Trạng thái không hợp lệ: ${status}`);
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ. Trạng thái phải là: ' + validStatuses.join(', ') });
    }

    const pool = await poolPromise;
    console.log('Kết nối database thành công');

    const request = pool.request();

    // Kiểm tra email đã tồn tại
    console.log(`Kiểm tra email đã tồn tại: ${email}`);
    const emailCheck = await request
      .input('Email', sql.NVarChar, email)
      .query('SELECT UserId FROM Users WHERE Email = @Email');
    if (emailCheck.recordset.length > 0) {
      console.log('Email đã tồn tại');
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    // Thêm người dùng mới
    const insertQuery = `
      INSERT INTO Users (FullName, Email, Password, Phone, Role, Status, CreatedAt)
      OUTPUT INSERTED.UserId
      VALUES (@FullName, @Email, @Password, @Phone, @Role, @Status, GETDATE())
    `;
    const insertResult = await request
      .input('FullName', sql.NVarChar, fullName)
      .input('Email', sql.NVarChar, email)
      .input('Password', sql.NVarChar, password)
      .input('Phone', sql.NVarChar, phone || null)
      .input('Role', sql.NVarChar, role)
      .input('Status', sql.NVarChar, status)
      .query(insertQuery);
    console.log(`Thêm người dùng thành công, UserId: ${insertResult.recordset[0].UserId}`);

    res.json({ success: true, message: 'Thêm người dùng thành công', userId: insertResult.recordset[0].UserId });
  } catch (err) {
    console.error('API /api/admin/users - Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm người dùng: ' + err.message });
  }
});

// API chỉnh sửa người dùng
app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`Bắt đầu chỉnh sửa người dùng, UserId: ${req.params.id}, User: ${req.user?.UserId}`);

    // Kiểm tra quyền truy cập
    if (req.user.Role !== 'Admin') {
      console.log(`Người dùng ${req.user.UserId} không có quyền truy cập. Role: ${req.user.Role}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { fullName, email, password, role, status, phone } = req.body;

    const userId = parseInt(id);
    if (isNaN(userId) || userId < 1) {
      console.log(`UserId không hợp lệ: ${id}`);
      return res.status(400).json({ success: false, message: 'UserId không hợp lệ' });
    }

    if (!fullName && !email && !password && !role && !status && !phone) {
      console.log('Không có trường nào để cập nhật');
      return res.status(400).json({ success: false, message: 'Cần cung cấp ít nhất một trường để cập nhật' });
    }

    console.log(`Dữ liệu cập nhật: fullName=${fullName}, email=${email}, role=${role}, status=${status}, phone=${phone}, có mật khẩu mới: ${!!password}`);

    const pool = await poolPromise;
    console.log('Kết nối database thành công');

    const transaction = pool.transaction();
    console.log('Bắt đầu giao dịch');

    try {
      await transaction.begin();
      const request = transaction.request();

      // Kiểm tra người dùng tồn tại
      console.log(`Kiểm tra người dùng tồn tại: UserId=${userId}`);
      const userCheck = await request
        .input('UserId', sql.Int, userId)
        .query('SELECT Email FROM Users WHERE UserId = @UserId');
      if (userCheck.recordset.length === 0) {
        console.log('Không tìm thấy người dùng');
        throw new Error('Không tìm thấy người dùng');
      }

      // Kiểm tra email nếu có cập nhật
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          console.log(`Email không hợp lệ: ${email}`);
          throw new Error('Email không hợp lệ');
        }

        console.log(`Kiểm tra email đã tồn tại: ${email}`);
        const emailCheck = await request
          .input('Email', sql.NVarChar, email)
          .input('UserId', sql.Int, userId)
          .query('SELECT UserId FROM Users WHERE Email = @Email AND UserId != @UserId');
        if (emailCheck.recordset.length > 0) {
          console.log('Email đã tồn tại');
          throw new Error('Email đã tồn tại');
        }
      }

      // Kiểm tra role và status
      if (role) {
        const validRoles = ['Admin', 'Quản lý', 'Nhân viên', 'Khách hàng'];
        if (!validRoles.includes(role)) {
          console.log(`Vai trò không hợp lệ: ${role}`);
          throw new Error('Vai trò không hợp lệ. Vai trò phải là: ' + validRoles.join(', '));
        }
      }
      if (status) {
        const validStatuses = ['Hoạt động', 'Không hoạt động', 'Tạm khóa'];
        if (!validStatuses.includes(status)) {
          console.log(`Trạng thái không hợp lệ: ${status}`);
          throw new Error('Trạng thái không hợp lệ. Trạng thái phải là: ' + validStatuses.join(', '));
        }
      }

      // Cập nhật người dùng
      const updateQuery = `
        UPDATE Users
        SET 
          FullName = ISNULL(@FullName, FullName),
          Email = ISNULL(@Email, Email),
          Password = ISNULL(@Password, Password),
          Phone = @Phone,
          Role = ISNULL(@Role, Role),
          Status = ISNULL(@Status, Status),
          UpdatedAt = GETDATE()
        WHERE UserId = @UserId
      `;
      const updateRequest = transaction.request();
      updateRequest.input('UserId', sql.Int, userId);
      updateRequest.input('FullName', sql.NVarChar, fullName || null);
      updateRequest.input('Email', sql.NVarChar, email || null);
      updateRequest.input('Password', sql.NVarChar, password || null);
      updateRequest.input('Phone', sql.NVarChar, phone || null);
      updateRequest.input('Role', sql.NVarChar, role || null);
      updateRequest.input('Status', sql.NVarChar, status || null);
      const updateResult = await updateRequest.query(updateQuery);
      console.log(`Số hàng bị ảnh hưởng: ${updateResult.rowsAffected[0]}`);

      if (updateResult.rowsAffected[0] === 0) {
        console.log('Không thể cập nhật người dùng');
        throw new Error('Không thể cập nhật người dùng');
      }

      await transaction.commit();
      console.log('Giao dịch commit thành công');

      res.json({ success: true, message: 'Cập nhật người dùng thành công' });
    } catch (err) {
      console.log('Lỗi trong giao dịch, thực hiện rollback...');
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/users/:id - Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật người dùng: ' + err.message });
  }
});

//API xóa người dùng
app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`Bắt đầu xóa người dùng, UserId: ${req.params.id}, User: ${req.user?.UserId}`);

    // Kiểm tra quyền truy cập
    if (req.user.Role !== 'Admin') {
      console.log(`Người dùng ${req.user.UserId} không có quyền truy cập. Role: ${req.user.Role}`);
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const { id } = req.params;

    const userId = parseInt(id);
    if (isNaN(userId) || userId < 1) {
      console.log(`UserId không hợp lệ: ${id}`);
      return res.status(400).json({ success: false, message: 'UserId không hợp lệ' });
    }

    const pool = await poolPromise;
    console.log('Kết nối database thành công');

    const transaction = pool.transaction();
    console.log('Bắt đầu giao dịch');

    try {
      await transaction.begin();

      const request = transaction.request();
      console.log(`Kiểm tra người dùng tồn tại: UserId=${userId}`);
      const userCheck = await request
        .input('UserId', sql.Int, userId)
        .query('SELECT UserId FROM Users WHERE UserId = @UserId');
      if (userCheck.recordset.length === 0) {
        console.log('Không tìm thấy người dùng');
        throw new Error('Không tìm thấy người dùng');
      }

      // Xóa OrderItems
      console.log('Xóa OrderItems liên quan...');
      const orderItemsRequest = transaction.request();
      const orderItemsResult = await orderItemsRequest
        .input('UserId', sql.Int, userId)
        .query(`
          DELETE FROM OrderItems 
          WHERE OrderId IN (SELECT OrderId FROM Orders WHERE UserId = @UserId)
        `);
      console.log(`Số OrderItems đã xóa: ${orderItemsResult.rowsAffected[0]}`);

      // Xóa Payments
      console.log('Xóa Payments liên quan...');
      const paymentsRequest = transaction.request();
      const paymentsResult = await paymentsRequest
        .input('UserId', sql.Int, userId)
        .query(`
          DELETE FROM Payments 
          WHERE OrderId IN (SELECT OrderId FROM Orders WHERE UserId = @UserId)
        `);
      console.log(`Số Payments đã xóa: ${paymentsResult.rowsAffected[0]}`);

      // Xóa Orders
      console.log('Xóa Orders liên quan...');
      const ordersRequest = transaction.request();
      const ordersResult = await ordersRequest
        .input('UserId', sql.Int, userId)
        .query('DELETE FROM Orders WHERE UserId = @UserId');
      console.log(`Số Orders đã xóa: ${ordersResult.rowsAffected[0]}`);

      // Xóa người dùng
      console.log('Xóa người dùng...');
      const deleteRequest = transaction.request();
      const deleteResult = await deleteRequest
        .input('UserId', sql.Int, userId)
        .query('DELETE FROM Users WHERE UserId = @UserId');
      console.log(`Số người dùng đã xóa: ${deleteResult.rowsAffected[0]}`);

      if (deleteResult.rowsAffected[0] === 0) {
        console.log('Không thể xóa người dùng');
        throw new Error('Không thể xóa người dùng');
      }

      await transaction.commit();
      console.log('Giao dịch commit thành công');

      res.json({ success: true, message: 'Xóa người dùng thành công' });
    } catch (err) {
      console.log('Lỗi trong giao dịch, thực hiện rollback...');
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('API /api/admin/users/:id - Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa người dùng: ' + err.message });
  }
});

// API lấy dữ liệu thống kê cho Dashboard
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.Role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    // 1. Tổng doanh thu (dựa trên OrderItems.Price * OrderItems.Quantity, với điều kiện 'Đã giao' và 'Đã thanh toán')
    const revenueQuery = `
      SELECT SUM(oi.Price * oi.Quantity) as totalRevenue
      FROM OrderItems oi
      JOIN Orders o ON oi.OrderId = o.OrderId
      JOIN (
        SELECT OrderId, Status
        FROM Payments p1
        WHERE p1.CreatedAt = (
          SELECT MAX(p2.CreatedAt)
          FROM Payments p2
          WHERE p2.OrderId = p1.OrderId
        )
      ) pay ON o.OrderId = pay.OrderId
      WHERE o.Status = 'Đã giao'
        AND pay.Status = 'Đã thanh toán'
    `;
    const revenueResult = await request.query(revenueQuery);
    const totalRevenue = revenueResult.recordset[0].totalRevenue || 0;

    // 2. Số sản phẩm
    const productsQuery = `
      SELECT COUNT(*) as totalProducts
      FROM Products
    `;
    const productsResult = await request.query(productsQuery);
    const totalProducts = productsResult.recordset[0].totalProducts || 0;

    // 3. Số đơn hàng
    const ordersQuery = `
      SELECT COUNT(*) as totalOrders
      FROM Orders
    `;
    const ordersResult = await request.query(ordersQuery);
    const totalOrders = ordersResult.recordset[0].totalOrders || 0;

    // 4. Số khách hàng
    const customersQuery = `
      SELECT COUNT(*) as totalCustomers
      FROM Users
      WHERE Role = 'Customer'
    `;
    const customersResult = await request.query(customersQuery);
    const totalCustomers = customersResult.recordset[0].totalCustomers || 0;

    // 5. Doanh thu theo tháng (dựa trên OrderItems.Price * OrderItems.Quantity, 12 tháng gần nhất, áp dụng điều kiện 'Đã giao' và 'Đã thanh toán')
    const salesByMonthQuery = `
      SELECT 
        MONTH(o.OrderDate) as month,
        SUM(oi.Price * oi.Quantity) as value
      FROM OrderItems oi
      JOIN Orders o ON oi.OrderId = o.OrderId
      JOIN (
        SELECT OrderId, Status
        FROM Payments p1
        WHERE p1.CreatedAt = (
          SELECT MAX(p2.CreatedAt)
          FROM Payments p2
          WHERE p2.OrderId = p1.OrderId
        )
      ) pay ON o.OrderId = pay.OrderId
      WHERE o.OrderDate >= DATEADD(MONTH, -12, GETDATE())
        AND o.Status = 'Đã giao'
        AND pay.Status = 'Đã thanh toán'
      GROUP BY MONTH(o.OrderDate)
      ORDER BY MONTH(o.OrderDate)
    `;
    const salesByMonthResult = await request.query(salesByMonthQuery);
    const salesData = Array.from({ length: 12 }, (_, i) => ({
      name: `T${i + 1}`,
      value: 0,
    }));
    salesByMonthResult.recordset.forEach((row) => {
      salesData[row.month - 1].value = row.value || 0;
    });

    // 6. Phân loại sản phẩm (theo danh mục)
    const productCategoryQuery = `
      SELECT 
        c.Name as name,
        COUNT(p.ProductId) as value
      FROM Categories c
      LEFT JOIN Products p ON c.CategoryId = p.CategoryId
      GROUP BY c.CategoryId, c.Name
    `;
    const productCategoryResult = await request.query(productCategoryQuery);
    const productCategoryData = productCategoryResult.recordset;

    // 7. Sản phẩm bán chạy (Top 5 sản phẩm có số lượng bán cao nhất, áp dụng điều kiện 'Đã giao' và 'Đã thanh toán')
    const topProductsQuery = `
      SELECT TOP 5
        prod.ProductId as id,
        prod.Name as name,
        SUM(oi.Quantity) as sales,
        prod.Stock as stock
      FROM Products prod
      JOIN OrderItems oi ON prod.ProductId = oi.ProductId
      JOIN Orders o ON oi.OrderId = o.OrderId
      JOIN (
        SELECT OrderId, Status
        FROM Payments p1
        WHERE p1.CreatedAt = (
          SELECT MAX(p2.CreatedAt)
          FROM Payments p2
          WHERE p2.OrderId = p1.OrderId
        )
      ) pay ON o.OrderId = pay.OrderId
      WHERE o.Status = 'Đã giao'
        AND pay.Status = 'Đã thanh toán'
      GROUP BY prod.ProductId, prod.Name, prod.Stock
      ORDER BY SUM(oi.Quantity) DESC
    `;
    const topProductsResult = await request.query(topProductsQuery);
    const topProducts = topProductsResult.recordset;

    // 8. So sánh doanh thu với tháng trước (dựa trên OrderItems.Price * OrderItems.Quantity, áp dụng điều kiện 'Đã giao' và 'Đã thanh toán')
    const revenueComparisonQuery = `
      SELECT 
        SUM(CASE WHEN MONTH(o.OrderDate) = MONTH(GETDATE()) AND YEAR(o.OrderDate) = YEAR(GETDATE()) THEN oi.Price * oi.Quantity ELSE 0 END) as currentMonth,
        SUM(CASE WHEN MONTH(o.OrderDate) = MONTH(DATEADD(MONTH, -1, GETDATE())) AND YEAR(o.OrderDate) = YEAR(DATEADD(MONTH, -1, GETDATE())) THEN oi.Price * oi.Quantity ELSE 0 END) as lastMonth
      FROM OrderItems oi
      JOIN Orders o ON oi.OrderId = o.OrderId
      JOIN (
        SELECT OrderId, Status
        FROM Payments p1
        WHERE p1.CreatedAt = (
          SELECT MAX(p2.CreatedAt)
          FROM Payments p2
          WHERE p2.OrderId = p1.OrderId
        )
      ) pay ON o.OrderId = pay.OrderId
      WHERE o.Status = 'Đã giao'
        AND pay.Status = 'Đã thanh toán'
    `;
    const revenueComparisonResult = await request.query(revenueComparisonQuery);
    const { currentMonth, lastMonth } = revenueComparisonResult.recordset[0];
    const revenueChange = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;

    // 9. Số sản phẩm mới (thêm trong tháng này)
    const newProductsQuery = `
      SELECT COUNT(*) as newProducts
      FROM Products
      WHERE MONTH(CreatedAt) = MONTH(GETDATE()) AND YEAR(CreatedAt) = YEAR(GETDATE())
    `;
    const newProductsResult = await request.query(newProductsQuery);
    const newProducts = newProductsResult.recordset[0].newProducts || 0;

    // 10. So sánh số đơn hàng với tháng trước
    const ordersComparisonQuery = `
      SELECT 
        COUNT(CASE WHEN MONTH(OrderDate) = MONTH(GETDATE()) AND YEAR(OrderDate) = YEAR(GETDATE()) THEN 1 END) as currentMonth,
        COUNT(CASE WHEN MONTH(OrderDate) = MONTH(DATEADD(MONTH, -1, GETDATE())) AND YEAR(OrderDate) = YEAR(DATEADD(MONTH, -1, GETDATE())) THEN 1 END) as lastMonth
      FROM Orders
    `;
    const ordersComparisonResult = await request.query(ordersComparisonQuery);
    const { currentMonth: currentOrders, lastMonth: lastOrders } = ordersComparisonResult.recordset[0];
    const ordersChange = lastOrders > 0 ? ((currentOrders - lastOrders) / lastOrders) * 100 : 0;

    // 11. Số khách hàng mới (thêm trong tháng này)
    const newCustomersQuery = `
      SELECT COUNT(*) as newCustomers
      FROM Users
      WHERE Role = 'Customer'
        AND MONTH(CreatedAt) = MONTH(GETDATE())
        AND YEAR(CreatedAt) = YEAR(GETDATE())
    `;
    const newCustomersResult = await request.query(newCustomersQuery);
    const newCustomers = newCustomersResult.recordset[0].newCustomers || 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalProducts,
        totalOrders,
        totalCustomers,
        salesData,
        productCategoryData,
        topProducts,
        revenueChange,
        newProducts,
        ordersChange,
        newCustomers,
      },
    });
  } catch (err) {
    console.error('API /api/admin/dashboard - Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu thống kê', error: err.message });
  }
});

io.on('connection', (socket) => {
  console.log('[Socket.io] Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('[Socket.io] Client disconnected:', socket.id);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));