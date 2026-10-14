import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),canvas=require('@napi-rs/canvas');Object.assign(globalThis,{DOMMatrix:canvas.DOMMatrix,ImageData:canvas.ImageData,Path2D:canvas.Path2D});
const pdfjs=await import(require.resolve('pdfjs-dist/legacy/build/pdf.mjs'));
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),start=html.indexOf('function parseBRDate('),end=html.indexOf('const taskBaseName=t=>window.ccgeCRDApp',start);
const functions=new Function('window',html.slice(start,end)+';return {parse:ccgeParseCRDRows,cells:ccgeCRDLayoutCells}')({ccgeParseMoney:v=>Number(String(v).replace(/\./g,'').replace(',','.'))});
const evidence=[];
for(const [filename,count,cents] of [['CRD 035(1).pdf',4,10303295],['CRD 055.pdf',5,4482495]]){
 const path='/workspace/scratch/ab37dae0fc3b/fixtures/'+filename,pdf=await pdfjs.getDocument({data:new Uint8Array(fs.readFileSync(path)),useSystemFonts:true}).promise;
 let text='',suppliers=[],descriptions=[];
 for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p),c=await page.getTextContent(),width=page.view[2]-page.view[0];text+=' '+c.items.map(x=>x.str).join(' ');suppliers.push(...functions.cells(c.items,width,.23,.35).map(r=>({...r,page:p})));descriptions.push(...functions.cells(c.items,width,.88,1.2));}
 const rows=functions.parse(text);assert.equal(rows.length,count);assert.equal(suppliers.length,count);assert.equal(descriptions.length,count);rows.forEach((r,i)=>{assert.equal(r.measurement,suppliers[i].measurement);assert.equal(r.measurement,descriptions[i].measurement);r.supplier=suppliers[i].value;r.description=descriptions[i].value;r.page=suppliers[i].page;assert(r.cnpj&&r.supplier&&r.number&&r.description&&r.page);});assert.equal(Math.round(rows.reduce((v,r)=>v+r.amount,0)*100),cents);
 evidence.push({file:filename,count,total:cents/100,rows});await pdf.destroy();
}
fs.writeFileSync(new URL('../real-crd-evidence.json',import.meta.url),JSON.stringify(evidence,null,2));console.log('Real PDFs: 035 4/R$103.032,95; 055 5/R$44.824,95; supplier/description/ME/page aligned PASS');
