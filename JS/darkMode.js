function toggleDarkMode() {
  document.documentElement.classList.toggle("dark-mode");
  localStorage.setItem(
    "darkMode",
    document.documentElement.classList.contains("dark-mode").toString(),
  );
}

if (localStorage.getItem("darkMode") === "true") {
  document.documentElement.classList.add("dark-mode");
}
