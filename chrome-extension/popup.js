// Set this to your production deployment URL, or keep localhost for local development
const VOLT_BASE_URL = "http://localhost:3000";

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const tab = tabs[0];
  let voltUrl = `${VOLT_BASE_URL}/quick-save?embed=true`;

  if (
    tab &&
    tab.url &&
    !tab.url.startsWith("chrome://") &&
    !tab.url.startsWith("chrome-extension://") &&
    !tab.url.startsWith("edge://") &&
    !tab.url.startsWith("about:")
  ) {
    const url = encodeURIComponent(tab.url);
    const title = encodeURIComponent(tab.title || "");
    voltUrl = `${VOLT_BASE_URL}/quick-save?url=${url}&title=${title}&embed=true`;
  }

  const iframe = document.getElementById("volt-frame");
  const loading = document.getElementById("loading");

  iframe.src = voltUrl;

  iframe.onload = function () {
    loading.style.display = "none";
    iframe.style.display = "block";
  };
});
