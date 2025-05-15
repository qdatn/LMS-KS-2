
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

    // Handle class selection with datalist
    const classInput = document.getElementById("classInput");
    const classIdInput = document.getElementById("classIdInput");
    const classList = document.getElementById("classList");
    const classOptions = Array.from(classList.options).map(option => ({
    id: option.getAttribute("data-id"),
    name: option.value
}));

    classInput.addEventListener("input", function () {
    const inputValue = this.value.toLowerCase();
    const matchedOption = classOptions.find(option => option.name.toLowerCase().includes(inputValue));
    classIdInput.value = matchedOption ? matchedOption.id : "";
    checkFormValidity();
});

    classInput.addEventListener("change", function () {
    const selectedOption = classOptions.find(option => option.name === this.value);
    if (selectedOption) {
    classIdInput.value = selectedOption.id;
    classInput.value = selectedOption.name;
} else {
    classIdInput.value = "";
    classInput.value = "";
}
    checkFormValidity();
});

    // Handle admin selection with datalist
    const adminInput = document.getElementById("adminInput");
    const adminIdInput = document.getElementById("adminIdInput");
    const adminList = document.getElementById("adminList");
    const adminOptions = Array.from(adminList.options).map(option => ({
    id: option.getAttribute("data-id"),
    name: option.value
}));

    adminInput.addEventListener("input", function () {
    const inputValue = this.value.toLowerCase();
    const matchedOption = adminOptions.find(option => option.name.toLowerCase().includes(inputValue));
    adminIdInput.value = matchedOption ? matchedOption.id : "";
    checkFormValidity();
});

    adminInput.addEventListener("change", function () {
    const selectedOption = adminOptions.find(option => option.name === this.value);
    if (selectedOption) {
    adminIdInput.value = selectedOption.id;
    adminInput.value = selectedOption.name;
} else {
    adminIdInput.value = "";
    adminInput.value = "";
}
    checkFormValidity();
});

    // Check form validity
    function checkFormValidity() {
    const classId = document.getElementById("classIdInput").value;
    const adminId = document.getElementById("adminIdInput").value;
    const ratings = [
    document.getElementById("courseKnowledgeInput").value,
    document.getElementById("communicationSkillsInput").value,
    document.getElementById("approachabilityInput").value,
    document.getElementById("engagementInput").value,
    document.getElementById("professionalismInput").value
    ];

    const submitButton = document.getElementById("submitButton");
    const isClassSelected = classId !== "";
    const isAdminSelected = adminId !== "";
    const areAllRatingsProvided = ratings.every(rating => rating && rating !== "0");

    submitButton.disabled = !(isClassSelected && isAdminSelected && areAllRatingsProvided);
}

    // Form validation on submit
    function validateForm() {
    const classId = document.getElementById("classIdInput").value;
    const adminId = document.getElementById("adminIdInput").value;
    const ratings = [
    document.getElementById("courseKnowledgeInput").value,
    document.getElementById("communicationSkillsInput").value,
    document.getElementById("approachabilityInput").value,
    document.getElementById("engagementInput").value,
    document.getElementById("professionalismInput").value
    ];

    if (!classId) {
    alert("Please select a valid class from the list.");
    return false;
}

    if (!adminId) {
    alert("Please select a valid admin from the list.");
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

    // Initial check
    checkFormValidity();
});