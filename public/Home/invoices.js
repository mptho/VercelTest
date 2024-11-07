$(document).ready(function() {
    const dataTable = $('#dataTable').DataTable({
        ajax: {
            url: 'http://localhost:3000/invoices', // Lấy dữ liệu hóa đơn
            dataSrc: ''
        },
        columns: [
            { data: 'invoiceId' }, // Mã hóa đơn
            { data: 'customerName' }, // Tên khách hàng
            { data: 'totalAmount' }, // Tổng tiền
            { data: 'status' }, // Trạng thái
            { data: 'dateCreated' }, // Ngày tạo
            {
                data: null,
                render: function(data, type, row) {
                    return `
                        <button class="viewBtn" data-id="${row._id}">View</button>
                        <button class="editBtn" data-id="${row._id}">Edit</button>
                        <button class="deleteBtn" data-id="${row._id}" data-invoiceid="${row.invoiceId}">Delete</button>
                    `;
                }
            }
        ]
    }); // Đây là dấu đóng cho hàm DataTable

    // Hiển thị modal cho việc thêm hóa đơn mới
$('#addInvoiceBtn').on('click', function() {
    $('#modalTitle').text('Add Invoice');
    $('#invoiceForm')[0].reset(); // Đặt lại form
    $('#totalAmount').val(0); // Đặt lại tổng tiền
    $('#invoiceModal').css('display', 'block'); // Hiển thị modal

    // Xóa tất cả các sản phẩm trong bảng chi tiết
    $('#productDetailsTable tbody').empty();

    // Tạo ID hóa đơn tự động và kiểm tra sự tồn tại
    createInvoiceId();
});

function createInvoiceId() {
    $.ajax({
    url: 'http://localhost:3000/api/invoices/generateId', // Đường dẫn đúng cho ID hóa đơn
    type: 'GET',
    success: function(response) {
        console.log('New Invoice ID:', response.invoiceId);
         $('#invoiceId').val(response.invoiceId);
    },
    error: function(xhr, status, error) {
        console.error('Error fetching invoice ID:', error);
    }
});
}

   // Xử lý khi nhấn nút "Save" Add
document.getElementById('saveBtn').addEventListener('click', function(e) {
    e.preventDefault(); // Ngăn chặn hành động mặc định của nút

    if (productList.length === 0) {
        alert('Please add at least one product to the invoice.'); // Hiển thị thông báo nếu không có sản phẩm
        return; // Dừng hàm nếu không có sản phẩm
    }

    totalAmount = productList.reduce((acc, product) => acc + product.total, 0);
    document.getElementById('totalAmount').value = totalAmount.toFixed(2); // Hiển thị tổng tiền trong modal hóa đơn
    document.getElementById('productModal').style.display = 'none'; // Đóng modal sản phẩm

    // Lấy thông tin hóa đơn
const invoiceData = {
    invoiceId: document.getElementById('invoiceId').value,
    customerName: document.getElementById('customerName').value,
    totalAmount: totalAmount,
    status: document.getElementById('status').value,
    dateCreated: document.getElementById('dateCreated').value,
    products: productList.map(product => ({
        invoiceId: document.getElementById('invoiceId').value, // Thêm invoiceId
        productId: product.id, // Thêm productId
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        total: product.total
    })) // Chuyển đổi danh sách sản phẩm thành định dạng mong muốn
};

// Log dữ liệu hóa đơn để kiểm tra
console.log('Invoice Data:', JSON.stringify(invoiceData, null, 2));

// Gửi dữ liệu hóa đơn đến API
$.ajax({
    url: 'http://localhost:3000/invoices',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(invoiceData),
    success: function(response) {
        if (response.success) {
            console.log('Response from server:', response);

            // Lấy ObjectId từ phản hồi
            const invoiceObjectId = response.data._id; // Chuyển từ response.invoice._id thành response.data._id

            // Cập nhật lại từng sản phẩm với invoiceObjectId
            const updatedProducts = invoiceData.products.map(product => ({
                ...product,
                invoiceObjectId: invoiceObjectId // Thêm ObjectId vào từng sản phẩm
            }));

            // Gọi hàm để lưu chi tiết hóa đơn sau khi hóa đơn đã được lưu thành công
            saveInvoiceDetails({
                invoiceId: invoiceData.invoiceId, // Mã hóa đơn
                invoiceObjectId: invoiceObjectId, // ID hóa đơn kiểu ObjectId
                products: updatedProducts // Danh sách sản phẩm đã cập nhật
            })
            .then(() => {
                // Xử lý sau khi lưu chi tiết hóa đơn thành công
                dataTable.ajax.reload(null, false);
                // Xóa sản phẩm và reset hóa đơn nếu cần
                productList = [];
                updateProductTable(); // Cập nhật lại bảng sản phẩm nếu cần
                $('#invoiceModal').css('display', 'none'); // Ẩn modal
            })
            .catch(error => {
                console.log('Error saving invoice details:', error);
                alert('Failed to save invoice details.');
            });
        }
    },
    error: function(error) {
        console.log('Error:', error);
        alert('Failed to save invoice.');
    }
});
});
// Hàm lưu chi tiết hóa đơn vào bảng `invoice_details`
function saveInvoiceDetails({ invoiceId, invoiceObjectId, products }) {
    const promises = products.map(product => {
        const productDetail = {
            invoiceId: invoiceId, // Mã hóa đơn dạng String
            invoiceObjectId: invoiceObjectId, // ID hóa đơn kiểu ObjectId
            productId: product.productId, // ID sản phẩm
            quantity: product.quantity,
            price: product.price,
            total: product.total
        };

        // Log để kiểm tra dữ liệu chi tiết sản phẩm
        console.log('Product Detail:', JSON.stringify(productDetail, null, 2));

        // Trả về một Promise cho từng cuộc gọi Ajax
        return $.ajax({
            url: 'http://localhost:3000/invoice_details', // API lưu chi tiết hóa đơn
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(productDetail)
        });
    });

    // Trả về một Promise cho tất cả các cuộc gọi Ajax
    return Promise.all(promises)
        .then(responses => {
            console.log('All product details saved:', responses);
        })
        .catch(error => {
            console.log('Error saving product details:', error);
            throw error; // Ném lại lỗi để xử lý bên ngoài
        })
        .finally(() => {
            // Sau khi lưu chi tiết sản phẩm, xóa bảng sản phẩm
            $('#productDetailsTable tbody').empty();
            productList = []; // Xóa danh sách sản phẩm sau khi lưu
        });
}


// Đóng modal khi nhấn vào dấu "x"
$('.close').on('click', function() {
    $('#invoiceModal').css('display', 'none');
});

// Hiển thị modal cho việc thêm sản phẩm mới
$('#addProductBtn').on('click', function() {
    $('#productModalTitle').text('Add Product');
    $('#productForm')[0].reset(); // Đặt lại form
    $('#productModal').css('display', 'block'); // Hiển thị modal thêm sản phẩm

    // Đặt lại nút thêm sản phẩm
    $('#addProductSaveBtn').off('click').on('click', function(e) {
        e.preventDefault();

        // Lấy thông tin từ form sản phẩm
        const productName = $('#productName').val();
        const quantity = $('#productQuantity').val();
        const price = $('#productPrice').val();

        // Thêm sản phẩm vào bảng chi tiết trong modal hóa đơn
        $('#productDetailsTable tbody').append(`
            <tr>
                <td>${productName}</td>
                <td>${quantity}</td>
                <td>${price}</td>
                <td><button class="removeProductBtn">Remove</button></td>
            </tr>
        `);

        // Cập nhật lại tổng tiền hóa đơn
        const totalAmount = parseFloat($('#totalAmount').val()) || 0;
        const newTotal = totalAmount + (quantity * price);
        $('#totalAmount').val(newTotal.toFixed(2)); // Cập nhật tổng tiền

        $('#productModal').css('display', 'none'); // Ẩn modal thêm sản phẩm
    });
});

// Khi người dùng nhập tên sản phẩm
$('#productName').on('input', function() {
    const productName = $(this).val(); // Lấy giá trị từ ô nhập liệu
    if (productName.length > 2) { // Chỉ tìm kiếm khi có ít nhất 3 ký tự
        $.ajax({
            url: 'http://localhost:3000/api/products/search?name=' + encodeURIComponent(productName), // Gọi API tìm kiếm
            type: 'GET',
            success: function(products) {
                // Hiển thị kết quả tìm kiếm
                displaySearchResults(products);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching products:', error);
            }
        });
    } else {
        // Nếu không đủ ký tự, xóa kết quả tìm kiếm
        $('#searchResults').empty();
    }
});

// Hàm để hiển thị kết quả tìm kiếm
function displaySearchResults(products) {
    const searchResultsContainer = $('#searchResults');
    searchResultsContainer.empty(); // Xóa kết quả cũ
    products.forEach(product => {
        searchResultsContainer.append(`<div class="search-result-item" 
                data-id="${product._id}" 
                data-name="${product.name}" 
                data-price="${product.price}" 
                data-stock="${product.stock}"> <!-- Thêm data-stock -->
                ${product.name} - $${product.price}
            </div>`);
    });

    // Thêm sự kiện click cho từng sản phẩm trong kết quả tìm kiếm
$('.search-result-item').on('click', function() {
    const selectedProductId = $(this).data('id'); // Lấy productId
    const selectedProductName = $(this).data('name');
    const selectedProductPrice = $(this).data('price');
    const selectedProductStock = $(this).data('stock'); // Lấy số lượng tồn kho

    // Gán tên sản phẩm, giá và ID vào các ô tương ứng
    $('#productName').val(selectedProductName);
    $('#productPrice').val(selectedProductPrice);
    $('#productQuantity').attr('max', selectedProductStock); // Giới hạn số lượng nhập

    // Lưu productId vào biến toàn cục để sử dụng sau này
    window.selectedProductId = selectedProductId; // Lưu vào biến toàn cục

    // Xóa kết quả tìm kiếm
    $('#searchResults').empty();
});

}


// Đóng modal khi nhấn vào dấu "x"
$('.close').on('click', function() {
    $('#productModal').css('display', 'none');
});

let productList = [];
let totalAmount = 0;
let editIndex = null; // Chỉ số của sản phẩm đang được chỉnh sửa

// Xử lý khi nhấn nút "Add" sản phẩm
document.getElementById('addProductToInvoiceBtn').addEventListener('click', function() {
    const productName = document.getElementById('productName').value;
    const productQuantity = parseInt(document.getElementById('productQuantity').value);
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productTotal = productQuantity * productPrice;

    if (editIndex === null) {
        // Thêm sản phẩm mới
        productList.push({
            id: window.selectedProductId, // Sử dụng ID đã lưu
            name: productName,
            quantity: productQuantity,
            price: productPrice,
            total: productTotal
        });
    } else {
        // Cập nhật sản phẩm đã chỉnh sửa
        productList[editIndex] = {
            id: window.selectedProductId, // Cập nhật ID nếu cần
            name: productName,
            quantity: productQuantity,
            price: productPrice,
            total: productTotal
        };
        editIndex = null; // Reset lại sau khi chỉnh sửa xong
    }

    updateProductTable(); // Cập nhật bảng hiển thị sản phẩm
    document.getElementById('productForm').reset(); // Reset form sau khi thêm hoặc chỉnh sửa
});



// Cập nhật bảng hiển thị sản phẩm
function updateProductTable() {
    const tableBody = document.getElementById('addedProductsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Xóa toàn bộ bảng trước khi cập nhật

    productList.forEach((product, index) => {
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
            </td>
        `;

        // Gắn sự kiện cho nút "Edit"
        newRow.querySelector('.editBtn').addEventListener('click', function() {
            editProduct(index);
        });

        // Gắn sự kiện cho nút "Delete"
        newRow.querySelector('.deleteBtn').addEventListener('click', function() {
            deleteProduct(index);
        });
    });
}

// Hàm chỉnh sửa sản phẩm
function editProduct(index) {
    const product = productList[index];
    document.getElementById('productName').value = product.name;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productPrice').value = product.price;
    editIndex = index; // Lưu lại chỉ số của sản phẩm đang chỉnh sửa

    // Mở lại modal sản phẩm để người dùng chỉnh sửa
    document.getElementById('productModal').style.display = 'block';
}

// Hàm xóa sản phẩm
function deleteProduct(index) {
    productList.splice(index, 1); // Xóa sản phẩm khỏi danh sách
    updateProductTable(); // Cập nhật bảng sau khi xóa
}

// Xử lý khi nhấn nút "Save" sản phẩm
document.getElementById('saveProductsBtn').addEventListener('click', function() {
    // Tính toán tổng số tiền
    totalAmount = productList.reduce((acc, product) => acc + product.total, 0);
    document.getElementById('totalAmount').value = totalAmount.toFixed(2); // Hiển thị tổng tiền trong modal hóa đơn
    
    // Log để kiểm tra danh sách sản phẩm và tổng tiền
    console.log('Products List:', JSON.stringify(productList, null, 2));
    console.log('Total Amount:', totalAmount.toFixed(2));

    document.getElementById('productModal').style.display = 'none'; // Đóng modal sản phẩm
});


// Khi nhấn vào nút View
$('#dataTable tbody').on('click', '.viewBtn', function() {
    const invoiceId = $(this).data('id');
    
    // Log invoiceId để kiểm tra ID đang được gửi đi
    console.log('Requesting details for invoiceId:', invoiceId);

    // Gọi API để lấy chi tiết hóa đơn
    $.ajax({
        url: `http://localhost:3000/invoices/${invoiceId}`,
        type: 'GET',
        success: function(response) {
            // Log response từ server
            console.log('Response from server:', response);

            if (response.success) {
                const invoice = response.data;

                // Log thông tin hóa đơn nhận được
                console.log('Invoice details:', invoice);

                // Hiển thị thông tin hóa đơn trong modal
                $('#modalInvoiceId').text(invoice.invoiceId);
                $('#modalCustomerName').text(invoice.customerName);
                $('#modalTotalAmount').text(invoice.totalAmount);
                $('#modalStatus').text(invoice.status);
                $('#modalDateCreated').text(new Date(invoice.dateCreated).toLocaleString());

                // Hiển thị danh sách sản phẩm
                const productsTableBody = $('#modalProductsTable tbody');
                productsTableBody.empty(); // Xóa dữ liệu cũ
                invoice.products.forEach(product => {
                    // Log chi tiết sản phẩm từng sản phẩm trong hóa đơn
                    console.log('Product detail:', product);

                    productsTableBody.append(`
                        <tr>
                            <td>${product.productId.name}</td>
                            <td>${product.quantity}</td>
                            <td>${product.price}</td>
                            <td>${product.total}</td>
                        </tr>
                    `);
                });

                // Hiển thị modal
                $('#viewInvoiceModal').css('display', 'block');
            } else {
                alert('Failed to fetch invoice details.');
            }
        },
        error: function(error) {
            // Log lỗi khi có lỗi xảy ra
            console.log('Error fetching invoice details:', error);
            alert('Failed to fetch invoice details.');
        }
    });
});

// Đóng modal khi nhấn vào dấu x
$('.close').on('click', function() {
    $('#viewInvoiceModal').css('display', 'none');
});

// Đóng modal khi nhấn ra ngoài modal
$(window).on('click', function(event) {
    if (event.target == $('#viewInvoiceModal')[0]) {
        $('#viewInvoiceModal').css('display', 'none');
    }
});

let currentInvoiceId; // Biến toàn cục để lưu invoiceId
let currentProductId; // Biến toàn cục để lưu productId
let currentEditInvoiceId;
// Khi nhấn Edit
$('#dataTable tbody').on('click', '.editBtn', function() {
    currentInvoiceId = $(this).data('id'); // Lưu _id vào biến toàn cục

    // Gọi API để lấy thông tin chi tiết hóa đơn
    $.ajax({
        url: `http://localhost:3000/invoices/${currentInvoiceId}`, // Sử dụng currentInvoiceId
        type: 'GET',
        success: async function(response) { // Đảm bảo hàm này là async
            console.log('Response from server:', response);
            if (response.success) {
                const invoice = response.data;

                // Điền thông tin hóa đơn vào form
                $('#editInvoiceId').val(invoice.invoiceId);
                $('#editCustomerName').val(invoice.customerName);
                $('#editTotalAmount').val(invoice.totalAmount);
                $('#editStatus').val(invoice.status);
                $('#editDateCreated').val(new Date(invoice.dateCreated).toISOString().split('T')[0]);

                // Lưu invoiceId vào biến toàn cục
                currentEditInvoiceId = invoice.invoiceId;

                // Cập nhật danh sách sản phẩm và lưu currentInvoiceDetailId
                productList = invoice.products.map(product => {
                    currentProductId = product.productId;
                    return {
                        productId: product.productId,
                        name: product.productId.name, // Tên sản phẩm
                        quantity: product.quantity,
                        price: product.price,
                        total: product.total,
                        invoiceDetailId: product._id // Lưu _id của hóa đơn chi tiết
                    };
                });

                // Hiển thị lại bảng sản phẩm
                updateProductTable();

                // Gọi hàm lấy chi tiết hóa đơn
                const invoiceDetails = await fetchInvoiceDetails(currentEditInvoiceId);

                // Hiển thị modal chỉnh sửa hóa đơn
                $('#editInvoiceModal').css('display', 'block');
            } else {
                alert('Failed to fetch invoice details.');
            }
        },
        error: function(error) {
            console.log('Error fetching invoice details:', error);
            alert('Failed to fetch invoice details.');
        }
    });
});




// Xử lý khi nhấn nút "Update" để cập nhật hóa đơn
document.getElementById('updateInvoiceBtn').addEventListener('click', function(e) {
    e.preventDefault(); // Ngăn chặn hành động mặc định của nút

    if (!currentInvoiceId) {
        alert('Invoice ID is required.'); // Kiểm tra xem currentInvoiceId có được gán không
        return;
    }

    if (productList.length === 0) {
        alert('Please add at least one product to the invoice.'); // Hiển thị thông báo nếu không có sản phẩm
        return; // Dừng hàm nếu không có sản phẩm
    }

    totalAmount = productList.reduce((acc, product) => acc + product.total, 0);
    document.getElementById('editTotalAmount').value = totalAmount.toFixed(2); // Hiển thị tổng tiền trong modal hóa đơn

    // Lấy thông tin hóa đơn
    const invoiceData = {
        invoiceId: $('#editInvoiceId').val(), // Có thể giữ lại để hiển thị trong form
        customerName: $('#editCustomerName').val(),
        totalAmount: totalAmount,
        status: $('#editStatus').val(),
        dateCreated: $('#editDateCreated').val(),
        products: productList.map(product => ({
            invoiceId: $('#editInvoiceId').val(), // Sử dụng invoiceId từ input
            productId: currentProductId, // Thêm productId
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            total: product.total,
            _id: currentInvoiceDetailId // Đảm bảo _id không thay đổi
        }))
    };

    // Log dữ liệu hóa đơn để kiểm tra
    console.log('Invoice Edit Data:', JSON.stringify(invoiceData, null, 2));

    // Gửi dữ liệu hóa đơn đến API để cập nhật
    $.ajax({
        url: `http://localhost:3000/invoices/${currentInvoiceId}`, // Sử dụng currentInvoiceId
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(invoiceData),
        success: function(response) {
            if (response.success) {
                console.log('Response from server:', response);

                // Cập nhật lại chi tiết hóa đơn
                const updatedProducts = invoiceData.products.map(product => ({
                    invoiceId: invoiceData.invoiceId,
                    invoiceObjectId: response.data._id, // ID hóa đơn
                    productId: currentProductId, // Giữ nguyên ID sản phẩm
                    name: product.name,
                    quantity: product.quantity,
                    price: product.price,
                    total: product.total,
                    invoiceDetailsId: currentInvoiceDetailId  // Giữ nguyên _id
                }));

                // Log invoiceDetailsId để kiểm tra
                updatedProducts.forEach(product => {
                    console.log(`Updated Product ID: ${product.invoiceDetailsId}`);
                });

                // Gọi hàm để lưu chi tiết hóa đơn chỉ sau khi hóa đơn đã được cập nhật thành công
                saveInvoiceDetailsForEdit({
                    invoiceId: invoiceData.invoiceId,
                    invoiceObjectId: response.data._id,
                    products: updatedProducts
                })
                .then(() => {
                    // Cập nhật lại bảng dữ liệu
                    dataTable.ajax.reload(null, false);
                    // Xóa sản phẩm và reset hóa đơn nếu cần
                    productList = [];
                    updateProductTable(); // Cập nhật lại bảng sản phẩm nếu cần
                    $('#editInvoiceModal').css('display', 'none'); // Ẩn modal
                })
                .catch(error => {
                    console.log('Error saving invoice details:', error);
                    alert('Failed to save invoice details.');
                });
            } else {
                alert('Failed to update invoice.');
            }
        },
        error: function(error) {
            console.log('Error:', error);
            alert('Failed to update invoice.');
        }
    });
});


async function fetchInvoiceDetails(invoiceId) {
    let modifiedInvoiceDetails;
    try {
        // Gửi yêu cầu tới API để lấy chi tiết hóa đơn
        const response = await fetch(`http://localhost:3000/invoice_details?invoiceId=${invoiceId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch invoice details');
        }

        const result = await response.json();

        if (result.success) {
            modifiedInvoiceDetails = result.invoiceDetails; // Lưu chi tiết hóa đơn
            console.log('Fetched Invoice Details:', modifiedInvoiceDetails);

            // Lưu _id vào biến toàn cục
            currentInvoiceDetailId = modifiedInvoiceDetails[0]._id; 
            console.log('Current Invoice Detail ID:', currentInvoiceDetailId);

            // Trả về modifiedInvoiceDetails nếu cần
            return modifiedInvoiceDetails;
        } else {
            console.error('Error fetching invoice details:', result.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching invoice details:', error);
        return null;
    }
}


function saveInvoiceDetailsForEdit({ invoiceId, invoiceObjectId, products }) {
    const promises = products.map(product => {
        // Log để kiểm tra invoiceDetailsId trước khi kiểm tra
        console.log(`Checking product with ID: ${product.invoiceDetailsId}`);

        const productDetail = {
            invoiceId: invoiceId,
            invoiceObjectId: invoiceObjectId,
            productId: product.productId, // Đảm bảo thêm productId
            quantity: product.quantity,
            price: product.price,
            total: product.total
        };

        // Log để kiểm tra dữ liệu chi tiết sản phẩm
        console.log('Updating Product Detail:', JSON.stringify(productDetail, null, 2));

        // Sử dụng invoiceDetailsId đã cho trong yêu cầu cập nhật
        const modifiedInvoiceDetailsId = currentInvoiceDetailId; // Sử dụng ID chi tiết sản phẩm hiện tại

        // Gửi yêu cầu cập nhật chi tiết sản phẩm với invoiceDetailsId đã sửa đổi
        return $.ajax({
    url: `http://localhost:3000/invoice_details/${modifiedInvoiceDetailsId}`, // Sử dụng route có gạch dưới
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(productDetail)
});
    });

    // Trả về một Promise cho tất cả các cuộc gọi Ajax
    return Promise.all(promises)
        .then(responses => {
            console.log('All product details updated successfully:', responses);

            // Đóng modal chỉnh sửa khi tất cả sản phẩm được cập nhật thành công
            document.getElementById('editInvoiceModal').style.display = 'none'; // Ẩn modal

            // Hiển thị thông báo thành công (tuỳ chọn)
            alert('Product details updated successfully!');
            
            return responses; // Trả về responses nếu cần
        })
        .catch(error => {
            console.log('Error updating product details:', error);
            alert('Failed to update product details. Please try again.');
            throw error; // Ném lại lỗi để xử lý bên ngoài
        });
}





// Đóng modal khi nhấn vào dấu x
$('.close').on('click', function() {
    $('#editInvoiceModal').css('display', 'none');
});


// Khi nhấn nút "Add Product" trong modal chỉnh sửa hóa đơn
$('#editAddProductBtn').on('click', function() {
    // Reset form
    $('#editProductForm')[0].reset();

    // Mở modal thêm sản phẩm
    $('#editProductModal').css('display', 'block');

    // Cập nhật bảng sản phẩm trong modal
    updateEditProductTable(); // Gọi hàm để cập nhật bảng sản phẩm
});

// Đóng modal khi nhấn vào nút "close"
$('.close').on('click', function() {
    $(this).closest('.modal').css('display', 'none');
});

// Hàm để cập nhật bảng sản phẩm trong modal chỉnh sửa
function updateEditProductTable() {
    const $tableBody = $('#editAddedProductsTable tbody');
    $tableBody.empty(); // Xóa tất cả các hàng hiện tại trong bảng

    productList.forEach(product => {
        const row = `<tr>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.price}</td>
            <td>
                <button class="edit-btn" data-id="${product.productId}">Edit</button>
                <button class="remove-btn" data-id="${product.productId}">Remove</button>
            </td>
        </tr>`;
        $tableBody.append(row); // Thêm hàng mới vào bảng
    });
}

// Khi người dùng nhập tên sản phẩm trong modal chỉnh sửa sản phẩm
$('#editProductName').on('input', function() {
    const productName = $(this).val(); // Lấy giá trị từ ô nhập liệu
    if (productName.length > 2) { // Chỉ tìm kiếm khi có ít nhất 3 ký tự
        $.ajax({
            url: 'http://localhost:3000/api/products/search?name=' + encodeURIComponent(productName), // Gọi API tìm kiếm
            type: 'GET',
            success: function(products) {
                // Hiển thị kết quả tìm kiếm
                displayEditSearchResults(products);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching products:', error);
            }
        });
    } else {
        // Nếu không đủ ký tự, xóa kết quả tìm kiếm
        $('#editSearchResults').empty();
    }
});

// Hàm để hiển thị kết quả tìm kiếm trong modal chỉnh sửa sản phẩm
function displayEditSearchResults(products) {
    const searchResultsContainer = $('#editSearchResults');
    searchResultsContainer.empty(); // Xóa kết quả cũ
    products.forEach(product => {
        searchResultsContainer.append(`<div class="search-result-item" 
                data-id="${product._id}" 
                data-name="${product.name}" 
                data-price="${product.price}" 
                data-stock="${product.stock}"> <!-- Thêm data-stock -->
                ${product.name} - $${product.price}
            </div>`);
    });

    // Thêm sự kiện click cho từng sản phẩm trong kết quả tìm kiếm
    $('.search-result-item').on('click', function() {
        const selectedProductId = $(this).data('id'); // Lấy productId
        const selectedProductName = $(this).data('name');
        const selectedProductPrice = $(this).data('price');
        const selectedProductStock = $(this).data('stock'); // Lấy số lượng tồn kho

        // Gán tên sản phẩm, giá và ID vào các ô tương ứng
        $('#editProductName').val(selectedProductName);
        $('#editProductPrice').val(selectedProductPrice);
        $('#editProductQuantity').attr('max', selectedProductStock); // Giới hạn số lượng nhập

        // Lưu productId vào biến toàn cục để sử dụng sau này
        window.selectedProductId = selectedProductId; // Lưu vào biến toàn cục

        // Xóa kết quả tìm kiếm
        $('#editSearchResults').empty();
    });
}

// Xử lý khi nhấn nút "Add" sản phẩm trong modal chỉnh sửa sản phẩm
document.getElementById('editAddProductToInvoiceBtn').addEventListener('click', function() {
    const productName = document.getElementById('editProductName').value;
    const productQuantity = parseInt(document.getElementById('editProductQuantity').value);
    const productPrice = parseFloat(document.getElementById('editProductPrice').value);
    const productTotal = productQuantity * productPrice;

    if (editIndex === null) {
        // Thêm sản phẩm mới
        productList.push({
            id: window.selectedProductId, // Sử dụng ID đã lưu
            name: productName,
            quantity: productQuantity,
            price: productPrice,
            total: productTotal
        });
    } else {
        // Cập nhật sản phẩm đã chỉnh sửa
        productList[editIndex] = {
            id: window.selectedProductId, // Cập nhật ID nếu cần
            name: productName,
            quantity: productQuantity,
            price: productPrice,
            total: productTotal
        };
        editIndex = null; // Reset lại sau khi chỉnh sửa xong
    }

    updateEditProductTable(); // Cập nhật bảng hiển thị sản phẩm
    document.getElementById('editProductForm').reset(); // Reset form sau khi thêm hoặc chỉnh sửa
});

// Cập nhật bảng hiển thị sản phẩm trong modal chỉnh sửa
function updateEditProductTable() {
    const tableBody = document.getElementById('editAddedProductsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Xóa toàn bộ bảng trước khi cập nhật

    productList.forEach((product, index) => {
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
            </td>
        `;

        // Gắn sự kiện cho nút "Edit"
        newRow.querySelector('.editBtn').addEventListener('click', function() {
            editEditProduct(index);
        });

        // Gắn sự kiện cho nút "Delete"
        newRow.querySelector('.deleteBtn').addEventListener('click', function() {
            deleteEditProduct(index);
        });
    });
}

// Hàm chỉnh sửa sản phẩm trong modal chỉnh sửa
function editEditProduct(index) {
    const product = productList[index];
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductQuantity').value = product.quantity;
    document.getElementById('editProductPrice').value = product.price;

    // Đặt max cho số lượng dựa trên số lượng tồn kho
    document.getElementById('editProductQuantity').setAttribute('max', product.stock); // Giới hạn số lượng nhập

    editIndex = index; // Lưu lại chỉ số của sản phẩm đang chỉnh sửa

    // Mở lại modal sản phẩm để người dùng chỉnh sửa
    document.getElementById('editProductModal').style.display = 'block';
}

// Hàm xóa sản phẩm trong modal chỉnh sửa
function deleteEditProduct(index) {
    productList.splice(index, 1); // Xóa sản phẩm khỏi danh sách
    updateEditProductTable(); // Cập nhật bảng sau khi xóa
}

let currentInvoiceDetailId; // Biến toàn cục để lưu _id của hóa đơn chi tiết

// Xử lý khi nhấn nút "Save" sản phẩm trong modal chỉnh sửa
document.getElementById('editSaveProductsBtn').addEventListener('click', async function() {
    // Tính toán tổng số tiền của danh sách sản phẩm
    const totalAmount = productList.reduce((acc, product) => acc + product.total, 0);
    document.getElementById('editTotalAmount').value = totalAmount.toFixed(2);

    // Log danh sách sản phẩm và tổng số tiền
    console.log('Products List:', JSON.stringify(productList, null, 2));
    console.log('Total Amount:', totalAmount.toFixed(2));

    // Ẩn modal chỉnh sửa sản phẩm
    document.getElementById('editProductModal').style.display = 'none'; 

    // Lấy `invoiceId` từ dữ liệu của nút (data attribute)
    const invoiceId = currentEditInvoiceId;
    console.log('Invoice ID:', invoiceId);

    let modifiedInvoiceDetails;

    try {
        // Thay đổi URL để sử dụng query parameter thay vì URL path
        const response = await fetch(`http://localhost:3000/invoice_details?invoiceId=${invoiceId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch invoice details');
        }

        const result = await response.json();
        
        if (result.success) {
            modifiedInvoiceDetails = result.invoiceDetails; // Lưu chi tiết hóa đơn
            console.log('Fetched Invoice Details:', modifiedInvoiceDetails);

            // Lưu _id vào biến toàn cục
            currentInvoiceDetailId = modifiedInvoiceDetails[0]._id; 
            console.log('Current Invoice Detail ID:', currentInvoiceDetailId);

            // Bạn có thể sử dụng `modifiedInvoiceDetails` để cập nhật gì đó nếu cần.
        } else {
            console.error('Error fetching invoice details:', result.message);
        }
    } catch (error) {
        console.error('Error fetching invoice details:', error);
    }
});


$(document).on('click', '.deleteBtn', function() {
    // Lấy invoiceId từ thuộc tính data-invoiceid của nút "Delete"
    const invoiceId = $(this).data('invoiceid');

    // Hiển thị xác nhận trước khi xóa
    if (confirm('Are you sure you want to delete this invoice?')) {
        // Gửi yêu cầu xóa đến server sử dụng invoiceId (chuỗi)
        $.ajax({
            url: `http://localhost:3000/invoices?invoiceId=${invoiceId}`, // Xóa dựa trên invoiceId
            type: 'DELETE',
            success: function(response) {
                if (response.success) {
                    alert('Invoice and related details deleted successfully.');
                    // Tải lại bảng sau khi xóa thành công
                    $('#dataTable').DataTable().ajax.reload();
                } else {
                    alert('Failed to delete invoice: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                alert('Error deleting invoice: ' + error);
            }
        });
    }
});


document.getElementById('backButton').addEventListener('click', function() {
    window.location.href = 'Home.html'; // Không cần thêm query string nữa
});

});






