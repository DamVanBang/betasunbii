const dir = {
  "loginData": "security/users.json",
  "usersInfo": "bigUsersData/usersInfo.json",
  "template": {
    "login": __dirname + "/template/login",
    "index": __dirname + "/cache",
  }
}
// Trang đăng nhập

const { writeFileSync, readFileSync, readdirSync} = require('fs');
const app = require("express").Router();


function updateloginData() {
  writeFileSync(dir.loginData, JSON.stringify(loginData, null, 2));
};


function updateUsersInfo() {
  writeFileSync(dir.usersInfo, JSON.stringify(usersInfo, null, 2));
};


// Hàm lấy thời gian
function timeNow(){
  return new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' })
}
// Hàm để tạo chuỗi ngẫu nhiên
function cookieR(length) {
    const a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let d = '';
    for (let i = 0; i < length; i++) {
        const r = Math.floor(Math.random() * a.length);
        d += a.charAt(r);
    }
    return d;
};



app.get('/login', (req, res) => {
  if (loginData.find(u => u.cookie.includes(req.cookies.user))) {
      return res.redirect('/');
  };
    res.sendFile(dir.template.login + '/login.html');
});


app.post('/login', (req, res) => {
  console.log(req.cookies);
  const { username, password } = req.body;
  console.log(req.body)
  const user = loginData.find(u => u.username === username);
  const userInfo = usersInfo.find(u => u.username === username);
    if (!user) {
      return res.json({status: 'account not found', message: 'Tài khoản không tồn tại!'});
    }else if(user.password !== password){
      return res.json({status: 'wrong password', message: 'Sai mật khẩu!'});
    };


    const newCookie = cookieR(20);
    user.cookie.push(newCookie);
    req.session.user = { username };
    res.cookie('user', newCookie);
    res.cookie('info', JSON.stringify(userInfo));
    res.json({status: 'success'});
    updateloginData();
  
});



// Trang đăng ký
app.get('/signup', (req, res) => {
    if (loginData.find(u => u.cookie.includes(req.cookies.user))) {
      // Nếu đã đăng nhập, chuyển hướng về trang chủ
    return res.redirect('/');
  };
    res.sendFile(__dirname + '/signup.html');
});

app.post('/signup', (req, res) => {
    const { newUsername, newPassword, email, tel, name, gender, birthday } = req.body;
    const existingUser = loginData.find(user => user.username === newUsername);
    if (existingUser) {
        return res.json({"status": "error", "message": "Tài khoản đã tồn tại"});
    }

  if(newUsername.split("").length < 8){
    return res.json({"status": "error", "message": "User name phải có trên 8 ký tự"});
  }

  if(!newPassword){
    return res.json({"status": "error", "message": "Không được để trống mật khẩu"});
  }


  const maxUid = Math.max(...loginData.map(user => parseInt(user.uid, 10))) || 0;
  const newUid = isFinite(maxUid) ? (maxUid + 1).toString() : "1"
  const newCookie = cookieR(20);

    loginData.push(
      {
        username: newUsername,
        password: newPassword,
        uid: newUid,
        email: email,
        tel: tel,
        dateCreated: timeNow(),
        cookie: [newCookie]
      });

     const userInfo = {
       username: newUsername,
       uid: newUid,
       name: name,
       gender: gender, 
       birthday: birthday,
       email: email,
       tel: tel,
       userData: newUid
     }


     usersInfo.push(userInfo);

  req.session.user = { newUsername };
  res.cookie('user', newCookie);
  res.cookie('info', JSON.stringify(userInfo));
  updateloginData();
  updateUsersInfo();
  res.json({"status": "success"})

});


// Đổi mật khẩu
app.get('/changepassword', (req, res) => {
    // Kiểm tra xem người dùng có đăng nhập không
    if (!loginData.find(u => u.cookie.includes(req.cookies.user))) {
        return res.redirect('/login');
    }
    res.sendFile(__dirname + '/changepassword.html');
});

app.post('/changepassword', (req, res) => {
  
    const { oldPassword, newPassword } = req.body;
    const userIndex = loginData.findIndex(u => u.cookie.includes(req.cookies.user));

    if (userIndex === -1) {
        // Người dùng không đăng nhập, chuyển hướng về trang đăng nhập
        return res.redirect('/login');
    }

    const user = loginData[userIndex];

    if (user.password !== oldPassword) {
        // Mật khẩu cũ không chính xác
        return res.json({status: 'oldPassword', message: 'Mật khẩu cũ không chính xác'});
    }else if (!newPassword) {
      // Mật khẩu cũ không chính xác
      return res.json({status: 'newPassword', message: 'Thiếu mật khẩu mới'});
  }

    // Cập nhật mật khẩu mới
    user.password = newPassword
  const newCookie = cookieR(20);
  user.cookie = [newCookie];
  res.cookie('user', newCookie);
  
  updateloginData();
  res.json({"status": "success"});
});


// Trang đăng xuất

app.post('/changeinfo', (req, res) => {
    const {newUsername,  email, tel, name, gender, birthday, password } = req.body;

    const userIndex = loginData.findIndex(u => u.cookie.includes(req.cookies.user));
    if (userIndex === -1) {
        // Người dùng không đăng nhập, chuyển hướng về trang đăng nhập
        return res.redirect('/login');
    }



    const userLogin = loginData[userIndex];
    const userInfoIndex = usersInfo.findIndex(u => u.username === userLogin.username);

  if (password !== userLogin.password) {
      // Mật khẩu không chính xác
      return res.json({"status": "error", "message": "Sai mật khẩu"});
  }

  
  //Sự kiện thay đổi thông tin
  const user = usersInfo[userInfoIndex];
  if(newUsername){
    user.username = newUsername;
    userLogin.username = newUsername;
  };
  if(email){
    user.email = email;
    userLogin.email = email;
  };
  if(tel){
    user.tel = tel;
    userLogin.tel = tel;
  };
  if(name){
    user.name = name;
  };
  if(gender){
    user.gender = gender;
  };
  if(birthday){
    user.birthday = birthday;
  };

  updateloginData();
  updateUsersInfo();
  res.cookie('info', JSON.stringify(user));
  res.json({"status": "success"});
});

app.get('/profile', (req, res) => {
  if (!loginData.find(u => u.cookie.includes(req.cookies.user))) {
      return res.redirect('/login');
  }else res.sendFile(dir.template.login + '/profile.html');

});

app.get('/logout', (req, res) => {

    // Tìm và cập nhật mảng cookie của người dùng khi đăng xuất
  const userIndex = loginData.findIndex(u => u.cookie.includes(req.cookies.user));  
    if (userIndex !== -1) {
        // Xóa cookie khỏi mảng cookie của người dùng
          loginData[userIndex].cookie = loginData[userIndex].cookie.filter(c => c !== req.cookies.user);
      
        updateloginData()
    };
    // Hủy bỏ session khi đăng xuất
    req.session.destroy();
    // Hủy cookie ở máy khách
    res.clearCookie('user');
    res.clearCookie('info');
    res.redirect('/');
});

module.exports = app;