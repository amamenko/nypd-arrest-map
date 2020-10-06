import LZString from "lz-string";

self.addEventListener("connect", ({ ports }) => {
  let ws = new WebSocket("ws://localhost:4000");

  const port = ports[0];

  if (process.env.NODE_ENV === "production") {
    const host = window.location.href.replace(/^http/, "ws");

    ws = new WebSocket(host);
  }

  ws.addEventListener("open", () => {
    console.log("WOW");
    // Send one bite to websocket every 55 seconds to keep socket from closing itself on idle
    setInterval(() => {
      ws.send(".");
    }, 55000);

    // Receive from main thread and send to websocket
    port.addEventListener("message", ({ data }) => {
      console.log(data);
      ws.send(data);
    });

    port.start();
  });

  // Send from websocket to main thread
  ws.addEventListener("message", ({ data }) => {
    const decompressedData = LZString.decompressFromEncodedURIComponent(data);

    if (decompressedData) {
      port.postMessage(JSON.parse(decompressedData));
    }
  });
});
