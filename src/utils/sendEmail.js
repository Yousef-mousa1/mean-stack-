const sendEmail = async (to, subject, text) => {
  console.log("========== EMAIL TEST ==========");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Message:", text);
  console.log("================================");

  return true;
};

module.exports = sendEmail;