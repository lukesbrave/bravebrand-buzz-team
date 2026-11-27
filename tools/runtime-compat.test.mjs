// DESKTOP_SOURCE points at a Workrooms desktop checkout with the upstream v1.0.6 tag.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
import {Context} from '@deepseek-ai/cordis';
import {Window} from 'happy-dom';
import React from 'react';
const desktop=process.env.DESKTOP_SOURCE;
if(!desktop)throw Error('Set DESKTOP_SOURCE to the desktop source checkout');
const source=readFileSync(new URL('../dist/plugin.js',import.meta.url),'utf8');
const plugin=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
for(const workrooms of [false,true]){
 const text=workrooms?readFileSync(path.join(desktop,'src/plugins/runtime.ts'),'utf8'):execFileSync('git',['show','v1.0.6:src/plugins/runtime.ts'],{cwd:desktop,encoding:'utf8'});
 const result=await build({stdin:{contents:text,loader:'ts',resolveDir:path.join(desktop,'src/plugins')},bundle:true,write:false,platform:'node',format:'esm'});
 const {PluginRuntime}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
 for(const privateDependency of [false,true])test(`${workrooms?'Workrooms':'official Buzz 1.0.6'} runtime: ${privateDependency?'pilot dependency':'public fix'}`,async()=>{
  const window=new Window();globalThis.document=window.document;
  const root=new Context();let page;
  root.provide('react',React);root.provide('pages',{register:p=>page=p});root.provide('agents',{});root.provide('host',{});
  if(workrooms)root.provide('bravebrandAgentControls',{});
  const runtime=new PluginRuntime(root,async()=>({inject:privateDependency?[...plugin.inject,'bravebrandAgentControls']:plugin.inject,apply:plugin.apply}),100);
  try{
   runtime.reconcile([{manifest:{id:'bravebrand.hire',name:'BraveBrand Team',apiVersion:1},source:'external',revision:'test',enabled:true,previous:null,reloadable:true,error:null}]);
   for(let i=0;i<100 && (!runtime.snapshot()['bravebrand.hire']||runtime.snapshot()['bravebrand.hire'].status==='starting');i++)await new Promise(r=>setTimeout(r,10));
   const state=runtime.snapshot()['bravebrand.hire'];
   if(privateDependency&&!workrooms){assert.equal(state.status,'failed');assert.match(state.error,/activation timed out/i);}
   else{assert.equal(state.status,'active');assert.equal(page.id,'main');}
  }finally{await runtime.dispose();await root.fiber.dispose();window.close();}
 });
}
