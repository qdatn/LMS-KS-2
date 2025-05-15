document.addEventListener("DOMContentLoaded", function () {
    // Handle star ratings
    document.querySelectorAll(".rating-container").forEach(container => {
        const starContainer = container.querySelector(".star-rating");
        const stars = starContainer.querySelectorAll("i");
        const inputField = container.querySelector("input[type='hidden']");

        stars.forEach(star => {
            star.addEventListener("click", function () {
                const value = parseInt(this.getAttribute("data-value"));
                inputField.value = value;
                stars.forEach(s => s.classList.remove("selected"));
                for (let i = 0; i < value; i++) {
                    stars[i].classList.add("selected");
                }
                checkFormValidity();
            });

            star.addEventListener("mouseover", function () {
                const value = parseInt(this.getAttribute("data-value"));
                for (let i = 0; i < value; i++) {
                    stars[i].classList.add("hover");
                }
            });

            star.addEventListener("mouseout", function () {
                stars.forEach(s => s.classList.remove("hover"));
            });
        });
    });

    // Handle course selection with datalist
    const courseInput = document.getElementById("courseInput");
    const courseIdInput = document.getElementById("courseIdInput");
    const courseList = document.getElementById("courseList");
    const options = Array.from(courseList.options).map(option => ({
        id: option.getAttribute("data-id"),
        name: option.value
    }));

    courseInput.addEventListener("input", function () {
        const inputValue = this.value.toLowerCase();
        const matchedOption = options.find(option => option.name.toLowerCase().includes(inputValue));
        if (matchedOption) {
            courseIdInput.value = matchedOption.id;
        } else {
            courseIdInput.value = "";
        }
        checkFormValidity();
    });

    courseInput.addEventListener("change", function () {
        const selectedOption = options.find(option => option.name === this.value);
        if (selectedOption) {
            courseIdInput.value = selectedOption.id;
            courseInput.value = selectedOption.name;
        } else {
            courseIdInput.value = "";
            courseInput.value = "";
        }
        checkFormValidity();
    });

    // Check form validity
    function checkFormValidity() {
        const courseId = document.getElementById("courseIdInput").value;
        const ratings = [
            document.getElementById("courseMaterialInput").value,
            document.getElementById("practicalApplicationsInput").value,
            document.getElementById("clarityOfExplanationInput").value,
            document.getElementById("courseStructureInput").value,
            document.getElementById("supportMaterialsInput").value
        ];
        const submitButton = document.getElementById("submitButton");
        const isCourseSelected = courseId !== "";
        const areAllRatingsProvided = ratings.every(rating => rating && rating !== "0");
        submitButton.disabled = !(isCourseSelected && areAllRatingsProvided);
    }

    // Initial check
    checkFormValidity();

    // Form validation on submit
    document.querySelector("form").onsubmit = function(event) {
        if (!validateForm()) {
            event.preventDefault();
        }
    };
});

function validateForm() {
    const courseId = document.getElementById("courseIdInput").value;
    const ratings = [
        document.getElementById("courseMaterialInput").value,
        document.getElementById("practicalApplicationsInput").value,
        document.getElementById("clarityOfExplanationInput").value,
        document.getElementById("courseStructureInput").value,
        document.getElementById("supportMaterialsInput").value
    ];

    if (!courseId) {
        alert("Please select a valid course from the list.");
        return false;
    }

    for (let rating of ratings) {
        if (!rating || rating === "0") {
            alert("Please provide a rating for all criteria.");
            return false;
        }
    }

    return true;
}
