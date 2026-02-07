;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="e59c8c69-1860-9ccb-33f2-08ee323c50dc")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,3748432,e=>{"use strict";e.i(2144405);var t=e.i(4205214),n=e.i(8660982),r=e.i(5677444),i=e.i(8612999),a=e.i(5773208);let s={hard:{skeleton:"primary-light",content:"primary-dark"},soft:{skeleton:"secondary-light",content:"secondary-dark"}};function o(e,t){let n=e?"hard":"soft";return{track:"Navigation Phases ▲",color:s[n][t.phase],properties:[["Navigation Type",n]].concat(Object.entries(t).map(e=>{let[t,n]=e;return[t.split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "),String(n)]}))}}function u(e,t,n){let r=JSON.stringify(e,t,n);return"string"==typeof r?r.replace(/</g,"\\u003c"):r}function l(e){let{children:r,...i}=e;return(0,t.jsxs)(t.Fragment,{children:[r,(0,t.jsx)(n.Suspense,{fallback:(0,t.jsx)("span",{"data-navigation-marker":`${i.phase}-${i.label}`,style:{width:"1px",height:"1px",opacity:0,position:"absolute"}}),children:(0,t.jsx)(c,{...i})})]})}function c(e){let s,l,{phase:c,label:h,routeOverride:g}=e,f=(s=(0,r.usePathname)(),l=(0,r.useParams)(),(0,n.useMemo)(()=>{if(!l)return(0,i.computeRoute)(s,{});let{catchAll:e,...t}=l;return(0,i.computeRoute)(s,t)},[s,l])),m=g??f??"unknown",j=(0,n.useRef)(!1);(0,n.useEffect)(()=>{if(!j.current&&(j.current=!0,!d(c,"interactive",h)))return requestAnimationFrame(()=>{requestAnimationFrame(()=>{var e=c,t=m,n=h;let r=performance.now(),i={phase:e,route:t,target_env:"production",label:n,state:"interactive"};try{performance.measure(`${e} interactive`,{start:a.routerState.lastRouterTransition.startMsSinceOrigin,end:r,detail:{vercelNavigation:{isHardNavigation:a.routerState.isHardNavigation,attrs:i},devtools:o(a.routerState.isHardNavigation,i)}})}catch{}})}),()=>{"skeleton"===c||d(c,"unmounted",h)||0===a.routerState.lastRouterTransition.startMsSinceOrigin||requestAnimationFrame(()=>{let e={phase:c,route:m,label:h,target_env:"production",state:"unmounted"};performance.measure(`${c} unmount`,{start:a.routerState.lastRouterTransition.startMsSinceOrigin,end:performance.now(),detail:{vercelNavigation:{isHardNavigation:!1,attrs:e},devtools:o(a.routerState.isHardNavigation,e)}})})}},[c,m,h]);let p={phase:c,label:h,route:m,target_env:"production",state:"visible"},x=u(`${c} visible`),v=u(h),S=JSON.stringify(u(p)),_=JSON.stringify(u(o(!0,p))),E=`
  requestAnimationFrame(() => {
    globalThis.__VERCEL_NAVIGATION_METRICS_RECORDED_MEASURES = globalThis.__VERCEL_NAVIGATION_METRICS_RECORDED_MEASURES || new Map();
    if (globalThis.__VERCEL_NAVIGATION_METRICS_RECORDED_MEASURES.has(${x})) {
      
      return;
    }
    globalThis.__VERCEL_NAVIGATION_METRICS_RECORDED_MEASURES.set(${x}, ${v});

    try {
      performance.measure(${x}, {
        end: performance.now(),
        detail: {
          vercelNavigation: {
            isHardNavigation: true,
            attrs: JSON.parse(${S}),
          },
          devtools: JSON.parse(${_})
        }
      });
    } catch {}
  });
`;return(0,t.jsx)(t.Fragment,{children:(0,t.jsx)("script",{dangerouslySetInnerHTML:{__html:E}})})}function d(e,t,n){let r=(0,a.getRecordedMeasures)();return!!r.has(`${e} ${t}`)||(r.set(`${e} ${t}`,n||"unknown"),!1)}e.s(["ConditionalNavigationMarker",0,function(e){let{children:n,enabled:r,phase:i,label:a,routeOverride:s}=e;return(0,t.jsxs)(t.Fragment,{children:[n,r&&(0,t.jsx)(l,{phase:i,label:a,routeOverride:s})]})},"NavigationMarker",0,l],3748432)},835469,e=>{e.v({settingsGeneral:"team-settings-general-skeleton-module__uzFQ5G__settingsGeneral"})},5216091,e=>{"use strict";var t=e.i(4205214),n=e.i(5255926),r=e.i(5807088),i=e.i(835469),a=e.i(3748432);function s(){return(0,t.jsx)(r.default,{height:80})}function o(){return(0,t.jsx)(r.default,{height:102})}function u(){return(0,t.jsx)(r.default,{height:55})}function l(){return(0,t.jsx)(r.default,{height:102})}function c(){return(0,t.jsx)(r.default,{height:81})}function d(){return(0,t.jsx)(n.Skeleton,{height:30,width:140})}function h(){return(0,t.jsx)(r.default,{height:81})}function g(){return(0,t.jsx)(r.default,{height:36})}function f(){return(0,t.jsx)(r.default,{height:56})}e.s(["TeamSettingsGeneralSkeleton",0,function(){return(0,t.jsxs)("main",{className:i.default.settingsGeneral,children:[(0,t.jsx)(a.NavigationMarker,{phase:"skeleton",label:"TeamSettingsGeneralSkeleton"}),(0,t.jsx)("section",{children:(0,t.jsx)(s,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(o,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(u,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(l,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(c,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(d,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(h,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(g,{})}),(0,t.jsx)("section",{children:(0,t.jsx)(f,{})})]})}])}]);

//# debugId=e59c8c69-1860-9ccb-33f2-08ee323c50dc
//# sourceMappingURL=17ac3c40c6d64105.js.map