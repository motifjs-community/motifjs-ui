import{Zn as e}from"./next-id-CtzpBrBT.js";import{n as t}from"./TabDocumentManager-BA5eduHh.js";var n=()=>e(`svg`,{__isSvgElement:!0,initializeComponent:t=>{t.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let n=e(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M4 1.75h5l3 3v9.5H4zM9 1.75v3h3`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.3`,"stroke-linejoin":`round`})}});t.controls.add(n)}}),r=[{path:`src/index.ts`,text:`export { App } from './app';
export { router } from './router';`},{path:`src/app.ts`,text:`import { Application } from '@motifx/core';

export const App = Application.CreateBuilder().build();`},{path:`src/router.ts`,text:`export const router = { mode: 'history', routes: [] };`},{path:`src/orders/index.ts`,text:`export * from './orders';`},{path:`src/orders/orders.ts`,text:`export interface Order {
  id: number;
  amount: number;
}`},{path:`README.md`,text:`# Shop

A small shop written with MotifJS.`},{path:`package.json`,text:`{
  "name": "shop",
  "private": true
}`},{path:`vite.config.ts`,text:`import { defineConfig } from 'vite';

export default defineConfig({});`}];function i(t){return e(`pre`,{initializeComponent:n=>{n.style(`margin: 0; padding: var(--mx-space-4); overflow: visible; font: var(--mx-font-size-body) / var(--mx-font-line-body) var(--mx-font-family-mono)`);let r=e(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,()=>{if(t!=null)return typeof t==`function`?t():()=>t})},__childExpr:()=>t});n.controls.add(r)}},1)}function a(a,o={}){let s=r.find(e=>e.path===a),c=a.lastIndexOf(`/`);return new t({id:a,type:`file`,title:a.slice(c+1),description:c>0?a.slice(0,c):``,icon:()=>e(n,{runover:{},childs:[]}),content:()=>i(s?.text??``),...o})}export{a as n,i as r,r as t};