/* eslint-disable no-undef */


// 輸入自己的api_key
const api_path = "kmapitest";

//建立API環境，利用axios.create來建立統整，簡潔程式碼

const customerApi = axios.create({
  baseURL: `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}`,
  timeout: 5000,
});

//初始化
const init = () => {
  (async () => {
    try {
      const products = await getProducts();
      renderProducts(products);
      const carts = await getCart();
      renderCartAll(carts);
      checkForm();
    } catch (err) {
      console.log(err);
    }
  })();
};

// 取得產品列表
const getProducts = async () => {
  try {
    const res = await customerApi.get("/products");
    const { products } = res.data;
    return products;
  } catch (error) {
    console.log(error);
  }
};

// 取得購物車列表
const getCart = async () => {
  try {
    const res = await customerApi.get("/carts");
    const carts = res.data;
    return carts;
  } catch (error) {
    console.log(error);
  }
};

// 加入購物車
const addCart = async (id, count) => {
  try {
    const res = await customerApi.post("/carts", {
      data: {
        productId: id,
        quantity: count,
      },
    });
    const carts = res.data;
    return carts;
  } catch (error) {
    console.log(error);
  }
};

// 修改購物車數量
const updateCart = async (id, count) => {
  try {
    const res = await customerApi.patch(`/carts`, {
      data: {
        id,
        quantity: count,
      },
    });
    const carts = res.data;
    return carts;
  } catch (error) {
    console.log(error);
  }
};

// 刪除購物車單筆
const deleteCart = async (id) => {
  try {
    const res = await customerApi.delete(`/carts/${id}`);
    const carts = res.data;
    return carts;
  } catch (error) {
    console.log(error);
  }
};

// 刪除購物車全部
const deleteAllCart = async () => {
  const res = await customerApi.delete(`/carts`);
  const carts = res.data;
  return carts;
};

// 新增訂單
const addOrder = async (data) => {
  try {
    const res = await customerApi.post("/orders", {
      data,
    });
    const order = res.data;
    return order;
  } catch (error) {
    console.log(error);
  }
};

// 渲染產品列表
const productWrap = document.querySelector(".productWrap");
const renderProducts = (products) => {
  let str = "";
  products.forEach((item) => {
    str += `
            <li class="productCard">
              <h4 class="productType">新品</h4>
              <img src="${item.images}" alt="">
              <a href="#" data-id="${item.id}" class="addCardBtn">加入購物車</a>
              <h3>${item.title}</h3>
              <del class="originPrice">NT$ ${thousands(item.origin_price)}</del>
              <p class="nowPrice">NT$ ${thousands(item.price)}</p>
            </li>
          `;
  });
  productWrap.innerHTML = str;
};

// 監聽產品種類選擇
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", (e) => {
  const category = e.target.value;
  (async () => {
    try {
      const products = await getProducts();
      const filterProducts = products.filter((item) => {
        return item.category === category;
      });
      renderProducts(filterProducts);
    } catch (err) {
      console.log(err);
    }
  })();
});

// 監聽加入購物車按鈕
productWrap.addEventListener("click", (e) => {
  e.preventDefault();
  const addCardBtn = e.target.closest(".addCardBtn");
  if (addCardBtn) {
    const productId = addCardBtn.dataset.id;
    (async () => {
      try {
        const cartslist = await getCart();
        const cart = cartslist.carts.find((item) => {
          return item.product.id === productId;
        });
        // 判斷購物車是否有此商品
        if (cart) {
          const count = cart.quantity + 1;
          const carts = await updateCart(cart.id, count);
          renderCartAll(carts);
        } else {
          const carts = await addCart(productId, 1);
          renderCartAll(carts);
        }
        changeFinishAlert("加入購物車成功");
      } catch (err) {
        console.log(err);
      }
    })();
  }
});

// 渲染購物車

const renderCartAll = (data) => {
  const shoppingCart = document.querySelector(".shoppingCart");
  const orderInfo = document.querySelector(".orderInfo");
  if (data.carts.length > 0) {
    shoppingCart.classList.remove("hidden");
    orderInfo.classList.remove("hidden");
    renderCart(data.carts);
    renderCartTotal(data.finalTotal);
  } else {
    shoppingCart.classList.add("hidden");
    orderInfo.classList.add("hidden");
  }
};

// 渲染購物車列表
const cartWrap = document.querySelector(".cartWrap");
const renderCart = (carts) => {
  let str = "";
  carts.forEach((item) => {
    str += `<tr>
              <td>
                  <div class="cardItem-title">
                      <img src="${item.product.images}" alt="">
                      <p>${item.product.title}</p>
                  </div>
              </td>
              <td>NT$ ${thousands(item.product.origin_price)}</td>
              <td>${item.quantity}</td>
              <td>NT$ ${thousands(item.product.price)}</td>
              <td class="discardBtn">
                  <a href="#"  class="discardBtnId material-icons" data-id="${
                    item.id
                  }">
                      clear
                  </a>
              </td>
            </tr>`;
  });
  cartWrap.innerHTML = str;
};

// 渲染購物車金額
const renderCartTotal = (num) => {
  const cartTotal = document.querySelector(".cartTotal");
  cartTotal.textContent = `NT$ ${thousands(num)}`;
};

// 狀態更改完成提示
const changeFinishAlert = (str) => {
  Swal.fire({
    position: "top-end",
    icon: "success",
    title: str,
    showConfirmButton: false,
    timer: 1500,
  });
};

// 更改失敗提示
const changeFailAlert = (str) => {
  Swal.fire({
    position: "top-end",
    icon: "error",
    title: str,
    showConfirmButton: false,
    timer: 1500,
  });
};

// 監聽購物車刪除按鈕
cartWrap.addEventListener("click", (e) => {
  e.preventDefault();
  const discardBtn = e.target.closest(".discardBtnId");
  if (discardBtn) {
    const id = discardBtn.dataset.id;
    (async () => {
      try {
        const carts = await deleteCart(id);
        renderCartAll(carts);
        changeFinishAlert("刪除成功");
      } catch (err) {
        console.log(err);
      }
    })();
  }
});

// 監聽購物車刪除全部按鈕
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  (async () => {
    try {
      const carts = await deleteAllCart();
      renderCartAll(carts);
      changeFinishAlert("清空購物車成功");
    } catch (err) {
      console.log(err);
      changeFailAlert(err.response.data.message);
    }
  })();
});

// 驗證表單規則
const constraints = {
  name: {
    presence: {
      allowEmpty: false,
      message: "必填，請輸入姓名",
    },
  },
  tel: {
    presence: {
      allowEmpty: false,
      message: "必填，請輸入電話",
    },
    format: {
      pattern: "^09[0-9]{8}$",
      message: "格式錯誤，請輸入正確電話格式",
    },
  },
  email: {
    presence: {
      allowEmpty: false,
      message: "必填，請輸入電子郵件",
    },
    email: {
      message: "格式錯誤，請輸入正確電子郵件格式",
    },
  },
  address: {
    presence: {
      allowEmpty: false,
      message: "必填，請輸入地址",
    },
  },
  tradeway: {
    presence: {
      allowEmpty: false,
      message: "必填，請選擇付款方式",
    },
  },
};

// 驗證輸入內容
let formErrors = true;
const checkForm = () => {
  const inputs = document.querySelectorAll(".orderInfo-input");
  inputs.forEach((item) => {
    item.addEventListener("blur", () => {
      //先清除錯誤訊息及狀態
      item.nextElementSibling.textContent = "";
      formErrors = false;

      // 驗證單一欄位
      const errors = validate(orderForm, constraints);

      // 渲染錯誤訊息及狀態
      if (errors) {
        Object.keys(errors).forEach((key) => {
          const error = document.getElementById(`customer${key}`);
          const messageElement = error.nextElementSibling;
          const messageText = errors[key].toString().split(" ")[1];
          messageElement.textContent = messageText;
          formErrors = true;
        });
      }
    });
  });
};

// 監聽表單送出

const orderForm = document.querySelector(".orderInfo-form");
orderForm.addEventListener("click", (e) => {
  e.preventDefault();
  const submitBtn = e.target.closest(".orderInfo-btn");
  if (submitBtn && !formErrors) {
    const name = document.querySelector("#customername").value;
    const tel = document.querySelector("#customertel").value;
    const email = document.querySelector("#customeremail").value;
    const address = document.querySelector("#customeraddress").value;
    const tradeway = document.querySelector("#customertradeway").value;
    const order = {
      user: { name, tel, email, address, payment: tradeway },
    };
    (async () => {
      try {
        await addOrder(order);
        changeFinishAlert("訂單送出成功");
        orderForm.reset();
        const carts = await getCart();
        renderCartAll(carts);
      } catch (err) {
        console.log(err);
        changeFailAlert(err.response.data.message);
      }
    })();
  }
});

// 千分位
const thousands = (value) => {
  if (value) {
    value += "";
    const arr = value.split(".");
    const re = /(\d{1,3})(?=(\d{3})+$)/g;
    return arr[0].replace(re, "$1,") + (arr.length == 2 ? "." + arr[1] : "");
  } else {
    return "";
  }
};

init();
