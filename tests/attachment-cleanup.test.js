const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const start=html.indexOf('function taskPendingDeletes()'),end=html.indexOf('// Serializa todas',start);
const modal={dataset:{temp:JSON.stringify({invoices:[{attachment:{storagePath:'temporary.pdf',_pendingUpload:true}},{attachment:{storagePath:'persisted.pdf'}}]})}};
const removed=[];
const document={querySelector:selector=>selector==='#taskModal'?modal:null};
const supabaseClient={storage:{from:()=>({remove:async paths=>{removed.push(...paths);return {error:null}}})}};
const cleanup=new Function('document','window','supabaseClient','CCGE_STORAGE_BUCKET',html.slice(start,end)+';return cleanupTaskPendingUploads')(document,{ccgeNotify:()=>{}},supabaseClient,'ccge-files');
cleanup().then(()=>{assert.deepEqual(removed,['temporary.pdf']);console.log('Cleanup: temporary attachment removed, persisted attachment preserved without private-scope helpers PASS');}).catch(e=>{console.error(e);process.exitCode=1});
