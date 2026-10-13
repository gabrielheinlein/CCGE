// Executar: node tests/crd-parser.test.js
// Casos sintéticos inspirados em layouts CRD; não contém documentos privados.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const start=html.indexOf('function ccgeDedupeSupplier(v)');
const end=html.indexOf('function ccgeNewInvoiceId()',start);
assert(start>=0&&end>start,'Funções CRD não encontradas');
const source=html.slice(start,end);
const parseBRDate=(d,m,y)=>{const year=Number(y),month=Number(m),day=Number(d);return year+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0')};
const parseMoney=v=>Number(String(v).replace(/\./g,'').replace(',','.'));
const parse=new Function('parseBRDate','window',source+';return ccgeParseCRDRows')(parseBRDate,{ccgeParseMoney:parseMoney});
const row=(crd,map,nf,company,cnpj,type,amount,method,description)=>
  '18/09/2026 '+crd+' '+map+' 18/09/2026 15/10/2026 '+nf+
  ' Taxa 09 '+company+' '+company+' '+cnpj+' '+type+' '+amount+
  ' - - - - - - - - '+amount+' '+method+' '+description+' ';
const text='CRD - Controle de Remessa de Documentos - Notas Fiscais '+
  row(55,'093-26',771426106,'AUTOGERADORA DE GERADORES LTDA','10.497.319/0001-28','LOC','8.221,66','Depósito','Locação gerador')+
  row(55,'096-26',15523,'RM LOCAÇÕES DE EQUIPAMENTOS LTDA','92.383.025/0007-25','MO','489,00','Boleto','Locação de motobomba')+
  ' Sub-total => 8.710,66';
const actual=parse(text);
assert.equal(actual.length,2);
assert.equal(actual[0].supplier,'AUTOGERADORA DE GERADORES LTDA');
assert.equal(actual[0].amount,8221.66);
assert.equal(actual[0].description,'Locação gerador');
assert.equal(actual[1].supplier,'RM LOCAÇÕES DE EQUIPAMENTOS LTDA');
assert.equal(actual[1].description,'Locação de motobomba');
assert.equal(actual[1].amount,489);
assert.equal(actual[0].type,'LOC');
assert.equal(actual[1].type,'MO');
// A importação de CRDs mistos deve ser bloqueada antes de modificar a tarefa.
const htmlGuard=html.includes("const mismatched=crdRows.filter(r=>")&&html.includes("Importação bloqueada para evitar custos na tarefa errada.");
assert.ok(htmlGuard,'Proteção contra CRD de tarefas diferentes ausente');
console.log('CRD parser: 2 lançamentos, fornecedores, categorias, valores e descrições PASSARAM');


assert.ok(html.includes("const taskName=String(taskBaseName(t)||'').trim().normalize('NFC')"),'CRD must compare ME task base name without area suffix');
assert.ok(html.includes("String(r.description).trim().normalize('NFC')!==String(taskBaseName(t)||'').trim().normalize('NFC')"),'Single-row CRD must compare ME task base name');
