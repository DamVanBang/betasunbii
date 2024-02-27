
  const fs = require('fs');
  const l = require('./../console/log');

  const fileDir = {
    "loginData": "security/users.json",
    "usersInfo": "bigUsersData/usersInfo.json"
  };

  const folderDir = {
    "bigUsersData": "./bigUsersData",
    "usersData": "./bigUsersData/usersData"
  };

// Tính năng 1: Tạo thư mục nếu chưa tồn tại
Object.keys(folderDir).forEach(key => {
  const folderPath = folderDir[key];
  if (!fs.existsSync(folderPath)) {
    l('error', `Không tìm thấy: ${folderPath}`);
    fs.mkdirSync(folderPath);
    l('success', `Tạo Thư mục: ${folderPath}`);

    // Tạo thêm tệp tin usersInfo.json trong thư mục mới tạo
    const filePath = fileDir.usersInfo;
    fs.writeFileSync(filePath, JSON.stringify([]));
    l('success', `Tạo Thư mục: ${filePath}`);
  }
});

  // Tính năng 2: Tạo tệp tin nếu chưa tồn tại
  Object.keys(fileDir).forEach(key => {
    const filePath = fileDir[key];
    if (!fs.existsSync(filePath)) {
      l('error', `Không tìm thấy: ${filePath}`);
      fs.writeFileSync(filePath, JSON.stringify([]));
      l('success', `Tạo file: ${filePath}`);
    }
  });

  // Tính năng 3: Xử lý lỗi tệp tin
  Object.keys(fileDir).forEach(key => {
    const filePath = fileDir[key];
    try {
      // Đọc nội dung tệp tin để kiểm tra xem có lỗi không
      JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      // Nếu có lỗi, đổi tên tệp tin và tạo tệp tin mới
      l('error', `Lỗi file  (${filePath})`);
      const newFilePath = `${filePath.replace(/\.json$/, '_Die.json')}`;
      fs.renameSync(filePath, newFilePath);
      fs.writeFileSync(filePath, JSON.stringify([]));
      l('success', `Thay đổi file: ${filePath}`);
    }
  });
l('system', `Hoàn thành quản lý Dữ liệu`);