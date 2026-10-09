const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
fs.mkdirSync('artifacts',{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const failures=[];
 const base=process.env.CCGE_TEST_URL||'https://ccge-git-test-ccge-supabase-homologacao-ccge2.vercel.app/';
 try{
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:45000});
  await page.screenshot({path:'artifacts/initial.png',fullPage:true});
  const loginVisible=await page.locator('input[type=password]').first().isVisible().catch(()=>false);
  if(loginVisible){
   assert.ok(process.env.CCGE_TEST_EMAIL&&process.env.CCGE_TEST_PASSWORD,'Login visible; configure CCGE_TEST_EMAIL and CCGE_TEST_PASSWORD secrets for authenticated browser checks');
   await page.locator('input[type=email], input[autocomplete=email]').first().fill(process.env.CCGE_TEST_EMAIL);
   await page.locator('input[type=password]').first().fill(process.env.CCGE_TEST_PASSWORD);
   await page.locator('#loginSubmit').click();
   await page.locator('#authGate').waitFor({state:'hidden',timeout:30000});
  }
  assert.ok(await page.locator('.topbar .search').isVisible(),'App header not available');
  assert.ok(await page.locator('#authGate').isHidden(),'Authentication gate still visible');
  for(const width of [1440,1280,1100]){
   await page.setViewportSize({width,height:900});
   const data=await page.evaluate(()=>{
    const a=document.querySelector('.topbar .search'),b=document.querySelector('#exportBtn'),c=document.querySelector('.topbar');
    const r=a.getBoundingClientRect(),q=b.getBoundingClientRect(),h=c.getBoundingClientRect();
    return {searchRight:r.right,exportLeft:q.left,headerRight:h.right,exportRight:q.right,viewport:innerWidth};
   });
   if(data.searchRight>data.exportLeft+1)failures.push('search overlaps Export at '+width+': '+JSON.stringify(data));
   if(data.exportRight>data.viewport+1)failures.push('Export outside viewport at '+width);
   await page.screenshot({path:'artifacts/header-'+width+'.png'});
  }
  assert.deepEqual(failures,[]);
  console.log('PASS: authenticated login and header non-overlap at 1440/1280/1100px');
 }catch(e){await page.screenshot({path:'artifacts/failure.png',fullPage:true}).catch(()=>{});throw e}finally{await browser.close()}
})().catch(e=>{console.error('FAIL:',e.stack||e);process.exitCode=1});
