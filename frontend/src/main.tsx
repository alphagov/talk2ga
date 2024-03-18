import ReactDOM from "react-dom/client";
import App from "./App.tsx";
// import App2 from "./App2.tsx";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeDate from "dayjs/plugin/relativeTime";

dayjs.extend(relativeDate);
dayjs.extend(utc);

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
// ReactDOM.createRoot(document.getElementById("root")!).render(<App2 />);
