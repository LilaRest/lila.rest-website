window.addEventListener("load", function () {

  // Retrieve many elements of the book-an-appointment section
  const choices = document.querySelector("#choices");
  const quickTalkChoice = choices.querySelector("button#quick-talk-choice");
  const advisingSessionChoice = choices.querySelector("button#advising-session-choice");

  const overlay = document.querySelector("#book-an-appointment > div > div.box-overlay");
  const navBackButton = overlay.querySelector("button");
  const loader = overlay.querySelector("div.loader");
  console.log(loader);

  const calendars = document.querySelector("#calendars");
  const quickTalkCalendar = calendars.querySelector("#quick-talk-calendar");
  const advisingSessionCalendar = calendars.querySelector("#advising-session-calendar");

  const hideLoaderWhenReady = (calInstance) => {
    if (calInstance && calInstance.iframeReady) {
      this.setTimeout(() => loader.classList.add("hidden"), 500);
    }
    else {
      Cal.ns.advisingSession("on", {
        action: "__windowLoadComplete",
        callback: () => loader.classList.add("hidden")
      });
    }
  };


  quickTalkChoice.addEventListener("click", function () {
    choices.style.display = "none";
    navBackButton.style.display = "flex";
    calendars.style.display = "flex";
    quickTalkCalendar.style.visibility = "visible";
    quickTalkCalendar.style.width = "100%";
    quickTalkCalendar.style.height = "100%";
    loader.classList.remove("hidden");
    hideLoaderWhenReady(Cal.ns.quickTalk.instance);
  });


  advisingSessionChoice.addEventListener("click", function () {
    choices.style.display = "none";
    navBackButton.style.display = "flex";
    calendars.style.display = "flex";
    advisingSessionCalendar.style.visibility = "visible";
    advisingSessionCalendar.style.width = "100%";
    advisingSessionCalendar.style.height = "100%";
    loader.classList.remove("hidden");
    hideLoaderWhenReady(Cal.ns.advisingSession.instance);
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
    loader.classList.add("hidden");
  });

  // Load the Cal.com library
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");

  // Initialize calendars namespaces
  Cal("init", "quickTalk");
  Cal("init", "advisingSession");


  // Define UI configuration for calendars
  const uiArgs = {
    theme: "dark",
    styles: {
      body: {
        background: "#002b3600",
      },
      eventTypeListItem: {
        background: "#002b36",
      },
      availabilityDatePicker: {
        backgroundColor: "#002b36",
      },
      branding: {
        lightColor: "#93a1a1",
        lighterColor: "#657b83",
      },
      enabledDateButton: {
        background: "#073642",
        color: "#eee8d5"
      },
    },
    hideEventTypeDetails: true
  };

  // Render calendars
  Cal.ns.quickTalk(
    ["inline", {
      elementOrSelector: "#quick-talk-calendar",
      calLink: "lilarest/quick-talk"
    }],
    ["ui", uiArgs]
  );

  Cal.ns.advisingSession(
    ["inline", {
      elementOrSelector: "#advising-session-calendar",
      calLink: "lilarest/advising-session"
    }],
    ["ui", uiArgs]
  );

  // Preload calendars
  Cal.ns.quickTalk("preload", { calLink: "lilarest/quick-talk" });
  Cal.ns.advisingSession("preload", { calLink: "lilarest/advising-session" });

  // Dynamically adjust width and height to fit the iframes' contents
  const lastOffsetHeights = {};
  const fitContent = (frame) => {
    if (!lastOffsetHeights[frame.src]) lastOffsetHeights[frame.src] = frame.offsetHeight;
    if (frame.offsetHeight !== lastOffsetHeights[frame.src]) {
      if (frame.offsetHeight > 500 && frame.offsetHeight < 800) {
        frame.style.minWidth = "0px";
        frame.parentElement.style.maxHeight = "unset";
      }
      else {
        frame.style.minWidth = "850px";
        frame.parentElement.style.maxHeight = "448px";
      }
    }
  };

  Cal.ns.quickTalk("on", {
    action: "*",
    callback: (e) => fitContent(Cal.ns.quickTalk.instance.iframe)
  });

  Cal.ns.advisingSession("on", {
    action: "*",
    callback: (e) => fitContent(Cal.ns.advisingSession.instance.iframe)
  });

  // Display the loader between each route change to hide the buggy transition
  const displayLoaderASecond = () => {
    loader.classList.remove("hidden");
    setTimeout(() => loader.classList.add("hidden"), 900);
  };
  Cal.ns.quickTalk("on", {
    action: "__routeChanged",
    callback: displayLoaderASecond
  });
  Cal.ns.advisingSession("on", {
    action: "__routeChanged",
    callback: displayLoaderASecond
  });
});