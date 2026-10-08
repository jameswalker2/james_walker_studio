// menu.js — opens and closes the phone menu
var btn = document.getElementById("menuBtn");
var menu = document.getElementById("menu");

function setMenu(open) {
  btn.classList.toggle("open", open); // icon becomes an X
  menu.classList.toggle("open", open); // menu fades in/out
  btn.setAttribute("aria-expanded", open);
  btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

// tap the icon: open if closed, close if open
btn.addEventListener("click", function () {
  setMenu(!menu.classList.contains("open"));
});

// tap a link: close the menu
menu.querySelectorAll("a").forEach(function (a) {
  a.addEventListener("click", function () {
    setMenu(false);
  });
});

// Escape key closes it too
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") setMenu(false);
});
