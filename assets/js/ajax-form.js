$(function () {
  // The form now submits natively to Web3Forms, which redirects back here
  // with ?sent=1 on success. Show the confirmation and clean up the URL.
  if (new URLSearchParams(window.location.search).get("sent") === "1") {
    $(".ajax-response")
      .removeClass("error")
      .addClass("success")
      .text("Success! Your message has been sent.");

    var url = new URL(window.location.href);
    url.searchParams.delete("sent");
    window.history.replaceState({}, document.title, url.toString());
  }
});
