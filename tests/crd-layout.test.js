// node tests/crd-layout.test.js
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const a=html.indexOf('function ccgeCRDLayoutSuppliers('),b=html.indexOf('async function ccgeCRDLayoutFromPDF(',a);
assert(a>=0&&b>a,'Leitor geométrico não encontrado');
const parse=new Function(html.slice(a,b)+';return ccgeCRDLayoutSuppliers')();
const item=(str,x,y)=>({str,transform:[1,0,0,1,x,y]});
const sample=[
 item('Fornecedor Principal:',204,502), // cabeçalho deve ser ignorado
 item('013-26',87,495),item('DANIEL QUADROS BITENCOURT & CIA LTDA',209,495),
 item('100-26',87,483),item('MASTER SOLUCOES EM HIGIENIZACOES E CONTROLE DE PRAGAS',203,484),
 item('URBANAS LTDA',237,482),
 item('096-26',87,477),item('RM LOCAÇÕES DE EQUIPAMENTOS LTDA',220,477),
 item('Sub-total =>',233,473) // subtotal deve ser ignorado
];
const names=parse(sample,842);
assert.equal(names.get('013-26'),'DANIEL QUADROS BITENCOURT & CIA LTDA');
assert.equal(names.get('100-26'),'MASTER SOLUCOES EM HIGIENIZACOES E CONTROLE DE PRAGAS URBANAS LTDA');
assert.equal(names.get('096-26'),'RM LOCAÇÕES DE EQUIPAMENTOS LTDA');
console.log('CRD layout: cabeçalho, fornecedor multilinha e subtotal PASSARAM');

