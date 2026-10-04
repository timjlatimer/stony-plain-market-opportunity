import * as THREE from 'three';
import {CONCEPT,inCrossover} from './model-spec.mjs';
import {box,line,roof,shedRoof,sign,person,car,stall,tree} from './drawing.mjs';
export function buildModel(m){
 const root=new THREE.Group();root.name='Stony Plain single-storey pencil concept';root.userData={version:'pencil-3d-v1',parameters:m.parameters,totalArea:m.totalArea,occupiedStoreys:1,mezzanine:false,assumptions:m.assumptions};
 const roofs=new THREE.Group();roofs.name='Liftable roof and decorative landmarks';root.add(roofs);
 const buildings=new THREE.Group();buildings.name='One occupied ground level';root.add(buildings);
 const outside=new THREE.Group();outside.name='Permanent open-sided outside market';root.add(outside);
 const p=m.parameters,W=m.width,D=m.depth,F=m.front,C=p.canopyDepth,X=m.marketX;
 box(root,W+2*C+150,.25,D+p.promenadeLength+150,0,-.7,p.promenadeLength/2-8,0xe6e7dc);
 // Clearly separate enclosed programme blocks at the SAME ground level.
 for(const z of m.zones){box(buildings,z.width,.28,D,z.centerX,-.05,0,z.id==='market'?0xe0e5dc:0xebe7dc);if(z.id!=='market')box(buildings,z.width,p.wallHeight,D,z.centerX,p.wallHeight/2,0,0xecebe1);}
 // Central hall glazed facade and clerestory; no elevated floors or walks.
 const hall=m.zones[1];for(const zSign of [-1,1])for(let x=hall.minX+11;x<hall.maxX-8;x+=22){if(Math.abs(x-X)<16)continue;const g=new THREE.Mesh(new THREE.PlaneGeometry(21,p.wallHeight-2),new THREE.MeshBasicMaterial({color:0xaebcb0,transparent:true,opacity:.15,side:THREE.DoubleSide,depthWrite:false}));g.position.set(x,p.wallHeight/2,zSign*(F+.2));buildings.add(g);line(buildings,[[x-10,p.wallHeight,zSign*F],[x-10,0,zSign*F]],.8);line(buildings,[[x-10,7,zSign*F],[x+10,7,zSign*F]],.4);}
 roof(roofs,W,D,0,0,p.wallHeight,p.ridgeHeight);
 // Repeated structural ribs beneath the roof make the huge single volume legible.
 for(let x=hall.minX+16;x<hall.maxX-8;x+=28){line(buildings,[[x,p.wallHeight,-F],[x,p.ridgeHeight,0],[x,p.wallHeight,F]],.8);line(buildings,[[x,p.wallHeight,-F],[x,p.wallHeight,F]],.55);}
 for(const z of m.zones){const height=m.towerHeights[z.id],tw=z.id==='market'?28:22,tz=F-28;
  box(roofs,tw,height-p.wallHeight-14,26,z.centerX,(p.wallHeight+height-14)/2,tz,0xe8e8de);
  box(roofs,tw*.78,8,22,z.centerX-3,height-12,tz-2,0xdddfd3);roof(roofs,tw*.78,22,z.centerX-3,tz-2,height-8,height);
  box(roofs,tw*.85,14,24,z.centerX+tw*.7,p.ridgeHeight+7,tz-4,0xe1e2d8);roof(roofs,tw*.85,24,z.centerX+tw*.7,tz-4,p.ridgeHeight+14,p.ridgeHeight+18);
  const text=z.id==='market'?'FARMERS\nMARKET':`${z.name.toUpperCase()}\n${z.area.toLocaleString('en-CA')} SQ FT`;
  sign(roofs,text,z.centerX,height-24,tz+13.4,tw*.9);
 }
 // Four actual perimeter roofs, including both anchor ends and rear.
 for(const f of m.canopy.roofPlans){const group=new THREE.Group();group.name=`Permanent ${f.face} canopy`;group.position.set(f.x,0,f.z);group.rotation.y=f.rotation;outside.add(group);shedRoof(group,f.width,f.depth,f.ridgeHeight,f.eaveHeight);for(let u=-f.width/2+10;u<f.width/2;u+=24){const post=box(group,.65,14,.65,u,7,f.depth/2-1,0xb9c0b1);post.userData.canopyPostFace=f.face;line(group,[[u-4,14,f.depth/2-1],[u,10,f.depth/2-1],[u+4,14,f.depth/2-1]],.6);}}
 for(let x=-W/2+12;x<W/2-8;x+=16){if(Math.abs(x-X)>p.promenadeWidth/2+4)stall(outside,x,F+9);if(Math.abs(x-X)>13)stall(outside,x,-F-9);}
 for(let z=-F+14;z<F-8;z+=16){stall(outside,-W/2-9,z,Math.PI/2);stall(outside,W/2+9,z,Math.PI/2);}
 // Long permanent gable roof oriented ALONG the road-to-building promenade.
 const prom=new THREE.Group();prom.name='Permanent covered market promenade';prom.position.set(X,0,F+p.promenadeLength/2);prom.rotation.y=Math.PI/2;outside.add(prom);roof(prom,p.promenadeLength,p.promenadeWidth,0,0,CONCEPT.canopyEave,CONCEPT.canopyRidge);
 box(outside,p.promenadeWidth,.25,p.promenadeLength,X,.1,F+p.promenadeLength/2,0xeceade);
 const crossingColumns=[],crossingStalls=[];
 for(let z=F+C+20;z<m.promenade.endZ-8;z+=16){if(inCrossover(z,m,8))continue;for(const side of [-1,1]){stall(outside,X+side*(p.promenadeWidth/2-4),z);box(outside,.6,14,.6,X+side*(p.promenadeWidth/2-1),7,z,0xb9c0b1);}crossingStalls.push(z);crossingColumns.push(z);}
 for(const z of [m.promenade.crossoverZ-17,m.promenade.crossoverZ+17]){for(const side of [-1,1])box(outside,.8,14,.8,X+side*(p.promenadeWidth/2-1),7,z);box(outside,p.promenadeWidth,1,1,X,13.5,z);}
 // Vehicle aisle and road remain clear; pedestrian markings at both crossings.
 for(const road of [m.road,m.vehicleAisle]){box(root,road.maxX-road.minX,.2,road.width,(road.minX+road.maxX)/2,.35,road.z,0xd4d7cd);for(let x=road.minX+10;x<road.maxX;x+=18)line(root,[[x,.5,road.z],[x+8,.5,road.z]],.4);for(let z=road.z-road.width/2+2;z<road.z+road.width/2;z+=3)box(root,p.promenadeWidth-5,.06,1.2,X,.52,z,0xf6f4e9);}
 // A movable market layout around two clear main aisles; no interior upper level.
 for(let x=hall.minX+20;x<hall.maxX-12;x+=25)for(let z=-F+18;z<F-12;z+=24){if(Math.abs(x-X)<16||Math.abs(z)<16)continue;stall(buildings,x,z);}
 sign(buildings,`CENTRAL MARKET\n${p.market.toLocaleString('en-CA')} SQ FT CONCEPT`,X,12,-F+1,45);
 // Plausible-size vehicles/pedestrians provide a consistent scale reference.
 for(const side of [-1,1])for(let z=F+35;z<m.promenade.endZ-8;z+=48){if(inCrossover(z,m,22))continue;for(let k=0;k<5;k++){const x=X+side*(p.promenadeWidth/2+35+k*32);if(Math.abs(x)>W/2+C-8)continue;car(root,x,z);line(root,[[x-5,.5,z-10],[x-5,.5,z+10]],.3);line(root,[[x+5,.5,z-10],[x+5,.5,z+10]],.3);}}
 for(let x=-W/2-28;x<W/2+40;x+=58){tree(root,x,-F-C-18);tree(root,x,m.roadZ+24);}
 for(let z=F+25;z<m.promenade.endZ-4;z+=34){if(!inCrossover(z,m,6)&&m.promenade.endZ-z>35)person(root,X+(z%2?6:-6),z);}
 for(let x=hall.minX+35;x<hall.maxX-25;x+=45)person(buildings,x,14);
 root.userData.crossoverStallPositions=crossingStalls;root.userData.crossoverColumnPositions=crossingColumns;
 return {root,roofs};
}
