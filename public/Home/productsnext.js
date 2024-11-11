$(document).ready(function () {
  // Khởi tạo DataTable chỉ 1 lần khi trang được tải
  let dataTable;
  let apiUrl = "";  // Biến global cho API URL
  
  // Lấy domain từ API getDomain
  fetch('/api/getDomain')
    .then(response => response.json())
    .then(data => {
      console.log("Received domain from /api/getDomain:", data.domain);

      // Chuyển sang HTTP nếu domain là localhost
      apiUrl = data.domain.includes("localhost") ? data.domain.replace("https", "http") : data.domain;
      apiUrl += '/api/getProducts';  // Địa chỉ API lấy sản phẩm

      console.log("API URL being used:", apiUrl);

      // Khởi tạo DataTable sau khi có API URL
      dataTable = $('#dataTable').DataTable({
        ajax: {
          url: apiUrl,
          dataSrc: ''
        },
        columns: [
          { data: 'productId' },
          { data: 'name' },
          { data: 'price' },
          { data: 'category' },
          { data: 'stock' },
          { data: null, render: function (data, type, row) {
            return `<button class="editBtn" data-id="${row.productId}">Edit</button>
            <button class="deleteBtn" data-id="${row._id}">Delete</button>`;
          }}
        ]
      });

      // Hiển thị modal khi nhấn nút "Add"
      $('#addBtn').on('click', function () {
        $('#modalTitle').text('Add Product');  // Thay đổi tiêu đề modal
        $('#productModal').css('display', 'block');  // Hiển thị modal
        $('#productForm')[0].reset();  // Đặt lại form
        createProductId();  // Gọi hàm tạo ID sản phẩm
      });

      // Đóng modal khi nhấn vào <span> (x)
      $('.close').on('click', function () {
        $('#productModal').css('display', 'none');  // Ẩn modal
      });

      // Đóng modal khi nhấn ra ngoài modal
      $(window).on('click', function (event) {
        if (event.target === $('#productModal')[0]) {
          $('#productModal').css('display', 'none');  // Ẩn modal
        }
      });

      // Hàm tạo ID sản phẩm tự động
      function createProductId() {
        // Cập nhật URL cho API để gọi genPrID
        const genPrIDUrl = apiUrl.replace('/getProducts', '/genPrID');

        fetch(genPrIDUrl)
          .then(response => response.json())
          .then(response => {
            console.log('New Product ID:', response.productId);
            $('#productId').val(response.productId);  // Điền ID vào form
          })
          .catch(error => {
            console.error('Error fetching product ID:', error);
          });
      }

      // Xử lý khi nhấn nút "Save" trong form
      $('#AddproductForm').on('Addsubmit', function (event) {
        event.preventDefault();  // Ngăn chặn reload trang mặc định khi submit form

        const product = {
          productId: $('#productId').val(),
          name: $('#name').val(),
          price: $('#price').val(),
          category: $('#category').val(),
          stock: $('#stock').val()
        };

        // Cập nhật URL cho API để gửi sản phẩm mới
        const saveApiUrl = apiUrl.replace('/getProducts', '/addProduct');

        // Gửi thông tin sản phẩm tới API
        fetch(saveApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        })
          .then(response => response.json())
          .then(data => {
            alert(data.message);  // Thông báo khi thêm sản phẩm thành công
            dataTable.ajax.reload();  // Tải lại DataTable để hiển thị sản phẩm mới
            $('#productModal').css('display', 'none');  // Ẩn modal
          })
          .catch(error => {
            console.error('Error adding product:', error);
            alert('Error adding product');
          });
      });
    })
    .catch(error => console.error('Error fetching domain:', error));

    // Xử lý khi nhấn nút "Delete" trong bảng
$(document).on('click', '.deleteBtn', function() {
  const productId = $(this).data('id'); // Lấy productId từ data-id của nút xóa

  if (confirm('Are you sure you want to delete this product?')) {
    fetch(`/api/deleteProduct?productId=${productId}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      $('#dataTable').DataTable().ajax.reload(); // Tải lại DataTable để cập nhật sau khi xóa
    })
    .catch(error => {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    });
  }
});

// Xử lý khi nhấn nút "Edit"
$(document).on('click', '.editBtn', function() {
  const productId = $(this).data('id'); // Lấy productId từ data-id của nút chỉnh sửa

  // Fetch thông tin sản phẩm
  fetch(`/api/getProductById?productId=${productId}`)
    .then(response => response.json())
    .then(product => {
      // Điền thông tin vào form chỉnh sửa
      $('#productId').val(product.productId);
      $('#name').val(product.name);
      $('#price').val(product.price);
      $('#category').val(product.category);
      $('#stock').val(product.stock);

      $('#modalTitle').text('Edit Product');
      $('#productModal').css('display', 'block');
    })
    .catch(error => {
      console.error('Error fetching product for edit:', error);
    });
});

// Cập nhật khi submit form chỉnh sửa
$('#EditproductForm').on('Editsubmit', function(event) {
  event.preventDefault();

  const productId = document.getElementById('productId').value;
  const updatedProduct = {
    name: document.getElementById('name').value,
    price: document.getElementById('price').value,
    category: document.getElementById('category').value,
    stock: document.getElementById('stock').value,
  };

  // Gửi yêu cầu PUT để cập nhật sản phẩm
  fetch(`/api/editProduct?productId=${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProduct),
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    $('#dataTable').DataTable().ajax.reload(); // Tải lại DataTable để hiển thị sản phẩm mới
    $('#productModal').css('display', 'none'); // Đóng modal
  })
  .catch(error => {
    console.error('Error updating product:', error);
    alert('Error updating product');
  });
});

document.getElementById('backButton').addEventListener('click', function() {
    window.location.href = 'Home.html'; // Không cần thêm query string nữa
});


});
