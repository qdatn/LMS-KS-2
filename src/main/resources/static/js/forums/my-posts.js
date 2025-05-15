function setDeleteAction(button) {
    const postId = button.getAttribute("data-id")
    const form = document.getElementById("deleteForm")
    form.action = "/forums/delete/" + postId + "?redirect=/forums/my-posts"
}

// View toggle functionality
document.addEventListener("DOMContentLoaded", () => {
    // Get the view toggle buttons
    const listViewBtn = document.getElementById("listViewBtn")
    const cardViewBtn = document.getElementById("cardViewBtn")

    // Get the view containers
    const listView = document.getElementById("listView")
    const cardView = document.getElementById("cardView")

    // Check if elements exist to prevent errors
    if (!listViewBtn || !cardViewBtn || !listView || !cardView) {
        console.error("View toggle elements not found")
        return
    }

    // Function to switch to list view
    function showListView() {
        listView.classList.remove("d-none")
        cardView.classList.add("d-none")
        listViewBtn.classList.add("active")
        cardViewBtn.classList.remove("active")
        localStorage.setItem("myPostsViewMode", "list")
    }

    // Function to switch to card view
    function showCardView() {
        listView.classList.add("d-none")
        cardView.classList.remove("d-none")
        listViewBtn.classList.remove("active")
        cardViewBtn.classList.add("active")
        localStorage.setItem("myPostsViewMode", "card")
    }

    // Add click event listeners
    listViewBtn.addEventListener("click", showListView)
    cardViewBtn.addEventListener("click", showCardView)

    // Load saved preference from localStorage
    const savedView = localStorage.getItem("myPostsViewMode")
    if (savedView === "card") {
        showCardView()
    } else {
        showListView()
    }

    // Debug log to verify script is running
    console.log("View toggle script initialized")
})
