import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
const source=readFileSync(process.env.HIRING_TEST_ARTIFACT || new URL('../dist/plugin.js',import.meta.url),'utf8');
const wait=async fn=>{for(let i=0;i<800;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}throw Error('Expected lifecycle state did not arrive');};
const defaults=Object.freeze({model:'',effort:'',instructions:'',workspace:'~/.buzz',scope:'thread'});
const claude={key:'buzz.claude-code/claude-code',title:'Claude',remote:false,defaults:()=>({config:defaults})};
async function fixture(options={}) {
 const window=new Window({url:'https://fixture.invalid'});
 for(const name of ['window','document','localStorage','navigator','HTMLElement','HTMLCanvasElement'])Object.defineProperty(globalThis,name,{configurable:true,value:window[name]});
 globalThis.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
 globalThis.ResizeObserver=class{observe(){}disconnect(){}};
 Object.defineProperty(window.HTMLElement.prototype,'clientWidth',{configurable:true,get:()=>options.mobile?800:1400});
 window.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){}});
 const card={definition:{name:'Simon — Digital Home Manager',systemPrompt:'Unchanged fixture instructions.\nRetain exact bytes.',model:'opus'}};
 let saved=options.existing?[{name:card.definition.name}]:[];
 let page,requests=0,manifestDone=false;const calls=[],subscribers=[];
 const ctx={react:React,pages:{register:p=>page=p},agents:{snapshot:()=>({agents:saved}),subscribe:fn=>{subscribers.push(fn);return()=>{};},types:()=>options.types??[claude],port:async input=>{calls.push(input);if(options.portError)throw Error('Fixture hire failed');saved.push({name:input.name});subscribers.forEach(fn=>fn());return{notes:[]};}},host:{request:async({url})=>{
   requests++;if(options.offline)throw Error('Fixture offline');if(options.refused)return{status:403,body:'{}'};
   const path=new URL(url).pathname;
   if(path.endsWith('/membership.json'))return{status:200,body:JSON.stringify({tier:options.tier??'premium'})};
   if(path.endsWith('/manifest.json')){manifestDone=true;return{status:200,body:JSON.stringify({card:'builder.agent.json',display:card.definition.name})};}
   return{status:200,body:JSON.stringify(card)};
 }}};
 localStorage.setItem('bravebrand.team.key','1'.repeat(24));
 const mod=await import('data:text/javascript;base64,'+Buffer.from(source+'\n// '+Math.random()).toString('base64'));mod.apply(ctx);
 const container=document.createElement('div');document.body.append(container);const reactRoot=createRoot(container);
 flushSync(()=>reactRoot.render(React.createElement(page.component)));
 await wait(()=>container.firstChild?.shadowRoot);const root=container.firstChild.shadowRoot;
 const close=()=>{flushSync(()=>reactRoot.unmount());window.happyDOM.abort();window.close();};
 const hire=async()=>{
   await wait(()=>manifestDone&&root.querySelector('#tier').hidden===false);
   // Wait for manifest continuations to render the seat, rather than using a delay.
   if(options.mobile&&!options.existing)await wait(()=>root.querySelector('[aria-label^="Digital Home Manager"]').textContent.match(/Employ Me|Hired/));
   root.querySelector('[aria-label^="Digital Home Manager"]').click();
   if(!options.mobile&&!saved.length){await wait(()=>root.querySelector('[data-hire="architect"]'));root.querySelector('[data-hire="architect"]').click();}
 };
 return{root,calls,card,hire,close,requests:()=>requests};
}
for(const mobile of [false,true]) {
 for(const tier of ['standard','premium'])test(`${mobile?'narrow':'wide'} ${tier}: exact instructions and Opus, then no duplicate`,async()=>{
   const f=await fixture({mobile,tier});try{await f.hire();await wait(()=>f.root.querySelector('[aria-label*="on your team"]'));
     assert.equal(f.calls.length,1);assert.equal(f.calls[0].type,claude.key);assert.deepEqual(f.calls[0].config,{...defaults,model:'opus'});assert.equal(defaults.model,'');assert.equal(f.calls[0].instructions,f.card.definition.systemPrompt);
     await f.hire();assert.equal(f.calls.length,1);
   }finally{f.close();}
 });
 for(const types of [[],[{key:'codex',title:'Codex',remote:false}],[{...claude,remote:true}]])test(`${mobile?'narrow':'wide'}: refuses unavailable local Claude ${JSON.stringify(types)}`,async()=>{
   const f=await fixture({mobile,types});try{await f.hire();await wait(()=>f.root.querySelector('#spotlight').classList.contains('open'));assert.match(f.root.querySelector('#spot-act').textContent,/Switch on Claude/);assert.equal(f.calls.length,0);}finally{f.close();}
 });
 test(`${mobile?'narrow':'wide'}: import failure visible and retry available`,async()=>{
   const f=await fixture({mobile,portError:true});try{await f.hire();await wait(()=>f.root.querySelector('#spot-act').textContent.includes('Fixture hire failed'));assert.ok(f.root.querySelector('#spotlight').classList.contains('open'));assert.equal(f.root.querySelector('[data-hire="architect"]').disabled,false);}finally{f.close();}
 });
}
test('offline retries and preserves saved access',async()=>{const f=await fixture({offline:true});try{await wait(()=>f.root.textContent.includes("Couldn't reach BraveBrand"));assert.equal(f.requests(),3);assert.equal(localStorage.getItem('bravebrand.team.key'),'1'.repeat(24));assert.equal(f.calls.length,0);}finally{f.close();}});
test('refused access clears saved link without hiring',async()=>{const f=await fixture({refused:true});try{await wait(()=>f.root.textContent.includes("isn't recognised"));assert.equal(localStorage.getItem('bravebrand.team.key'),null);assert.equal(f.calls.length,0);}finally{f.close();}});
test('existing Simon is not imported again',async()=>{const f=await fixture({existing:true});try{await f.hire();assert.equal(f.calls.length,0);assert.match(f.root.querySelector('#spot-act').textContent,/on your team/);}finally{f.close();}});
