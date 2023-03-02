window.addEventListener("load", function () {

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
  Cal("preload", { calLink: "lilarest/quick-talk" });
  Cal("preload", { calLink: "lilarest/advising-session" });

  // Adjust calendars' iframes minWidth depending on their content
  const fitContent = (frame) => {
    if (frame.offsetHeight > 500 && frame.offsetHeight < 800) frame.style.minWidth = "0px";
    else frame.style.minWidth = "850px";
  };

  Cal.ns.quickTalk("on", {
    action: "*",
    callback: (e) => fitContent(Cal.ns.quickTalk.instance.iframe)
  });

  Cal.ns.advisingSession("on", {
    action: "*",
    callback: (e) => fitContent(Cal.ns.advisingSession.instance.iframe)
  });
});