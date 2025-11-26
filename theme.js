const button = document.getElementById("theme-toggle");

button.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    button.textContent = next === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode";
});
