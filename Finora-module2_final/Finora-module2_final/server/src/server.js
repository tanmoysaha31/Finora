const app = require("./app");
require("./config/db");
const { serverPort } = require("./secret");



app.listen(serverPort, () => {
  console.log(`server is running at http://localhost:${serverPort}`);
});

