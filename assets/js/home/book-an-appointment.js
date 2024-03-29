window.addEventListener("load", function () {

  // Retrieve many elements of the book-an-appointment section
  const bookAnAppointment = document.querySelector("#book-an-appointment");
  const box = bookAnAppointment.querySelector(".box");
  const overlay = box.querySelector(".box-overlay");
  const main = box.querySelector(".box-main");
  const navBackButton = overlay.querySelector("button");
  const loader = overlay.querySelector(".loader");

  const choices = box.querySelector("#choices");
  const quickTalkChoice = choices.querySelector("#quick-talk-choice");
  const advisingSessionChoice = choices.querySelector("#advising-session-choice");

  const calendars = box.querySelector("#calendars");
  const quickTalkCalendar = calendars.querySelector("#quick-talk-calendar");
  const advisingSessionCalendar = calendars.querySelector("#advising-session-calendar");

  const bookingMessage = box.querySelector("#booking-message");
  const bookingMessageEventType = bookingMessage.querySelector(".event-type");

  // Define some state variables
  let calendarsShown = false;
  const bookedCalendars = {};

  // Define a function that hides the loader when the given calendar is ready
  let lastLinkReadyListener = null;
  const hideLoaderWhenReady = (ns) => {
    if (ns.instance && ns.instance.iframeReady) {
      setTimeout(() => {
        loader.classList.add("hidden");
        calendarsShown = true;
      }, 500);
    }
    else {
      if (lastLinkReadyListener) ns("off", lastLinkReadyListener);
      const listener = {
        action: "linkReady",
        callback: () => {
          loader.classList.add("hidden");
          calendarsShown = true;
          ns("off", listener);
        }
      };
      lastLinkReadyListener = listener;
      ns("on", lastLinkReadyListener);
    }
  };

  // Define a function that display the given calendar
  function displayCalendar (ns, cal) {
    if (bookedCalendars[ns.instance.namespace]) displayBookingMessage(ns);
    else {
      loader.classList.remove("hidden");
      main.style.minHeight = "351px";
      choices.style.display = "none";
      bookingMessage.style.display = "none";
      navBackButton.style.display = "flex";
      calendars.style.display = "flex";
      cal.style.visibility = "visible";
      cal.style.width = "100%";
      cal.style.height = "100%";
      hideLoaderWhenReady(ns);
    }
  }

  function displayChoices () {
    calendarsShown = false;
    loader.classList.remove("hidden");
    main.style.minHeight = "unset";
    choices.style.display = "block";
    navBackButton.style.display = "none";
    calendars.style.display = "none";
    bookingMessage.style.display = "none";
    quickTalkCalendar.style.visibility = "hidden";
    quickTalkCalendar.style.width = "0px";
    quickTalkCalendar.style.height = "0px";
    advisingSessionCalendar.style.visibility = "hidden";
    advisingSessionCalendar.style.width = "0px";
    advisingSessionCalendar.style.height = "0px";
    setTimeout(() => loader.classList.add("hidden"), 500);
  }

  const displayBookingMessage = (ns) => {
    bookedCalendars[ns.instance.namespace] = true;
    loader.classList.remove("hidden");
    main.style.minHeight = "351px";
    choices.style.display = "none";
    calendars.style.display = "none";
    bookingMessage.style.display = "flex";
    navBackButton.style.display = "flex";
    let eventType = "Meeting";
    if (ns.instance.namespace === "quickTalk") eventType = "Quick Talk";
    if (ns.instance.namespace === "advisingSession") eventType = "Advising Session";
    bookingMessageEventType.innerText = eventType;
    setTimeout(() => loader.classList.add("hidden"), 500);
  };

  quickTalkChoice.addEventListener("click", () => displayCalendar(Cal.ns.quickTalk, quickTalkCalendar));
  advisingSessionChoice.addEventListener("click", () => displayCalendar(Cal.ns.advisingSession, advisingSessionCalendar));

  navBackButton.addEventListener("click", displayChoices);

  // Load the Cal.com library
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");

  // Initialize calendars namespaces
  Cal("init", "quickTalk");
  Cal("init", "advisingSession");

  lastUiArgs = {};
  function buildUiArgs () {
    const bodyStyle = getComputedStyle(document.querySelector("body"));
    return {
      theme: document.body.classList.contains("theme-light") ? "light" : "dark",
      styles: {
        body: {
          background: bodyStyle.getPropertyValue("--base-low"),
        },
        eventTypeListItem: {
          background: bodyStyle.getPropertyValue("--base-low"),
        },
        availabilityDatePicker: {
          backgroundColor: bodyStyle.getPropertyValue("--base-low"),
        },
        enabledDateButton: {
          background: bodyStyle.getPropertyValue("--base"),
          color: bodyStyle.getPropertyValue("--cont")
        },
        branding: {
          lightColor: bodyStyle.getPropertyValue("--mid-high"),
          lighterColor: bodyStyle.getPropertyValue("--mid"),
        },
      },
      hideEventTypeDetails: true
    };
  }

  const init = async () => {

    // Define UI configuration for calendars
    const uiArgs = buildUiArgs();

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

    // Dynamically adjust width and height to fit the iframes' contents
    const fitContent = (namespace) => {
      const ns = Cal.ns[namespace];
      const frame = ns.instance.iframe;

      // Listen for route change
      const routeListener = {
        action: "__routeChanged",
        callback: () => {

          // Stop listening after first received event
          ns("off", routeListener);

          // Display the loading screen
          loader.classList.remove("hidden");

          // Reset default height and width to let iframe content take the place it need (analyzed below)
          frame.style.minWidth = "900px";
          frame.parentElement.style.maxHeight = "448px";

          // Listen for the next dimension changed event
          const dimensionListener = {
            action: "__dimensionChanged",
            callback: (e) => {

              // Stop listening after first received event
              ns("off", dimensionListener);

              // Let 1 second for iframe content to take the space it needs (removing will break)
              setTimeout(() => {

                // Remove height and width limit if the current page is the booking form (greater than 400px)
                if (e.detail.data.iframeHeight > 450) {
                  frame.style.minWidth = "unset";
                }
                frame.parentElement.style.maxHeight = "unset";

                // Hide the loading screen
                loader.classList.add("hidden");

                // Re-enable listening of further route changes
                ns("on", routeListener);
              }, 1000);
            }
          };
          ns("on", dimensionListener);
        }
      };
      ns("on", routeListener);
    };

    Cal.ns.quickTalk("on", {
      action: "linkReady",
      callback: () => fitContent("quickTalk")
    });

    Cal.ns.advisingSession("on", {
      action: "linkReady",
      callback: () => fitContent("advisingSession")
    });

    let lastSetTimeout = null;
    onThemeChange(() => {
      if (calendarsShown) loader.classList.remove("hidden");
      const newUiArgs = buildUiArgs();
      Cal.ns.quickTalk("ui", newUiArgs);
      Cal.ns.advisingSession("ui", newUiArgs);
      if (calendarsShown) {
        if (lastSetTimeout) clearTimeout(lastSetTimeout);
        lastSetTimeout = setTimeout(() => loader.classList.add("hidden"), 1500);
      }
    });

    Cal.ns.quickTalk("on", {
      action: "bookingSuccessful",
      callback: () => displayBookingMessage(Cal.ns.quickTalk)
    });
    Cal.ns.advisingSession("on", {
      action: "bookingSuccessful",
      callback: () => displayBookingMessage(Cal.ns.advisingSession)
    });

  };
  init();
});