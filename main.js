const dir = {
  "loginData": "security/users.json",
  "usersInfo": "bigUsersData/usersInfo.json",
  "settings":  "./settings.json",
  "modules":   "./modules",
  "template": {
    "login": __dirname + "/template/login",
    "index": __dirname + "/cache",
  }
}

require('./tool/fileFix');

const express = require('express'), app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const { writeFileSync, readFileSync, readdirSync} = require('fs');
const cookieParser = require('cookie-parser');

settings = require(dir.settings);
l = require('./console/log');

loginData = JSON.parse(readFileSync(dir.loginData, 'utf8'));
usersInfo = JSON.parse(readFileSync(dir.usersInfo, 'utf8'));

app.use(session({secret: 'my-secret-key', resave: true, saveUninitialized: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('json spaces', 2);
 
//Kiểm tra Request
app.use((req, res, next) => {
  l('mission', decodeURI(req.url));
  next();
});


//Khởi chạy modules
const modules = readdirSync(dir.modules).filter((f)=>f.endsWith(".js"));

var listModules = {
  "length": 0,
  "homePageModules": [],
  "modules": []
};
caches = new Object();

for (var i of modules) {
  try {
    var FileName = i.split('.')[0]; // Tách đuôi file
    var { info, get} = require(dir.modules+'/'+i);
    if (settings["dont-load-modules"].includes(i)){
      l("dontload",i+" bị tắt!")
    }else{
      if (!info || !get){
        l("mdlerr",FileName+" không đủ nội dung!")
        global.client.errorLog.modules.push(i);
      }else{
        var mname = info.name;
          listModules.modules.push(info);
          listModules.length+=1;
        try{
          app.get("/"+FileName,get);
          l("getmdl", mname+" khởi dộng thành công")
        }catch(e){
          l("mdlerr", e)
        //  global.client.errorLog.modules.push(i);
        };
      }
    }
  }catch(e) {
    log("mdlerr",`${i} || ${e.name} - ${e.message}`);
    // global.client.errorLog.modules.push(i);
  }
}

//Thêm modules vào Trang chủ
const itemTemplate = `
  <a href="%productURL%" class="iTem">
    <div class="u-container-layout-1">
      <span class="u-icon-1">
        <img src="%thumbnail%" alt=""/>
      </span>
      <h4 class="u-text-3">%name%</h4>
      <p class="u-text-4">%description%</p>
    </div>
  </a>
`;

//Danh sách sản phẩm trên trang chủ

caches.mdLength = 0;

for (i of listModules.modules) {
  if (i.setHomePage) {
    listModules.homePageModules.push(i);
      caches.mdLength++;
    if (caches.mdLength >= settings.numberOfPost) break; // dừng vòng lặp nếu đã đủ số lượng sản phẩm trên trang chủ
  }
}

console.log(listModules)


app.use('/login', express.static(dir.template.login));

app.get('/api', (req, res) => {
  if(req.query.get){
    switch (req.query.get){
       case 'homePageModules': res.json({status: 'success', message: `Dữ liệu của: ${req.query.get}`, data: listModules.homePageModules});
         break;
       case 'allModules': res.json({status: 'success', message: `Dữ liệu của: ${req.query.get}`, data: listModules.modules});
         break;
       default: res.json({status: 'error', message: `không tìm thấy: ${req.query.get}`});
    }
  }
});

// Trang chủ
app.get('/', (req, res) => {
    if (!loginData.find(u => u.cookie.includes(req.cookies.user))) {
      // Hủy cookie ở máy khách
      res.clearCookie('user');
      res.clearCookie('info');
    };
  
  if (req.query.search) {
    const searchQuery = req.query.search;
    const result = listModules.modules.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );


    if(result.length < 1){
      return res.json({status: 'notFound', message: `không tìm thấy: ${req.query.search}`});
    }
    return res.json({status: 'success', message: `Dữ liệu của: ${req.query.search}`, data: result});
  }
  
  return res.sendFile(__dirname + '/template/index/index.html');
    //res.sendFile(dir.template.index + '/index.html');

});
app.use("/", express.static(__dirname + '/template/index/'));
app.use("/", require("./router"));




// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  l('port', `Máy chủ  chạy ở cổng: ${PORT}`);
});
