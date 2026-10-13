const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const a=html.indexOf('const originalAttach=window.ccgeBaseAttachInvoiceFile;'),b=html.indexOf('})();',a),source=html.slice(a,b);
function harness(){
 const modal={dataset:{temp:JSON.stringify({id:'task-1',notes:'before',invoices:[{id:'inv-1',number:''}]}),invoiceSession:'1'}};
 let release;const waiting=new Promise(r=>release=r);let calls=0;
 const window={ccgeReadTaskDraft:()=>JSON.parse(modal.dataset.temp),ccgeNotify:()=>{},ccgeAnalyzeInvoiceFile:async()=>{const t=JSON.parse(modal.dataset.temp);t.invoices[0].number='new';modal.dataset.temp=JSON.stringify(t);return {mode:'single'}},ccgeBaseAttachInvoiceFile:async()=>{calls++;await waiting;throw Error('offline')},ccgePropagateInvoiceAttachment:()=>{}};
 const document={getElementById:id=>id==='taskModal'?modal:{files:[]}};
 window.ccgeRenderInvoices=()=>{};new Function('window','document',source)(window,document);
 return {modal,window,release,get calls(){return calls}};
}
(async()=>{
 const h=harness(),p=h.window.attachInvoiceFile(0,{name:'test.pdf'}).catch(()=>{});
 await new Promise(r=>setImmediate(r));
 const secondPromise=h.window.attachInvoiceFile(0,{name:'test.pdf'}).catch(()=>false);
 await new Promise(r=>setImmediate(r));
 assert.equal(h.calls,1,'concurrent import must reject before a second upload');
 const d=JSON.parse(h.modal.dataset.temp);d.notes='edited during upload';h.modal.dataset.temp=JSON.stringify(d);h.release();await p;assert.equal(await secondPromise,false);
 assert.equal(JSON.parse(h.modal.dataset.temp).notes,'edited during upload','rollback must preserve unrelated edits');
 const s=harness(),pending=s.window.attachInvoiceFile(0,{name:'test.pdf'}).catch(()=>{});await new Promise(r=>setImmediate(r));
 const switched={id:'task-2',notes:'different task',invoices:[]};s.modal.dataset.invoiceSession='2';s.modal.dataset.temp=JSON.stringify(switched);s.release();await pending;
 assert.deepEqual(JSON.parse(s.modal.dataset.temp),switched,'failed upload must not restore the previous task into another modal');
 console.log('Upload races: concurrent imports, unrelated edits and task switches PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
