// node tests/invoice-pipeline.test.js
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const start=html.indexOf('const originalAttach=window.ccgeBaseAttachInvoiceFile;');
const end=html.indexOf('})();',start);
assert(start>=0&&end>start,'Invoice upload wrapper not found');
const wrapper=html.slice(start,end);
async function scenario(name,analysis,uploadOk,expected){
 let draft={invoices:[{id:'med-1',number:'',attachment:null}]},uploaded=0,propagated=0;
 const modal={dataset:{temp:JSON.stringify(draft)}};
 const window={
   ccgeAnalyzeInvoiceFile:async()=>{if(analysis!==false){draft.invoices[0].number='NF-TEST';modal.dataset.temp=JSON.stringify(draft)}return analysis},
   ccgeReadTaskDraft:()=>JSON.parse(modal.dataset.temp),
   ccgeBaseAttachInvoiceFile:async(i,file)=>{uploaded++;if(!uploadOk)throw Error('storage offline');const d=JSON.parse(modal.dataset.temp);d.invoices[i].attachment={name:file.name};modal.dataset.temp=JSON.stringify(d);return true},
   ccgePropagateInvoiceAttachment:()=>{propagated++}
 };
 const document={getElementById:id=>id==='taskModal'?modal:{files:[]}};
 const renderInvoices=()=>{};
 new Function('window','document','renderInvoices',wrapper)(window,document,renderInvoices);
 let result,error;
 try{result=await window.attachInvoiceFile(0,{name:'CRD.pdf'})}catch(e){error=e.message}
 assert.equal(result===true,expected==='ok',name+' result');
 if(expected==='blocked'){assert.match(error,/bloqueada|não concluída/);assert.equal(uploaded,0);assert.equal(propagated,0)}
 if(expected==='error'){assert.equal(error,'storage offline');assert.equal(propagated,0);assert.equal(JSON.parse(modal.dataset.temp).invoices[0].number,'')}
 if(expected==='ok'){assert.equal(uploaded,1);assert.equal(propagated,1);assert.equal(JSON.parse(modal.dataset.temp).invoices[0].attachment.name,'CRD.pdf')}
}
(async()=>{
 await scenario('valid CRD',{mode:'crd',count:2},true,'ok');
 await scenario('duplicate CRD',false,true,'blocked');
 await scenario('upload failed',{mode:'single',count:1},false,'error');
 console.log('Invoice pipeline: accepted, blocked duplicate and failed upload PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
