const themeChangeCallbacks = [];
const onThemeChange = (callback) => themeChangeCallbacks.push(callback);

window.addEventListener("load", function () {
  const themeSwitcher = document.querySelector(".theme-switcher");
  const toggle = themeSwitcher.querySelector("input");
  const sunSvg = themeSwitcher.querySelector("svg.sun");
  const moonSvg = themeSwitcher.querySelector("svg.moon");
  const resetThemeButton = document.querySelector(".theme-switcher button");

  const getExplicitPreference = () => localStorage.getItem("theme");
  const setExplicitPreference = (theme) => localStorage.setItem("theme", theme);
  const resetExplicitPreference = () => localStorage.removeItem("theme");

  const DEFAULT_THEME = "light";

  /**
   * This function applies a give theme name to the webpage
   * @param theme Can be else "dark" or "light"
   */
  function applyTheme (theme) {
    if (!["light", "dark"].includes(theme)) throw `Unsupported color theme "${theme}"`;

    const otherTheme = theme === "light" ? "dark" : "light";
    document.body.classList.remove(`theme-${otherTheme}`);
    document.body.classList.add(`theme-${theme}`);

    toggle.checked = theme === "light" ? false : true;
    if (theme === "light") {
      sunSvg.classList.add("selected");
      moonSvg.classList.remove("selected");
    }
    else {
      moonSvg.classList.add("selected");
      sunSvg.classList.remove("selected");
    }
  }

  /**
   * This function retrieves the user's preferred theme, else return the default one
   * @returns Else "dark" or "light"
   */
  function findTheme () {
    // If the user has explicitly set a preference during this visit or the previous ones
    const userPreference = getExplicitPreference();
    if (userPreference) return userPreference;

    // Else if the user's OS give a preferred color scheme
    if (window.matchMedia) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
      if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    }

    // Else return default theme
    return DEFAULT_THEME;
  }

  /* This function find and apply the theme */
  let lastTheme = null;
  const updateTheme = (firstCall = false) => {
    const newTheme = findTheme();
    if (lastTheme !== newTheme) {
      applyTheme(newTheme);
      lastTheme = newTheme;
      if (!firstCall) themeChangeCallbacks.forEach(element => element());
    }
  };

  /* Call update theme on loading */
  updateTheme(true);

  /* Hide the reset button if no explicit preference is set yet */
  if (getExplicitPreference())
    resetThemeButton.classList.add("shown");

  /* Set explicit preference when the user change the theme switcher, also shows the reset button */
  toggle.addEventListener("change", () => {
    setExplicitPreference(toggle.checked ? "dark" : "light");
    updateTheme();
    resetThemeButton.classList.add("shown");
  });

  /* Trigger a theme update each time the OS theme changes */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

  /* Reset explicit preference when the user click the reset theme button, also hide the reset button */
  resetThemeButton.addEventListener("click", () => {
    resetExplicitPreference();
    updateTheme();
    resetThemeButton.classList.remove("shown");
  });
});