window.addEventListener("load", function () {
  // Retrieve many elements of the book-an-appointment section
  const choices = document.querySelector("#choices");
  const quickTalkChoice = choices.querySelector("button#quick-talk-choice");
  const advisingSessionChoice = choices.querySelector("button#advising-session-choice");

  const overlay = document.querySelector("#book-an-appointment > div > div.box-overlay");
  const navBackButton = overlay.querySelector("button");

  const calendars = document.querySelector("#calendars");
  const quickTalkCalendar = calendars.querySelector("#quick-talk-calendar");
  const advisingSessionCalendar = calendars.querySelector("#advising-session-calendar");


  quickTalkChoice.addEventListener("click", function () {
    choices.style.display = "none";
    navBackButton.style.display = "flex";
    calendars.style.display = "flex";
    quickTalkCalendar.style.visibility = "visible";
    quickTalkCalendar.style.width = "100%";
    quickTalkCalendar.style.height = "100%";

    if (!Cal.ns.quickTalk.instance || !Cal.ns.quickTalk.instance.iframeReady) {
      overlay.classList.add("loader");
      Cal.ns.quickTalk("on", {
        action: "__windowLoadComplete",
        callback: () => overlay.classList.remove("loader")
      });
    }
  });

  advisingSessionChoice.addEventListener("click", function () {
    choices.style.display = "none";
    navBackButton.style.display = "flex";
    calendars.style.display = "flex";
    advisingSessionCalendar.style.visibility = "visible";
    advisingSessionCalendar.style.width = "100%";
    advisingSessionCalendar.style.height = "100%";

    if (!Cal.ns.advisingSession.instance || !Cal.ns.advisingSession.instance.iframeReady) {
      overlay.classList.add("loader");
      Cal.ns.advisingSession("on", {
        action: "__windowLoadComplete",
        callback: () => overlay.classList.remove("loader")
      });
    }
  });

  navBackButton.addEventListener("click", function () {
    navBackButton.style.display = "none";
    choices.style.display = "block";
    calendars.style.display = "none";
    quickTalkCalendar.style.visibility = "hidden";
    quickTalkCalendar.style.width = "0px";
    quickTalkCalendar.style.height = "0px";
    advisingSessionCalendar.style.visibility = "hidden";
    advisingSessionCalendar.style.width = "0px";
    advisingSessionCalendar.style.height = "0px";
  });
});