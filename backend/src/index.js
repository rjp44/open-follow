const config = require('config');
const server = require("./server.js");

const PORT = config.get('port');

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));

process.on("unhandledRejection", (error) => {
  console.error(error);
  process.exit(1);
});
