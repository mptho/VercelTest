$(document).ready(function() {
    const dataTable = $('#dataTable').DataTable({
        ajax: {
            url: 'http://localhost:3000/products',
            dataSrc: ''
        },
        columns: [
            {
                data: 'image',
                render: function(data, type, row) {
                    return `<img src="http://localhost:3000${data}" alt="${row.name}" style="width: 50px; height: 50px;">`;
                },
                className: 'image-column'
            },
            { data: 'productId' },
            { data: 'name' },
            { data: 'price' },
            { data: 'category' },
            { data: 'stock' },
            {
                data: null,
                render: function(data, type, row) {
                    return `
                        <button class="editBtn" data-id="${row._id}">Edit</button>
                        <button class="deleteBtn" data-id="${row._id}">Delete</button>
                    `;
                }
            }
        ]
    });

    // Hiển thị modal cho việc thêm sản phẩm mới
    $('#addBtn').on('click', function() {
        $('#modalTitle').text('Add Product');
        $('#productForm')[0].reset(); // Đặt lại form
        $('#imagePreview').attr('src', '').hide(); // Ẩn hình ảnh
        $('#productModal').css('display', 'block'); // Hiển thị modal
        createProductId();

        });

        function createProductId() {
    $.ajax({
    url: 'http://localhost:3000/api/products/generateId', // Đường dẫn đúng cho ID hóa đơn
    type: 'GET',
    success: function(response) {
        console.log('New Product ID:', response.productId);
         $('#productId').val(response.productId);
    },
    error: function(xhr, status, error) {
        console.error('Error fetching product ID:', error);
    }
});
}

        $('#saveBtn').off('click').on('click', function(e) {
    e.preventDefault();

    // Lấy thông tin từ form và file ảnh
    const formData = new FormData();
    formData.append('productId', $('#productId').val()); // Thêm dòng này để lấy productId từ form
    formData.append('name', $('#name').val());
    formData.append('price', $('#price').val());
    formData.append('category', $('#category').val());
    formData.append('stock', $('#stock').val());
    formData.append('image', $('#imageUpload')[0].files[0]); // Lấy file ảnh từ input

    // Gửi dữ liệu với AJAX
    $.ajax({
        url: 'http://localhost:3000/products',
        type: 'POST',
        data: formData,
        contentType: false, // Không đặt header Content-Type
        processData: false, // Không xử lý dữ liệu
        success: function(response) {
            if (response.success) {
                dataTable.row.add(response.product).draw();
                $('#productModal').css('display', 'none'); // Ẩn modal
            }
        },
        error: function(error) {
            console.log('Error:', error);
        }
    });
});



    // Hiển thị modal cho việc chỉnh sửa sản phẩm
$('#dataTable tbody').on('click', '.editBtn', function() {
    const productId = $(this).data('id'); // Sử dụng data-id thay vì data-product-id
    const rowData = dataTable.row($(this).parents('tr')).data();

    // Hiển thị dữ liệu sản phẩm vào modal để chỉnh sửa
    $('#modalTitle').text('Edit Product');
    $('#productId').val(rowData.productId); // Hiển thị productId
    $('#name').val(rowData.name);
    $('#price').val(rowData.price);
    $('#category').val(rowData.category);
    $('#stock').val(rowData.stock);
    $('#imagePreview').attr('src', `http://localhost:3000${rowData.image}`).show(); // Hiển thị hình ảnh hiện tại
    $('#productModal').css('display', 'block'); // Hiển thị modal

    // Xử lý sự kiện khi người dùng bấm "Save" để cập nhật sản phẩm
    $('#saveBtn').off('click').on('click', function(e) {
        e.preventDefault();

        // Tạo dữ liệu sản phẩm mới để gửi lên server
        const updatedProduct = {
            productId: $('#productId').val(), // Bao gồm productId trong dữ liệu cập nhật
            name: $('#name').val(),
            price: $('#price').val(),
            category: $('#category').val(),
            stock: $('#stock').val()
            // Nếu có thêm ảnh, bạn có thể xử lý upload ảnh ở đây
        };

        // Gửi yêu cầu AJAX để cập nhật sản phẩm
        $.ajax({
            url: `http://localhost:3000/products/${productId}`, // Gửi PUT request với productId
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedProduct), // Chuyển đổi dữ liệu sản phẩm thành JSON
            success: function(response) {
                if (response.success) {
                    // Cập nhật hàng trong DataTable
                    dataTable.ajax.reload(null, false); // Làm mới bảng nhưng không tải lại toàn bộ trang
                    $('#productModal').css('display', 'none'); // Ẩn modal
                } else {
                    console.error('Failed to update product:', response.message); // Log thông báo lỗi nếu không thành công
                }
            },
            error: function(xhr, status, error) {
                console.error('Error while updating product:', error); // Log lỗi nếu có
            }
        });
    });
});


    // Xóa sản phẩm
// Xử lý nút xóa
    $('#dataTable tbody').on('click', '.deleteBtn', function() {
        const productId = $(this).data('id'); // Lấy productId từ thuộc tính data-id
        console.log('Button clicked, productId:', productId); // In ra productId

        if (!productId) {
            console.error('Product ID is undefined');
            return; // Thoát nếu productId không hợp lệ
        }

        $.ajax({
            url: `http://localhost:3000/products/${productId}`,
            type: 'DELETE',
            success: function(response) {
                if (response.success) {
                    dataTable.ajax.reload(null, false);
                } else {
                    console.error('Failed to delete product:', response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error while deleting product:', error);
            }
        });
    });


    // Đóng modal khi nhấn vào <span> (x)
    $('.close').on('click', function() {
        $('#productModal').css('display', 'none'); // Ẩn modal
    });

    // Đóng modal khi nhấn ra ngoài modal
    $(window).on('click', function(event) {
        if (event.target === $('#productModal')[0]) {
            $('#productModal').css('display', 'none'); // Ẩn modal
        }
    });

    // Hiển thị hình ảnh được chọn
    $('#imageUpload').on('change', function() {
        const file = this.files[0]; // Lấy file từ input
        const reader = new FileReader();

        // Khi file đã được đọc, cập nhật thuộc tính src của hình preview
        reader.onload = function(e) {
            $('#imagePreview').attr('src', e.target.result).show(); // Hiển thị hình ảnh được chọn
        }

        // Đọc file dưới dạng Data URL
        if (file) {
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('backButton').addEventListener('click', function() {
    window.location.href = 'Home.html'; // Không cần thêm query string nữa
});
    
});



