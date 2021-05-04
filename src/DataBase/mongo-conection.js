const { connect } = require("mongoose");

(async () => {
  try {
    await connect("mongodb://localhost/control", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("db connected!!!")
  } catch (error) {
    throw new Error(error)
  }
})();
