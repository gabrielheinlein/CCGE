const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const a=html.indexOf('function ccgePlanCRDDistribution('),b=html.indexOf('function ccgeNewInvoiceId()',a);
assert.ok(a>=0&&b>a,'Pure CRD distribution planner missing');
const plan=new Function('taskBaseName',html.slice(a,b)+';return ccgePlanCRDDistribution')(t=>t.name);
const tasks=[{id:'earth',name:'Terraplenagem',invoices:[{_crdNumber:'35',measurement:'013-26',number:'212'}]},{id:'hygiene',name:"Higienização caixa d'água"},{id:'dup1',name:'EPC'},{id:'dup2',name:'EPC'},{id:'archived',name:'Portaria',archived:true}];
const row=(crd,measurement,number,description,amount=100)=>({crd,measurement,number,description,amount,supplier:'Fornecedor Teste',cnpj:'12.345.678/0001-90'});
const input=[row('035','013-26','212','Terraplenagem'),row('055','100-26','1006',"Higienização caixa d'água"),row('055','074-26','52993','EPC'),row('055','009-26','42','Portaria'),row('055','093-26','771426106','Locação gerador'),row('055','096-26','15523','Terraplenagem'),row('055','096-26','15523','Terraplenagem'),row('055','045-26','565','Terraplenagem',0)];
const before=JSON.stringify({tasks,input});
const result=plan(input,tasks);
assert.deepEqual(result.map(x=>x.status),['duplicate','ready','ambiguous','unmatched','unmatched','ready','duplicate','invalid']);
assert.equal(result[1].taskId,'hygiene');
assert.equal(result[5].taskId,'earth');
assert.ok(result.filter(x=>x.status!=='ready').every(x=>x.taskId===null));
assert.equal(JSON.stringify({tasks,input}),before,'Planner must never mutate imported rows or tasks');
console.log('CRD planner: duplicate, exact ME match, ambiguity, missing task, invalid value, no mutation PASS');

const withoutSupplier=row('055','097-26','7','Terraplenagem');withoutSupplier.supplier='';assert.equal(plan([withoutSupplier],tasks)[0].status,'invalid','Supplier is required before automatic distribution');

const withoutCNPJ=row('055','098-26','8','Terraplenagem');withoutCNPJ.cnpj='';assert.equal(plan([withoutCNPJ],tasks)[0].status,'invalid','CNPJ is required before automatic distribution');
