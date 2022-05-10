const dynamoose = require("dynamoose");

const schema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
    },
    raw_email: String,
    mailgun_timestamp: String,
  },
  {
    timestamps: true,
  }
);

const EmailModel = dynamoose.model("emails_table", schema, {
  create: true,
  throughput: "ON_DEMAND",
});

module.exports = { EmailModel };
