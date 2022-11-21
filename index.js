// 輸入自己的api_key
const api_path = "kmapitest";
const token = "L9wcq4qbltS3NJ1U4P2Dk00lSUE3";

//建立API環境，利用axios.create來建立統整，簡潔程式碼

const customerApi = axios.create({
  baseURL: `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}`,
  timeout: 5000,
});

const adminApi = axios.create({
  baseURL: `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}`,
  headers: {
    Authorization: token,
  },
  timeout: 5000,
});

//初始化
const init = async () => {
  try {
    const products = await getProducts();
    renderProducts(products);
    const carts = await getCarts();
    renderCarts(carts);
  } catch (error) {
    console.log(error);
  }
};

//渲染產品列表
const productsList = document.querySelector("#products-list");
const renderProducts = (data) => {
  let str = "";
  data.forEach((item) => {
    str += `<li class="">
              <div class=" relative">
                 <img src="${item.images}" alt="">
                <span class="px-6 py-2 bg-black text-white absolute right-0 top-2" >新品</span>
                <button data-id=${item.id} class="w-full px-6 py-2 bg-black text-white text-center mb-2" >加入購物車</button>
                <h2 class="text-lg font-bold mb-2">${item.title}</h2>
                <p class="line-through mb-2">NT$${item["origin_price"]}</p>
                <p class="text-xl font-bold">NT$${item.price}</p>
              </div>
            </li>`;
  });
  productsList.innerHTML = str;
};

//渲染購物車項目
const cartsList = document.querySelector("#carts-list");
const renderCartsContent = (data) => {
  let str = "";
  data.forEach((item) => {
    str += `<tr class="border-b border-[#BFBFBF]">
              <td class="py-5 ">
                <div class="flex items-center ">
                  <img class="h-[80px]" src="${item.product.images}" alt="">
                  <p class="ml-2">${item.product.title}</p>
                </div>
              </td>
              <td>${item.product.price}</td>
              <td>${item.quantity}</td>
              <td>${item.product.price * item.quantity}</td>
              <td>
                <button data-id=${item.id} class="delete-cart-btn">刪除</button>
              </td> 
            </tr>`;
  });
  cartsList.innerHTML = str;
};

// 渲染表尾金額
const renderTotalPrice = (data) => {
  const totalPrice = document.querySelector("#total-price");
  totalPrice.textContent = data;
};

// 渲染購物車
const renderCarts = (data) => {
  renderCartsContent(data.carts);
  renderTotalPrice(data.finalTotal);
};

//問題一：初始化，取得產品與購物車列表

const getProducts = async () => {
  try {
    const result = await customerApi.get("/products");
    const { products } = result.data;
    return products;
  } catch (err) {
    console.log(err);
  }
};

const getCarts = async () => {
  try {
    const cartsResult = await customerApi.get("/carts");
    const carts = cartsResult.data;
    return carts;
  } catch (err) {
    console.log(err);
  }
};

//監聽產品項目按鈕
productsList.addEventListener("click", (e) => {
  if (e.target.nodeName === "BUTTON") {
    const productId = e.target.dataset.id;
    // 判定是否有產品已經在購物車內，有則數量+1，沒有則新增
    let count = 1;
    (async (id) => {
      const check = await checkItemCarts(id);
      if (check) {
        count = check.quantity + 1;
      }
      const newCarts = await postCarts(id, count);
      renderCarts(newCarts);
    })(productId);
  }
});

// 確認是否品項已在購物車內

const checkItemCarts = async (ProductId) => {
  try {
    const carts = await getCarts();
    const checkItem = carts.carts.filter(
      (item) => item.product.id === ProductId
    );
    if (checkItem.length > 0) {
      return {
        check: true,
        quantity: checkItem[0].quantity,
      };
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
  }
};

//問題二：新增購物車品項，並再次初始化購物車列表

const postCarts = async (ProductId, count) => {
  try {
    const result = await customerApi.post("/carts", {
      data: {
        productId: ProductId,
        quantity: count,
      },
    });
    const carts = result.data;
    return carts;
  } catch (err) {
    console.log(err);
  }
};

// 修改購物車品項數量

const patchCarts = async (cartId, count) => {
  try {
    const result = await customerApi.patch(`/carts`, {
      data: {
        id: cartId,
        quantity: count,
      },
    });
    const carts = result.data;
    return carts;
  } catch (err) {
    console.log(err);
  }
};

//問題三：修改購物車狀態(刪除全部、刪除單筆)，並再次初始化購物車列表

//刪除單筆
const deleteCarts = async (ProductId) => {
  try {
    const result = await customerApi.delete(`/carts/${ProductId}`);
    const carts  = result.data;
    return carts;
  } catch (err) {
    console.log(err);
  }
};

//刪除全部
const deleteAllCarts = async () => {
  try {
    const result = await customerApi.delete("/carts");
    const carts = result.data;
    return carts;
  } catch (err) {
    console.log(err);
  }
};

//監聽購物車按鈕

const cartsListTotal = document.querySelector("#carts-list-total");
cartsListTotal.addEventListener("click", (e) => {
  if (e.target.getAttribute("class") === "delete-cart-btn") {
    const productId = e.target.dataset.id;
    deleteCarts(productId).then((res) => renderCarts(res));
  }
  if (e.target.id === "delete-all-cart-btn") {
    deleteAllCarts().then((res) => renderCarts(res));
  }
});

//問題四：送出購買訂單，並再次初始化購物車列表

const testData = {
  data: {
    user: {
      name: "六角學院",
      tel: "07-5313506",
      email: "hexschool@hexschool.com",
      address: "高雄市六角學院路",
      payment: "Apple Pay",
    },
  },
};

const postOrder = async (data) => {
  try {
    const result = await customerApi.post("/orders", data);
    const res = result.data;
    init();
    console.log(res);
    // return res;
  } catch (err) {
    console.log(err);
  }
};

// postOrder(testData)

//問題五：觀看後台訂單

const getOrder = async () => {
  try {
    const result = await adminApi.get("/orders");
    const { orders } = result.data;
    // return orders;
    console.log(orders);
  } catch (err) {
    console.log(err);
  }
};

// getOrder()

init();
