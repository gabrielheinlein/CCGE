const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const a=html.indexOf('function persistState()'),b=html.indexOf('function save(msg)',a);
assert.ok(a>=0&&b>a);
const source=html.slice(a,b);
const saved=[];
let result=false;
const persist=new Function('persistentStateSnapshot','safeStore','salvarEstadoNuvem','toast','console',source+';return persistState')(()=>({tasks:[{id:'test'}]}),{set:x=>saved.push(x)},async()=>result,()=>{},console);
(async()=>{
 await persist();
 assert.equal(saved.length,0,'Cloud rejection must not overwrite last verified local snapshot');
 result=true;
 await persist();
 assert.equal(saved.length,1,'Successful cloud CAS must update local snapshot');
 console.log('Cloud/local persistence ordering PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
