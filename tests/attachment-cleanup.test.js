const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const start=html.indexOf('function taskPendingDeletes()'),end=html.indexOf('// Serializa todas',start);
const modal={dataset:{temp:JSON.stringify({invoices:[{attachment:{storagePath:'temporary.pdf',_pendingUpload:true}},{attachment:{storagePath:'persisted.pdf'}}]})}};
const removed=[];
const document={querySelector:selector=>selector==='#taskModal'?modal:null};
const supabaseClient={storage:{from:()=>({remove:async paths=>{removed.push(...paths);return {error:null}}})}};
const cleanup=new Function('document','window','supabaseClient','CCGE_STORAGE_BUCKET',html.slice(start,end)+';return cleanupTaskPendingUploads')(document,{ccgeNotify:()=>{}},supabaseClient,'ccge-files');
cleanup().then(()=>{assert.deepEqual(removed,['temporary.pdf']);console.log('Cleanup: temporary attachment removed, persisted attachment preserved without private-scope helpers PASS');}).catch(e=>{console.error(e);process.exitCode=1});

// A fila de exclusões não pode ser descartada após falha do Storage.
assert.ok(html.includes('const failedDeletes=[];for(const f of pendingDeletes)'), 'Fila de falhas de exclusão ausente');
assert.ok(html.includes("dataset.pendingDeletes=JSON.stringify(failedDeletes)"), 'Falhas de exclusão não preservadas');

assert.ok(html.includes("Documento sem identificador de medição. Reabra a tarefa antes de excluir."),'Exclusão de documento deve exigir identificador estável');

const queue=new Function('document','window','supabaseClient','CCGE_STORAGE_BUCKET',html.slice(start,end)+';return queueTaskAttachmentDelete')(document,{ccgeNotify:()=>{}},supabaseClient,'ccge-files');
queue({storagePath:'new-temporary.pdf',_pendingUpload:true});
assert.equal(removed.includes('new-temporary.pdf'),false,'Temporary attachment must not be physically deleted before save');
assert.equal(JSON.parse(modal.dataset.pendingDeletes).length,1,'Temporary attachment must be queued for post-save cleanup');
