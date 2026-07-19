$(function () {
  // Get the form.
  var form = $("#contact-form");

  // Get the messages div.
  var formMessages = $(".ajax-response");

  // Set up an event listener for the contact form.
  $(form).on("submit", function (e) {
    // Stop the browser from submitting the form.
    e.preventDefault();

    var recipient = $(form).data("recipient");
    var name = $.trim($(form).find("[name='name']").val());
    var email = $.trim($(form).find("[name='email']").val());
    var website = $.trim($(form).find("[name='subject']").val());
    var message = $.trim($(form).find("[name='message']").val());

    if (!name || !email || !message) {
      $(formMessages).removeClass("success").addClass("error");
      $(formMessages).text("Please fill in your name, email, and message.");
      return;
    }

    var subject = "New inquiry from " + name;
    var bodyLines = [
      "Name: " + name,
      "Email: " + email,
      website ? "Website link: " + website : null,
      "",
      message,
    ].filter(function (line) {
      return line !== null;
    });

    var mailtoUrl =
      "mailto:" +
      encodeURIComponent(recipient) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(bodyLines.join("\n"));

    // Open the visitor's email client with the message pre-filled.
    window.location.href = mailtoUrl;

    $(formMessages).removeClass("error").addClass("success");
    $(formMessages).text(
      "Opening your email client to send this message to " + recipient + "...",
    );

    // Clear the form.
    $("#contact-form input,#contact-form textarea").val("");
  });
});
