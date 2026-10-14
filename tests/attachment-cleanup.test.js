const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const start=html.indexOf('function taskPendingDeletes()'),end=html.indexOf('// Serializa todas',start);
const modal={dataset:{temp:JSON.stringify({invoices:[{attachment:{storagePath:'temporary.pdf',_pendingUpload:true}},{attachment:{storagePath:'persisted.pdf'}}]})}};
const removed=[];
const document={querySelector:selector=>selector==='#taskModal'?modal:null};
const supabaseClient={storage:{from:()=>({remove:async paths=>{removed.push(...paths);return {error:null}}})}};
const cleanup=new Function('document','window','supabaseClient','CCGE_STORAGE_BUCKET',html.slice(start,end)+';return cleanupTaskPendingUploads')(document,{ccgeNotify:()=>{}},supabaseClient,'ccge-files');
const firstCleanup=cleanup().then(()=>{assert.deepEqual(removed,['temporary.pdf']);console.log('Cleanup: temporary attachment removed, persisted attachment preserved without private-scope helpers PASS');});

// A fila de exclusões não pode ser descartada após falha do Storage.
assert.ok(html.includes('const failedDeletes=[];for(const f of pendingDeletes)'), 'Fila de falhas de exclusão ausente');
assert.ok(html.includes("dataset.pendingDeletes=JSON.stringify(failedDeletes)"), 'Falhas de exclusão não preservadas');

assert.ok(html.includes("Documento sem identificador de medição. Reabra a tarefa antes de excluir."),'Exclusão de documento deve exigir identificador estável');

const queue=new Function('document','window','supabaseClient','CCGE_STORAGE_BUCKET',html.slice(start,end)+';return queueTaskAttachmentDelete')(document,{ccgeNotify:()=>{}},supabaseClient,'ccge-files');
queue({storagePath:'new-temporary.pdf',_pendingUpload:true});
assert.equal(removed.includes('new-temporary.pdf'),false,'Temporary attachment must not be physically deleted before save');
assert.equal(JSON.parse(modal.dataset.pendingDeletes).length,1,'Temporary attachment must be queued for post-save cleanup');

assert.ok(html.includes('uploaded._pendingUpload=true;'),'Monthly replacement upload must remain temporary until save');
assert.ok(html.includes("else $('#monthlyModal').dataset.pendingDelete=JSON.stringify(previous)"),'Persisted monthly attachment must be deferred until save');
assert.ok(html.includes("toast('Documento anterior não removido do armazenamento; tente salvar novamente.')"),'Monthly failed deletion must be visible and retryable');

firstCleanup.then(()=>cleanup()).then(()=>{
 assert.equal(removed.filter(x=>x==='new-temporary.pdf').length,1,'Discarded queued temporary upload must be removed on modal close');
 assert.equal(removed.includes('persisted.pdf'),false,'Cancel must never delete persisted attachment');
 console.log('Cleanup: discarded queued upload removed on cancel PASS');
}).catch(e=>{console.error(e);process.exitCode=1});

assert.ok(html.includes("if(c.attachment._pendingUpload){try{await deleteCCGEAttachment(c.attachment)}"),'Removing an unsaved monthly upload must not queue it as a persisted attachment');

const guardStart=html.indexOf('function ccgeAttachmentStillReferenced('),guardEnd=html.indexOf('async function deleteCCGEAttachment(',guardStart);
assert.ok(guardStart>=0&&guardEnd>guardStart,'Shared attachment guard missing');
const stillReferenced=new Function('CCGE_STORAGE_BUCKET',html.slice(guardStart,guardEnd)+';return ccgeAttachmentStillReferenced')('ccge-files');
const oldFile={storagePath:'shared.pdf'};
assert.equal(stillReferenced(oldFile,{tasks:[{invoices:[{attachment:{storagePath:'shared.pdf'}}]}],monthlyContracts:[]}),true,'Task invoice must protect shared monthly attachment');
assert.equal(stillReferenced(oldFile,{tasks:[],monthlyContracts:[{attachment:{storagePath:'shared.pdf'}}]}),true,'Another monthly contract must protect shared attachment');
assert.equal(stillReferenced(oldFile,{tasks:[],monthlyContracts:[{attachment:{storagePath:'other.pdf'}}]}),false,'Unreferenced attachment may be deleted after cloud save');
assert.ok(html.includes('if(!ccgeAttachmentStillReferenced(oldAttachment,state))await deleteCCGEAttachment(oldAttachment)'),'Monthly save must check live references before deleting');
console.log('Shared monthly/task attachment deletion guard PASS');

