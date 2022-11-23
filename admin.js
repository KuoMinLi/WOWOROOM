/* eslint-disable no-undef */

// 輸入自己的api_key
const api_path = "kmapitest";
const token = "L9wcq4qbltS3NJ1U4P2Dk00lSUE3";

//建立API環境，利用axios.create來建立統整，簡潔程式碼
const adminApi = axios.create({
  baseURL: `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}`,
  headers: {
    Authorization: token,
  },
  timeout: 5000,
});

// 初始化
const init = () => {
  (async () => {
    try {
      const order = await getOrder();
      renderOrder(order);
      renderC3DataFormat(order);
      renderC3orederFormat(order);
    } catch (err) {
      console.log(err);
    }
  })();
};

// 取得訂單
const getOrder = async () => {
  try {
    const result = await adminApi.get("/orders");
    const { orders } = result.data;
    return orders;
  } catch (err) {
    changeFailAlert(err.response.data.message);
  }
};

// 更改訂單狀態
const changeOrderStatus = async (orderId, status) => {
  const result = await adminApi.put(`/orders`, {
    data: {
      id: orderId,
      paid: status,
    },
  });
  return result.data;
};

// 刪除單筆訂單
const deleteOrderId = async (orderId) => {
  const result = await adminApi.delete(`/orders/${orderId}`);
  const { orders } = result.data;
  return orders;
};

// 刪除全部訂單
const deleteOrderAll = async () => {
  const result = await adminApi.delete(`/orders`);
  const { orders } = result.data;
  return orders;
};

// 渲染訂單列表
const orderList = document.querySelector("#order-list");
const renderOrder = (order) => {
  let str = "";
  order.forEach((item) => {
    // 取出個別訂單產品數量
    let products = "";
    item.products.forEach((product) => {
      products += `${product.title} x ${product.quantity} <br>`;
    });

    str += `<tr>
              <td>${item.createdAt}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                <p>${products}</p>
              </td>
              <td>${new Date(item.createdAt * 1000)
                .toISOString()
                .split("T")[0]
                .split("-")
                .join("/")}</td>
              <td class="orderStatus">
                <a  data-id=${item.id} href="#">${
      item.paid ? "已處理" : "未處理"
    }</a>
              </td>
              <td>
                <input data-id=${
                  item.id
                } type="button" class="delSingleOrder-Btn" value="刪除">
              </td>
            </tr>`;
  });
  orderList.innerHTML = str;
};

// 監聽按鈕 - 更改狀態 / 刪除單筆訂單
orderList.addEventListener("click", (e) => {
  e.preventDefault();
  const id = e.target.dataset.id;
  // 更改狀態
  if (e.target.nodeName === "A") {
    (async () => {
      try {
        if (e.target.textContent === "未處理") {
          await changeOrderStatus(id, true);
        } else if (e.target.textContent === "已處理") {
          await changeOrderStatus(id, false);
        }
        changeFinishAlert("訂單狀態已更改");
        init();
      } catch (err) {
        changeFailAlert(err.response.data.message);
      }
    })();

    // 刪除單筆訂單
  } else if (e.target.classList.contains("delSingleOrder-Btn")) {
    (async () => {
      try {
        await deleteOrderId(id);
        changeFinishAlert("訂單已刪除");
        init();
      } catch (err) {
        changeFailAlert(err.response.data.message);
      }
    })();
  }
});

// 監聽按鈕 - 刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  (async () => {
    try {
      const result = await deleteOrderAll();
      changeFinishAlert(result.data.message);
      init();
    } catch (err) {
      console.log(err);
      changeFailAlert(err.response.data.message);
    }
  })();
});

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

// 整理數據成C3所需格式
const renderC3DataFormat = (data) => {
  const allItem = data.reduce((acc, cur) => {
    cur.products.forEach((product) => {
      acc.push(product);
    });
    return acc;
  }, []);

  // 整理成{名稱: 營收金額}格式
  const itemMoney = allItem.reduce((acc, cur) => {
    if (!acc[cur.title]) {
      acc[cur.title] = cur.price * cur.quantity;
    } else {
      acc[cur.title] += cur.price * cur.quantity;
    }
    return acc;
  }, {});

  // 整理成陣列且依大到小排序
  const itemArr = Object.entries(itemMoney);
  const itemArrSort = itemArr.sort((a, b) => b[1] - a[1]);

  // 取出除前三名外的數據加總
  const otherCount = itemArrSort.slice(3).reduce((acc, cur) => {
    acc += cur[1];
    return acc;
  }, 0);

  // 取前三名
  const otherArr = ["其他", otherCount];
  const top3Arr = itemArrSort.slice(0, 3);
  const c3Data = [...top3Arr, otherArr];

  // 加入設計稿C3顏色
  const colorItem = ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"];
  const c3Color = c3Data.reduce((acc, cur, index) => {
    acc[cur[0]] = colorItem[index];
    return acc;
  }, {});

  renderC3(c3Data, c3Color, "#chart");
};

// 訂單處理比例
const renderC3orederFormat = (orders) => {
  const data = [
    ["未處理", orders.filter((item) => !item.paid).length],
    ["已處理", orders.filter((item) => item.paid).length],
  ];
  const color = {
    未處理: "#DACBFF",
    已處理: "#9D7FEA",
  };
  renderC3(data, color, "#chart2");
};

// C3.js
const renderC3 = (data, color, element) => {
  c3.generate({
    bindto: element, // HTML 元素綁定
    data: {
      type: "pie",
      columns: data,
      colors: color,
    },
  });
};

// 初始化
init();
