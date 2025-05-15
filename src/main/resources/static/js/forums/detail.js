document.addEventListener("DOMContentLoaded", function () {
    // Convert links in .convert-links
    function convertLinks() {
        document.querySelectorAll(".convert-links").forEach(function (element) {
            let text = element.innerHTML;
            let urlRegex = /(https?:\/\/[^\s]+)/g;
            element.innerHTML = text.replace(urlRegex, function (url) {
                return `<a href="${url}" target="_blank" class="text-primary text-decoration-underline">${url}</a>`;
            });
        });
    }
    convertLinks();

    // Lưu trang trước để quay lại
    const postId = document.getElementById("backButton")?.getAttribute("data-post-id");
    if (document.referrer && postId && !document.referrer.includes("/forums/" + postId)) {
        sessionStorage.setItem("previousPage", document.referrer);
    }

    // Nút quay lại
    document.getElementById("backButton")?.addEventListener("click", function () {
        let previousPage = sessionStorage.getItem("previousPage");
        if (previousPage) {
            window.location.href = previousPage;
        } else {
            window.location.href = "/forums";
        }
    });

    // Cuộn xuống form bình luận
    document.querySelector('a[href="#add-comment"]')?.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector('#add-comment')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Hiển thị ảnh preview khi chọn ảnh
    document.getElementById('imageUpload')?.addEventListener('change', function (event) {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('imagePreview').src = e.target.result;
                document.getElementById('imagePreviewContainer').classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        }
    });

    // Xóa ảnh đã chọn
    document.getElementById('removeImage')?.addEventListener('click', function () {
        document.getElementById('imageUpload').value = "";
        document.getElementById('imagePreviewContainer').classList.add('d-none');
    });
});
