window.addEventListener("load", function () {
  const loadingScreen = document.querySelector(".loading-screen ");
  const overlay = loadingScreen.querySelector(".loading-screen .content .box .box-overlay");

  overlay.style.minWidth = "0px";
  overlay.style.width = "80px";
  overlay.style.height = "80px";

  setTimeout(() => {
    overlay.parentElement.style.transform = "rotateZ(45deg)";
    setTimeout(() => {
      loadingScreen.style.opacity = "0";
      loadingScreen.style.pointerEvent = "none";
      setTimeout(() => {
        loadingScreen.remove();
      }, 200);
    }, 600);
  }, 300);
});