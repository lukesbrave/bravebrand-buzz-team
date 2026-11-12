import {test} from 'node:test';
import {execFileSync} from 'node:child_process';
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
 let saved=options.records ?? (options.names ? options.names.map(name=>({name})) : options.existing?[{name:card.definition.name}]:[]);
 let page,requests=0,manifestDone=false;const calls=[],subscribers=[];
 const ctx={react:React,pages:{register:p=>page=p},agents:{register:()=>{},snapshot:()=>({agents:saved}),subscribe:fn=>{subscribers.push(fn);return()=>{};},types:()=>options.types??[claude],create:async input=>{
   calls.push(input);
   if(options.remoteError)throw Error('VPS unavailable');
   saved.push({name:input.name});subscribers.forEach(fn=>fn());
 },port:async input=>{calls.push(input);if(options.portError)throw Error('Fixture hire failed');saved.push({name:input.name});subscribers.forEach(fn=>fn());return{notes:[]};}},host:{runCommand:async (_,payload)=>{
   const {op}=JSON.parse(payload);
   if(op==='status')return JSON.stringify({protocol:1,community:'wss://fixture.invalid',creationModels:true});
   if(op==='creation-models')return JSON.stringify({models:[{id:'opus',title:'Opus'},{id:'sonnet',title:'Sonnet'}]});
   throw Error('Unexpected bridge operation');
 },request:async({url})=>{
   requests++;if(options.offline)throw Error('Fixture offline');if(options.refused)return{status:403,body:'{}'};
   const path=new URL(url).pathname;
   if(path.includes('/fred-design/')){
     if(options.tier === 'standard') throw Error('Unexpected Standard request for Fred');
     if(path.endsWith('/manifest.json'))return {status:200,body:JSON.stringify({display:'Fred',card:'1/fred.agent.json'})};
     return {status:200,body:JSON.stringify({definition:{name:'Fred',model:'claude-opus-5-5',systemPrompt:'Fred instructions'},profile:{avatarUrl:'https://images.example/buzz.png'}})};
   }
   if(options.upgrade){
     const premium=path.split('/')[1]==='2'.repeat(24);
     if(path.endsWith('/membership.json'))return{status:200,body:JSON.stringify({tier:premium?'premium':'standard'})};
     const bob=path.includes('/content-manager/');
     if(path.endsWith('/manifest.json')){manifestDone=true;return{status:200,body:JSON.stringify(bob&&!premium?{locked:true}:{card:'builder.agent.json',display:bob?'Bob — Content Manager':card.definition.name})};}
     return{status:200,body:JSON.stringify(bob?{definition:{...card.definition,name:'Bob — Content Manager'}}:card)};
   }
   if(path.endsWith('/membership.json'))return{status:200,body:JSON.stringify({tier:options.tier??'premium'})};
   if(path.endsWith('/manifest.json')){manifestDone=true;return{status:200,body:JSON.stringify({card:'builder.agent.json',display:path.includes('/blaze/')?'Blaze (Video Editor)':card.definition.name})};}
   return{status:200,body:JSON.stringify(card)};
 }}};
 localStorage.setItem('bravebrand.team.key','1'.repeat(24));
 const mod=await import('data:text/javascript;base64,'+Buffer.from((options.source ?? source)+'\n// '+Math.random()).toString('base64'));mod.apply(ctx);
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
 const reopen=async()=>{flushSync(()=>reactRoot.render(null));flushSync(()=>reactRoot.render(React.createElement(page.component)));await wait(()=>container.firstChild?.shadowRoot);return container.firstChild.shadowRoot;};
 const replacePlugin=async()=>{
   flushSync(()=>reactRoot.render(null));
   const next=await import('data:text/javascript;base64,'+Buffer.from(source+'\n// replacement '+Math.random()).toString('base64'));
   next.apply(ctx);
   return reopen();
 };
 return{root,calls,card,hire,close,reopen,replacePlugin,requests:()=>requests};
}
for(const mobile of [false,true]) {
 for(const tier of ['standard','premium'])test(`${mobile?'narrow':'wide'} ${tier}: exact instructions and Opus, then no duplicate`,async()=>{
   const f=await fixture({mobile,tier});try{await f.hire();await wait(()=>f.root.querySelector('[aria-label*="on your team"]'));
     assert.equal(f.calls.length,1);assert.equal(f.calls[0].type,claude.key);assert.deepEqual(f.calls[0].config,{...defaults,model:'opus'});assert.equal(defaults.model,'');assert.equal(f.calls[0].instructions,f.card.definition.systemPrompt);
     await f.hire();assert.equal(f.calls.length,1);
   }finally{f.close();}
 });
 for(const key of ['buzz.goose/goose','buzz.codex/codex'])test(`${mobile?'narrow':'wide'}: hire on ${key} with its own defaults`,async()=>{
   const f=await fixture({mobile,types:[{key,title:key,remote:false}]});try{
     await f.hire();await wait(()=>f.root.querySelector('[aria-label*="on your team"]'));
     assert.equal(f.calls[0].type,key);assert.equal(Object.hasOwn(f.calls[0],'config'),false);
     assert.equal(f.calls[0].instructions,f.card.definition.systemPrompt);await f.hire();assert.equal(f.calls.length,1);
   }finally{f.close();}
 });
 test(`${mobile?'narrow':'wide'}: member can choose Goose alongside Claude`,async()=>{
   const goose={key:'buzz.goose/goose',title:'Goose',remote:false};
   const f=await fixture({mobile,types:[claude,goose]});try{
     await wait(()=>f.root.querySelector('#tier').hidden===false);
     f.root.querySelector('[aria-label^="Digital Home Manager"]').click();
     await wait(()=>f.root.querySelector('[data-type="buzz.goose/goose"]'));
     assert.equal(f.calls.length,0);f.root.querySelector('[data-type="buzz.goose/goose"]').click();
     await wait(()=>f.calls.length===1);assert.equal(f.calls[0].type,goose.key);assert.equal(Object.hasOwn(f.calls[0],'config'),false);
   }finally{f.close();}
 });
 for(const types of [[],[{key:'buzz.builderlab/builderlab',title:'Builderlab',remote:false}],[{...claude,remote:true}]])test(`${mobile?'narrow':'wide'}: refuses unsupported or remote setups ${JSON.stringify(types)}`,async()=>{
   const f=await fixture({mobile,types});try{await f.hire();await wait(()=>f.root.querySelector('#spotlight').classList.contains('open'));assert.match(f.root.querySelector('#spot-act').textContent,/Connect Goose/);assert.equal(f.calls.length,0);}finally{f.close();}
 });
 test(`${mobile?'narrow':'wide'}: import failure visible and retry available`,async()=>{
   const f=await fixture({mobile,portError:true});try{await f.hire();await wait(()=>f.root.querySelector('#spot-act').textContent.includes('Fixture hire failed'));assert.ok(f.root.querySelector('#spotlight').classList.contains('open'));assert.equal(f.root.querySelector('[data-hire="architect"]').disabled,false);}finally{f.close();}
 });
}
for (const remoteError of [false,true]) test(`explicit VPS choice (failure=${remoteError})`, async()=>{
 const remote={key:'bravebrand.hire/vps-claude',title:'My VPS · Claude',remote:true};
 const f=await fixture({types:[claude,remote],remoteError});
 try{
   await wait(()=>f.root.querySelector('#tier').hidden===false);
   f.root.querySelector('[aria-label^="Digital Home Manager"]').click();
   await wait(()=>f.root.querySelector('[data-type="bravebrand.hire/vps-claude"]'));
   assert.equal(f.calls.length,0);
   f.root.querySelector('[data-type="bravebrand.hire/vps-claude"]').click();
   await wait(()=>f.root.querySelector('#vps-model'));
   assert.equal(f.calls.length,0);
   const select=f.root.querySelector('#vps-model');
   assert.equal(select.value,'opus');
   select.value='sonnet';select.dispatchEvent(new window.Event('change'));
   f.root.querySelector('[data-confirm-vps]').click();
   await wait(()=>remoteError?f.root.querySelector('#spot-act').textContent.includes('VPS unavailable'):f.root.querySelector('[aria-label*="on your team"]'));
   assert.equal(f.calls.length,1);
   assert.equal(f.calls[0].type,remote.key);
   assert.deepEqual(f.calls[0].config,{instructions:f.card.definition.systemPrompt,model:'sonnet'});
 }finally{f.close();}
});
test('offline retries and preserves saved access',async()=>{const f=await fixture({offline:true});try{await wait(()=>f.root.textContent.includes("Couldn't reach BraveBrand"));assert.equal(f.requests(),3);assert.equal(localStorage.getItem('bravebrand.team.key'),'1'.repeat(24));assert.equal(f.calls.length,0);}finally{f.close();}});
test('refused access clears saved link without hiring',async()=>{const f=await fixture({refused:true});try{await wait(()=>f.root.textContent.includes("isn't recognised"));assert.equal(localStorage.getItem('bravebrand.team.key'),null);assert.equal(f.calls.length,0);}finally{f.close();}});
test('existing Simon is not imported again',async()=>{const f=await fixture({existing:true});try{await f.hire();assert.equal(f.calls.length,0);assert.match(f.root.querySelector('#spot-act').textContent,/on your team/);}finally{f.close();}});

for(const mobile of [false,true])test(`${mobile?'narrow':'wide'}: Standard to Premium unlock preserves Simon and hires Bob once`,async()=>{
 const f=await fixture({mobile,upgrade:true,existing:true});try{
  await wait(()=>f.root.querySelector('#tiername').textContent==='Standard');
  f.root.querySelector('[aria-label^="Content Manager"]').click();
  await wait(()=>f.root.querySelector('[data-premium-entry]'));
  assert.equal(f.root.querySelector('#spotlink'),null);
  assert.equal(f.root.querySelector('#spot-act .cta').textContent,'Upgrade to Premium in Skool');
  f.root.querySelector('[data-premium-entry]').click();
  assert.equal(f.root.querySelector('#spot-act a.cta'),null);
  f.root.querySelector('[data-premium-back]').click();
  assert.equal(f.root.querySelector('#spotlink'),null);
  f.root.querySelector('[data-premium-entry]').click();

  assert.match(f.root.querySelector('#spot-act').textContent,/Unlock your full team/);
  assert.equal(f.calls.length,0);
  const submit=value=>{f.root.querySelector('#spotlink').value=value;f.root.querySelector('form[data-unlock]').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));};
  submit('not a link');assert.match(f.root.querySelector('#spot-act').textContent,/isn't a BraveBrand/);assert.equal(f.calls.length,0);
  submit('https://home.bravebrand.com/'+'2'.repeat(24)+'/');
  await wait(()=>f.root.querySelector('[data-hire="content"]'));
  assert.equal(f.root.querySelector('#tiername').textContent,'Premium');
  assert.equal(localStorage.getItem('bravebrand.team.key'),'2'.repeat(24));
  assert.equal(f.calls.length,0,'Switching access must not create or update any employee');
  f.root.querySelector('[data-hire="content"]').click();
  await wait(()=>f.calls.length===1);
  assert.equal(f.calls[0].name,'Bob — Content Manager');
  assert.equal(f.calls[0].instructions,f.card.definition.systemPrompt);
  assert.equal(f.calls[0].config.model,'opus');
  await wait(()=>!f.root.querySelector('#spotlight').classList.contains('open'));
  await f.hire();assert.equal(f.calls.length,1,'Existing Simon is retained without reimport');
  const reopened=await f.reopen();await wait(()=>reopened.querySelector('#tiername').textContent==='Premium');
  assert.equal(f.calls.length,1,'Reopening does not import employees');
  await wait(()=>reopened.querySelector('[aria-label^="Digital Home Manager"]').textContent.includes('Hired'));
  await wait(()=>reopened.querySelector('[aria-label^="Content Manager"]').textContent.includes('Hired'));
 }finally{f.close();}
});

test('footer Change access link upgrades in the same plugin without creating employees',async()=>{
 const f=await fixture({upgrade:true,existing:true});try{
  await wait(()=>f.root.querySelector('#tiername').textContent==='Standard');
  f.root.querySelector('#changelink').click();assert.equal(f.root.querySelector('#gate').hidden,false);
  f.root.querySelector('#gatelink').value='https://home.bravebrand.com/'+'2'.repeat(24)+'/';
  f.root.querySelector('#gate').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  await wait(()=>f.root.querySelector('#tiername').textContent==='Premium');assert.equal(f.calls.length,0);
 }finally{f.close();}
});
test('offline upgrade retains the entered Premium link and recovers on reopening',async()=>{
 const options={upgrade:true,existing:true};const f=await fixture(options);try{
  await wait(()=>f.root.querySelector('#tiername').textContent==='Standard');
  f.root.querySelector('[aria-label^="Content Manager"]').click();await wait(()=>f.root.querySelector('[data-premium-entry]'));f.root.querySelector('[data-premium-entry]').click();
  options.offline=true;f.root.querySelector('#spotlink').value='2'.repeat(24);
  f.root.querySelector('form[data-unlock]').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  await wait(()=>f.root.querySelector('#spot-act').textContent.includes("Couldn't reach BraveBrand"));
  assert.equal(localStorage.getItem('bravebrand.team.key'),'2'.repeat(24));assert.equal(f.calls.length,0);
  options.offline=false;const reopened=await f.reopen();await wait(()=>reopened.querySelector('#tiername').textContent==='Premium');assert.equal(f.calls.length,0);
 }finally{f.close();}
});

for (const name of ['Blaze (Video Editor & Ads Manager)', 'Blaze (Video Editor)', 'Blaze', 'Blaze (Unrelated Role)']) test('Blaze recognition: '+name,async()=>{
 const f=await fixture({names:[name]});try{
  await wait(()=>f.root.querySelector('#tiername').textContent==='Premium');
  f.root.querySelector('[aria-label^="Video Editor"]').click();
  await wait(()=>f.root.querySelector('[data-hire="adsmanager"]') || f.root.querySelector('#spot-act').textContent.includes('on your team'));
  const known=['Blaze (Video Editor & Ads Manager)','Blaze (Video Editor)'].includes(name);
  assert.equal(f.root.querySelector('#spot-act').textContent.includes('on your team'),known);
  assert.equal(!!f.root.querySelector('[data-hire="adsmanager"]'),!known);
  assert.equal(f.calls.length,0);
 }finally{f.close();}
});

test('published old plugin to corrected plugin preserves access and customised agents',async()=>{
 const old=execFileSync('git',['show','25a6ee94b6b9bded556ff5c64bfce853bbe93349:dist/plugin.js'],{encoding:'utf8'});
 const records=[
  {name:'Simon — Digital Home Manager',id:'existing-simon',instructions:'Owner-customised Simon instructions',config:{model:'owner-choice'},memory:{project:'Keep my Home'}},
  {name:'Blaze (Video Editor & Ads Manager)',id:'existing-blaze',instructions:'Keep customised Blaze',config:{model:'owner-choice'}}
 ];
 const before=structuredClone(records);
 const f=await fixture({source:old,records});try{
  await wait(()=>f.root.querySelector('#tiername').textContent==='Premium');
  const access=localStorage.getItem('bravebrand.team.key');
  const updated=await f.replacePlugin();
  await wait(()=>updated.querySelector('#tiername').textContent==='Premium');
  await wait(()=>updated.querySelector('[aria-label^="Video Editor"]').getAttribute('aria-label').includes('on your team'));
  assert.deepEqual(records,before);
  assert.equal(localStorage.getItem('bravebrand.team.key'),access);
  assert.equal(f.calls.length,0,'Plugin replacement never imports or rewrites an employee');
  updated.querySelector('[aria-label^="Digital Home Manager"]').click();
  await wait(()=>updated.querySelector('#spot-act').textContent.includes('on your team'));
  assert.equal(f.calls.length,0);
 }finally{f.close();}
});

test('Premium can hire Fred once or recognise the manual import', async()=>{
 for(const names of [[],['Fred'],['Fred (Graphic Designer)']]){
  const f=await fixture({names});
  try{
   const button=f.root.querySelector('[data-seat="fred"]');
   await wait(()=>!button.hidden);
   button.click();
   if(!names.length){
    await wait(()=>f.root.querySelector('[data-hire="fred"]'));
    f.root.querySelector('[data-hire="fred"]').click();
    await wait(()=>f.calls.length===1);
    assert.equal(f.calls[0].config.model,'claude-opus-5-5');
    assert.equal(f.calls[0].picture,'https://images.example/buzz.png');
    assert.equal(f.calls[0].instructions,'Fred instructions');
    button.click();
   }
   await wait(()=>f.root.querySelector('#spot-act').textContent.includes('on your team'));
   assert.equal(f.root.querySelector('[data-hire="fred"]'),null);
  } finally { f.close(); }
 }
});
test('Standard has no Fred hire action',async()=>{
 const f=await fixture({tier:'standard'});
 try{
  await wait(()=>f.root.querySelector('#tiername').textContent==='Standard');
  const button=f.root.querySelector('[data-seat="fred"]');
  assert.equal(button.hidden,false);
  assert.equal(button.nextElementSibling.dataset.seat,"salesrep");
  assert.equal(button.querySelector('.btext').textContent,'Graphic Designer');
  assert.match(button.querySelector('.fig img').src,/fred-studio-loop\.png$/);
  button.click();
  assert.deepEqual([...f.root.querySelectorAll('#spot-stats dt')].map(el=>el.textContent),['You get','They run','So you']);
  assert.match(f.root.querySelector('#spot-stats').textContent,/Three visual routes/);
  assert.equal(f.root.querySelector('#spot-name').textContent,'Graphic Designer');
  assert.equal(f.root.querySelector('[data-hire="fred"]'),null);
 } finally {f.close();}
});
