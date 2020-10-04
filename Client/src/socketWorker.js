import LZString from "lz-string";
import getData from "./getData";

export const getSocketData = (year) => {
  let ws = new WebSocket("ws://localhost:4000");

  if (process.env.NODE_ENV === "production") {
    const host = window.location.href.replace(/^http/, "ws");

    ws = new WebSocket(host);
  }

  if (ws.readyState === 0) {
    ws.onopen = (event) => {
      // Send one bite to websocket every 55 seconds to keep socket from closing itself on idle
      setInterval(() => {
        ws.send(".");
      }, 55000);

      ws.send(year);

      ws.onmessage = (compressed_data) => {
        const data = LZString.decompressFromEncodedURIComponent(
          compressed_data.data
        );

        getData(data);
      };
    };
  } else if (ws.readyState === 1) {
    ws.send(year);

    ws.onmessage = (compressed_data) => {
      const data = LZString.decompressFromEncodedURIComponent(
        compressed_data.data
      );

      getData(data);
    };
  } else {
    ws.onclose = () => {
      console.log("Websocket disconnected");
    };
  }
};
