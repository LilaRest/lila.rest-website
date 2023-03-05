window.addEventListener("load", function () {
  const themeSwitcher = document.querySelector(".theme-switcher input");
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

    themeSwitcher.checked = theme === "light" ? false : true;
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
  const updateTheme = () => applyTheme(findTheme());

  /* Call update theme on loading */
  updateTheme();

  /* Set explicit preference when the user change the theme switcher, also shows the reset button */
  themeSwitcher.addEventListener("change", () => {
    setExplicitPreference(themeSwitcher.checked ? "dark" : "light");
    updateTheme();
    resetThemeButton.classList.remove("hidden");
  });

  /* Trigger a theme update each time the OS theme changes */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

  /* Reset explicit preference when the user click the reset theme button, also hide the reset button */
  resetThemeButton.addEventListener("click", () => {
    resetExplicitPreference();
    updateTheme();
    resetThemeButton.classList.add("hidden");
  });

  /* Hide the reset button if no explicit preference is set yet */
  if (!getExplicitPreference())
    resetThemeButton.classList.add("hidden");
});