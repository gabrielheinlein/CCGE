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


const dStart=html.indexOf('function ccgeCRDLayoutDescriptions('),dEnd=html.indexOf('async function ccgeCRDLayoutFromPDF(',dStart);
assert(dStart>=0&&dEnd>dStart,'Leitor geométrico de descrições não encontrado');
const parseDescriptions=new Function(html.slice(dStart,dEnd)+';return ccgeCRDLayoutDescriptions')();
const desc=parseDescriptions([item('013-26',87,495),item('Terraplenagem',765,495),item('076-26',87,483),item("Higienização caixa d'água",765,483),item('MASTER SOLUCOES',235,483)],842);
assert.equal(desc.get('013-26'),'Terraplenagem');
assert.equal(desc.get('076-26'),"Higienização caixa d'água");
assert.ok(html.includes('if(description)row.description=description'),'PDF geometry must override contaminated linear description');
console.log('CRD descriptions: column extraction ignores supplier text PASS');
