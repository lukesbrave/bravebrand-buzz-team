// Real browser layout checks; PLAYWRIGHT_MODULE may point to an installed Playwright module.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const source=readFileSync(new URL('../dist/plugin.js',import.meta.url),'utf8').replaceAll('export const ','const ').replace('export function apply','function apply');
const results=[];
for (const [engine,type] of Object.entries({chromium,webkit})) {
 const browser=await type.launch({headless:true,...(process.env[engine.toUpperCase()+"_EXECUTABLE"]?{executablePath:process.env[engine.toUpperCase()+"_EXECUTABLE"]}:{})});
 try {
  for(const width of [1300,1100,900,760,720,640,560,420,400,320]) for(const unlocked of [false,true]) {
   const page=await browser.newPage({viewport:{width:1500,height:900},reducedMotion:'reduce'});
   await page.route('https://fixture.invalid/**',r=>r.fulfill({contentType:'text/html',body:`<style>body{margin:0}#host{width:${width}px;height:800px}</style><div id="host"></div>`}));
   await page.goto('https://fixture.invalid/');
   await page.evaluate(({source,unlocked})=>{
    if(unlocked)localStorage.setItem('bravebrand.team.key','1'.repeat(24));
    (0,eval)(source+`\nloadFonts(); const root=document.querySelector('#host').attachShadow({mode:'open'}); root.innerHTML='<style>'+CSS+'</style>'+MARKUP; window.hires=[]; mountSheet(root,{agents:{snapshot:()=>({agents:[]}),subscribe:()=>()=>{},types:()=>[],port:async x=>window.hires.push(x)},host:{request:async({url})=>({status:200,body:JSON.stringify(url.endsWith('membership.json')?{tier:'premium'}:{display:'Fixture',card:'card.json'})})}});`);
   },{source,unlocked});
   await page.locator('#crew .seat').first().waitFor();
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForFunction(()=>{const r=document.querySelector('#host').shadowRoot;return [...r.querySelectorAll('#housebase,.seat .fig>img:not(.anim)')].every(i=>i.complete&&i.naturalWidth>0);});
   const state=await page.evaluate(()=>{
    const root=document.querySelector('#host').shadowRoot,q=s=>root.querySelector(s),rect=s=>{const r=q(s).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
    return {house:rect('#house'),crew:rect('.crew'),progress:rect('#progress'),columns:getComputedStyle(q('.crew')).gridTemplateColumns.split(' ').length,overflow:q('.bb-scroll').scrollWidth>q('.bb-scroll').clientWidth+1,houseVisible:getComputedStyle(q('.housewrap')).display!=='none',progressVisible:getComputedStyle(q('#progress')).display!=='none'};
   });
   assert.equal(state.overflow,false,JSON.stringify({engine,width,unlocked,state}));
   assert.ok(state.houseVisible&&state.progressVisible&&state.house.w>0&&state.progress.w>0);
   assert.equal(state.columns,width<=420?2:3);
   if(width>640)assert.ok(state.crew.x>=state.house.x+state.house.w-1);
   else assert.ok(state.crew.y>=state.house.y+state.house.h-1);
   await page.locator('#crew .seat').first().click();
   assert.ok(await page.locator('#spotlight').evaluate(el=>el.classList.contains('open')));
   assert.equal(await page.evaluate(()=>window.hires.length),0);
   if(engine==='chromium'&&unlocked&&[900,400].includes(width)){
    await page.keyboard.press('Escape');await page.screenshot({path:`/tmp/team-layout-${width}.png`});
   }
   results.push({engine,width,unlocked,columns:state.columns});await page.close();
  }
 }finally{await browser.close();}
}
console.log(JSON.stringify({passed:results.length,cases:results},null,2));
