import LZString from "lz-string";

let ws = new WebSocket("ws://localhost:4000");

if (process.env.NODE_ENV === "production") {
  const host = window.location.href.replace(/^http/, "ws");

  ws = new WebSocket(host);
}

onmessage = (e) => {
  const year = e.data;

  if (ws.readyState === 1) {
    // Receive from main thread and send to websocket
    ws.send(year);
  }

  ws.onopen = () => {
    // Send one bite to websocket every 55 seconds to keep socket from closing itself on idle
    setInterval(() => {
      ws.send(".");
    }, 55000);

    // Receive from main thread and send to websocket
    ws.send(year);
  };

  // Send from websocket to main thread
  ws.onmessage = ({ data }) => {
    const decompressedData = LZString.decompressFromEncodedURIComponent(data);

    // Faster to JSON.stringify() then postMessage() a string than to postMessage() an object.
    if (decompressedData) {
      postMessage(JSON.stringify({ year: year, data: decompressedData }));
    }
  };
};
