(function(){'use strict';function d(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}var f=d(this),h="function"==typeof Object.create?Object.create:function(a){function b(){}b.prototype=a;return new b},k;
if("function"==typeof Object.setPrototypeOf)k=Object.setPrototypeOf;else{var l;a:{var m={a:!0},n={};try{n.__proto__=m;l=n.a;break a}catch(a){}l=!1}k=l?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}var p=k;/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var q=this||self;function r(a){return a};function t(a,b,c){a=parseInt(a.getAttribute(b),10);isNaN(a)&&(a=c);return a}function u(a,b){a=parseFloat(a.getAttribute(b));isFinite(a)||(a=NaN);return a};function v(a){var b=void 0===b?null:b;var c=document.createEvent("CustomEvent");c.initCustomEvent("ready",!0,!0,b);a.dispatchEvent(c)}function w(a,b){function c(g){a.removeEventListener("load",c);b(g)}a.addEventListener("load",c)};var x;function y(a){this.g=a}y.prototype.toString=function(){return this.g+""};var A={};/*

 SPDX-License-Identifier: Apache-2.0
*/
function B(){for(var a=["google","load"],b=window,c=0;b&&c<a.length;c++)b=b[a[c]];this.g=b?0:2;this.h=[]}B.prototype.i=function(){for(var a=this.g=0;a<this.h.length;a++)this.h[a]();this.h=[]};
B.prototype.load=function(a){a&&(0==this.g?a():this.h.push(a));if(2==this.g){this.g=1;var b=document;a="SCRIPT";"application/xhtml+xml"===b.contentType&&(a=a.toLowerCase());a=b.createElement(a);w(a,this.i.bind(this));a.setAttribute("type","text/javascript");a.setAttribute("async",!0);b="https://www.google.com/jsapi";if(void 0===x){var c=null;var g=q.trustedTypes;if(g&&g.createPolicy){try{c=g.createPolicy("goog#html",{createHTML:r,createScript:r,createScriptURL:r})}catch(J){q.console&&q.console.error(J.message)}x=
c}else x=c}b=(c=x)?c.createScriptURL(b):b;b=new y(b,A);a.src=b instanceof y&&b.constructor===y?b.g:"type_error:TrustedResourceUrl";var e,z;(e=(b=null==(z=(e=(a.ownerDocument&&a.ownerDocument.defaultView||window).document).querySelector)?void 0:z.call(e,"script[nonce]"))?b.nonce||b.getAttribute("nonce")||"":"")&&a.setAttribute("nonce",e);(e=document.getElementsByTagName("script")[0])?e.parentNode.insertBefore(a,e):document.getElementsByTagName("head")[0].appendChild(a)}};var C=null;function D(a){C||(C=new B);C.load(function(){google.load("maps","3.28",a)})};function E(a){return"gwd-page"==a.tagName.toLowerCase()||"gwd-page"==a.getAttribute("is")}function F(a){if(E(a))return a;for(;a&&9!=a.nodeType;)if((a=a.parentElement)&&E(a))return a;return null};var G="heading interaction key latitude longitude pitch zoom".split(" ");function H(){var a=HTMLElement.call(this)||this;a.g=0;a.D=a.v.bind(a);a.l=null;a.B=a.A.bind(a);return a}var I=HTMLElement;H.prototype=h(I.prototype);H.prototype.constructor=H;if(p)p(H,I);else for(var K in I)if("prototype"!=K)if(Object.defineProperties){var L=Object.getOwnPropertyDescriptor(I,K);L&&Object.defineProperty(H,K,L)}else H[K]=I[K];
H.prototype.connectedCallback=function(){this.s=this.hasAttribute("interaction");this.h=u(this,"latitude");this.i=u(this,"longitude");this.m=t(this,"heading",0);this.o=t(this,"pitch",0);this.u=t(this,"zoom",2);this.j=this.hasAttribute("key")?this.getAttribute("key"):"";if(!this.gwdIsLoaded()){var a=F(this);a?a.gwdIsLoaded()&&this.gwdLoad():this.gwdLoad()}};H.prototype.gwdIsLoaded=function(){return 2==this.g||3==this.g};H.prototype.gwdLoad=function(){1!=this.g&&M(this)};
H.prototype.attributeChangedCallback=function(a){switch(a){case "interaction":this.s=this.hasAttribute("interaction");break;case "latitude":this.h=u(this,"latitude");break;case "longitude":this.i=u(this,"longitude");break;case "heading":this.m=t(this,"heading",0);break;case "pitch":this.o=t(this,"pitch",0);break;case "zoom":this.u=t(this,"zoom",2);break;case "key":this.j=this.hasAttribute("key")?this.getAttribute("key"):""}0!=this.g&&M(this)};
function M(a){if(isNaN(a.h)||isNaN(a.i))console.error("Missing latitude or longitude:","["+a.h+", "+a.i+"]","in",a),a.g=3,v(a);else{for(a.g=1;a.firstChild;)a.removeChild(a.firstChild);if(a.s){var b=a.j,c="";b&&(c="&key="+b);D({callback:a.D,other_params:"sensor=true"+c})}else b=document.createElement("gwd-image"),c="https://maps.googleapis.com/maps/api/streetview?size="+(a.clientWidth||256)+"x"+(a.clientHeight||256)+"&location="+a.h+","+a.i+"&heading="+a.m+"&pitch="+a.o,a.j&&(c+="&key="+a.j),b.setAttribute("source",
c),b.addEventListener("ready",a.B,!1),a.appendChild(b),a.C=b,a.C.gwdLoad()}}H.prototype.A=function(){this.g=2;v(this)};H.prototype.v=function(){if(1==this.g){this.l=document.createElement("div");this.appendChild(this.l);var a={position:new google.maps.LatLng(this.h,this.i),pov:{heading:this.m,pitch:this.o},zoom:this.u,zoomControl:!0,scrollwheel:!0,scaleControl:!0,disableDoubleClickZoom:!0,disableDefaultUI:!0};new google.maps.StreetViewPanorama(this.l,a);this.g=2;v(this)}};
f.Object.defineProperties(H,{observedAttributes:{configurable:!0,enumerable:!0,get:function(){return G}}});customElements.define("gwd-streetview",H);}).call(this);
