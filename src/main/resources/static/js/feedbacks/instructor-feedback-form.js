document.addEventListener("DOMContentLoaded", function () {
    // Handle star ratings
    document.querySelectorAll(".rating-container").forEach(container => {
        const starContainer = container.querySelector(".star-rating");
        const stars = starContainer.querySelectorAll("i");
        const inputField = container.querySelector("input[type='hidden']");

        stars.forEach(star => {
            star.addEventListener("click", function () {
                const value = parseInt(this.getAttribute("data-value"));

                // Update hidden input value
                inputField.value = value;

                // Remove 'selected' class from all stars
                stars.forEach(s => s.classList.remove("selected"));

                // Add 'selected' class to stars up to the clicked value
                for (let i = 0; i < value; i++) {
                    stars[i].classList.add("selected");
                }

                // Check form validity after rating change
                checkFormValidity();
            });

            // Hover effect
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
    const courseOptions = Array.from(courseList.options).map(option => ({
        id: option.getAttribute("data-id"),
        name: option.value
    }));

    courseInput.addEventListener("input", function () {
        const inputValue = this.value.toLowerCase();
        const matchedOption = courseOptions.find(option => option.name.toLowerCase().includes(inputValue));

        if (matchedOption) {
            courseIdInput.value = matchedOption.id;
        } else {
            courseIdInput.value = "";
        }

        checkFormValidity();
    });

    courseInput.addEventListener("change", function () {
        const selectedOption = courseOptions.find(option => option.name === this.value);
        if (selectedOption) {
            courseIdInput.value = selectedOption.id;
            courseInput.value = selectedOption.name;
        } else {
            courseIdInput.value = "";
            courseInput.value = "";
        }

        checkFormValidity();
    });

    // Function to check form validity and enable/disable submit button
    function checkFormValidity() {
        const courseId = document.getElementById("courseIdInput").value;
        const ratings = [
            document.getElementById("courseKnowledgeInput").value,
            document.getElementById("communicationSkillsInput").value,
            document.getElementById("approachabilityInput").value,
            document.getElementById("engagementInput").value,
            document.getElementById("professionalismInput").value
        ];

        const submitButton = document.getElementById("submitButton");

        const isCourseSelected = courseId !== "";
        const areAllRatingsProvided = ratings.every(rating => rating && rating !== "0");

        if (isCourseSelected && areAllRatingsProvided) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }

    // Initial check on page load
    checkFormValidity();
});

// Form validation on submit (additional safety check)
function validateForm() {
    const courseId = document.getElementById("courseIdInput").value;
    const ratings = [
        document.getElementById("courseKnowledgeInput").value,
        document.getElementById("communicationSkillsInput").value,
        document.getElementById("approachabilityInput").value,
        document.getElementById("engagementInput").value,
        document.getElementById("professionalismInput").value
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

document.querySelector("form").onsubmit = function(event) {
    if (!validateForm()) {
        event.preventDefault();
    }
};