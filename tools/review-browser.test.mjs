import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const bundle=await build({stdin:{resolveDir:fileURLToPath(new URL('..',import.meta.url)),contents:`
import React from 'react';import {createRoot} from 'react-dom/client';import {apply} from './dist/plugin.js';
const h=React.createElement;window.calls=[];let page;const records=[],listeners=[];
const Model=({config,onChange})=>h('select',{'aria-label':'Model',value:config.model,onChange:e=>onChange({...config,model:e.target.value})},h('option',{value:'opus'},'Opus'),h('option',{value:'sonnet'},'Sonnet'));
localStorage.setItem('bravebrand.team.key','1'.repeat(24));
apply({react:React,pages:{register:p=>page=p},agents:{snapshot:()=>({agents:records}),subscribe:f=>{listeners.push(f);return()=>{};},types:()=>[{key:'buzz.claude-code/claude-code',title:'Claude',defaults:()=>({config:{model:'',workspace:'kept'}}),CreateModel:Model}],port:async input=>{window.calls.push(input);records.push({name:input.name});listeners.forEach(f=>f());}},host:{request:async({url})=>({status:200,body:JSON.stringify(url.endsWith('membership.json')?{tier:'premium'}:url.endsWith('manifest.json')?{display:'Simon',card:'card.json'}:{definition:{name:'Simon',systemPrompt:'Exact training',model:'opus'}})})}});
createRoot(document.getElementById('host')).render(h(page.component));
`},bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"production"'}});
let passed=0;
for(const [engine,type] of Object.entries({chromium,webkit})){
 const browser=await type.launch({headless:true,...(process.env[engine.toUpperCase()+'_EXECUTABLE']?{executablePath:process.env[engine.toUpperCase()+'_EXECUTABLE']}:{})});
 try{for(const width of [320,400,900])for(const scheme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:800},colorScheme:scheme,reducedMotion:'reduce'});
  await page.route('https://fixture.invalid/**',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0;--surface-popover:#fff;--text-standard:#16314c}@media(prefers-color-scheme:dark){body{--surface-popover:#20252d;--text-standard:#eee}}#host{height:100vh}</style><div id="host"></div>'}));
  await page.goto('https://fixture.invalid/');await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.locator('[data-seat="architect"]').click();await page.locator('[data-hire="architect"]').click();
  await page.locator('[data-hire-review]').waitFor();
  assert.equal(await page.evaluate(()=>window.calls.length),0);
  assert.ok(await page.locator('#host>div').first().evaluate(el=>el.inert));
  assert.equal(await page.locator('[data-hire-review] [role="dialog"]').evaluate(el=>{const r=el.getBoundingClientRect();return el.scrollWidth>el.clientWidth+1||r.left<0||r.right>innerWidth;}),false);
  await page.getByLabel('Model',{exact:true}).selectOption('sonnet');
  await page.locator('[data-hire-cancel]').click();assert.equal(await page.evaluate(()=>window.calls.length),0);
  await page.locator('[data-hire="architect"]').click();await page.locator('[data-hire-review]').waitFor();
  assert.equal(await page.getByLabel('Model',{exact:true}).inputValue(),'opus');
  await page.getByLabel('Model',{exact:true}).selectOption('sonnet');
  if(engine==='chromium'&&scheme==='light')await page.screenshot({path:'/tmp/team-hire-review-'+width+'.png'});
  await page.locator('[data-hire-confirm]').click();
  await page.waitForFunction(()=>window.calls.length===1);
  const [call]=await page.evaluate(()=>window.calls);
  assert.equal(call.config.model,'sonnet');assert.equal(call.config.workspace,'kept');assert.equal(call.instructions,'Exact training');
  assert.equal(await page.locator('[data-hire-review]').count(),0);
  passed++;await page.close();
 }}finally{await browser.close();}
}
console.log(JSON.stringify({passed}));
