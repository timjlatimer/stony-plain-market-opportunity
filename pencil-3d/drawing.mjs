import * as THREE from 'three';
// Pure pencil drawing primitives. Independent of programme/model specification.
const graphite=new THREE.LineBasicMaterial({color:0x59605a,transparent:true,opacity:.72});
graphite.userData.sharedPencil=true;
const paint=new Map(),linePaint=new Map();
function lineMaterial(opacity){if(!linePaint.has(opacity))linePaint.set(opacity,new THREE.LineBasicMaterial({color:0x59605a,transparent:true,opacity}));linePaint.get(opacity).userData.sharedPencil=true;return linePaint.get(opacity);}
function material(color){if(!paint.has(color))paint.set(color,new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide}));paint.get(color).userData.sharedPencil=true;return paint.get(color);}
export function box(parent,w,h,d,x,y,z,color=0xe7e6dd){
 const g=new THREE.BoxGeometry(w,h,d),m=new THREE.Mesh(g,material(color));m.position.set(x,y,z);parent.add(m);
 const e=new THREE.LineSegments(new THREE.EdgesGeometry(g),graphite);e.position.copy(m.position);parent.add(e);return m;
}
export function line(parent,points,opacity=.72){const geo=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Line(geo,opacity===.72?graphite:lineMaterial(opacity));parent.add(m);return m;}
export function roof(parent,w,d,x,z,eave,ridge,color=0xdfdfd5){
 const pos=[-w/2,eave,-d/2,w/2,eave,-d/2,w/2,ridge,0,-w/2,ridge,0,-w/2,eave,d/2,w/2,eave,d/2];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex([0,1,2,0,2,3,3,2,5,3,5,4,0,3,4,1,5,2]);g.computeVertexNormals();const mesh=new THREE.Mesh(g,material(color));mesh.position.set(x,0,z);parent.add(mesh);
 const edges=new THREE.LineSegments(new THREE.EdgesGeometry(g),graphite);edges.position.copy(mesh.position);parent.add(edges);
 for(let u=-w/2;u<=w/2;u+=8)line(parent,[[x+u,eave+.06,z-d/2],[x+u,ridge+.06,z],[x+u,eave+.06,z+d/2]],.38);
 return mesh;
}
export function shedRoof(parent,w,d,innerHeight,outerHeight){
 const pos=[-w/2,innerHeight,-d/2,w/2,innerHeight,-d/2,w/2,outerHeight,d/2,-w/2,outerHeight,d/2];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();parent.add(new THREE.Mesh(g,material(0xdfdfd5)));parent.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),graphite));
 for(let x=-w/2;x<=w/2;x+=8)line(parent,[[x,innerHeight+.06,-d/2],[x,outerHeight+.06,d/2]],.38);
}
export function sign(parent,text,x,y,z,width=34,front=true){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#f5f3e9';c.fillRect(0,0,768,256);c.fillStyle='#35453b';c.textAlign='center';const lines=text.split('\n');lines.forEach((l,i)=>{c.font=i===0?'600 52px Arial':'36px Arial';c.fillText(l,384,95+i*65);});
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width/3),new THREE.MeshBasicMaterial({map:t,side:THREE.FrontSide}));mesh.position.set(x,y,z);if(!front)mesh.rotation.y=Math.PI;parent.add(mesh);return mesh;
}
export function person(parent,x,z){box(parent,.9,3.9,.6,x,2.3,z,0x8e968f);const h=new THREE.Mesh(new THREE.SphereGeometry(.55,6,4),material(0xb5b8ac));h.position.set(x,5.15,z);parent.add(h);line(parent,[[x-.4,2,z],[x-.4,0,z]],.8);line(parent,[[x+.4,2,z],[x+.4,0,z]],.8);}
export function car(parent,x,z){box(parent,6.2,2.3,15.7,x,1.75,z,0xc7ccc4);box(parent,5.7,1.5,7,x,3.35,z,0xe4e6de);}
export function stall(parent,x,z,orientation=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=orientation;box(g,7.5,3,4,0,1.5,0,0xd0d7cb);for(const u of [-2.4,0,2.4])box(g,1.8,.5,3.3,u,3.4,0,0xc2cbbd);parent.add(g);return g;}
export function tree(parent,x,z){box(parent,.8,10,.8,x,5,z,0xb3b7a8);const m=new THREE.Mesh(new THREE.IcosahedronGeometry(5.2,0),material(0xcdd5c2));m.position.set(x,12,z);parent.add(m);const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),graphite);e.position.copy(m.position);parent.add(e);}
export function disposeGroup(group){const materials=new Set();group.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])if(m&&!m.userData.sharedPencil)materials.add(m);});for(const m of materials){m.map?.dispose();m.dispose();}}
