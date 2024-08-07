import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// @ts-ignore
import { initAll } from './govuk-frontend.min.js';

initAll();

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeDate from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeDate);
dayjs.extend(utc);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
