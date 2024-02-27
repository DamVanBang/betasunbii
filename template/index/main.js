//Tải DCM
const searchInput = document.getElementById("searchInput");
const searchNoti = document.querySelector('.searchNoti');
const hLogo = document.querySelector('.hLogo');
const class_e = document.querySelector('.e');
const loadAllModules = document.querySelector('.loadAllModules');
const listModules = document.getElementById("listModules");
const userName = document.getElementById("userName");
const loginButton = document.getElementById("loginButton");


// Tách các phần của cookie bằng dấu chấm phẩy và khoảng trắng
var cookieParts = document.cookie.split("; ");
var cookieObject = {};

// Lặp qua các phần của cookie và phân tích chúng thành cặp key-value
cookieParts.forEach(function(part) {
  var keyValue = part.split("=");
  var key = keyValue[0];
  var value = keyValue[1];
  cookieObject[key] = value;
});

// Lấy thông tin từ user và info nếu chúng tồn tại trong cookieObject
var userInfo = {};

if(cookieObject.user){
  userInfo = JSON.parse(decodeURIComponent(cookieObject.info));
  userName.textContent = userInfo.name;
  userName.setAttribute("for", "account");
}else{
  userName.textContent = "Đăng nhập";
  loginButton.href= "/login";

}

//click vào input search
searchInput.addEventListener('click', function() {
  hLogo.classList.add('anMenu');
  class_e.classList.add('anMenu');
});
searchInput.addEventListener('blur', function() {
  hLogo.classList.remove('anMenu');
  class_e.classList.remove('anMenu');
console.log(searchInput.value);
  if(!searchInput.value){
    loadPage();
  };
});


searchInput.addEventListener('keydown', function(event) {
  // Kiểm tra xem phím đã được ấn có phải là Enter không (mã phím Enter là 13)
  if (event.keyCode === 13) {
    const searchText = searchInput.value;
    searchInput.placeholder = searchText;
    document.title = searchText+" - SUNBII";
    if(searchText){
      fetch('/?search='+searchText, { method: 'GET' })
      .then(response => response.json())
      .then(m => {
        if(m.startus = "success" && m.data){
          listModulesCreate(m.data);
        }else if(m.startus = "notFound"){
          searchNotiControl(true);
          listModules.style.opacity = "0";
          setTimeout(()=>listModules.innerHTML = "", 250);
          searchNoti.textContent = "Không tìm thấy kết quả cho: " + searchText;
        }
      }).catch(e => {console.error('Error:', e)});
    }
  }
});

// Mẫu HTML cho mỗi mô-đun
const itemTemplate = `
    <a class='iTem' href='%productURL%'>
      <div class='u-container-layout-1'>
        <span class='u-icon-1'>
          <img alt='' src='%thumbnail%'/>
        </span>
        <h4 class='u-text-3'>%name%</h4>
        <p class='u-text-4'>%description%</p>
      </div>
    </a>
  `;

// Kết hợp các chuỗi HTML thành một chuỗi duy nhất và Gán chuỗi HTML vào innerHTML của phần tử listModules
function listModulesCreate(m) {
  searchNotiControl(false);
  listModules.style.opacity = "0";
  setTimeout(()=>{
    listModules.innerHTML = m.map(m => {
      return itemTemplate
        .replace("%thumbnail%", m.thumbnail)
        .replace(/%name%/g, m.name)
        .replace(/%productURL%/g, m.URL)
        .replace("%description%", m.description);
    }).join('');
    listModules.style.opacity = "1";
  }, 250)
 
  
};

function searchNotiControl(i) {
  switch (i) {
    case true : {
      searchNoti.style.display = "block";
      setTimeout(()=>searchNoti.style.opacity = "1", 250);
      break;
    }
    case false: {
      searchNoti.style.opacity = "0";
      setTimeout(()=>searchNoti.style.display = "none", 250);
      break;
    }
    case 'loadAllModules': setTimeout(()=>loadAllModules.style.opacity = "1", 500);
      break;
    }
}
//Tải trang web
function loadPage() {
    document.title = "Trang chủ - SUNBII";
  searchNotiControl('loadAllModules');
    fetch('/api?get=homePageModules', {method: 'GET'})
      .then(r => r.json()).then(m => {
        if(m.startus = "success" && m.data) return listModulesCreate(m.data);
        console.log(m);
      }).catch(e => {
        console.error('Error:', e)
      });
    ;
  }

// Xử lý sự kiện khi người dùng click vào nút "Tải toàn bộ trang web"
function loadFullModules() {
  fetch('/api?get=allModules', {
      method: 'GET'
    })
    .then(response => response.json())
    .then(m => {
      if(m.startus = "success" && m.data) return listModulesCreate(m.data);
      console.log(m);
    }).catch(e => {
      console.error('Error:', e)
    });
};