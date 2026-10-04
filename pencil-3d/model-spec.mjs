// Model units: feet. Area allocations are Tim's concept, not issued architecture.
export const DEFAULTS = Object.freeze({anchorA:25000,market:75000,anchorB:20000,depth:222,wallHeight:28,ridgeHeight:40,promenadeLength:240,promenadeWidth:32,canopyDepth:16});
export const LIMITS=freeze({anchorA:[10000,40000],market:[40000,110000],anchorB:[10000,40000],depth:[180,280],wallHeight:[20,36],ridgeHeight:[30,56],promenadeLength:[160,400],promenadeWidth:[24,48],canopyDepth:[12,24]});
const models=new WeakSet();
export const CONCEPT=Object.freeze({crossHalfWidth:9,crossoverHalfWidth:12,crossoverFraction:.65,roadOffset:32,roadWidth:28,siteShoulder:70,sideMargin:28,rearMargin:35,roadMargin:48,maxWalkStep:4,segmentStep:.5,canopyEave:14,canopyRidge:18,clearance:13,stallBandStart:6,stallBandEnd:12,promenadeStallStartOffset:14,promenadeStallEndGap:6,promenadeInnerBankInset:8,wallBuffer:1,canopyCornerGap:6});
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function checkModel(m){if(!m||!models.has(m))throw new Error('Use an immutable model returned by derive().');}
export function validate(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Use a model settings object.');
 if(![Object.prototype,null].includes(Object.getPrototypeOf(input))||Object.getOwnPropertySymbols(input).length)throw new Error('Use plain JSON settings with named numeric data fields.');
 for(const k of Object.getOwnPropertyNames(input))if(!(k in DEFAULTS)||!Object.hasOwn(DEFAULTS,k))throw new Error(`Unknown model setting: ${k}.`);
 const p={};for(const [k,d] of Object.entries(DEFAULTS)){const desc=Object.getOwnPropertyDescriptor(input,k);if(desc&&!Object.hasOwn(desc,'value'))throw new Error(`Use a numeric data property for ${k}.`);const v=desc?desc.value:d;if(typeof v!=='number'||!Number.isFinite(v)||v<LIMITS[k][0]||v>LIMITS[k][1])throw new Error(`Invalid ${k}: allowed ${LIMITS[k].join('–')}.`);p[k]=v;}
 if(p.ridgeHeight<p.wallHeight+5)throw new Error('Roof ridge must be at least 5ft above the wall.');
 return p;
}
export function derive(input=DEFAULTS){
 const p=validate(input),width=(p.anchorA+p.market+p.anchorB)/p.depth;
 let x=-width/2;
 const zones=[['a','Anchor A',p.anchorA],['market','Central market',p.market],['b','Anchor B',p.anchorB]].map(([id,name,area])=>{const w=area/p.depth;const z={id,name,area,width:w,minX:x,maxX:x+w,centerX:x+w/2};x+=w;return z;});
 const front=p.depth/2,marketX=zones[1].centerX,crossoverZ=front+p.promenadeLength*CONCEPT.crossoverFraction;
 const result={parameters:p,width,depth:p.depth,totalArea:p.anchorA+p.market+p.anchorB,zones,front,marketX,
  occupiedStoreys:1,mezzanine:false,anchorsConfirmed:false,totalMatchesOpening:p.anchorA+p.market+p.anchorB===120000,programmeMatchesVerified:p.anchorA===25000&&p.market===75000&&p.anchorB===20000,programmeWarning:p.anchorA===25000&&p.market===75000&&p.anchorB===20000?'':'Edited concept allocations differ from the opening 25k/75k/20k programme.',towerHeights:{a:p.ridgeHeight+38,market:p.ridgeHeight+58,b:p.ridgeHeight+38},
  canopy:{depth:p.canopyDepth,faces:['front','back','left','right'],occupiedArea:0,roofHeightsFixed:true,clearance:CONCEPT.clearance,roofPlans:[{face:'front',x:0,z:front+p.canopyDepth/2,width:width+2*p.canopyDepth,depth:p.canopyDepth,rotation:0},{face:'back',x:0,z:-front-p.canopyDepth/2,width:width+2*p.canopyDepth,depth:p.canopyDepth,rotation:Math.PI},{face:'left',x:-width/2-p.canopyDepth/2,z:0,width:p.depth,depth:p.canopyDepth,rotation:-Math.PI/2},{face:'right',x:width/2+p.canopyDepth/2,z:0,width:p.depth,depth:p.canopyDepth,rotation:Math.PI/2}]},
  promenade:{x:marketX,startZ:front,endZ:front+p.promenadeLength,width:p.promenadeWidth,length:p.promenadeLength,crossoverZ,crossoverHalfWidth:CONCEPT.crossoverHalfWidth,occupiedArea:0,roof:'permanent matching pitched roof',sides:'open',eaveHeight:CONCEPT.canopyEave,ridgeHeight:CONCEPT.canopyRidge,vehicleClearanceAssumption:CONCEPT.clearance,roofHeightsFixed:true,walkingLaneWidth:p.promenadeWidth-2*CONCEPT.promenadeInnerBankInset,laneNote:'Walking lane narrows with promenade width; door cross remains 18ft.'},
  roadZ:front+p.promenadeLength+CONCEPT.roadOffset,road:{z:front+p.promenadeLength+CONCEPT.roadOffset,width:CONCEPT.roadWidth,minX:-width/2-p.canopyDepth-CONCEPT.siteShoulder,maxX:width/2+p.canopyDepth+CONCEPT.siteShoulder},vehicleAisle:{z:crossoverZ,width:CONCEPT.crossoverHalfWidth*2,minX:-width/2-p.canopyDepth-CONCEPT.siteShoulder,maxX:width/2+p.canopyDepth+CONCEPT.siteShoulder},narrowLaneWarning:p.promenadeWidth-2*CONCEPT.promenadeInnerBankInset<12?'Edited promenade has a walking lane narrower than 12ft; this is a visualization only.':'',
  visualizationAssumptions:{depthBasis:'Concept depth uses historic 222ft grid span; not a surveyed exterior-face measurement. Edits are conceptual.',towerHeightOffsets:[38,58,38],constants:CONCEPT},
  assumptions:`${p.anchorA===25000&&p.market===75000&&p.anchorB===20000?'Opening 25k/75k/20k programme matches Tim’s request; arithmetic checked.':'Edited area programme differs from Tim’s opening 25k/75k/20k request; these edited allocations are not source verified.'} Not issued architecture. ${p.depth}ft conceptual depth is adapted from the historic 222ft grid; all derived widths are schematic. ${p.wallHeight}ft walls, ${p.ridgeHeight}ft ridge, ${p.ridgeHeight+38}/${p.ridgeHeight+58}/${p.ridgeHeight+38}ft tower silhouettes, ${p.canopyDepth}ft canopy and ${p.promenadeLength}ft promenade are visualization assumptions. Promenade begins at the facade under the canopy. The ${CONCEPT.crossoverHalfWidth*2}ft vehicle aisle runs across the site at ${CONCEPT.crossoverFraction*100}% of the promenade measured from the facade; inCrossover excludes stalls/columns from its envelope, not walking. ${CONCEPT.crossHalfWidth*2}ft circulation cross is narrower than the promenade and ends at closed anchor walls. Road offset ${CONCEPT.roadOffset}ft and walk margins ${CONCEPT.sideMargin}/${CONCEPT.rearMargin}/${CONCEPT.roadMargin}ft allow conceptual walking onto/beyond the road; no traffic physics. Segment sampling may cut corners by less than 0.36ft; each move is capped ${CONCEPT.maxWalkStep}ft. Anchors unconfirmed; no occupied upper floor. Outdoor roofs excluded from enclosed allocations. Exterior stalls use coarse no-walk bands with crossover and door gaps; no full furniture collision. Fixed promenade eave/ridge ${CONCEPT.canopyEave}/${CONCEPT.canopyRidge}ft and vehicle clearance ${CONCEPT.clearance}ft are visualization assumptions, not engineering clearance approval.`};
 result.canopy.roofPlans.forEach(f=>{f.eaveHeight=CONCEPT.canopyEave;f.ridgeHeight=CONCEPT.canopyRidge;});result.assumptions+=` Current central width is ${zones[1].width.toFixed(2)}ft for ${p.market.toLocaleString('en-CA')}sqft at ${p.depth}ft depth. The opening 75,000sqft market uses 337.84ft rather than the historic 336ft grid at 222ft depth. Anchor positioning is conceptual. Promenade starts under the front canopy; roof intersections need architectural detailing. Perimeter roofs slope from the 18ft inner edge to the 14ft outer edge; the promenade has an 18ft pitched ridge. The promenade ends at an 18ft uncovered road apron and crosswalk, not the road centreline.`;
 models.add(result);return freeze(result);
}
export function inCrossover(z,model,objectDepth=0){checkModel(model);if(!Number.isFinite(z)||!Number.isFinite(objectDepth)||objectDepth<0)throw new Error('Use a finite position and nonnegative object depth.');return Math.abs(z-model.promenade.crossoverZ)<model.promenade.crossoverHalfWidth+objectDepth/2;}
export function walkBoundary(model){checkModel(model);return {minX:-model.width/2-model.parameters.canopyDepth-CONCEPT.sideMargin,maxX:model.width/2+model.parameters.canopyDepth+CONCEPT.sideMargin,minZ:-model.depth/2-model.parameters.canopyDepth-CONCEPT.rearMargin,maxZ:model.roadZ+CONCEPT.roadMargin};}
export function isWalkable(x,z,model){
 checkModel(model);
 if(!Number.isFinite(x)||!Number.isFinite(z))return false;const b=walkBoundary(model);if(x<b.minX||x>b.maxX||z<b.minZ||z>b.maxZ)return false;
 for(const a of [model.zones[0],model.zones[2]])if(x>a.minX-CONCEPT.wallBuffer&&x<a.maxX+CONCEPT.wallBuffer&&Math.abs(z)<=model.depth/2+CONCEPT.wallBuffer)return false;
 if(x>=model.zones[1].minX-CONCEPT.wallBuffer&&x<=model.zones[1].maxX+CONCEPT.wallBuffer&&Math.abs(z)<=model.depth/2+CONCEPT.wallBuffer&&Math.abs(x-model.marketX)>CONCEPT.crossHalfWidth&&Math.abs(z)>CONCEPT.crossHalfWidth)return false;
 const lateral=Math.abs(x-model.marketX),prom=model.promenade;
 if(z>model.front+model.parameters.canopyDepth+CONCEPT.promenadeStallStartOffset&&z<prom.endZ-CONCEPT.promenadeStallEndGap&&lateral>prom.width/2-CONCEPT.promenadeInnerBankInset&&lateral<prom.width/2&&!inCrossover(z,model,CONCEPT.promenadeInnerBankInset))return false;
 const frontGap=z>0?model.parameters.promenadeWidth/2:CONCEPT.crossHalfWidth;
 if(Math.abs(x)<model.width/2-CONCEPT.canopyCornerGap&&Math.abs(z)>model.front+CONCEPT.stallBandStart&&Math.abs(z)<model.front+CONCEPT.stallBandEnd&&lateral>frontGap)return false;
 if(Math.abs(z)<model.front-CONCEPT.canopyCornerGap&&Math.abs(x)>model.width/2+CONCEPT.stallBandStart&&Math.abs(x)<model.width/2+CONCEPT.stallBandEnd)return false;
 return true;
}
export function constrainWalk(x,z,model,previous){
 if(!previous||!isWalkable(previous.x,previous.z,model))throw new Error('Walking requires a valid previous position.');
 if(!Number.isFinite(x)||!Number.isFinite(z))return {x:previous.x,z:previous.z};
 const distance=Math.hypot(x-previous.x,z-previous.z);if(distance>CONCEPT.maxWalkStep){x=previous.x+(x-previous.x)*CONCEPT.maxWalkStep/distance;z=previous.z+(z-previous.z)*CONCEPT.maxWalkStep/distance;}
 const b=walkBoundary(model);x=Math.min(b.maxX,Math.max(b.minX,x));z=Math.min(b.maxZ,Math.max(b.minZ,z));
 // Reject or slide a SMALL movement, never project across the hall. Check the
 // segment too, so even a large settings/test move cannot cross a blocked volume.
 const clear=(tx,tz)=>{const n=Math.max(1,Math.ceil(Math.hypot(tx-previous.x,tz-previous.z)/CONCEPT.segmentStep));for(let i=1;i<=n;i++)if(!isWalkable(previous.x+(tx-previous.x)*i/n,previous.z+(tz-previous.z)*i/n,model))return false;return true;};
 if(clear(x,z))return {x,z};if(clear(x,previous.z))return {x,z:previous.z};if(clear(previous.x,z))return {x:previous.x,z};return {x:previous.x,z:previous.z};
}
