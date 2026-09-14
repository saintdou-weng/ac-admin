/* Backward-compatible loader for existing platform integrations. */
(function(){if(window.PlatformAPI)return;const s=document.createElement("script");s.src=new URL("../platform-api.js?v=1.3.0",document.currentScript.src).href;document.head.appendChild(s);})();
