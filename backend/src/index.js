const server = require("./server.js");
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));

process.on("unhandledRejection", (error) => {
  console.error(error);
  process.exit(1);
});
