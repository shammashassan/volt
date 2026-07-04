chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const tab = tabs[0];
  if (tab && tab.url) {
    const url = encodeURIComponent(tab.url);
    const title = encodeURIComponent(tab.title || "");
    const voltUrl = `http://localhost:3000/quick-save?url=${url}&title=${title}&embed=true`;

    const iframe = document.getElementById("volt-frame");
    const loading = document.getElementById("loading");

    iframe.src = voltUrl;

    iframe.onload = function () {
      loading.style.display = "none";
      iframe.style.display = "block";
    };
  } else {
    document.getElementById("loading").textContent = "Cannot save this page.";
  }
});
