import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ZERLEGEN } from './edition';
import ZerlegenApp from './zerlegen/ZerlegenApp';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode>{ZERLEGEN ? <ZerlegenApp /> : <App />}</StrictMode>);
