$(function () {
  // The form submits natively to /api/contact (a Cloud Function), which
  // redirects back here with ?sent=1 or ?error=1. Show the result and
  // clean up the URL.
  var params = new URLSearchParams(window.location.search);
  var formMessages = $(".ajax-response");

  if (params.get("sent") === "1") {
    formMessages
      .removeClass("error")
      .addClass("success")
      .text("Success! Your message has been sent.");
  } else if (params.get("error") === "1") {
    formMessages
      .removeClass("success")
      .addClass("error")
      .text("Something went wrong. Please try again.");
  } else {
    return;
  }

  params.delete("sent");
  params.delete("error");
  var url = new URL(window.location.href);
  url.search = params.toString();
  window.history.replaceState({}, document.title, url.toString());
});
