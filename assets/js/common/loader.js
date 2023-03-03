window.addEventListener("load", function () {
  const loadingScreen = document.querySelector(".loading-screen ");
  const overlay = loadingScreen.querySelector(".loading-screen .content .box .box-overlay");

  overlay.style.width = "calc(100vw - 8px)";
  overlay.style.height = "calc(100vh - 8px)";

  setTimeout(() => {
    loadingScreen.style.opacity = "0";
    loadingScreen.style.pointerEvent = "none";
    setTimeout(() => {
      loadingScreen.remove();
    }, 300);
  }, 300);
});