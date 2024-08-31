import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Function to initialize the Facebook SDK
const initFacebookSDK = () => {
  // Load the Facebook SDK script if not already loaded
  if (!window.FB) {
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_GB/sdk.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId      : '473274172290049', // Replace with your Facebook App ID
          cookie     : true,
          xfbml      : true,
          version    : 'v20.0'
        });
        console.log('Facebook SDK initialized');
      };
    };
    document.body.appendChild(script);
  } else {
    console.log('Facebook SDK already loaded');
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));

// Initialize Facebook SDK before rendering the app
initFacebookSDK();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
