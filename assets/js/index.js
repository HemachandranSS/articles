document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayId = `date-${yyyy}-${mm}-${dd}`;

    document.querySelectorAll(".date-badge").forEach(badge => {
        const todaySpan = badge.querySelector(".date-today");
        if (todaySpan && badge.id !== todayId) {
            todaySpan.style.display = "none";
        }
    });
});
