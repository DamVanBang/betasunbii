exports.info = {
  "name": "Ổ đĩa đám mây",
  "type": "get",
  "setHomePage": true,
  "URL": "/3700",
  "id": "3700",
  "thumbnail": "https://cdn.gcooperp.com/public/product/202212021119372092980948.png",
  "description": "Lưu trữ đám mây",
  "tag": "đám mây"
};

/*
const tbody = require('fs').readFileSync(`./database/productPost/post/${exports.info.id}.html`, 'utf8');

const pInfo = `<div class="product-info">
      <img class="pImage" src="${exports.info.thumbnail}">
      <div class="product-details">
        <h1>${exports.info.name}</h1>
        <p class="price">Giá: ${exports.info.price}₫</p>
        <p class="description">${exports.info.description}</p>
        <a href="${config.zaloURL}" class="custom-btn btn mt-3">Liên hệ tư vấn qua zalo</a>
      </div>
    </div>`;

const html = (teleProductTemplate
  .replace("%main%", tbody)
  .replace("%productInfo%", pInfo))
  .replace(/%title%/g, exports.info.name + " - " + config.nameWebsite)
  .replace(/%description%/g, exports.info.description)
  .replace(/%thumbnail%/g, exports.info.thumbnail);
*/


exports.get = async (req, res, next) => res.send("SUCCESS");