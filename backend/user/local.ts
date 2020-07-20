import * as server from "./server";

const PORT = 3000;

server.app.listen(PORT, () => {
    console.log("Listening on port=", PORT);
});
