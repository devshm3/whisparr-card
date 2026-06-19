function e(e,t,i,r){var o,s=arguments.length,n=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(s<3?o(n):s>3?o(t,i,n):o(t,i))||n);return s>3&&n&&Object.defineProperty(t,i,n),n}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),o=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}};const n=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new s(i,e,r)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:c,defineProperty:l,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,v=globalThis,_=v.trustedTypes,g=_?_.emptyScript:"",f=v.reactiveElementPolyfillSupport,m=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!c(e,t),$={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:y};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),v.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=$){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&l(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:o}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const s=r?.call(this);o?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??$}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),o=t.litNonce;void 0!==o&&r.setAttribute("nonce",o),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==o?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=r;const s=o.fromAttribute(t,e.type);this[r]=s??this._$Ej?.get(r)??s,this._$Em=null}}requestUpdate(e,t,i,r=!1,o){if(void 0!==e){const s=this.constructor;if(!1===r&&(o=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??y)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:o},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==o||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[m("elementProperties")]=new Map,x[m("finalized")]=new Map,f?.({ReactiveElement:x}),(v.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const w=globalThis,S=e=>e,k=w.trustedTypes,P=k?k.createPolicy("lit-html",{createHTML:e=>e}):void 0,A="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+E,T=`<${C}>`,z=document,M=()=>z.createComment(""),F=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,I="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,U=/>/g,q=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,L=/"/g,B=/^(?:script|style|textarea|title)$/i,j=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),H=Symbol.for("lit-noChange"),Q=Symbol.for("lit-nothing"),W=new WeakMap,V=z.createTreeWalker(z,129);function G(e,t){if(!D(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==P?P.createHTML(t):t}const Y=(e,t)=>{const i=e.length-1,r=[];let o,s=2===t?"<svg>":3===t?"<math>":"",n=N;for(let t=0;t<i;t++){const i=e[t];let a,c,l=-1,d=0;for(;d<i.length&&(n.lastIndex=d,c=n.exec(i),null!==c);)d=n.lastIndex,n===N?"!--"===c[1]?n=O:void 0!==c[1]?n=U:void 0!==c[2]?(B.test(c[2])&&(o=RegExp("</"+c[2],"g")),n=q):void 0!==c[3]&&(n=q):n===q?">"===c[0]?(n=o??N,l=-1):void 0===c[1]?l=-2:(l=n.lastIndex-c[2].length,a=c[1],n=void 0===c[3]?q:'"'===c[3]?L:R):n===L||n===R?n=q:n===O||n===U?n=N:(n=q,o=void 0);const h=n===q&&e[t+1].startsWith("/>")?" ":"";s+=n===N?i+T:l>=0?(r.push(a),i.slice(0,l)+A+i.slice(l)+E+h):i+E+(-2===l?t:h)}return[G(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class K{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let o=0,s=0;const n=e.length-1,a=this.parts,[c,l]=Y(e,t);if(this.el=K.createElement(c,i),V.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=V.nextNode())&&a.length<n;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(A)){const t=l[s++],i=r.getAttribute(e).split(E),n=/([.?@])?(.*)/.exec(t);a.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?te:"?"===n[1]?ie:"@"===n[1]?re:ee}),r.removeAttribute(e)}else e.startsWith(E)&&(a.push({type:6,index:o}),r.removeAttribute(e));if(B.test(r.tagName)){const e=r.textContent.split(E),t=e.length-1;if(t>0){r.textContent=k?k.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],M()),V.nextNode(),a.push({type:2,index:++o});r.append(e[t],M())}}}else if(8===r.nodeType)if(r.data===C)a.push({type:2,index:o});else{let e=-1;for(;-1!==(e=r.data.indexOf(E,e+1));)a.push({type:7,index:o}),e+=E.length-1}o++}}static createElement(e,t){const i=z.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,r){if(t===H)return t;let o=void 0!==r?i._$Co?.[r]:i._$Cl;const s=F(t)?void 0:t._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),void 0===s?o=void 0:(o=new s(e),o._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=o:i._$Cl=o),void 0!==o&&(t=J(e,o._$AS(e,t.values),o,r)),t}class Z{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??z).importNode(t,!0);V.currentNode=r;let o=V.nextNode(),s=0,n=0,a=i[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new X(o,o.nextSibling,this,e):1===a.type?t=new a.ctor(o,a.name,a.strings,this,e):6===a.type&&(t=new oe(o,this,e)),this._$AV.push(t),a=i[++n]}s!==a?.index&&(o=V.nextNode(),s++)}return V.currentNode=z,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=Q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),F(e)?e===Q||null==e||""===e?(this._$AH!==Q&&this._$AR(),this._$AH=Q):e!==this._$AH&&e!==H&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>D(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Q&&F(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=K.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new Z(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=W.get(e.strings);return void 0===t&&W.set(e.strings,t=new K(e)),t}k(e){D(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const o of e)r===t.length?t.push(i=new X(this.O(M()),this.O(M()),this,this.options)):i=t[r],i._$AI(o),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=S(e).nextSibling;S(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,o){this.type=1,this._$AH=Q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Q}_$AI(e,t=this,i,r){const o=this.strings;let s=!1;if(void 0===o)e=J(this,e,t,0),s=!F(e)||e!==this._$AH&&e!==H,s&&(this._$AH=e);else{const r=e;let n,a;for(e=o[0],n=0;n<o.length-1;n++)a=J(this,r[i+n],t,n),a===H&&(a=this._$AH[n]),s||=!F(a)||a!==this._$AH[n],a===Q?e=Q:e!==Q&&(e+=(a??"")+o[n+1]),this._$AH[n]=a}s&&!r&&this.j(e)}j(e){e===Q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Q?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Q)}}class re extends ee{constructor(e,t,i,r,o){super(e,t,i,r,o),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??Q)===H)return;const i=this._$AH,r=e===Q&&i!==Q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==Q&&(i===Q||r);r&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const se=w.litHtmlPolyfillSupport;se?.(K,X),(w.litHtmlVersions??=[]).push("3.3.3");const ne=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ae extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let o=r._$litPart$;if(void 0===o){const e=i?.renderBefore??null;r._$litPart$=o=new X(t.insertBefore(M(),e),e,void 0,i??{})}return o._$AI(e),o})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return H}}ae._$litElement$=!0,ae.finalized=!0,ne.litElementHydrateSupport?.({LitElement:ae});const ce=ne.litElementPolyfillSupport;ce?.({LitElement:ae}),(ne.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const le=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},de={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:y},he=(e=de,t,i)=>{const{kind:r,metadata:o}=i;let s=globalThis.litPropertyMetadata.get(o);if(void 0===s&&globalThis.litPropertyMetadata.set(o,s=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),s.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const o=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,o,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const o=this[r];t.call(this,i),this.requestUpdate(r,o,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ue(e){return pe({...e,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ve="whisparr_hacs";async function _e(e,t,i,r,o={}){const s={type:`${ve}/get_parent_scenes`,entry_id:t,kind:i,parent_id:r};o.filter&&"all"!==o.filter&&(s.filter=o.filter),o.sort&&(s.sort=o.sort),o.search&&(s.search=o.search);return(await e.connection.sendMessagePromise(s)).scenes}async function ge(e,t,i,r,o){await e.callService(ve,"set_monitored",{entry_id:t,kind:i,item_id:r,monitored:o})}async function fe(e,t,i,r){await e.callService(ve,"trigger_search",{entry_id:t,kind:i,item_id:r})}async function me(e,t,i,r,o=!1){await e.callService(ve,"delete",{entry_id:t,kind:i,item_id:r,delete_files:o})}const be="whisparr_hacs";let ye=class extends ae{constructor(){super(...arguments),this._entries=[],this._entriesLoaded=!1}setConfig(e){this._config={...e},this.requestUpdate()}updated(e){e.has("hass")&&this.hass&&!this._entriesLoaded&&(this._entriesLoaded=!0,this._loadEntries())}async _loadEntries(){var e;try{const t=await this.hass.connection.sendMessagePromise({type:"config_entries/get",domain:be});this._entries=t.filter(e=>e.domain===be),1!==this._entries.length||(null===(e=this._config)||void 0===e?void 0:e.entry_id)||this._fire({entry_id:this._entries[0].entry_id})}catch{this._entries=[]}}render(){var e,t,i,r;if(!this._config)return j``;const o=this._config;return j`
      <div class="form">
        ${this._entries.length>1?j`
          <div class="field">
            <label>Instance</label>
            <select @change=${e=>this._fire({entry_id:e.target.value})}>
              <option value="" ?selected=${!o.entry_id}>Select…</option>
              ${this._entries.map(e=>j`
                <option value=${e.entry_id} ?selected=${o.entry_id===e.entry_id}>
                  ${e.title}
                </option>
              `)}
            </select>
          </div>
        `:""}
        <div class="field">
          <label>Card Title (default: "Scenes")</label>
          <input .value=${null!==(e=o.card_title)&&void 0!==e?e:""} @change=${this._str("card_title")} />
        </div>
        <div class="field">
          <label>Appearance</label>
          <select @change=${this._str("appearance")}>
            ${["glass","material"].map(e=>{var t;return j`
              <option value=${e} ?selected=${(null!==(t=o.appearance)&&void 0!==t?t:"glass")===e}>
                ${"glass"===e?"Glass (default)":"Material You"}
              </option>
            `})}
          </select>
        </div>
        <div class="field">
          <label>Default View</label>
          <select @change=${this._str("default_view")}>
            ${["scenes","studios","performers"].map(e=>{var t;return j`
              <option value=${e} ?selected=${(null!==(t=o.default_view)&&void 0!==t?t:"scenes")===e}>${e}</option>`})}
          </select>
        </div>
        <div class="field">
          <label>Default Sort</label>
          <select @change=${this._str("default_sort")}>
            ${["added","released","title"].map(e=>{var t;return j`
              <option value=${e} ?selected=${(null!==(t=o.default_sort)&&void 0!==t?t:"added")===e}>${e}</option>`})}
          </select>
        </div>
        <div class="field">
          <label>Columns (2–3, default: 2)</label>
          <input type="number" min="2" max="3" .value=${String(null!==(t=o.columns)&&void 0!==t?t:2)}
            @change=${e=>this._fire({columns:Number(e.target.value)})} />
        </div>
        <div class="field">
          <label>Page Size (default: 25)</label>
          <input type="number" min="10" max="200" .value=${String(null!==(i=o.page_size)&&void 0!==i?i:25)}
            @change=${e=>this._fire({page_size:Number(e.target.value)})} />
        </div>
        <div class="field">
          <label>Poster Border Radius px (default: 8)</label>
          <input type="number" min="0" max="24" .value=${String(null!==(r=o.poster_radius)&&void 0!==r?r:8)}
            @change=${e=>this._fire({poster_radius:Number(e.target.value)})} />
        </div>
        ${this._checkbox("Show Studios Tab","show_studios_tab")}
        ${this._checkbox("Show Performers Tab","show_performers_tab")}
        ${this._checkbox("Show Status Badges","show_status_badges")}
        ${this._checkbox("Show Filter Counts","show_filter_counts")}
        ${this._checkbox("Show Quality Profile","show_quality")}
        ${this._checkbox("Show File Info","show_file_info")}
        ${this._checkbox("Show Refresh Button","show_refresh_button")}
      </div>
    `}_checkbox(e,t){return j`
      <div class="field-row">
        <input type="checkbox" ?checked=${!1!==this._config[t]}
          @change=${e=>this._fire({[t]:e.target.checked})} />
        <label>${e}</label>
      </div>
    `}_str(e){return t=>this._fire({[e]:t.target.value})}_fire(e){this._config={...this._config,...e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0})),this.requestUpdate()}};ye.styles=n`
    .form { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field-row { display: flex; align-items: center; gap: 8px; }
    label { color: var(--secondary-text-color); font-size: 0.85rem; }
    input:not([type=checkbox]), select {
      background: var(--card-background-color, #1c1c1e);
      border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
      border-radius: 6px; color: var(--primary-text-color);
      padding: 6px 10px; width: 100%; box-sizing: border-box;
    }
  `,e([pe({attribute:!1})],ye.prototype,"hass",void 0),e([ue()],ye.prototype,"_entries",void 0),ye=e([le("whisparr-hacs-card-editor")],ye);const $e=[{key:"all",label:"All"},{key:"available",label:"Available"},{key:"missing",label:"Missing"},{key:"downloading",label:"Downloading"},{key:"unmonitored",label:"Unmonitored"}];let xe=class extends ae{constructor(){super(...arguments),this.activeFilter="all"}render(){return j`${$e.map(e=>{var t;return j`
      <button
        class=${e.key===this.activeFilter?"active":""}
        @click=${()=>this._select(e.key)}
      >${e.label}${this.counts?j`<span class="count">${null!==(t=this.counts[e.key])&&void 0!==t?t:0}</span>`:""}</button>
    `})}`}_select(e){this.dispatchEvent(new CustomEvent("filter-change",{detail:e,bubbles:!0,composed:!0}))}};xe.styles=n`
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 16px;
    }
    button {
      background: var(--rc-chip-bg, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.09));
      border-radius: var(--rc-chip-radius, 20px);
      color: var(--rc-text-secondary, var(--secondary-text-color));
      cursor: pointer;
      font-size: 0.82rem;
      letter-spacing: 0.02em;
      padding: 4px 14px;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    button.active::before { content: var(--rc-chip-check, ""); }
    button:hover {
      background: color-mix(in srgb, var(--rc-text, #fff) 8%, transparent);
      color: var(--rc-text, var(--primary-text-color));
    }
    button.active {
      background: var(--rc-accent-container, var(--primary-color));
      border-color: var(--rc-accent-container, var(--primary-color));
      color: var(--rc-on-accent, var(--text-primary-color, #fff));
      font-weight: 600;
    }
    .count {
      background: color-mix(in srgb, var(--rc-text, #fff) 15%, transparent);
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 1px 6px;
    }
    button.active .count {
      background: color-mix(in srgb, var(--rc-on-accent, #000) 22%, transparent);
    }
  `,e([pe()],xe.prototype,"activeFilter",void 0),e([pe({attribute:!1})],xe.prototype,"counts",void 0),xe=e([le("whisparr-filter-chips")],xe);let we=class extends ae{constructor(){super(...arguments),this.active="scenes",this.showStudios=!0,this.showPerformers=!0}_select(e){this.dispatchEvent(new CustomEvent("view-change",{detail:e,bubbles:!0,composed:!0}))}render(){const e=(e,t)=>j`
      <button class=${e===this.active?"active":""} @click=${()=>this._select(e)}>${t}</button>`;return j`<div class="seg">
      ${e("scenes","Scenes")}
      ${this.showStudios?e("studios","Studios"):""}
      ${this.showPerformers?e("performers","Performers"):""}
    </div>`}};we.styles=n`
    :host { display: flex; gap: 4px; padding: 10px 16px 0; }
    .seg {
      display: flex; gap: 4px;
      background: var(--rc-surface-container, rgba(255,255,255,.05));
      border-radius: var(--rc-control-radius, 8px);
      padding: 3px;
    }
    button {
      background: transparent; border: none;
      border-radius: var(--rc-control-radius, 8px);
      color: var(--rc-text-secondary, var(--secondary-text-color));
      cursor: pointer; font-size: 0.85rem; padding: 6px 14px;
      transition: background 0.15s, color 0.15s;
    }
    button.active {
      background: var(--rc-accent-container, var(--primary-color));
      color: var(--rc-on-accent, var(--text-primary-color, #fff));
      font-weight: 600;
    }
  `,e([pe()],we.prototype,"active",void 0),e([pe({type:Boolean})],we.prototype,"showStudios",void 0),e([pe({type:Boolean})],we.prototype,"showPerformers",void 0),we=e([le("whisparr-tab-bar")],we);let Se=class extends ae{constructor(){super(...arguments),this.selected=!1,this.showBadge=!0,this.radius=8}get _poster(){var e,t,i,r,o,s,n,a;return null!==(a=null!==(r=null===(i=null===(t=null===(e=this.scene)||void 0===e?void 0:e.images)||void 0===t?void 0:t.find(e=>"screenshot"===e.coverType||"fanart"===e.coverType||"poster"===e.coverType))||void 0===i?void 0:i.remoteUrl)&&void 0!==r?r:null===(n=null===(s=null===(o=this.scene)||void 0===o?void 0:o.images)||void 0===s?void 0:s[0])||void 0===n?void 0:n.remoteUrl)&&void 0!==a?a:""}get _downloadPct(){var e;const t=null===(e=this.scene)||void 0===e?void 0:e.queueItem;return t&&0!==t.size?Math.round(100*(1-t.sizeleft/t.size)):0}render(){var e;const t=(i=this.scene).inQueue&&!i.hasFile?"downloading":i.hasFile?"available":i.monitored?"missing":"unmonitored";var i;const r=function(e){var t,i,r;return null!==(r=null!==(i=null!==(t=e.digitalRelease)&&void 0!==t?t:e.releaseDate)&&void 0!==i?i:e.added)&&void 0!==r?r:""}(this.scene).slice(0,10),o="downloading"===t?`${this._downloadPct}%`:t;return j`
      <div
        class="wrap ${this.selected?"selected":""}"
        style="--r:${this.radius}px"
        @click=${()=>this.dispatchEvent(new CustomEvent("poster-click",{detail:this.scene,bubbles:!0,composed:!0}))}
      >
        ${this._poster?j`<img src=${this._poster} alt=${this.scene.title} loading="lazy"
              @error=${e=>e.target.style.display="none"} />`:j`<div class="placeholder">
              <span>${this.scene.title}</span>
              ${this.scene.year?j`<span>(${this.scene.year})</span>`:Q}
            </div>`}

        ${this.showBadge&&!1!==this.scene.inLibrary?j`
          <span class="badge ${t}">${o}</span>
        `:Q}

        <div class="footer">
          <div class="footer-title">${this.scene.title}</div>
          <div class="footer-sub">
            <span>${null!==(e=this.scene.studioTitle)&&void 0!==e?e:""}</span>
            <span>${r}</span>
          </div>
        </div>

        ${this.scene.queueItem?j`
          <div class="progress-bar">
            <div class="progress-fill" style="width:${this._downloadPct}%"></div>
          </div>
        `:Q}
      </div>
    `}};Se.styles=n`
    :host { display: block; cursor: pointer; }
    .wrap {
      aspect-ratio: 16 / 9;
      border: 2px solid transparent;
      border-radius: var(--r, 8px);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      position: relative;
      transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    }
    .wrap:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
      transform: scale(1.025);
    }
    .wrap.selected {
      border-color: var(--rc-accent, var(--primary-color));
      box-shadow: 0 0 0 2px var(--rc-accent, var(--primary-color)), 0 6px 20px rgba(0, 0, 0, 0.35);
    }
    img {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.04));
      display: block;
      height: 100%;
      object-fit: cover;
      width: 100%;
    }
    .placeholder {
      align-items: center;
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.04));
      color: var(--rc-text-secondary, var(--secondary-text-color));
      display: flex;
      flex-direction: column;
      font-size: 0.72rem;
      gap: 4px;
      height: 100%;
      justify-content: center;
      padding: 8px;
      text-align: center;
    }
    .badge {
      border-radius: 10px;
      top: 6px;
      right: 6px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 2px 7px;
      position: absolute;
      text-transform: uppercase;
    }
    .badge.available    { background: #43a047; color: #fff; }
    .badge.missing      { background: #f57c00; color: #fff; }
    .badge.downloading  { background: #1e88e5; color: #fff; }
    .badge.unmonitored  { background: #757575; color: #fff; }
    .footer {
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      bottom: 0;
      left: 0;
      padding: 18px 8px 6px;
      position: absolute;
      right: 0;
    }
    .footer-title {
      color: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .footer-sub {
      align-items: center;
      color: var(--rc-text-secondary, rgba(255,255,255,0.65));
      display: flex;
      font-size: 0.62rem;
      justify-content: space-between;
      margin-top: 2px;
    }
    .progress-bar {
      background: rgba(0,0,0,0.4);
      bottom: 0;
      height: 4px;
      left: 0;
      position: absolute;
      right: 0;
    }
    .progress-fill {
      background: var(--primary-color);
      height: 100%;
      transition: width 1s linear;
    }
  `,e([pe({attribute:!1})],Se.prototype,"scene",void 0),e([pe({type:Boolean})],Se.prototype,"selected",void 0),e([pe({type:Boolean})],Se.prototype,"showBadge",void 0),e([pe({type:Number})],Se.prototype,"radius",void 0),Se=e([le("whisparr-scene-poster")],Se);let ke=class extends ae{constructor(){super(...arguments),this.scenes=[],this.columns=2,this.showBadges=!0,this.posterRadius=8}render(){if(!this.scenes.length)return j`<div class="empty">No scenes found</div>`;const e=Math.min(3,Math.max(2,this.columns||2));return j`
      <div class="grid" style="grid-template-columns:repeat(${e},1fr)">
        ${this.scenes.map(e=>j`
          <whisparr-scene-poster
            .scene=${e}
            ?selected=${e.id===this.selectedSceneId}
            ?showBadge=${this.showBadges}
            .radius=${this.posterRadius}
          ></whisparr-scene-poster>
        `)}
      </div>
    `}};ke.styles=n`
    :host { display: block; padding: 8px; }
    .grid { display: grid; gap: 8px; }
    .empty {
      color: var(--secondary-text-color);
      padding: 32px;
      text-align: center;
    }
  `,e([pe({attribute:!1})],ke.prototype,"scenes",void 0),e([pe({type:Number})],ke.prototype,"columns",void 0),e([pe({type:Number})],ke.prototype,"selectedSceneId",void 0),e([pe({type:Boolean})],ke.prototype,"showBadges",void 0),e([pe({type:Number})],ke.prototype,"posterRadius",void 0),ke=e([le("whisparr-scene-grid")],ke);let Pe=class extends ae{constructor(){super(...arguments),this.open=!1,this.qualityProfiles=[],this.rootFolders=[],this.showQuality=!0,this.showFileInfo=!0,this._monitored=!0,this._searchOnAdd=!0,this._adding=!1,this._confirmDelete=!1,this._searchQueued=!1}get _poster(){var e,t,i,r,o,s,n,a;return null!==(a=null!==(r=null===(i=null===(t=null===(e=this.scene)||void 0===e?void 0:e.images)||void 0===t?void 0:t.find(e=>"screenshot"===e.coverType||"fanart"===e.coverType||"poster"===e.coverType))||void 0===i?void 0:i.remoteUrl)&&void 0!==r?r:null===(n=null===(s=null===(o=this.scene)||void 0===o?void 0:o.images)||void 0===s?void 0:s[0])||void 0===n?void 0:n.remoteUrl)&&void 0!==a?a:""}get _showAddForm(){var e;return!1===(null===(e=this.scene)||void 0===e?void 0:e.inLibrary)}get _downloadPct(){var e;const t=null===(e=this.scene)||void 0===e?void 0:e.queueItem;return t&&0!==t.size?Math.round(100*(1-t.sizeleft/t.size)):0}_formatTimeLeft(e){if(!e)return"";const t=e.split(":").map(Number);if(3!==t.length)return e;const[i,r]=t;return i>0?`${i}h ${r}m left`:r>0?`${r}m left`:"< 1m left"}get _qualityProfileName(){var e,t;if(this.showQuality&&(null===(e=this.scene)||void 0===e?void 0:e.qualityProfileId))return null===(t=this.qualityProfiles.find(e=>e.id===this.scene.qualityProfileId))||void 0===t?void 0:t.name}get _fileInfoStr(){var e,t,i;if(!this.showFileInfo||!(null===(e=this.scene)||void 0===e?void 0:e.movieFile))return;const{quality:r,size:o}=this.scene.movieFile;if(void 0===o)return;return[null!==(i=null===(t=null==r?void 0:r.quality)||void 0===t?void 0:t.name)&&void 0!==i?i:"",o>1e9?`${(o/1e9).toFixed(1)} GB`:`${Math.round(o/1e6)} MB`].filter(Boolean).join(" · ")}updated(e){e.has("scene")&&(this._profileId=void 0,this._folder=void 0,this._monitored=!0,this._searchOnAdd=!0,this._adding=!1,this._addError=void 0,this._confirmDelete=!1,this._searchQueued=!1)}render(){var e,t;if(!this.scene)return j``;const i=this.scene,r=null!==(e=i.releaseDate)&&void 0!==e?e:i.digitalRelease;return j`
      <div class="panel">
        <div class="poster">
          ${this._poster?j`<img src=${this._poster} alt=${i.title} />`:j`
              <div class="poster-placeholder">
                <span>${i.title}</span>
                ${i.year?j`<span>(${i.year})</span>`:Q}
              </div>
            `}
        </div>
        <div>
          <h2>${i.title}${i.year?j` <span style="font-weight:400;opacity:.7">(${i.year})</span>`:""}</h2>
          <div class="meta">
            ${[null!==(t=i.studioTitle)&&void 0!==t?t:"",r?r.slice(0,10):""].filter(Boolean).join(" · ")}
          </div>
          ${this._qualityProfileName?j`
            <div class="info-row"><strong>Quality:</strong> ${this._qualityProfileName}</div>
          `:Q}
          ${this._fileInfoStr?j`
            <div class="info-row"><strong>File:</strong> ${this._fileInfoStr}</div>
          `:Q}
          ${i.hasFile?j`
            <div class="info-row"><strong>Status:</strong> Downloaded</div>
          `:j`
            <div class="info-row"><strong>Status:</strong> Missing</div>
          `}
          ${i.overview?j`<div class="overview">${i.overview}</div>`:""}

          ${this._showAddForm?j`
            <div class="actions">
              <span style="color:var(--secondary-text-color);font-size:.85rem">Not in library</span>
            </div>
          `:j`
            <div class="actions">
              <button
                class=${i.monitored?"monitored-on":"monitored-off"}
                @click=${this._toggleMonitored}
              >${i.monitored?"● Monitored":"○ Unmonitored"}</button>

              <button
                class=${this._searchQueued?"success":""}
                ?disabled=${this._searchQueued}
                @click=${this._searchNow}
              >${this._searchQueued?"✓ Search queued":"Search now"}</button>

              ${this._confirmDelete?j`
                <button class="danger" @click=${this._deleteScene}>Confirm delete</button>
                <button @click=${()=>{this._confirmDelete=!1}}>Cancel</button>
              `:j`
                <button class="danger" @click=${()=>{this._confirmDelete=!0}}>Delete</button>
              `}
            </div>
          `}
        </div>

        ${this.scene.queueItem?j`
          <div class="download-progress">
            <div class="progress-header">
              <span class="progress-label">Downloading${this.scene.queueItem.protocol?` · ${this.scene.queueItem.protocol}`:""}</span>
              <span class="progress-time">${this._formatTimeLeft(this.scene.queueItem.timeleft)}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${this._downloadPct}%"></div>
            </div>
            <div class="progress-pct">${this._downloadPct}%</div>
          </div>
        `:Q}

        ${this._showAddForm?j`
          <div class="add-form">
            <div class="form-row">
              <label>Quality Profile</label>
              <select @change=${e=>this._profileId=Number(e.target.value)}>
                <option value="">Select…</option>
                ${this.qualityProfiles.map(e=>j`<option value=${e.id}>${e.name}</option>`)}
              </select>
            </div>
            <div class="form-row">
              <label>Root Folder</label>
              <select @change=${e=>this._folder=e.target.value}>
                <option value="">Select…</option>
                ${this.rootFolders.map(e=>j`<option value=${e.path}>${e.path}</option>`)}
              </select>
            </div>
            <div class="form-row">
              <label>Monitored</label>
              <input type="checkbox" ?checked=${this._monitored}
                @change=${e=>this._monitored=e.target.checked} />
            </div>
            <div class="form-row">
              <label>Search on add</label>
              <input type="checkbox" ?checked=${this._searchOnAdd}
                @change=${e=>this._searchOnAdd=e.target.checked} />
            </div>
            ${this._addError?j`<div class="add-error">${this._addError}</div>`:""}
            <button
              class="primary"
              ?disabled=${this._adding||!this._profileId||!this._folder}
              @click=${this._addScene}
            >${this._adding?"Adding…":"+ Add to library"}</button>
          </div>
        `:""}
      </div>
    `}_toggleMonitored(){this.dispatchEvent(new CustomEvent("toggle-monitored",{detail:{scene:this.scene,monitored:!this.scene.monitored},bubbles:!0,composed:!0}))}_searchNow(){this._searchQueued=!0,this.dispatchEvent(new CustomEvent("search-now",{detail:{scene:this.scene},bubbles:!0,composed:!0}))}_deleteScene(){this._confirmDelete=!1,this.dispatchEvent(new CustomEvent("delete-scene",{detail:this.scene,bubbles:!0,composed:!0}))}_addScene(){this._profileId&&this._folder&&(this._adding=!0,this._addError=void 0,this.dispatchEvent(new CustomEvent("add-scene",{detail:{scene:this.scene,qualityProfileId:this._profileId,rootFolder:this._folder,monitored:this._monitored,searchOnAdd:this._searchOnAdd},bubbles:!0,composed:!0})))}addComplete(e){this._adding=!1,e&&(this._addError=e)}};Pe.styles=n`
    :host {
      display: block;
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.2s ease;
    }
    :host([open]) { max-height: 1200px; opacity: 1; }

    .panel {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.08));
      border-radius: var(--rc-radius, 12px);
      display: grid;
      gap: 16px;
      grid-template-columns: auto 1fr;
      margin: 0 8px 8px;
      padding: 16px;
    }
    .poster img {
      aspect-ratio: 16 / 9;
      border-radius: 8px;
      display: block;
      object-fit: cover;
      width: 200px;
    }
    .poster-placeholder {
      align-items: center;
      aspect-ratio: 16 / 9;
      background: var(--rc-surface-container, rgba(255,255,255,0.05));
      border-radius: 8px;
      color: var(--secondary-text-color);
      display: flex;
      flex-direction: column;
      font-size: 0.75rem;
      gap: 4px;
      justify-content: center;
      padding: 8px;
      text-align: center;
      width: 200px;
    }
    h2 { font-size: 1.15rem; margin: 0 0 4px; color: var(--rc-text, var(--primary-text-color)); }
    .meta { color: var(--rc-text-secondary, var(--secondary-text-color)); font-size: 0.82rem; line-height: 1.6; }
    .info-row { color: var(--rc-text-secondary, var(--secondary-text-color)); font-size: 0.8rem; margin-top: 4px; }
    .info-row strong { color: var(--rc-text, var(--primary-text-color)); }
    .overview { font-size: 0.88rem; line-height: 1.55; margin-top: 8px; color: var(--rc-text, var(--primary-text-color)); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }

    button {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.07));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.12));
      border-radius: var(--rc-control-radius, 8px);
      color: var(--rc-text, var(--primary-text-color));
      cursor: pointer;
      font-size: 0.84rem;
      padding: 6px 14px;
      transition: background 0.15s;
    }
    button:hover { background: color-mix(in srgb, var(--rc-text, #fff) 12%, transparent); }
    button.primary {
      background: var(--rc-accent-container, var(--primary-color));
      border-color: var(--rc-accent-container, var(--primary-color));
      color: var(--rc-on-accent, var(--text-primary-color, #fff));
    }
    button.primary:disabled { opacity: 0.5; cursor: default; }
    button.primary:hover:not(:disabled) { filter: brightness(1.1); }
    button.danger { border-color: #f44336; color: #f44336; }
    button.danger:hover { background: rgba(244,67,54,0.12); }
    button.monitored-on  { border-color: #43a047; color: #43a047; }
    button.monitored-off { border-color: #757575; color: #9e9e9e; }
    button.success { border-color: #43a047; color: #43a047; }

    .add-form { grid-column: 1 / -1; }
    .form-row {
      align-items: center;
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .form-row label { font-size: 0.84rem; min-width: 120px; }
    select {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.06));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.1));
      border-radius: var(--rc-control-radius, 6px);
      color: var(--rc-text, var(--primary-text-color));
      flex: 1;
      padding: 6px 10px;
    }
    .add-error { color: var(--error-color, #f44336); font-size: 0.8rem; margin-bottom: 8px; }
    .download-progress {
      grid-column: 1 / -1;
      margin-top: 4px;
    }
    .progress-header {
      align-items: center;
      display: flex;
      font-size: 0.8rem;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    .progress-label { color: var(--rc-text-secondary, var(--secondary-text-color)); }
    .progress-time { color: var(--rc-text, var(--primary-text-color)); font-weight: 500; }
    .progress-track {
      background: color-mix(in srgb, var(--rc-text, #fff) 8%, transparent);
      border-radius: 4px;
      height: 6px;
      overflow: hidden;
    }
    .progress-fill {
      background: var(--rc-accent, var(--primary-color));
      border-radius: 4px;
      height: 100%;
      transition: width 1s linear;
    }
    .progress-pct {
      color: var(--rc-text-secondary, var(--secondary-text-color));
      font-size: 0.75rem;
      margin-top: 4px;
      text-align: right;
    }
  `,e([pe({type:Boolean,reflect:!0})],Pe.prototype,"open",void 0),e([pe({attribute:!1})],Pe.prototype,"scene",void 0),e([pe({attribute:!1})],Pe.prototype,"qualityProfiles",void 0),e([pe({attribute:!1})],Pe.prototype,"rootFolders",void 0),e([pe({type:Boolean})],Pe.prototype,"showQuality",void 0),e([pe({type:Boolean})],Pe.prototype,"showFileInfo",void 0),e([ue()],Pe.prototype,"_profileId",void 0),e([ue()],Pe.prototype,"_folder",void 0),e([ue()],Pe.prototype,"_monitored",void 0),e([ue()],Pe.prototype,"_searchOnAdd",void 0),e([ue()],Pe.prototype,"_adding",void 0),e([ue()],Pe.prototype,"_addError",void 0),e([ue()],Pe.prototype,"_confirmDelete",void 0),e([ue()],Pe.prototype,"_searchQueued",void 0),Pe=e([le("whisparr-scene-detail")],Pe);let Ae=class extends ae{constructor(){super(...arguments),this.kind="studio",this.selected=!1,this.radius=8}get _artUrl(){var e,t,i,r,o,s,n,a;const c=null!==(t=null===(e=this.parent)||void 0===e?void 0:e.images)&&void 0!==t?t:[];if("performer"===this.kind){const e=null!==(r=null!==(i=c.find(e=>"headshot"===e.coverType))&&void 0!==i?i:c.find(e=>"poster"===e.coverType))&&void 0!==r?r:c[0];return null!==(o=null==e?void 0:e.remoteUrl)&&void 0!==o?o:""}{const e=null!==(n=null!==(s=c.find(e=>"logo"===e.coverType))&&void 0!==s?s:c.find(e=>"fanart"===e.coverType))&&void 0!==n?n:c[0];return null!==(a=null==e?void 0:e.remoteUrl)&&void 0!==a?a:""}}render(){var e,t,i,r,o;const s=this.parent,n=this._artUrl,a=null!==(e=s.sceneCount)&&void 0!==e?e:0,c=null!==(t=s.missingCount)&&void 0!==t?t:0,l=s.monitored,d=null!==(o=null!==(r=null!==(i=s.displayName)&&void 0!==i?i:s.title)&&void 0!==r?r:s.fullName)&&void 0!==o?o:"";return j`
      <div
        class="wrap ${this.kind} ${this.selected?"selected":""}"
        style="--r:${this.radius}px"
        @click=${()=>this.dispatchEvent(new CustomEvent("poster-click",{detail:s,bubbles:!0,composed:!0}))}
      >
        ${n?j`<img src=${n} alt=${d} loading="lazy" @error=${e=>e.target.style.visibility="hidden"} />`:j`<div class="placeholder">${d}</div>`}

        <span class="monitored-dot ${l?"on":"off"}"></span>

        <div class="footer">
          <div class="footer-name">${d}</div>
          <div class="footer-sub">
            <span class="footer-scenes">${a} scenes</span>
            <span class="footer-missing ${c>0?"warn":""}">${c} missing</span>
          </div>
        </div>
      </div>
    `}};Ae.styles=n`
    :host { display: block; cursor: pointer; }

    .wrap {
      border: 2px solid transparent;
      border-radius: var(--r, 8px);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      position: relative;
      transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    }
    .wrap:hover { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35); transform: scale(1.025); }
    .wrap.selected {
      border-color: var(--rc-accent, var(--primary-color));
      box-shadow: 0 0 0 2px var(--rc-accent, var(--primary-color)), 0 6px 20px rgba(0, 0, 0, 0.35);
    }

    /* performer = portrait 2/3 */
    .wrap.performer { aspect-ratio: 2 / 3; }
    /* studio = landscape 16/7 */
    .wrap.studio { aspect-ratio: 16 / 7; }

    img {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.04));
      display: block; height: 100%; object-fit: cover; width: 100%;
    }
    /* studio art is a logo — show the whole thing, never crop it */
    .wrap.studio img { object-fit: contain; padding: 8px; box-sizing: border-box; }

    .placeholder {
      align-items: center;
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.05));
      color: var(--rc-text-secondary, var(--secondary-text-color));
      display: flex;
      font-size: 0.85rem;
      height: 100%;
      justify-content: center;
      padding: 8px;
      text-align: center;
      width: 100%;
    }

    .monitored-dot {
      border-radius: 50%;
      height: 8px;
      left: 6px;
      position: absolute;
      top: 6px;
      width: 8px;
    }
    .monitored-dot.on  { background: var(--rc-accent, var(--primary-color)); }
    .monitored-dot.off { background: var(--rc-text-secondary, rgba(255,255,255,0.3)); }

    .footer {
      background: linear-gradient(transparent, rgba(0,0,0,0.65));
      bottom: 0; left: 0; right: 0;
      padding: 18px 8px 6px;
      position: absolute;
    }
    .footer-name {
      color: #fff;
      font-size: 0.82rem;
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .footer-sub {
      align-items: center;
      display: flex;
      font-size: 0.72rem;
      justify-content: space-between;
      margin-top: 2px;
    }
    .footer-scenes { color: rgba(255,255,255,0.7); }
    .footer-missing { color: rgba(255,255,255,0.7); }
    .footer-missing.warn { color: var(--rc-accent, #f57c00); }
  `,e([pe({attribute:!1})],Ae.prototype,"parent",void 0),e([pe()],Ae.prototype,"kind",void 0),e([pe({type:Boolean})],Ae.prototype,"selected",void 0),e([pe({type:Number})],Ae.prototype,"radius",void 0),Ae=e([le("whisparr-parent-poster")],Ae);let Ee=class extends ae{constructor(){super(...arguments),this.open=!1,this.kind="studio",this.scenes=[],this.loading=!1,this.qualityProfiles=[],this.rootFolders=[],this.showQuality=!0,this.showFileInfo=!0,this._monitored=!0,this._searchOnAdd=!0,this._adding=!1,this._confirmDelete=!1,this._optimisticScenes={},this._expandedYears={}}get _artUrl(){var e,t,i,r,o,s,n,a;const c=null!==(t=null===(e=this.parent)||void 0===e?void 0:e.images)&&void 0!==t?t:[];if("performer"===this.kind){const e=null!==(r=null!==(i=c.find(e=>"headshot"===e.coverType))&&void 0!==i?i:c.find(e=>"poster"===e.coverType))&&void 0!==r?r:c[0];return null!==(o=null==e?void 0:e.remoteUrl)&&void 0!==o?o:""}{const e=null!==(n=null!==(s=c.find(e=>"logo"===e.coverType))&&void 0!==s?s:c.find(e=>"fanart"===e.coverType))&&void 0!==n?n:c[0];return null!==(a=null==e?void 0:e.remoteUrl)&&void 0!==a?a:""}}willUpdate(e){var t;if(e.has("scenes")&&(this._optimisticScenes={}),!e.has("parent"))return;const i=e.get("parent");null!=i&&null!=this.parent&&i.id===this.parent.id?void 0!==this._optimisticParent&&(null===(t=this.parent)||void 0===t?void 0:t.monitored)===this._optimisticParent&&(this._optimisticParent=void 0):(this._optimisticParent=void 0,this._optimisticScenes={},this._expandedYears={},this._confirmDelete=!1,this._addError=void 0,this._adding=!1,this._profileId=void 0,this._folder=void 0,this._monitored=!0,this._searchOnAdd=!0)}_sceneThumb(e){var t,i,r;return null!==(r=null===(i=null===(t=e.images)||void 0===t?void 0:t[0])||void 0===i?void 0:i.remoteUrl)&&void 0!==r?r:""}_sceneSubLine(e){var t,i,r,o,s;const n=null!==(t=e.releaseDate)&&void 0!==t?t:e.digitalRelease,a=n?n.slice(0,10):"";if(e.inQueue&&e.queueItem){const t=e.queueItem;return`downloading ${t.size>0?Math.round(100*(1-t.sizeleft/t.size)):0}%`}if(!e.hasFile)return[a,"not downloaded"].filter(Boolean).join(" · ");const c=[];if(a&&c.push(a),this.showQuality){const t=null===(o=null===(r=null===(i=e.movieFile)||void 0===i?void 0:i.quality)||void 0===r?void 0:r.quality)||void 0===o?void 0:o.name;t&&c.push(t)}if(this.showFileInfo&&void 0!==(null===(s=e.movieFile)||void 0===s?void 0:s.size)){const t=e.movieFile.size;c.push(t>1e9?`${(t/1e9).toFixed(1)} GB`:`${Math.round(t/1e6)} MB`)}return c.filter(Boolean).join(" · ")}_scenePill(e){if(e.inQueue&&e.queueItem){const t=e.queueItem;return{cls:"pct",label:`${t.size>0?Math.round(100*(1-t.sizeleft/t.size)):0}%`}}return e.hasFile?{cls:"file",label:"FILE"}:{cls:"missing",label:"MISSING"}}render(){var e,t,i;if(!this.parent)return j``;const r=this.parent,o=null!==(i=null!==(t=null!==(e=r.displayName)&&void 0!==e?e:r.title)&&void 0!==t?t:r.fullName)&&void 0!==i?i:"",s=this._artUrl,n=!1!==r.inLibrary;return j`
      <div class="panel">
        <div class="hero-art ${this.kind}">
          ${s?j`<img src=${s} alt=${o} />`:j`<div class="hero-art-placeholder ${this.kind}">${o}</div>`}
        </div>
        <div>
          <h2>${o}</h2>
          ${n?this._renderStatLine(r):Q}
          ${n?this._renderManageActions(r):Q}
        </div>

        ${n?this._renderScenes():this._renderAddForm(r)}
      </div>
    `}_renderStatLine(e){var t,i,r;const o=null!==(t=e.sceneCount)&&void 0!==t?t:0,s=null!==(i=e.missingCount)&&void 0!==i?i:0,n=this.scenes.filter(e=>e.hasFile).length,a=null!==(r=this._optimisticParent)&&void 0!==r?r:e.monitored;return j`
      <div class="stat-line">
        ${o} scenes · ${n} downloaded · ${s} missing · ${a?"monitored":"unmonitored"}
      </div>
    `}_renderManageActions(e){var t;const i=null!==(t=this._optimisticParent)&&void 0!==t?t:e.monitored;return j`
      <div class="actions">
        <button class="action" @click=${()=>this._toggleParent(e)}>
          ${i?"◉ Monitored":"◯ Unmonitored"}
        </button>
        <button class="action" @click=${()=>this._searchParent(e)}>⌕ Search all</button>
        ${this._confirmDelete?j`
          <button class="action danger" @click=${()=>this._deleteParent(e)}>Confirm delete</button>
          <button class="action" @click=${()=>{this._confirmDelete=!1}}>Cancel</button>
        `:j`
          <button class="action danger" @click=${()=>{this._confirmDelete=!0}}>Delete</button>
        `}
      </div>
    `}_sceneYear(e){var t,i;const r=null!==(t=e.releaseDate)&&void 0!==t?t:e.digitalRelease;if(r){const e=Number(r.slice(0,4));if(e)return e}return null!==(i=e.year)&&void 0!==i?i:null}get _scenesByYear(){const e=new Map;for(const t of this.scenes){const i=this._sceneYear(t),r=null!=i?String(i):"Unknown",o=e.get(r);o?o.push(t):e.set(r,[t])}return[...e.entries()].sort((e,t)=>"Unknown"===e[0]?1:"Unknown"===t[0]?-1:Number(t[0])-Number(e[0]))}_toggleYear(e){this._expandedYears={...this._expandedYears,[e]:!this._expandedYears[e]}}_renderScenes(){return this.loading||0!==this.scenes.length?j`
      <div class="scenes">
        ${this.loading?j`<div class="loading-line">Loading…</div>`:Q}
        ${this._scenesByYear.map(([e,t])=>{var i;const r=null!==(i=this._expandedYears[e])&&void 0!==i&&i,o=t.filter(e=>e.hasFile).length;return j`
            <div class="year-group">
              <button class="year-header" @click=${()=>this._toggleYear(e)}>
                <span class="year-caret ${r?"open":""}">▸</span>
                <span class="year-label">${e}</span>
                <span class="year-count">
                  ${t.length} ${1===t.length?"scene":"scenes"} · ${o} downloaded
                </span>
              </button>
              ${r?j`<div class="year-scenes">${t.map(e=>this._renderSceneRow(e))}</div>`:Q}
            </div>
          `})}
      </div>
    `:j`<div class="scenes"><div class="loading-line">No scenes</div></div>`}_renderSceneRow(e){var t;const i=null!==(t=this._optimisticScenes[e.id])&&void 0!==t?t:e.monitored,r=this._sceneThumb(e),o=this._sceneSubLine(e),s=this._scenePill(e);return j`
      <div class="scene-row">
        <div class="scene-thumb">
          ${r?j`<img src=${r} alt=${e.title} loading="lazy" />`:j`<div class="scene-thumb-placeholder"></div>`}
        </div>
        <div class="scene-info">
          <div class="scene-title">${e.title}</div>
          <div class="scene-sub">${o}</div>
        </div>
        <span class="pill ${s.cls}">${s.label}</span>
        <button
          class="toggle ${i?"on":""}"
          title="Toggle monitored"
          @click=${()=>this._toggleScene(e)}
        ></button>
        <button class="icon-btn" title="Search scene" @click=${()=>this._searchScene(e)}>⌕</button>
      </div>
    `}_renderAddForm(e){return j`
      <div class="add-form">
        <div class="form-row">
          <label>Quality Profile</label>
          <select @change=${e=>{this._profileId=Number(e.target.value)}}>
            <option value="">Select…</option>
            ${this.qualityProfiles.map(e=>j`<option value=${e.id}>${e.name}</option>`)}
          </select>
        </div>
        <div class="form-row">
          <label>Root Folder</label>
          <select @change=${e=>{this._folder=e.target.value}}>
            <option value="">Select…</option>
            ${this.rootFolders.map(e=>j`<option value=${e.path}>${e.path}</option>`)}
          </select>
        </div>
        <div class="form-row">
          <label>Monitored</label>
          <input type="checkbox" ?checked=${this._monitored}
            @change=${e=>{this._monitored=e.target.checked}} />
        </div>
        <div class="form-row">
          <label>Search on add</label>
          <input type="checkbox" ?checked=${this._searchOnAdd}
            @change=${e=>{this._searchOnAdd=e.target.checked}} />
        </div>
        ${this._addError?j`<div class="add-error">${this._addError}</div>`:Q}
        <button
          class="action primary"
          ?disabled=${this._adding||!this._profileId||!this._folder}
          @click=${()=>this._addParent(e)}
        >${this._adding?"Adding…":"+ Add to library"}</button>
      </div>
    `}_toggleParent(e){var t;const i=!(null!==(t=this._optimisticParent)&&void 0!==t?t:e.monitored);this._optimisticParent=i,this.dispatchEvent(new CustomEvent("toggle-monitored",{detail:{kind:this.kind,item:e,monitored:i},bubbles:!0,composed:!0}))}_searchParent(e){this.dispatchEvent(new CustomEvent("search-now",{detail:{kind:this.kind,item:e},bubbles:!0,composed:!0}))}_deleteParent(e){this._confirmDelete=!1,this.dispatchEvent(new CustomEvent("delete-parent",{detail:e,bubbles:!0,composed:!0}))}_toggleScene(e){var t;const i=!(null!==(t=this._optimisticScenes[e.id])&&void 0!==t?t:e.monitored);this._optimisticScenes={...this._optimisticScenes,[e.id]:i},this.dispatchEvent(new CustomEvent("scene-toggle-monitored",{detail:{scene:e,monitored:i},bubbles:!0,composed:!0}))}_searchScene(e){this.dispatchEvent(new CustomEvent("scene-search",{detail:{scene:e},bubbles:!0,composed:!0}))}_addParent(e){this._profileId&&this._folder&&(this._adding=!0,this._addError=void 0,this.dispatchEvent(new CustomEvent("add-parent",{detail:{parent:e,qualityProfileId:this._profileId,rootFolder:this._folder,monitored:this._monitored,searchOnAdd:this._searchOnAdd},bubbles:!0,composed:!0})))}addComplete(e){this._adding=!1,e&&(this._addError=e)}};Ee.styles=n`
    :host {
      display: block;
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.2s ease;
    }
    :host([open]) { max-height: 4000px; opacity: 1; }

    .panel {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.08));
      border-radius: var(--rc-radius, 12px);
      display: grid;
      gap: 16px;
      grid-template-columns: auto 1fr;
      margin: 0 8px 8px;
      padding: 16px;
    }

    .hero-art img {
      border-radius: 8px;
      display: block;
    }
    .hero-art.performer img { width: 100px; }
    .hero-art.studio img   { width: 160px; }

    .hero-art-placeholder {
      align-items: center;
      background: var(--rc-surface-container, rgba(255,255,255,0.05));
      border-radius: 8px;
      color: var(--rc-text-secondary, var(--secondary-text-color));
      display: flex;
      font-size: 0.78rem;
      justify-content: center;
      padding: 12px;
      text-align: center;
    }
    .hero-art-placeholder.performer { aspect-ratio: 2/3; width: 100px; }
    .hero-art-placeholder.studio    { aspect-ratio: 16/7; width: 160px; }

    h2 { font-size: 1.15rem; margin: 0 0 4px; color: var(--rc-text, var(--primary-text-color)); }
    .stat-line { color: var(--rc-text-secondary, var(--secondary-text-color)); font-size: 0.82rem; line-height: 1.6; margin-bottom: 4px; }

    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    button.action {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.07));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.12));
      border-radius: var(--rc-control-radius, 8px);
      color: var(--rc-text, var(--primary-text-color));
      cursor: pointer;
      font-size: 0.84rem;
      padding: 6px 14px;
      transition: background 0.15s;
    }
    button.action:hover { background: color-mix(in srgb, var(--rc-text, #fff) 12%, transparent); }
    button.action.primary {
      background: var(--rc-accent-container, var(--primary-color));
      border-color: var(--rc-accent-container, var(--primary-color));
      color: var(--rc-on-accent, var(--text-primary-color, #fff));
    }
    button.action.primary:disabled { opacity: 0.5; cursor: default; }
    button.action.danger { border-color: #f44336; color: #f44336; }
    button.action.danger:hover { background: rgba(244,67,54,0.12); }

    /* Scene rows */
    .scenes { grid-column: 1 / -1; margin-top: 4px; max-height: 60vh; overflow-y: auto; }

    /* Year accordion */
    .year-group { border-bottom: 1px solid var(--rc-outline, rgba(255,255,255,0.08)); }
    .year-header {
      align-items: center;
      background: none;
      border: none;
      color: var(--rc-text, var(--primary-text-color));
      cursor: pointer;
      display: flex;
      font-size: 0.92rem;
      font-weight: 600;
      gap: 8px;
      padding: 10px 2px;
      text-align: left;
      width: 100%;
    }
    .year-header:hover { background: color-mix(in srgb, var(--rc-text, #fff) 6%, transparent); }
    .year-caret {
      color: var(--rc-text-secondary, var(--secondary-text-color));
      display: inline-block;
      font-size: 0.8rem;
      transition: transform 0.15s;
    }
    .year-caret.open { transform: rotate(90deg); }
    .year-count {
      color: var(--rc-text-secondary, var(--secondary-text-color));
      font-size: 0.75rem;
      font-weight: 400;
      margin-left: auto;
    }
    .year-scenes { padding-left: 8px; }
    .year-scenes .scene-row:last-child { border-bottom: none; }
    .loading-line {
      color: var(--rc-text-secondary, var(--secondary-text-color));
      font-size: 0.85rem;
      padding: 8px 2px;
    }
    .scene-row {
      align-items: center;
      border-bottom: 1px solid var(--rc-outline, rgba(255,255,255,0.06));
      display: flex;
      gap: 10px;
      padding: 8px 2px;
    }
    .scene-thumb {
      aspect-ratio: 16 / 9;
      background: var(--rc-surface-container, rgba(255,255,255,0.04));
      border-radius: 4px;
      flex-shrink: 0;
      overflow: hidden;
      width: 80px;
    }
    .scene-thumb img { display: block; height: 100%; object-fit: cover; width: 100%; }
    .scene-thumb-placeholder {
      align-items: center;
      display: flex;
      height: 100%;
      justify-content: center;
      width: 100%;
    }
    .scene-info { flex: 1; min-width: 0; }
    .scene-title {
      color: var(--rc-text, var(--primary-text-color));
      font-size: 0.85rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .scene-sub { color: var(--rc-text-secondary, var(--secondary-text-color)); font-size: 0.75rem; margin-top: 2px; }
    .pill {
      border-radius: 10px;
      flex-shrink: 0;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 2px 7px;
      text-transform: uppercase;
    }
    .pill.file    { background: #43a047; color: #fff; }
    .pill.missing { background: #757575; color: #fff; }
    .pill.pct     { background: #f57c00; color: #fff; }

    .toggle {
      background: color-mix(in srgb, var(--rc-text, #fff) 18%, transparent);
      border: none; border-radius: 11px;
      cursor: pointer; flex-shrink: 0;
      height: 18px; position: relative; width: 32px;
      transition: background 0.15s;
    }
    .toggle.on { background: var(--rc-accent, var(--primary-color)); }
    .toggle::after {
      background: #fff; border-radius: 50%; content: '';
      height: 14px; width: 14px; position: absolute; top: 2px; left: 2px;
      transition: left 0.15s;
    }
    .toggle.on::after { left: 16px; }

    .icon-btn {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.07));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.12));
      border-radius: var(--rc-control-radius, 6px);
      color: var(--rc-text, var(--primary-text-color));
      cursor: pointer; flex-shrink: 0; font-size: 0.8rem; padding: 4px 8px;
    }
    .icon-btn:hover { background: color-mix(in srgb, var(--rc-text, #fff) 13%, transparent); }

    /* Add form */
    .add-form { grid-column: 1 / -1; }
    .form-row { align-items: center; display: flex; gap: 10px; margin-bottom: 10px; }
    .form-row label { font-size: 0.84rem; min-width: 120px; color: var(--rc-text-secondary, var(--secondary-text-color)); }
    select {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.06));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.1));
      border-radius: var(--rc-control-radius, 6px);
      color: var(--rc-text, var(--primary-text-color));
      flex: 1; padding: 6px 10px;
    }
    .add-error { color: var(--error-color, #f44336); font-size: 0.8rem; margin-bottom: 8px; }
  `,e([pe({type:Boolean,reflect:!0})],Ee.prototype,"open",void 0),e([pe({attribute:!1})],Ee.prototype,"parent",void 0),e([pe()],Ee.prototype,"kind",void 0),e([pe({attribute:!1})],Ee.prototype,"scenes",void 0),e([pe({type:Boolean})],Ee.prototype,"loading",void 0),e([pe({attribute:!1})],Ee.prototype,"qualityProfiles",void 0),e([pe({attribute:!1})],Ee.prototype,"rootFolders",void 0),e([pe({type:Boolean})],Ee.prototype,"showQuality",void 0),e([pe({type:Boolean})],Ee.prototype,"showFileInfo",void 0),e([ue()],Ee.prototype,"_profileId",void 0),e([ue()],Ee.prototype,"_folder",void 0),e([ue()],Ee.prototype,"_monitored",void 0),e([ue()],Ee.prototype,"_searchOnAdd",void 0),e([ue()],Ee.prototype,"_adding",void 0),e([ue()],Ee.prototype,"_addError",void 0),e([ue()],Ee.prototype,"_confirmDelete",void 0),e([ue()],Ee.prototype,"_optimisticParent",void 0),e([ue()],Ee.prototype,"_optimisticScenes",void 0),e([ue()],Ee.prototype,"_expandedYears",void 0),Ee=e([le("whisparr-parent-detail")],Ee);const Ce="whisparr_hacs";let Te=class extends ae{constructor(){super(...arguments),this._view="scenes",this._scenes=[],this._filteredScenes=[],this._parents=[],this._filteredParents=[],this._parentScenes=[],this._parentLoading=!1,this._qualityProfiles=[],this._rootFolders=[],this._dialogOpen=!1,this._activeFilter="all",this._searchTerm="",this._remoteForced=!1,this._isRemoteView=!1,this._sort="added",this._loading=!1,this._initialised=!1,this._searchGen=0}static getConfigElement(){return document.createElement("whisparr-hacs-card-editor")}static async getStubConfig(e){var t;try{const i=(await e.connection.sendMessagePromise({type:"config_entries/get",domain:Ce})).find(e=>e.domain===Ce);return{entry_id:null!==(t=null==i?void 0:i.entry_id)&&void 0!==t?t:""}}catch{return{entry_id:""}}}setConfig(e){var t,i,r;if(!e.entry_id)throw new Error("entry_id is required");this._config={default_view:"scenes",show_studios_tab:!0,show_performers_tab:!0,columns:2,default_sort:"added",default_filter:"all",show_status_badges:!0,poster_radius:8,page_size:25,show_quality:!0,show_file_info:!0,show_filter_counts:!0,show_refresh_button:!0,...e},this._view=null!==(t=this._config.default_view)&&void 0!==t?t:"scenes",this._sort=this._clampSort(null!==(i=this._config.default_sort)&&void 0!==i?i:"added",this._view),this._activeFilter=null!==(r=this._config.default_filter)&&void 0!==r?r:"all"}_availableSorts(e){return"scenes"===e?["added","released","title"]:["added","title"]}_clampSort(e,t){return this._availableSorts(t).includes(e)?e:"added"}getCardSize(){var e,t;const i=this._clampCols(null!==(t=null===(e=this._config)||void 0===e?void 0:e.columns)&&void 0!==t?t:2),r=this._pageSize||25;return 3+3*Math.max(1,Math.ceil(r/i))}getGridOptions(){return{columns:"full",rows:"auto"}}updated(e){var t,i,r,o,s,n;if(e.has("hass")||e.has("_config")){this.setAttribute("data-appearance",null!==(i=null===(t=this._config)||void 0===t?void 0:t.appearance)&&void 0!==i?i:"glass");const e=null!==(s=null===(o=null===(r=this.hass)||void 0===r?void 0:r.themes)||void 0===o?void 0:o.darkMode)&&void 0!==s?s:window.matchMedia("(prefers-color-scheme: dark)").matches;this.toggleAttribute("data-dark",!!e)}e.has("hass")&&this.hass&&this._config&&!this._initialised&&(this._initialised=!0,this._loadData()),e.has("_dialogOpen")&&this._dialogOpen&&(null===(n=this._dialog)||void 0===n||n.showModal())}disconnectedCallback(){super.disconnectedCallback(),this._queueTimer&&(clearInterval(this._queueTimer),this._queueTimer=void 0)}_clampCols(e){return Math.min(3,Math.max(2,e||2))}get _pageSize(){var e,t;return null!==(t=null===(e=this._config)||void 0===e?void 0:e.page_size)&&void 0!==t?t:25}get _displayScenes(){return this._pageSize>0?this._filteredScenes.slice(0,this._pageSize):this._filteredScenes}get _displayParents(){return this._pageSize>0?this._filteredParents.slice(0,this._pageSize):this._filteredParents}get _hasMoreScenes(){return this._pageSize>0&&this._filteredScenes.length>this._pageSize}get _hasMoreParents(){return this._pageSize>0&&this._filteredParents.length>this._pageSize}get _activeKind(){return"performers"===this._view?"performer":"studio"}_matchesFilter(e,t){switch(t){case"available":return!!e.available;case"missing":return!!e.monitored&&!e.available;case"downloading":return!!e.inQueue;case"unmonitored":return!e.monitored;default:return!0}}_applyActiveFilter(){this._filteredScenes="all"===this._activeFilter?this._scenes:this._scenes.filter(e=>this._matchesFilter(e,this._activeFilter))}get _filterCounts(){const e=this._scenes;return{all:e.length,available:e.filter(e=>this._matchesFilter(e,"available")).length,missing:e.filter(e=>this._matchesFilter(e,"missing")).length,downloading:e.filter(e=>this._matchesFilter(e,"downloading")).length,unmonitored:e.filter(e=>this._matchesFilter(e,"unmonitored")).length}}async _loadData(e=!1){this._loading=!e,this._error=void 0;try{const t=await async function(e,t){return e.connection.sendMessagePromise({type:`${ve}/get_config`,entry_id:t})}(this.hass,this._config.entry_id);this._qualityProfiles=t.quality_profiles,this._rootFolders=t.root_folders,"scenes"===this._view?await this._loadScenes(e):await this._loadParents(e)}catch(e){this._error=`Could not connect to Whisparr: ${e}`}finally{this._loading=!1}}async _loadScenes(e=!1){var t,i,r,o;const s=e?null===(t=this._selectedScene)||void 0===t?void 0:t.id:void 0,n=e?null===(i=this._dialogSelectedScene)||void 0===i?void 0:i.id:void 0,a=await async function(e,t,i={}){const r={type:`${ve}/get_scenes`,entry_id:t};return i.filter&&"all"!==i.filter&&(r.filter=i.filter),i.sort&&(r.sort=i.sort),i.search&&(r.search=i.search),(await e.connection.sendMessagePromise(r)).scenes}(this.hass,this._config.entry_id,{sort:this._sort});this._scenes=a,this._isRemoteView||(this._applyActiveFilter(),null!=s&&(this._selectedScene=null!==(r=a.find(e=>e.id===s))&&void 0!==r?r:this._selectedScene),null!=n&&(this._dialogSelectedScene=null!==(o=a.find(e=>e.id===n))&&void 0!==o?o:this._dialogSelectedScene));const c=a.some(e=>e.inQueue);c&&!this._queueTimer?this._queueTimer=setInterval(()=>this._loadData(!0),15e3):!c&&this._queueTimer&&(clearInterval(this._queueTimer),this._queueTimer=void 0)}async _loadParents(e=!1){var t,i;const r=e?null===(t=this._selectedParent)||void 0===t?void 0:t.id:void 0,o=e?null===(i=this._dialogSelectedParent)||void 0===i?void 0:i.id:void 0,s=this._activeKind,n=await async function(e,t,i,r={}){const o={type:`${ve}/get_parents`,entry_id:t,kind:i};return r.sort&&(o.sort=r.sort),r.search&&(o.search=r.search),(await e.connection.sendMessagePromise(o)).parents}(this.hass,this._config.entry_id,s,{sort:this._sort});if(this._parents=n,!this._isRemoteView){if(this._filteredParents=n,null!=r){const e=n.find(e=>e.id===r);e&&(this._selectedParent=e)}if(null!=o){const e=n.find(e=>e.id===o);e&&(this._dialogSelectedParent=e)}}}async _reloadParentScenes(){if(this._selectedParent){this._parentLoading=!0;try{this._parentScenes=await _e(this.hass,this._config.entry_id,this._activeKind,this._selectedParent.id)}finally{this._parentLoading=!1}}}_onViewChange(e){var t,i;e!==this._view&&(this._view=e,this._searchTerm="",this._remoteForced=!1,this._isRemoteView=!1,this._selectedScene=void 0,this._dialogSelectedScene=void 0,this._selectedParent=void 0,this._dialogSelectedParent=void 0,this._parentScenes=[],this._filteredParents=[],this._sort=this._clampSort(null!==(t=this._config.default_sort)&&void 0!==t?t:"added",e),this._activeFilter=null!==(i=this._config.default_filter)&&void 0!==i?i:"all",this._loadData())}_onSearchInput(e){this._searchTerm=e.target.value,this._searchGen++,clearTimeout(this._debounceTimer),this._remoteForced=!1,this._isRemoteView=!1;const t=this._searchTerm.toLowerCase();t?"scenes"===this._view?(this._filteredScenes=this._scenes.filter(e=>{var i;return e.title.toLowerCase().includes(t)||String(null!==(i=e.year)&&void 0!==i?i:"").includes(t)}),0===this._filteredScenes.length&&(this._debounceTimer=setTimeout(()=>this._whisparrSceneSearch(),400))):(this._filteredParents=this._parents.filter(e=>{var i,r,o;return(null!==(o=null!==(r=null!==(i=e.displayName)&&void 0!==i?i:e.title)&&void 0!==r?r:e.fullName)&&void 0!==o?o:"").toLowerCase().includes(t)}),0===this._filteredParents.length&&(this._debounceTimer=setTimeout(()=>this._whisparrParentSearch(),400))):"scenes"===this._view?this._applyActiveFilter():this._filteredParents=this._parents}_forceSearchWhisparr(){this._remoteForced=!0,this._searchGen++,clearTimeout(this._debounceTimer),"scenes"===this._view?this._whisparrSceneSearch():this._whisparrParentSearch()}async _whisparrSceneSearch(){if(!this._searchTerm)return;const e=this._searchGen;try{const t=await async function(e,t,i){return(await e.connection.sendMessagePromise({type:`${ve}/lookup_scene`,entry_id:t,term:i})).results}(this.hass,this._config.entry_id,this._searchTerm);this._searchGen===e&&(this._filteredScenes=t,this._isRemoteView=!0)}catch(e){}}async _whisparrParentSearch(){if(!this._searchTerm)return;const e=this._searchGen;try{const t=await async function(e,t,i,r){return(await e.connection.sendMessagePromise({type:`${ve}/lookup_parent`,entry_id:t,kind:i,term:r})).results}(this.hass,this._config.entry_id,this._activeKind,this._searchTerm);this._searchGen===e&&(this._filteredParents=t,this._isRemoteView=!0)}catch(e){}}_onSortChange(e){this._sort=e,this._loadData()}_onFilterChange(e){this._activeFilter=e,this._selectedScene=void 0,this._dialogSelectedScene=void 0,this._isRemoteView=!1,this._remoteForced=!1,this._searchTerm="",this._applyActiveFilter()}_onScenePosterClick(e){var t;this._selectedScene=(null===(t=this._selectedScene)||void 0===t?void 0:t.id)===e.id?void 0:e}_onDialogScenePosterClick(e){var t;this._dialogSelectedScene=(null===(t=this._dialogSelectedScene)||void 0===t?void 0:t.id)===e.id?void 0:e}async _onParentPosterClick(e){var t;if((null===(t=this._selectedParent)||void 0===t?void 0:t.id)===e.id)return this._selectedParent=void 0,void(this._parentScenes=[]);this._selectedParent=e,this._parentScenes=[],this._parentLoading=!0;try{this._parentScenes=await _e(this.hass,this._config.entry_id,this._activeKind,e.id)}finally{this._parentLoading=!1}}async _onDialogParentPosterClick(e){var t;if((null===(t=this._dialogSelectedParent)||void 0===t?void 0:t.id)===e.id)return this._dialogSelectedParent=void 0,void(this._parentScenes=[]);this._dialogSelectedParent=e,this._parentScenes=[],this._parentLoading=!0;try{this._parentScenes=await _e(this.hass,this._config.entry_id,this._activeKind,e.id)}finally{this._parentLoading=!1}}async _onAddSceneEvent(e){const{scene:t,qualityProfileId:i,rootFolder:r,monitored:o,searchOnAdd:s}=e.detail,n=e.target;let a;try{await async function(e,t,i,r,o,s=!0,n=!0){await e.callService(ve,"add_scene",{entry_id:t,foreign_id:i.foreignId,title:i.title,quality_profile_id:r,root_folder:o,monitored:s,search_on_add:n})}(this.hass,this._config.entry_id,t,i,r,o,s),this._selectedScene=void 0,this._dialogSelectedScene=void 0,this._searchTerm="",this._isRemoteView=!1,await this._loadData()}catch(e){a=String(e)}n.addComplete(a)}async _onDeleteSceneEvent(e){const t=e.detail;try{await me(this.hass,this._config.entry_id,"scene",t.id),this._selectedScene=void 0,this._dialogSelectedScene=void 0}catch(e){this._error=`Delete failed: ${e}`}finally{await this._loadData()}}async _onToggleMonitoredScene(e){const{scene:t,monitored:i}=e.detail;try{await ge(this.hass,this._config.entry_id,"scene",t.id,i),await this._loadData(!0)}catch(e){this._error=`Could not update monitored: ${e}`}}async _onSearchNowScene(e){const{scene:t}=e.detail;try{await fe(this.hass,this._config.entry_id,"scene",t.id)}catch(e){this._error=`Search failed: ${e}`}}async _onToggleMonitoredParent(e){var t;const{kind:i,item:r,monitored:o}=e.detail;try{await ge(this.hass,this._config.entry_id,i,r.id,o),await this._loadData(!0),(null===(t=this._selectedParent)||void 0===t?void 0:t.id)===r.id&&await this._reloadParentScenes()}catch(e){this._error=`Could not update monitored: ${e}`}}async _onSearchNowParent(e){const{kind:t,item:i}=e.detail;try{await fe(this.hass,this._config.entry_id,t,i.id)}catch(e){this._error=`Search failed: ${e}`}}async _onDeleteParentEvent(e){const t=e.detail;try{await me(this.hass,this._config.entry_id,this._activeKind,t.id),this._selectedParent=void 0,this._dialogSelectedParent=void 0,this._parentScenes=[]}catch(e){this._error=`Delete failed: ${e}`}finally{await this._loadData()}}async _onSceneToggleMonitored(e){const{scene:t,monitored:i}=e.detail;try{await ge(this.hass,this._config.entry_id,"scene",t.id,i),await this._reloadParentScenes()}catch(e){this._error=`Could not update monitored: ${e}`}}async _onSceneSearch(e){const{scene:t}=e.detail;try{await fe(this.hass,this._config.entry_id,"scene",t.id)}catch(e){this._error=`Search failed: ${e}`}}async _onAddParentEvent(e){const{parent:t,qualityProfileId:i,rootFolder:r,monitored:o,searchOnAdd:s}=e.detail,n=e.target;let a;try{await async function(e,t,i,r,o,s,n=!0,a=!0){var c,l;await e.callService(ve,"add_parent",{entry_id:t,kind:i,foreign_id:r.foreignId,title:null!==(l=null!==(c=r.displayName)&&void 0!==c?c:r.title)&&void 0!==l?l:r.fullName,quality_profile_id:o,root_folder:s,monitored:n,search_on_add:a})}(this.hass,this._config.entry_id,this._activeKind,t,i,r,o,s),this._selectedParent=void 0,this._dialogSelectedParent=void 0,this._parentScenes=[],await this._loadData()}catch(e){a=String(e)}n.addComplete(a)}_openDialog(){this._dialogOpen=!0}_onDialogClose(){this._dialogOpen=!1,this._dialogSelectedScene=void 0,this._dialogSelectedParent=void 0}_renderSortControl(){const e={added:"Added",released:"Released",title:"Title"},t=this._availableSorts(this._view).map(t=>[t,e[t]]);return j`
      <div style="display:flex;gap:4px;padding:4px 16px 0;flex-wrap:wrap">
        ${t.map(([e,t])=>j`
          <button
            class="icon-btn"
            style=${this._sort===e?"border-color:var(--rc-accent);color:var(--rc-accent)":""}
            @click=${()=>this._onSortChange(e)}
          >${t}</button>
        `)}
      </div>
    `}_renderSearchWhisparrLink(){return!this._searchTerm||0===this._filteredScenes.length||this._remoteForced?Q:j`
      <div style="padding:4px 16px 8px;text-align:right">
        <a style="color:var(--primary-color);font-size:.82rem;opacity:.85;text-decoration:none"
          href="#" @click=${e=>{e.preventDefault(),this._forceSearchWhisparr()}}
        >Search Whisparr →</a>
      </div>
    `}_renderSearchWhisparrParentLink(){return!this._searchTerm||0===this._filteredParents.length||this._remoteForced?Q:j`
      <div style="padding:4px 16px 8px;text-align:right">
        <a style="color:var(--primary-color);font-size:.82rem;opacity:.85;text-decoration:none"
          href="#" @click=${e=>{e.preventDefault(),this._forceSearchWhisparr()}}
        >Search Whisparr →</a>
      </div>
    `}_renderSceneGrid(e,t,i){var r,o;if(!e.length)return j`<div class="empty">${this._searchTerm?"No results":"No scenes found"}</div>`;const s=this._clampCols(null!==(o=null===(r=this._config)||void 0===r?void 0:r.columns)&&void 0!==o?o:2),n=null!=t?e.findIndex(e=>e.id===t.id):-1,a=n>=0?Math.min(Math.floor(n/s)*s+s-1,e.length-1):-1;return j`
      <div class="grid" style="grid-template-columns:repeat(${s},1fr)">
        ${e.map((e,r)=>{var o,s,n,c,l;return j`
          <whisparr-scene-poster
            .scene=${e}
            ?selected=${e.id===(null==t?void 0:t.id)}
            .showBadge=${!1!==(null===(o=this._config)||void 0===o?void 0:o.show_status_badges)}
            .radius=${null!==(n=null===(s=this._config)||void 0===s?void 0:s.poster_radius)&&void 0!==n?n:8}
            @poster-click=${()=>i(e)}
          ></whisparr-scene-poster>
          ${r===a?j`
            <div class="inline-detail">
              <whisparr-scene-detail
                open
                .scene=${t}
                .qualityProfiles=${this._qualityProfiles}
                .rootFolders=${this._rootFolders}
                .showQuality=${!1!==(null===(c=this._config)||void 0===c?void 0:c.show_quality)}
                .showFileInfo=${!1!==(null===(l=this._config)||void 0===l?void 0:l.show_file_info)}
                @add-scene=${e=>this._onAddSceneEvent(e)}
                @delete-scene=${e=>this._onDeleteSceneEvent(e)}
                @toggle-monitored=${e=>this._onToggleMonitoredScene(e)}
                @search-now=${e=>this._onSearchNowScene(e)}
              ></whisparr-scene-detail>
            </div>
          `:Q}
        `})}
      </div>
    `}_renderParentGrid(e,t,i,r,o){var s,n;if(!e.length)return j`<div class="empty">${this._searchTerm?"No results":`No ${this._activeKind}s found`}</div>`;const a=this._clampCols(null!==(n=null===(s=this._config)||void 0===s?void 0:s.columns)&&void 0!==n?n:2),c=null!=t?e.findIndex(e=>e.id===t.id):-1,l=c>=0?Math.min(Math.floor(c/a)*a+a-1,e.length-1):-1;return j`
      <div class="grid" style="grid-template-columns:repeat(${a},1fr)">
        ${e.map((e,s)=>{var n,a,c,d;return j`
          <whisparr-parent-poster
            .parent=${e}
            .kind=${this._activeKind}
            ?selected=${e.id===(null==t?void 0:t.id)}
            .radius=${null!==(a=null===(n=this._config)||void 0===n?void 0:n.poster_radius)&&void 0!==a?a:8}
            @poster-click=${()=>i(e)}
          ></whisparr-parent-poster>
          ${s===l?j`
            <div class="inline-detail">
              <whisparr-parent-detail
                open
                .parent=${t}
                .kind=${this._activeKind}
                .scenes=${r}
                .loading=${o}
                .qualityProfiles=${this._qualityProfiles}
                .rootFolders=${this._rootFolders}
                .showQuality=${!1!==(null===(c=this._config)||void 0===c?void 0:c.show_quality)}
                .showFileInfo=${!1!==(null===(d=this._config)||void 0===d?void 0:d.show_file_info)}
                @toggle-monitored=${e=>this._onToggleMonitoredParent(e)}
                @search-now=${e=>this._onSearchNowParent(e)}
                @delete-parent=${e=>this._onDeleteParentEvent(e)}
                @scene-toggle-monitored=${e=>this._onSceneToggleMonitored(e)}
                @scene-search=${e=>this._onSceneSearch(e)}
                @add-parent=${e=>this._onAddParentEvent(e)}
              ></whisparr-parent-detail>
            </div>
          `:Q}
        `})}
      </div>
    `}render(){var e;if(!this._config)return j``;const t=this._config,i=null!==(e=t.card_title)&&void 0!==e?e:"Whisparr",r=!1!==t.show_filter_counts,o="scenes"===this._view,s=o?"Search scenes…":`Search ${this._activeKind}s…`;return j`
      <ha-card>
        <div class="header">
          <span class="title">${i}</span>
          <input class="search" type="search" .placeholder=${s}
            .value=${this._searchTerm} @input=${this._onSearchInput} />
          ${!1!==t.show_refresh_button?j`
            <button class="icon-btn" @click=${()=>this._loadData()} title="Refresh">↻</button>
          `:Q}
        </div>

        <whisparr-tab-bar
          .active=${this._view}
          .showStudios=${!1!==t.show_studios_tab}
          .showPerformers=${!1!==t.show_performers_tab}
          @view-change=${e=>this._onViewChange(e.detail)}
        ></whisparr-tab-bar>

        ${o?j`
          <whisparr-filter-chips
            .activeFilter=${this._activeFilter}
            .counts=${r?this._filterCounts:void 0}
            @filter-change=${e=>this._onFilterChange(e.detail)}
          ></whisparr-filter-chips>
        `:Q}

        ${this._renderSortControl()}

        ${this._loading?j`<div class="state-msg">Loading…</div>`:""}

        ${this._error?j`
          <div class="state-msg error-msg">
            ${this._error}<br/>
            <button class="retry" @click=${()=>{this._error=void 0,this._loadData()}}>Retry</button>
          </div>
        `:""}

        ${this._loading||this._error?"":j`
          ${o?j`
            ${this._renderSceneGrid(this._displayScenes,this._selectedScene,e=>this._onScenePosterClick(e))}
            ${this._hasMoreScenes?j`
              <button class="view-all" @click=${this._openDialog}>
                View all ${this._filteredScenes.length} scenes →
              </button>
            `:""}
            ${this._renderSearchWhisparrLink()}
          `:j`
            ${this._renderParentGrid(this._displayParents,this._selectedParent,e=>this._onParentPosterClick(e),this._parentScenes,this._parentLoading)}
            ${this._hasMoreParents?j`
              <button class="view-all" @click=${this._openDialog}>
                View all ${this._filteredParents.length} ${this._activeKind}s →
              </button>
            `:""}
            ${this._renderSearchWhisparrParentLink()}
          `}
        `}
      </ha-card>

      <dialog @close=${this._onDialogClose}>
        ${this._dialogOpen?j`
          <div class="dialog-header">
            <span class="title">${i}</span>
            <input class="search" type="search" .placeholder=${s}
              .value=${this._searchTerm} @input=${this._onSearchInput} />
            <button class="icon-btn" @click=${()=>{var e;return null===(e=this._dialog)||void 0===e?void 0:e.close()}}>✕</button>
          </div>
          ${o?j`
            <whisparr-filter-chips
              .activeFilter=${this._activeFilter}
              .counts=${r?this._filterCounts:void 0}
              @filter-change=${e=>this._onFilterChange(e.detail)}
            ></whisparr-filter-chips>
            ${this._renderSceneGrid(this._filteredScenes,this._dialogSelectedScene,e=>this._onDialogScenePosterClick(e))}
            ${this._renderSearchWhisparrLink()}
          `:j`
            ${this._renderParentGrid(this._filteredParents,this._dialogSelectedParent,e=>this._onDialogParentPosterClick(e),this._parentScenes,this._parentLoading)}
            ${this._renderSearchWhisparrParentLink()}
          `}
        `:""}
      </dialog>
    `}};Te.styles=n`
    :host {
      display: block;
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
      --rc-text: var(--primary-text-color);
      --rc-text-secondary: var(--secondary-text-color);
      --rc-surface: var(--ha-card-background, var(--card-background-color));
      --rc-surface-container: color-mix(in srgb, var(--rc-text) 8%, transparent);
      --rc-outline: var(--divider-color, color-mix(in srgb, var(--rc-text) 12%, transparent));
      --rc-accent: var(--primary-color);
      --rc-accent-container: var(--primary-color);
      --rc-on-accent: var(--text-primary-color, #fff);
      --rc-radius: var(--ha-card-border-radius, 12px);
      --rc-control-radius: 8px;
      --rc-chip-radius: 20px;
      --rc-chip-bg: var(--rc-surface-container);
      --rc-chip-check: "";
    }
    :host([data-appearance="material"]) {
      --rc-text: #1c1b1a;
      --rc-text-secondary: #5f5b55;
      --rc-surface: color-mix(in srgb, var(--primary-color) 5%, #ffffff);
      --rc-surface-container: color-mix(in srgb, var(--primary-color) 8%, #ffffff);
      --rc-outline: color-mix(in srgb, var(--primary-color) 15%, #b5ada5);
      --rc-accent: var(--primary-color);
      --rc-accent-container: color-mix(in srgb, var(--primary-color) 22%, #ffffff);
      --rc-on-accent: color-mix(in srgb, var(--primary-color) 75%, #000000);
      --rc-radius: 24px;
      --rc-control-radius: 20px;
      --rc-chip-radius: 8px;
      --rc-chip-bg: transparent;
      --rc-chip-check: "✓ ";
    }
    :host([data-appearance="material"][data-dark]) {
      --rc-accent: var(--primary-color);
      --rc-text: #ece5df;
      --rc-text-secondary: #cbc3bb;
      --rc-surface: color-mix(in srgb, var(--primary-color) 6%, #1a1715);
      --rc-surface-container: color-mix(in srgb, var(--primary-color) 10%, #262220);
      --rc-outline: color-mix(in srgb, var(--primary-color) 15%, #4a443d);
      --rc-accent-container: color-mix(in srgb, var(--primary-color) 30%, #000000);
      --rc-on-accent: color-mix(in srgb, var(--primary-color) 60%, #ffffff);
    }
    ha-card {
      overflow: hidden;
      padding: 0;
    }
    :host([data-appearance="material"]) ha-card {
      background: var(--rc-surface);
      border-radius: var(--rc-radius);
      color: var(--rc-text);
    }
    .header {
      align-items: center;
      background: transparent;
      border-bottom: 1px solid var(--rc-outline);
      display: flex;
      gap: 8px;
      padding: 12px 16px;
    }
    .title {
      color: var(--rc-text);
      font-size: 1.05rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
    }
    .search {
      background: var(--rc-surface-container);
      border: 1px solid var(--rc-outline);
      border-radius: var(--rc-control-radius);
      color: var(--rc-text);
      flex: 1;
      font-size: 0.88rem;
      outline: none;
      padding: 7px 13px;
      transition: border-color 0.15s;
    }
    .search::placeholder { color: var(--rc-text-secondary); opacity: 0.7; }
    .search:focus { border-color: var(--rc-accent); }
    .icon-btn {
      background: var(--rc-surface-container);
      border: 1px solid var(--rc-outline);
      border-radius: var(--rc-control-radius);
      color: var(--rc-text);
      cursor: pointer;
      flex-shrink: 0;
      font-size: 1rem;
      line-height: 1;
      padding: 6px 10px;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .icon-btn:hover { background: color-mix(in srgb, var(--rc-text) 14%, transparent); }
    .state-msg { color: var(--rc-text-secondary); padding: 40px 24px; text-align: center; }
    .error-msg { color: var(--error-color, #f44336); }
    .retry {
      background: var(--rc-surface-container);
      border: 1px solid var(--rc-outline);
      border-radius: var(--rc-control-radius);
      color: var(--rc-text);
      cursor: pointer;
      display: inline-block;
      margin-top: 10px;
      padding: 6px 16px;
      transition: background 0.15s;
    }
    .retry:hover { background: color-mix(in srgb, var(--rc-text) 12%, transparent); }
    .grid { display: grid; gap: 8px; padding: 8px; }
    .empty { color: var(--rc-text-secondary); padding: 32px; text-align: center; }
    .inline-detail { animation: slideDown 0.2s ease-out; grid-column: 1 / -1; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .view-all {
      background: var(--rc-surface-container);
      border: 1px solid var(--rc-outline);
      border-radius: var(--rc-control-radius);
      box-sizing: border-box;
      color: var(--rc-accent);
      cursor: pointer;
      display: block;
      font-size: 0.88rem;
      margin: 0 8px 12px;
      padding: 10px;
      text-align: center;
      transition: background 0.15s;
      width: calc(100% - 16px);
    }
    .view-all:hover { background: color-mix(in srgb, var(--rc-text) 9%, transparent); }
    dialog {
      background: var(--card-background-color, #1c1c1e);
      border: none;
      box-sizing: border-box;
      height: 100dvh;
      inset: 0;
      margin: 0;
      max-height: 100%;
      max-width: 100%;
      overflow-y: auto;
      padding: 0;
      position: fixed;
      width: 100%;
    }
    :host([data-appearance="material"]) dialog {
      background: var(--rc-surface);
      color: var(--rc-text);
    }
    dialog::backdrop { background: rgba(0, 0, 0, 0.6); }
    .dialog-header {
      align-items: center;
      background: var(--rc-surface-container);
      border-bottom: 1px solid var(--rc-outline);
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      position: sticky;
      top: 0;
      z-index: 1;
    }
  `,e([pe({attribute:!1})],Te.prototype,"hass",void 0),e([ue()],Te.prototype,"_config",void 0),e([ue()],Te.prototype,"_view",void 0),e([ue()],Te.prototype,"_scenes",void 0),e([ue()],Te.prototype,"_filteredScenes",void 0),e([ue()],Te.prototype,"_selectedScene",void 0),e([ue()],Te.prototype,"_dialogSelectedScene",void 0),e([ue()],Te.prototype,"_parents",void 0),e([ue()],Te.prototype,"_filteredParents",void 0),e([ue()],Te.prototype,"_selectedParent",void 0),e([ue()],Te.prototype,"_dialogSelectedParent",void 0),e([ue()],Te.prototype,"_parentScenes",void 0),e([ue()],Te.prototype,"_parentLoading",void 0),e([ue()],Te.prototype,"_qualityProfiles",void 0),e([ue()],Te.prototype,"_rootFolders",void 0),e([ue()],Te.prototype,"_dialogOpen",void 0),e([ue()],Te.prototype,"_activeFilter",void 0),e([ue()],Te.prototype,"_searchTerm",void 0),e([ue()],Te.prototype,"_remoteForced",void 0),e([ue()],Te.prototype,"_isRemoteView",void 0),e([ue()],Te.prototype,"_sort",void 0),e([ue()],Te.prototype,"_loading",void 0),e([ue()],Te.prototype,"_error",void 0),e([
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function(e){return(t,i,r)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}("dialog")],Te.prototype,"_dialog",void 0),Te=e([le("whisparr-hacs-card")],Te),window.customCards=window.customCards||[],window.customCards.push({type:"whisparr-hacs-card",name:"Whisparr Card",description:"Browse and manage your Whisparr scenes, studios, and performers",preview:!1,documentationURL:"https://github.com/devshm3/whisparr-card"}),console.info("%c WHISPARR-CARD %c 0.1.0 ","background:#e040fb;color:#1a1a1a;font-weight:700","background:#333;color:#fff");export{Te as WhisparrHacsCard};
