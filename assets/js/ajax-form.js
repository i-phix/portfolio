$(function () {
  // Get the form.
  var form = $("#contact-form")[0];
  if (!form) return;

  // Get the messages div.
  var formMessages = $(".ajax-response");
  var submitBtn = $(form).find('button[type="submit"]');
  var submitBtnText = submitBtn.find(".text-1");

  $(form).on("submit", async function (e) {
    e.preventDefault();

    var originalText = submitBtnText.text();
    submitBtnText.text("Sending...");
    submitBtn.prop("disabled", true);

    var formData = new FormData(form);

    try {
      var response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      var data = await response.json();

      if (response.ok && data.success) {
        formMessages.removeClass("error").addClass("success");
        formMessages.text("Success! Your message has been sent.");
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
});
