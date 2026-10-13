const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const a=html.indexOf('function financialTruth(t)'),b=html.indexOf('function approvedWithAdditives',a);
const truth=new Function('ccgeMoneyNumber','canonicalAdditives',html.slice(a,b)+';return financialTruth')(v=>Number(v||0),t=>Number(t.additives||0));
assert.equal(truth({invoices:[{amount:80,situation:'Cancelada'}],invoiced:80}).actualCost,0);
assert.equal(truth({payments:[{paidAmount:0}],paid:80}).paid,0);
assert.equal(truth({invoices:[],_invoiceLedgerActive:true,invoiced:80}).actualCost,0);
assert.equal(truth({payments:[],_paymentLedgerActive:true,paid:80}).paid,0);
assert.equal(truth({invoices:[],payments:[],invoiced:80,paid:25}).actualCost,80);
assert.equal(truth({invoices:[],payments:[],invoiced:80,paid:25}).paid,25);
assert.equal(truth({invoices:[{amount:25,situation:'Ativa'}],invoiced:80}).actualCost,25);
console.log('Financial ledgers: cancelled invoices, zero payment, removed last entry, legacy compatibility and active amount PASS');

const ra=html.indexOf('function recomputeDerivedState()'),rb=html.indexOf('function scheduleReactiveRender()',ra);
const state={tasks:[{invoices:[{amount:80,situation:'Cancelada'}],invoiced:80,payments:[],_paymentLedgerActive:true,paid:90},{invoices:[],_invoiceLedgerActive:true,invoiced:70,payments:[],paid:30},{invoices:[],invoiced:50,payments:[],paid:20}]};
new Function('state','canonicalAdditives','ccgeMoneyNumber',html.slice(ra,rb)+';return recomputeDerivedState')(state,()=>0,v=>Number(v||0))();
assert.equal(state.tasks[0].invoiced,0,'Canceled invoices must not contribute to realized');
assert.equal(state.tasks[0].paid,0,'Empty active payment ledger must remain zero');
assert.equal(state.tasks[1].invoiced,0,'Empty active invoice ledger must remain zero');
assert.equal(state.tasks[2].invoiced,50,'Legacy invoice total must survive');
assert.equal(state.tasks[2].paid,20,'Legacy payment total must survive');

assert.ok(html.includes('t._paymentLedgerActive=true;t.payments.push(...items)'), 'Editing payment commitments must activate payment ledger');

const separated=truth({estimated:91000,contracted:50000,additives:80000,invoices:[{amount:25000,situation:'Ativa'}]});
assert.equal(separated.estimateBase,91000,'ME estimate must not be replaced by contract');
assert.equal(separated.estimateUpdated,91000,'Contract additives must not inflate approved ME estimate');
assert.equal(separated.contracted,50000,'Contract base must remain distinct');
assert.equal(separated.contractUpdated,130000,'Contract total must include additives');
assert.equal(separated.estimateVariance,-66000,'Estimated versus realized must use ME estimate');
