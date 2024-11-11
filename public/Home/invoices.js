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
        apiUrl += '/api/getInvoices';  // Địa chỉ API lấy sản phẩm

        console.log("API URL being used:", apiUrl);

        // Khởi tạo DataTable sau khi có API URL
        dataTable = $('#dataTable').DataTable({
          ajax: {
            url: apiUrl,
            dataSrc: ''
          },
          columns: [
            { data: 'invoiceId' }, // Mã hóa đơn
            { data: 'customerName' }, // Tên khách hàng
            { data: 'totalAmount' }, // Tổng tiền
            { data: 'status' }, // Trạng thái
            { data: 'dateCreated' }, // Ngày tạo
            { data: null, render: function (data, type, row) {
              return `<button class="viewBtn" data-id="${row.invoiceId}">View</button>
            <button class="editBtn" data-id="${row.invoiceId}">Edit</button>
            <button class="deleteBtn" data-id="${row._id}">Delete</button>`;
            }}
          ]
        });

        // Mở modal khi nhấn nút Add
        $('#addInvoiceBtn').on('click', function () {
            $('#addInvoiceModal').css('display', 'block');
            createInvoiceId() 
        });

        // Đóng modal khi nhấn nút đóng
        $('#closeAddInvoiceModal').on('click', function () {
            $('#addInvoiceModal').css('display', 'none');
        });

        // Thêm sản phẩm mới vào form
        $('#addProductBtn').on('click', function () {
            const productItem = $('<div class="product-item">')
                .append('<input type="text" class="product-name" placeholder="Product Name" required>')
                .append('<input type="number" class="product-quantity" placeholder="Quantity" required>')
                .append('<span class="product-total">0</span>')
                .append('<button type="button" class="remove-product-btn">Remove</button>');
            
            $('#productContainer').append(productItem);
        });

        // Xóa sản phẩm
        $('#productContainer').on('click', '.remove-product-btn', function () {
            $(this).closest('.product-item').remove();
            updateTotalAmount();
        });
      }); // Thêm dấu ngoặc đóng cho phần `.then`


// Hàm tạo ID sản phẩm tự động
      function createInvoiceId() {
        // Cập nhật URL cho API để gọi genPrID
        const genPrIDUrl = apiUrl.replace('/getInvoices', '/genInvID');

        fetch(genPrIDUrl)
          .then(response => response.json())
          .then(response => {
            console.log('New Invoice ID:', response.productId);
            $('#InvoiceId').val(response.productId);  // Điền ID vào form
          })
          .catch(error => {
            console.error('Error fetching product ID:', error);
          });
      }

// Tự động hoàn tất tên sản phẩm
$('#productContainer').on('focus', '.product-name', function () {
    $(this).autocomplete({
        source: function (request, response) {
            $.ajax({
                // Sửa lại URL đúng với API của bạn
                url: `/api/searchProducts?name=${encodeURIComponent(request.term)}`, 
                type: "GET",
                success: function (data) {
                    response(data.map(product => ({
                        label: product.name, // Tên sản phẩm
                        value: product.name, // Tên sản phẩm khi chọn
                        quantity: product.stock, // Số lượng sản phẩm
                        price: product.price // Giá sản phẩm
                    })));
                },
                error: function () {
                    console.error("Error fetching product information.");
                }
            });
        },
        select: function (event, ui) {
            const $productItem = $(this).closest('.product-item');
            $productItem.find('.product-name').val(ui.item.label);  // Điền tên sản phẩm vào ô
            $productItem.find('.product-quantity').attr("max", ui.item.quantity);  // Cập nhật số lượng tối đa
            $productItem.find('.product-total').text(ui.item.price);  // Hiển thị giá sản phẩm
            $(this).data('productPrice', ui.item.price);  // Lưu giá vào phần tử
            updateTotalAmount();  // Cập nhật tổng số tiền
            return false;
        }
    });
});


    // Cập nhật tổng tiền
    $('#productContainer').on('input', '.product-quantity', function () {
        const $this = $(this);
        const maxQuantity = parseInt($this.attr("max")) || 0;
        
        // Kiểm tra số lượng
        if ($this.val() > maxQuantity) {
            alert(`Max quantity available is ${maxQuantity}`);
            $this.val(maxQuantity); // Giới hạn số lượng theo max
        }
        updateTotalAmount();
    });

    // Hàm cập nhật tổng tiền
    function updateTotalAmount() {
        let totalAmount = 0;
        $('#productContainer .product-item').each(function () {
            const quantity = parseInt($(this).find('.product-quantity').val()) || 0;
            const price = parseFloat($(this).find('.product-name').data('productPrice')) || 0;
            totalAmount += quantity * price;
        });
        $('#totalAmount').val(totalAmount.toFixed(2));
    }

document.getElementById('addsaveInvoiceBtn').addEventListener('click', function (event) {
    event.preventDefault();

    // Collect invoice data
    const invoiceId = document.getElementById('InvoiceId').value;
    const customerName = document.getElementById('customerName').value;
    const status = document.getElementById('status').value;
    const dateCreated = document.getElementById('dateCreated').value;
    const totalAmount = document.getElementById('totalAmount').value;

    // Collect product data
    const products = [];
    const productItems = document.querySelectorAll('.product-item');

    productItems.forEach(item => {
        const productName = item.querySelector('.product-name').value;
        const productQuantity = item.querySelector('.product-quantity').value;
        const productTotal = item.querySelector('.product-total').textContent;
        
        products.push({
            productName,
            productQuantity,
            productTotal
        });
    });

    // Prepare invoice data
    const invoiceData = {
        invoiceId,
        customerName,
        status,
        dateCreated,
        totalAmount,
        products
    };

    // Send data to the backend
    fetch('/api/addInvoice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Invoice saved:', data);
        alert('Invoice saved successfully');
        dataTable.ajax.reload(); 
        // Close the modal and reset the form if needed
        document.getElementById('addInvoiceModal').style.display = 'none';
    })
    .catch(error => {
        console.error('Error saving invoice:', error);
        alert('Failed to save invoice');
    });
});

// Xử lý khi nhấn nút "Delete" trong bảng
$(document).on('click', '.deleteBtn', function() {
  const productId = $(this).data('id'); // Lấy productId từ data-id của nút xóa

  if (confirm('Are you sure you want to delete this?')) {
    fetch(`/api/deleteInvoice?productId=${productId}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      $('#dataTable').DataTable().ajax.reload(); // Tải lại DataTable để cập nhật sau khi xóa
    })
    .catch(error => {
      console.error('Error deleting :', error);
      alert('Error deleting product');
    });
  }
});


// Khi nhấn nút Edit
$(document).on('click', '.editBtn', function() {
  const invoiceId = $(this).data('id'); // Lấy invoiceId từ button
  console.log('Đã nhấn nút Edit, invoiceId:', invoiceId); // Kiểm tra khi nhấn nút Edit

  // Fetch invoice data từ API
  fetch(`/api/getInvoiceById?invoiceId=${invoiceId}`)
    .then(response => response.json())
    .then(invoice => {
      console.log('Dữ liệu hóa đơn:', invoice); // Log dữ liệu hóa đơn để kiểm tra cấu trúc

      if (invoice) {
        // Điền giá trị vào trường Invoice ID
        $('#editInvoiceId').val(invoice.invoiceId); 
        console.log('Invoice ID:', invoice.invoiceId); // Kiểm tra giá trị invoiceId

        // Điền giá trị vào trường Customer Name
        $('#editCustomerName').val(invoice.customerName); 
        console.log('Customer Name:', invoice.customerName); // Kiểm tra giá trị customerName

        // Điền giá trị vào trường Status
        $('#editStatus').val(invoice.status); 
        console.log('Status:', invoice.status); // Kiểm tra giá trị status

        // Điền giá trị vào trường Date Created
        $('#editDateCreated').val(invoice.dateCreated); 
        console.log('Date Created:', invoice.dateCreated); // Kiểm tra giá trị dateCreated

        // Điền giá trị vào trường Total Amount
        $('#editTotalAmount').val(invoice.totalAmount); 
        console.log('Total Amount:', invoice.totalAmount); // Kiểm tra giá trị totalAmount

        // Handle the product list
        const productContainer = $('#editProductContainer');
        productContainer.empty(); // Clear the old product items

        // Add products to the container
if (invoice.products && Array.isArray(invoice.products)) {
  invoice.products.forEach((product, index) => {
    console.log('Sản phẩm:', product); // Log mỗi sản phẩm
    
    // Đảm bảo khai báo biến đúng trước khi sử dụng
    const productName = product.name || ''; // Tên sản phẩm
    const productQuantity = product.quantity || 0; // Số lượng
    const productTotal = (product.price * product.quantity) || 0; // Tổng tiền sản phẩm (Giá x Số lượng)
    
    // Append each product as a product item
    productContainer.append(`
      <div class="editProductItem">
        <input type="text" class="editProductName" value="${productName}" required>
        <input type="number" class="editProductQuantity" value="${productQuantity}" required min="0">
        <span class="editProductTotal">${productTotal}</span>
        <button type="button" class="editRemoveProductBtn">Remove</button>
      </div>
    `);
  });
}
        console.log('Danh sách sản phẩm:', invoice.products);

        // Cập nhật tiêu đề của modal
        $('#editModalTitle').text('Edit Invoice');
        $('#editInvoiceModal').css('display', 'block');
        console.log('Modal should now be visible.');
      } else {
        console.error('Dữ liệu hóa đơn không tồn tại.');
      }
    })
    .catch(error => {
      console.error('Lỗi khi lấy hóa đơn:', error);
    });
});

// Đóng modal khi nhấn vào nút span Close
$('#closeEditInvoiceModal').on('click', function () {
    console.log('Đã nhấn nút đóng modal'); // Kiểm tra khi nhấn nút đóng modal
    $('#editInvoiceModal').css('display', 'none'); // Đóng modal
});


// Thêm sản phẩm mới vào form trong modal sửa
$('#addEditProductBtn').on('click', function () {
    console.log('Thêm sản phẩm mới'); // Kiểm tra khi nhấn nút thêm sản phẩm

    const productItem = $('<div class="editProductItem">')
        .append('<input type="text" class="editProductName" placeholder="Product Name" required>')
        .append('<input type="number" class="editProductQuantity" placeholder="Quantity" required min="0">')
        .append('<span class="editProductTotal">0</span>')
        .append('<button type="button" class="editRemoveProductBtn">Remove</button>');
    
    $('#editProductContainer').append(productItem); // Thêm sản phẩm mới vào container
});

// Xóa sản phẩm trong modal sửa
$('#editProductContainer').on('click', '.editRemoveProductBtn', function () {
    console.log('Xóa sản phẩm'); // Kiểm tra khi nhấn nút xóa sản phẩm
    $(this).closest('.editProductItem').remove(); // Xóa sản phẩm khi nhấn nút "Remove"
    updateEditTotalAmount();
});

// Tự động hoàn tất tên sản phẩm
$('#editProductContainer').on('focus', '.editProductName', function () {
    $(this).autocomplete({
        source: function (request, response) {
            console.log("Autocomplete request term:", request.term); // Kiểm tra từ khóa tìm kiếm
            $.ajax({
                url: `/api/searchProducts?name=${encodeURIComponent(request.term)}`, 
                type: "GET",
                success: function (data) {
                    console.log("Autocomplete response data:", data); // Kiểm tra dữ liệu trả về từ server
                    response(data.map(product => ({
                        label: product.name,
                        value: product.name,
                        quantity: product.stock,
                        price: product.price
                    })));
                },
                error: function () {
                    console.error("Error fetching product information.");
                }
            });
        },
        select: function (event, ui) {
            console.log("Selected product:", ui.item); // Kiểm tra sản phẩm được chọn
            
            // Truy vấn trực tiếp mà không cần `.product-item`
            $('#editProductContainer').find('.editProductName').val(ui.item.label);  
            $('#editProductContainer').find('.editProductQuantity').attr("max", ui.item.quantity);  
            $('#editProductContainer').find('.editProductTotal').text(ui.item.price);  
            
            $(this).data('productPrice', ui.item.price);  // Lưu giá vào phần tử
            updateEditTotalAmount();  // Cập nhật tổng số tiền
            return false;
        }
    });
});




// Cập nhật tổng tiền
$('#editProductContainer').on('input', '.editProductQuantity', function () {
    const $this = $(this);
    const maxQuantity = parseInt($this.attr("max")) || 0;
    
    // Kiểm tra số lượng
    if ($this.val() > maxQuantity) {
        alert(`Max quantity available is ${maxQuantity}`);
        $this.val(maxQuantity); // Giới hạn số lượng theo max
    }
    updateEditTotalAmount();
});

function updateEditTotalAmount() {
    let totalAmount = 0;

    // Truy cập trực tiếp các trường mà không cần `.product-item`
    $('#editProductContainer .editProductQuantity').each(function (index) {
        const quantity = parseInt($(this).val()) || 0;
        const price = parseFloat($('#editProductContainer .editProductName').eq(index).data('productPrice')) || 0;

        // Kiểm tra log giá trị
        console.log("Quantity:", quantity, "Price:", price);

        totalAmount += quantity * price;
    });

    console.log("Total Amount:", totalAmount); // Kiểm tra tổng tiền trước khi hiển thị
    $('#editTotalAmount').val(totalAmount.toFixed(2));
}


// Cập nhật khi submit form chỉnh sửa hóa đơn
$('#editInvoiceForm').on('submit', function(event) {
  event.preventDefault();

  // Lấy thông tin ID hóa đơn và các dữ liệu từ form
  const invoiceId = document.getElementById('editInvoiceId').value;
  const updatedInvoice = {
    customerName: document.getElementById('editCustomerName').value,
    products: [], // Sẽ thêm chi tiết sản phẩm ở bên dưới
    totalAmount: parseFloat(document.getElementById('editTotalAmount').value),
    status: document.getElementById('editStatus').value,
    dateCreated: document.getElementById('editDateCreated').value,
  };

  // Lấy thông tin từng sản phẩm trong hóa đơn mà không cần tìm kiếm trong `.product-item`
  // Giả sử bạn có các trường như `.editProductName`, `.editProductQuantity`, và `.editProductPrice` cho mỗi sản phẩm
  $('.editProductName').each(function (index) {
    const productName = $(this).val();
    const quantity = parseInt($('.editProductQuantity').eq(index).val());
    const price = parseFloat($(this).data('productPrice'));

    // Nếu tên sản phẩm và số lượng hợp lệ, thêm vào mảng products
    if (productName && quantity > 0) {
      updatedInvoice.products.push({ name: productName, quantity: quantity, price: price });
    }
  });

  // Gửi yêu cầu PUT để cập nhật hóa đơn
  fetch(`/api/editInvoice?invoiceId=${invoiceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedInvoice),
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    $('#dataTable').DataTable().ajax.reload(); // Tải lại DataTable để hiển thị hóa đơn cập nhật
    $('#editInvoiceModal').css('display', 'none'); // Đóng modal
  })
  .catch(error => {
    console.error('Error updating invoice:', error);
    alert('Error updating invoice');
  });
});

// Xử lý sự kiện click vào nút View
$('#dataTable').on('click', '.viewBtn', function() {
  const invoiceId = $(this).data('id');

  // Gửi yêu cầu đến API để lấy chi tiết hóa đơn
  fetch(`/api/getInvoiceDetails?invoiceId=${invoiceId}`)
    .then(response => response.json())
    .then(data => {
      // Điền thông tin hóa đơn vào modal
      $('#viewInvoiceId').text(data.invoiceId);
      $('#viewCustomerName').text(data.customerName);
      $('#viewStatus').text(data.status);
      $('#viewDateCreated').text(data.dateCreated);
      $('#viewTotalAmount').text(data.totalAmount);  // Tổng tiền của hóa đơn

      // Điền thông tin sản phẩm vào bảng
      const products = data.products;  // Giả sử `data.products` chứa danh sách sản phẩm trong hóa đơn
      let productsHTML = '';
      
      // Duyệt qua từng sản phẩm và tạo hàng trong bảng
      products.forEach(product => {
        const totalProductPrice = product.quantity * product.price; // Sử dụng `product.price` thay vì `product.unitPrice`
        productsHTML += `
          <tr>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.price}</td>  <!-- Hiển thị giá trị price -->
            <td>${totalProductPrice}</td>
          </tr>
        `;
      });

      // Thêm thông tin vào bảng sản phẩm
      $('#invoiceProductsBody').html(productsHTML);

      // Mở modal
      $('#viewInvoiceModal').css('display', 'block');
    })
    .catch(error => {
      console.error('Error fetching invoice details:', error);
      alert('Error fetching invoice details');
    });
});


  // Đóng modal khi nhấn vào dấu "X"
  $('#closeViewInvoiceModal').on('click', function() {
    $('#viewInvoiceModal').css('display', 'none');
  });

  // Đóng modal khi nhấn ra ngoài modal
  $(window).on('click', function(event) {
    if ($(event.target).is('#viewInvoiceModal')) {
      $('#viewInvoiceModal').css('display', 'none');
    }
  });



}); // Đóng hàm $(document).ready
