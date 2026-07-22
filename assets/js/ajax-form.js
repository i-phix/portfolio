$(function () {
  var form = $("#contact-form")[0];
  var formMessages = $(".ajax-response");

  // No-JS fallback: a plain <form> submit gets redirected back here with
  // ?sent=1 or ?error=1. Show the result and clean up the URL.
  var params = new URLSearchParams(window.location.search);
  if (params.has("sent") || params.has("error")) {
    if (params.get("sent") === "1") {
      formMessages
        .removeClass("error")
        .addClass("success")
        .text("Success! Your message has been sent.");
    } else {
      formMessages
        .removeClass("success")
        .addClass("error")
        .text("Something went wrong. Please try again.");
    }
    params.delete("sent");
    params.delete("error");
    var url = new URL(window.location.href);
    url.search = params.toString();
    window.history.replaceState({}, document.title, url.toString());
  }

  if (!form) return;

  var submitBtn = $(form).find('button[type="submit"]');
  var submitBtnText = submitBtn.find(".text-1");

  $(form).on("submit", async function (e) {
    e.preventDefault();

    var originalText = submitBtnText.text();
    submitBtnText.text("Sending...");
    submitBtn.prop("disabled", true);

    var formData = new URLSearchParams(new FormData(form));

    try {
      var response = await fetch(form.action, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });
      var data = await response.json();

      if (response.ok && data.success) {
        formMessages.removeClass("error").addClass("success");
        formMessages.text(data.message || "Success! Your message has been sent.");
        form.reset();
      } else {
        formMessages.removeClass("success").addClass("error");
        formMessages.text(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      formMessages.removeClass("success").addClass("error");
      formMessages.text("Something went wrong. Please try again.");
    } finally {
      submitBtnText.text(originalText);
      submitBtn.prop("disabled", false);
    }
  });

  // WhatsApp button: reach out directly, pre-filled with whatever's in the
  // form so far. Works even if the form is empty ("just reaching out").
  var WHATSAPP_NUMBER = "254791216791";
  $("#whatsapp-btn").on("click", function (e) {
    e.preventDefault();

    var name = $.trim($(form).find("[name='name']").val());
    var email = $.trim($(form).find("[name='email']").val());
    var website = $.trim($(form).find("[name='website']").val());
    var interest = $.trim($(form).find("[name='interest']").val());
    var message = $.trim($(form).find("[name='message']").val());

    var lines = [
      "Hi, I'd like to get in touch.",
      "",
      name ? "Name: " + name : null,
      email ? "Email: " + email : null,
      website ? "Website link: " + website : null,
      interest ? "Interested in: " + interest : null,
      message ? "\n" + message : null,
    ].filter(function (line) {
      return line !== null;
    });

    var text = lines.join("\n");
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener");
  });
});
