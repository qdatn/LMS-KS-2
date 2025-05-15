document.addEventListener('DOMContentLoaded', function () {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const removeImage = document.getElementById('removeImage');

    if (imageUpload) {
        imageUpload.addEventListener('change', function (event) {
            let file = event.target.files[0];
            if (file) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeImage) {
        removeImage.addEventListener('click', function () {
            imageUpload.value = "";
            imagePreviewContainer.classList.add('d-none');
        });
    }
});
