import LZString from "lz-string";

export const getSocketData = (year, currentIndex) => {
  const timerPromise = new Promise((resolve, reject) => {
    let ws = new WebSocket("ws://localhost:4000");

    if (process.env.NODE_ENV === "production") {
      const host = window.location.href.replace(/^http/, "ws");

      ws = new WebSocket(host);
    }

    const newArr = [];

    const getData = () => {
      if (newArr[currentIndex]) {
        return resolve(newArr[currentIndex]);
      }
    };

    setInterval(getData, 500);

    if (ws.readyState === 0 && currentIndex === 0) {
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

          if (data) {
            newArr.push(data);
          }
        };
      };
    } else if (ws.readyState === 1 && currentIndex > 0) {
      ws.send(year);

      ws.onmessage = (compressed_data) => {
        const data = LZString.decompressFromEncodedURIComponent(
          compressed_data.data
        );

        newArr.push(data);
      };
    } else {
      ws.onclose = () => {
        console.log("Websocket disconnected");
      };
    }
  });
  return timerPromise;
};
