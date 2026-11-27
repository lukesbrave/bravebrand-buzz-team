import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Context} from '@deepseek-ai/cordis';
import React from 'react';
import {Window} from 'happy-dom';
const source=readFileSync(new URL('../dist/plugin.js',import.meta.url),'utf8');
for(const workrooms of [false,true])test(`${workrooms?'Workrooms':'ordinary Buzz'}: real dependency loader activates the public artifact`,async()=>{
 const window=new Window();globalThis.document=window.document;
 const root=new Context();let page;
 root.provide('react',React);root.provide('pages',{register:p=>{page=p;}});
 root.provide('agents',{});root.provide('host',{});
 if(workrooms)root.provide('bravebrandAgentControls',{});
 const mod=await import('data:text/javascript;base64,'+Buffer.from(source+'\n// '+workrooms).toString('base64'));
 try{
  const fiber=root.plugin({inject:mod.inject,apply:mod.apply});await fiber.await();
  assert.equal(page?.id,'main');assert.equal(typeof page.component,'function');
  assert.deepEqual([...mod.inject],['react','pages','agents','host']);
 }finally{await root.fiber.dispose();window.close();}
});
test('regression proof: a required private service keeps ordinary Buzz activation waiting',async()=>{
 const root=new Context();let activated=false;
 root.provide('react',React);root.provide('pages',{});root.provide('agents',{});root.provide('host',{});
 try{
  const fiber=root.plugin({inject:['react','pages','agents','host','bravebrandAgentControls'],apply(){activated=true;}});
  await fiber.await();assert.equal(activated,false);
  root.provide('bravebrandAgentControls',{});await fiber.await();assert.equal(activated,true);
 }finally{await root.fiber.dispose();}
});
