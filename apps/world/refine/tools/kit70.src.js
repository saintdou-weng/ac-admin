/* v7.0 · 單棟建築模型組（四島共用）
   外觀與剖面是同一棟樓：外觀＝外殼＋正立面；剖面＝拿掉正立面，看每層房間、牆厚、樓板、樓梯與家具。
   每一組只用 2–3 個合併網格（頂點色），不逐件建立 Mesh。 */
(()=>{
'use strict';
const T=window.THREE;if(!T||window.Kit70)return;
const TAU=Math.PI*2,tc=new T.Color(),rgb=h=>{tc.setHex(h);return [tc.r,tc.g,tc.b];};
const rng=s=>{let a=s>>>0;return()=>{a=(Math.imul(a,1664525)+1013904223)>>>0;return a/4294967296;};};
const shade=(h,k)=>{tc.setHex(h).multiplyScalar(k);return tc.getHex();};
class G{
 constructor(){this.p=[];this.n=[];this.c=[];this.i=[];}
 q(a,b,c,d,h){const col=Array.isArray(h)?h:rgb(h),ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;const k=this.p.length/3;
  for(const v of [a,b,c,d]){this.p.push(v[0],v[1],v[2]);this.n.push(nx,ny,nz);this.c.push(col[0],col[1],col[2]);}this.i.push(k,k+1,k+2,k,k+2,k+3);return this;}
 box(x,y,z,w,h,d,hexc,ry=0){const col=rgb(hexc),cs=Math.cos(ry),sn=Math.sin(ry),a=w/2,b=h/2,e=d/2,P=(px,py,pz)=>[x+px*cs+pz*sn,y+py,z-px*sn+pz*cs];
  const v=[P(-a,-b,-e),P(a,-b,-e),P(a,-b,e),P(-a,-b,e),P(-a,b,-e),P(a,b,-e),P(a,b,e),P(-a,b,e)];
  this.q(v[3],v[2],v[6],v[7],col);this.q(v[1],v[0],v[4],v[5],col);this.q(v[2],v[1],v[5],v[6],col);this.q(v[0],v[3],v[7],v[4],col);this.q(v[7],v[6],v[5],v[4],col);this.q(v[0],v[1],v[2],v[3],col);return this;}
 /* profile [[r,y]…] swept round the y axis from angle a0 to a1; col may be f(k,j) */
 lathe(prof,seg,x,y,z,col,o={}){const a0=o.a0||0,a1=o.a1??TAU,sx=o.sx||1,sz=o.sz||1,rot=o.rot||0,flat=o.flat,at=(r,yy,j)=>{const a=rot+a0+(a1-a0)*j/seg;return [x+Math.cos(a)*r*sx,y+yy,z+Math.sin(a)*r*sz];};
  for(let k=0;k<prof.length-1;k++){const [r0,y0]=prof[k],[r1,y1]=prof[k+1],dr=r1-r0,dy=y1-y0,l=Math.hypot(dr,dy)||1;
   for(let j=0;j<seg;j++){const h=typeof col==='function'?col(k,j):col,A=at(r0,y0,j),B=at(r0,y0,j+1),C=at(r1,y1,j+1),D=at(r1,y1,j);
    if(flat){this.q(A,D,C,B,h);continue;}
    const c=rgb(h),nn=q=>{const a=rot+a0+(a1-a0)*q/seg;return [Math.cos(a)*dy/l,-dr/l,Math.sin(a)*dy/l];},i=this.p.length/3;
    for(const [v,n] of [[A,nn(j)],[B,nn(j+1)],[C,nn(j+1)],[D,nn(j)]]){this.p.push(v[0],v[1],v[2]);this.n.push(n[0],n[1],n[2]);this.c.push(c[0],c[1],c[2]);}this.i.push(i,i+2,i+1,i,i+3,i+2);}}
  const [rt,yt]=prof[prof.length-1];if(rt>.02&&!o.open){const c=rgb(o.cap??(typeof col==='function'?col(prof.length-2,0):col)),m=this.p.length/3;this.p.push(x,y+yt,z);this.n.push(0,1,0);this.c.push(c[0],c[1],c[2]);
   for(let j=0;j<=seg;j++){const v=at(rt,yt,j);this.p.push(v[0],v[1],v[2]);this.n.push(0,1,0);this.c.push(c[0],c[1],c[2]);}for(let j=0;j<seg;j++)this.i.push(m,m+2+j,m+1+j);}
  return this;}
 /* free surface f(u,v) → [x,y,z]; col may be f(u,v,p) */
 surf(f,nu,nv,col){const P=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)P.push(f(i/nu,j/nv));const id=(i,j)=>j*(nu+1)+i,base=this.p.length/3;
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const a=P[id(Math.min(nu,i+1),j)],b=P[id(Math.max(0,i-1),j)],c=P[id(i,Math.min(nv,j+1))],d=P[id(i,Math.max(0,j-1))],u=[a[0]-b[0],a[1]-b[1],a[2]-b[2]],w=[c[0]-d[0],c[1]-d[1],c[2]-d[2]];
   let n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];const l=Math.hypot(n[0],n[1],n[2])||1,p=P[id(i,j)],c3=rgb(typeof col==='function'?col(i/nu,j/nv,p):col);this.p.push(p[0],p[1],p[2]);this.n.push(n[0]/l,n[1]/l,n[2]/l);this.c.push(c3[0],c3[1],c3[2]);}
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=base+id(i,j);this.i.push(a,a+1,a+nu+2,a,a+nu+2,a+nu+1);}return this;}
 /* flat disc (or ring) in the x-y plane, facing +z */
 disc(x,y,z,r,col,seg=16,r0=0){for(let j=0;j<seg;j++){const a=j*TAU/seg,b=(j+1)*TAU/seg;this.q([x+Math.cos(a)*r0,y+Math.sin(a)*r0,z],[x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z],[x+Math.cos(b)*r0,y+Math.sin(b)*r0,z],col);}return this;}
 beam(a,b,t,col){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(d[0],d[1],d[2])||1,u=d.map(q=>q/l),s=Math.abs(u[1])>.9?[1,0,0]:[0,1,0];
  let p=[u[1]*s[2]-u[2]*s[1],u[2]*s[0]-u[0]*s[2],u[0]*s[1]-u[1]*s[0]];const pl=Math.hypot(p[0],p[1],p[2])||1;p=p.map(q=>q/pl);const w=[u[1]*p[2]-u[2]*p[1],u[2]*p[0]-u[0]*p[2],u[0]*p[1]-u[1]*p[0]];
  const c=(o,i,j)=>[o[0]+(p[0]*i+w[0]*j)*t/2,o[1]+(p[1]*i+w[1]*j)*t/2,o[2]+(p[2]*i+w[2]*j)*t/2],A=[c(a,-1,-1),c(a,1,-1),c(a,1,1),c(a,-1,1)],E=[c(b,-1,-1),c(b,1,-1),c(b,1,1),c(b,-1,1)];
  for(let k=0;k<4;k++){const n=(k+1)%4;this.q(A[k],A[n],E[n],E[k],col);}return this;}
 mesh(mat,name){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
  g.setIndex(this.p.length/3>65535?new T.Uint32BufferAttribute(this.i,1):this.i);g.computeBoundingSphere();const m=new T.Mesh(g,mat);m.name=name||'v70';m.castShadow=m.receiveShadow=true;return m;}
}
let MAT=null;
const mats=()=>MAT||(MAT={solid:new T.MeshStandardMaterial({vertexColors:true,roughness:.86,metalness:.02,side:T.DoubleSide}),
 glass:new T.MeshStandardMaterial({vertexColors:true,roughness:.22,metalness:.4,side:T.DoubleSide}),
 glow:new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide})});
const part=()=>({s:new G(),w:new G(),g:new G()});
const flush=(grp,pt,name)=>{const m=mats();if(pt.s.p.length)grp.add(pt.s.mesh(m.solid,name));if(pt.w.p.length)grp.add(pt.w.mesh(m.glass,name+' · glass'));
 if(pt.g.p.length){const e=pt.g.mesh(m.glow,name+' · light');e.castShadow=e.receiveShadow=false;e.userData.light70=true;grp.add(e);}return grp;};
const loc=(x,z,ry,dx,dz)=>{const c=Math.cos(ry),s=Math.sin(ry);return [x+dx*c+dz*s,z-dx*s+dz*c];};
const IRON=0x1b1c20,CUT=0x14151a;

/* ---------- furniture (pt = part; ry turns the piece; it faces local +z) ---------- */
const BOOK=[0x7a2e2a,0x2f4b63,0x3f6247,0xb08a3c,0x5a3b63,0x8a5a33,0xcfc4a8,0x243a4f,0x8c3b2f];
const F={
 put(pt,x,y,z,ry,dx,dy,dz,w,h,d,col,k='s'){const [px,pz]=loc(x,z,ry,dx,dz);pt[k].box(px,y+dy,pz,w,h,d,col,ry);},
 shelf(pt,x,y,z,w,h,ry=0,r=Math.random){const d=.34;F.put(pt,x,y,z,ry,0,h/2,0,w,h,d,0x4e3524);const n=Math.max(2,Math.round(h/.42));
  for(let j=0;j<n;j++){const yy=.08+j*(h-.1)/n;let u=-w/2+.06;while(u<w/2-.1){const bw=Math.min(w/2-.06-u,.16+r()*.34);F.put(pt,x,y,z,ry,u+bw/2,yy+.15,d/2+.012,bw-.02,.24+r()*.08,.03,BOOK[Math.floor(r()*BOOK.length)]);u+=bw;}}},
 bed(pt,x,y,z,ry=0,w=1.6,col=0xf2efe8){F.put(pt,x,y,z,ry,0,.22,0,w,.3,2.05,0x5b4130);F.put(pt,x,y,z,ry,0,.46,.05,w-.06,.2,1.9,col);F.put(pt,x,y,z,ry,0,.62,.42,w-.04,.14,1.2,shade(col,.9));
  F.put(pt,x,y,z,ry,0,.7,-1.0,w+.1,1.1,.1,0x4a3326);for(const s of [-1,1])F.put(pt,x,y,z,ry,s*w*.24,.62,-.72,w*.4,.12,.36,0xffffff);},
 sofa(pt,x,y,z,ry=0,w=1.9,col=0xf1ede4){F.put(pt,x,y,z,ry,0,.3,0,w,.34,.8,col);F.put(pt,x,y,z,ry,0,.62,-.33,w,.5,.16,col);for(const s of [-1,1])F.put(pt,x,y,z,ry,s*(w/2-.08),.5,0,.16,.36,.8,shade(col,.94));
  F.put(pt,x,y,z,ry,0,.08,0,w-.2,.12,.6,0x3d2c22);},
 chair(pt,x,y,z,ry=0,col=0xe9e2d2){F.put(pt,x,y,z,ry,0,.44,0,.42,.07,.42,col);F.put(pt,x,y,z,ry,0,.78,-.19,.42,.6,.05,col);for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])F.put(pt,x,y,z,ry,a*.17,.2,b*.17,.04,.42,.04,0x3d2c22);},
 table(pt,x,y,z,w,d,ry=0,col=0x5c3d28,h=.74){F.put(pt,x,y,z,ry,0,h,0,w,.06,d,col);for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])F.put(pt,x,y,z,ry,a*(w/2-.08),h/2,b*(d/2-.08),.07,h,.07,shade(col,.8));},
 round(pt,x,y,z,r=.38,col=0xf4f1ea){pt.s.lathe([[.05,0],[.05,.7],[r,.7],[r,.74]],10,x,y,z,col);pt.s.lathe([[.2,0],[.03,.04]],8,x,y,z,0x2a2a2e);},
 lamp(pt,x,y,z,h=1.5){pt.s.lathe([[.12,0],[.02,.05],[.02,h-.3]],6,x,y,z,0x8a6a3a);pt.g.lathe([[.2,h-.3],[.12,h]],8,x,y,z,0xffe2a6,{cap:0xfff4d6});},
 tlamp(pt,x,y,z){pt.s.lathe([[.06,0],[.02,.04],[.02,.2]],6,x,y,z,0x8a6a3a);pt.g.lathe([[.13,.2],[.08,.38]],8,x,y,z,0xffe2a6,{cap:0xfff4d6});},
 fire(pt,x,y,z,ry=0){F.put(pt,x,y,z,ry,0,.62,0,1.5,1.24,.3,0xe8e3d8);F.put(pt,x,y,z,ry,0,1.28,.03,1.7,.08,.4,0xd6d0c2);F.put(pt,x,y,z,ry,0,.42,.14,.8,.7,.06,0x1d1a18);F.put(pt,x,y,z,ry,0,.22,.17,.5,.26,.04,0xff9a3c,'g');
  F.put(pt,x,y,z,ry,0,2.0,.02,1.0,1.1,.05,0xc9a24a);F.put(pt,x,y,z,ry,0,2.0,.05,.84,.94,.03,0xb9cbd6,'w');},
 piano(pt,x,y,z,ry=0){F.put(pt,x,y,z,ry,0,.62,0,1.5,1.2,.55,0x17171a);F.put(pt,x,y,z,ry,0,.72,.36,1.4,.06,.22,0xf5f2ea);F.put(pt,x,y,z,ry,0,.3,.8,.7,.08,.34,0x2b1f18);},
 rug(pt,x,y,z,w,d,col=0x2f4a78,ry=0){F.put(pt,x,y,z,ry,0,.012,0,w,.02,d,col);F.put(pt,x,y,z,ry,0,.016,0,w-.4,.02,d-.4,shade(col,1.35));F.put(pt,x,y,z,ry,0,.02,0,w-.9,.02,d-.9,col);},
 pic(pt,x,y,z,ry=0,w=.7,h=.9,col=0x40546a){F.put(pt,x,y,z,ry,0,0,0,w+.12,h+.12,.05,0xc9a24a);F.put(pt,x,y,z,ry,0,0,.02,w,h,.04,col);F.put(pt,x,y,z,ry,0,.05,.035,w*.4,h*.5,.03,0xd9b89a);},
 chand(pt,x,y,z,r=.9){pt.s.box(x,y+.6,z,.04,1.2,.04,0x8a6a3a);pt.s.lathe([[r,0],[r*.9,.06],[.1,.3]],12,x,y-.1,z,0xc9a24a,{open:true});for(let k=0;k<10;k++){const a=k*TAU/10;pt.g.box(x+Math.cos(a)*r,y+.08,z+Math.sin(a)*r,.07,.16,.07,0xfff0c4);}
  pt.g.lathe([[.16,-.3],[.22,-.12],[.02,.1]],8,x,y,z,0xffe9b8);},
 tub(pt,x,y,z,ry=0){F.put(pt,x,y,z,ry,0,.32,0,1.6,.5,.74,0xf7f6f2);F.put(pt,x,y,z,ry,0,.5,0,1.4,.16,.56,0xbfd8e2);for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])F.put(pt,x,y,z,ry,a*.6,.05,b*.26,.08,.1,.08,0xc9a24a);},
 plant(pt,x,y,z,h=1.2){pt.s.lathe([[.16,0],[.2,.34]],8,x,y,z,0xb5673f);pt.s.lathe([[.05,.3],[.3,h*.6],[.2,h*.85],[.02,h]],7,x,y,z,(k,j)=>j%2?0x4f8a45:0x5f9a4f,{flat:true});},
 counter(pt,x,y,z,w,ry=0,col=0x4a3326){F.put(pt,x,y,z,ry,0,.5,0,w,1.0,.55,col);F.put(pt,x,y,z,ry,0,1.03,0,w+.08,.06,.63,0xd9d2c4);},
 crate(pt,x,y,z,s=.6,col=0x8a6a45){pt.s.box(x,y+s/2,z,s,s,s,col);pt.s.box(x,y+s/2,z,s+.03,.06,s+.03,shade(col,.7));},
 barrel(pt,x,y,z,r=.36,h=.9){pt.s.lathe([[r*.82,0],[r,h*.5],[r*.82,h]],10,x,y,z,(k,j)=>k?0x7a5333:0x86603c);for(const yy of [.16,.74])pt.s.lathe([[r*.93,h*yy],[r*.95,h*yy+.05]],10,x,y,z,0x2a2a2e,{open:true});}
};

/* ---------- iron railing between two points on a facade ---------- */
function railing(fb,u0,u1,y,n,h=.95){const L=Math.abs(u1-u0),c=(u0+u1)/2;fb('s',c,y+h,n,L,.05,.05,IRON);fb('s',c,y+.1,n,L,.04,.04,IRON);fb('s',c,y+h*.62,n,L,.025,.03,IRON);
 const k=Math.max(2,Math.round(L/.16));for(let i=0;i<=k;i++)fb('s',u0+(u1-u0)*i/k,y+h/2+.02,n,.022,h-.1,.022,IRON);
 for(let i=0;i<k;i+=3)fb('s',u0+(u1-u0)*(i+1.5)/k,y+h*.8,n,.2,.12,.02,IRON);}

/* ---------- one street elevation. rows: [{y0,h,kind:'shop'|'win',bal:'long'|'small'|0,ww,doorAt,awn:[…],lit}] ----------
   wall thickness t lies behind the plane (n<0); u runs across, n points outward */
function face(pt,cx,cz,th,width,nb,rows,o={}){
 const cs=Math.cos(th),sn=Math.sin(th),t=o.t??.35,stone=o.stone??0xdfd3ba,stone2=shade(stone,.93),trim=o.trim??0xece4d2,r=o.r||rng(7),bw=width/nb;
 const fb=(k,u,y,n,w,h,d,col)=>pt[k].box(cx+cs*u+sn*n,y,cz-sn*u+cs*n,w,h,d,col,th);
 rows.forEach((R,ri)=>{const y0=R.y0,h=R.h,top=y0+h,slab=o.slab??.3;
  if(R.kind==='shop'){const oh=h-.75,ow=bw-1.0;
   fb('s',0,top-.375,-t/2,width,.75,t,stone);                                             // fascia over the openings
   for(let i=0;i<=nb;i++){const u=-width/2+i*bw,w=i===0||i===nb?.5:1.0,uu=i===0?u+.25:i===nb?u-.25:u;fb('s',uu,y0+oh/2,-t/2,w,oh,t,stone);
    for(let j=1;j<oh/.55;j++)fb('s',uu,y0+j*.55,.012,w+.02,.05,.03,shade(stone,.78));fb('s',uu,y0+.25,.03,w+.08,.5,.06,shade(stone,.86));}
   fb('s',0,top-.62,.06,width+.1,.16,.14,trim);fb('s',0,top-.08+slab,.1,width+.24,.14,.22,trim);
   for(let i=0;i<nb;i++){const u=-width/2+(i+.5)*bw;
    if(i===R.doorAt){fb('s',u,y0+oh/2,-.2,ow,oh,.1,0x23392e);for(const s of [-1,1]){fb('s',u+s*ow*.25,y0+oh*.36,-.14,ow*.4,oh*.5,.04,0x2d4a3b);fb('s',u+s*.08,y0+1.1,-.1,.05,.3,.06,0xc9a24a);}
     fb('g',u,y0+oh-.42,-.13,ow-.3,.6,.04,0xffdf9e);fb('s',u,y0+oh-.42,-.1,.05,.6,.05,0x23392e);continue;}
    const fr=R.wood??0x1d2a26;fb('s',u,y0+.3,-.12,ow,.6,.12,fr);fb(R.lit===false?'w':'g',u,y0+.6+(oh-1.1)/2,-.16,ow-.12,oh-1.1,.04,R.lit===false?0x6f8494:0xffe7b0);
    fb('s',u,y0+oh-.25,-.12,ow,.5,.12,fr);for(const s of [-1,0,1])fb('s',u+s*(ow/2-.04)*(s?1:0),y0+oh/2,-.11,.07,oh,.1,fr);
    fb('s',u,y0+oh-.25,-.05,ow*.7,.22,.03,0xd8c48a);
    if(R.awn&&R.awn.includes(i)){const n0=.05,n1=1.5,ya=y0+oh-.1,yb=ya-.62,k=Math.round(ow/.3);
     for(let j=0;j<k;j++){const ua=u-ow/2+ow*j/k,ub=u-ow/2+ow*(j+1)/k,col=j%2?0xf4efe6:(R.awnCol??0xa8322c),P=(uu,yy,nn)=>[cx+cs*uu+sn*nn,yy,cz-sn*uu+cs*nn];
      pt.s.q(P(ua,ya,n0),P(ub,ya,n0),P(ub,yb,n1),P(ua,yb,n1),col);pt.s.q(P(ua,yb,n1),P(ub,yb,n1),P(ub,yb-.22,n1),P(ua,yb-.22,n1),col);}
     for(const s of [-1,1])fb('s',u+s*ow/2,(ya+yb)/2-.1,(n0+n1)/2,.03,.03,n1-n0,IRON);}}
   return;}
  const ww=R.ww??1.25,wb=y0+.12,wh=R.wh??(h-.85),pw=(bw-ww)/2,noble=R.noble;
  fb('s',0,y0-slab/2+.06,-t/2,width,slab+.12,t,stone);fb('s',0,(wb+wh+top)/2,-t/2,width,top-wb-wh,t,stone);
  for(let i=0;i<nb;i++){const u=-width/2+(i+.5)*bw;for(const s of [-1,1])fb('s',u+s*(ww/2+pw/2),wb+wh/2,-t/2,pw,wh,t,ri%2?stone:stone2);
   // reveal, frame, glass, glazing bars
   const lit=R.lit==null?r()<(o.litRate??.3):R.lit;fb(lit?'g':'w',u,wb+wh/2,-.2,ww-.1,wh-.1,.03,lit?(r()<.5?0xffdc9a:0xffe9bd):(r()<.5?0x6b8191:0x7890a0));
   for(const s of [-1,1])fb('s',u+s*(ww/2-.04),wb+wh/2,-.17,.07,wh,.07,0xf3f0e8);fb('s',u,wb+wh-.04,-.17,ww,.07,.07,0xf3f0e8);fb('s',u,wb+.04,-.17,ww,.08,.07,0xf3f0e8);
   fb('s',u,wb+wh/2,-.165,.05,wh,.05,0xf3f0e8);for(const f of [.32,.66])fb('s',u,wb+wh*f,-.165,ww-.1,.035,.04,0xf3f0e8);
   // stone surround, lintel, keystone
   for(const s of [-1,1])fb('s',u+s*(ww/2+.09),wb+wh/2,.03,.16,wh+.1,.07,trim);fb('s',u,wb+wh+.14,.05,ww+.5,.2,.12,trim);
   if(noble){fb('s',u,wb+wh+.33,.08,ww+.7,.1,.2,trim);fb('s',u,wb+wh+.2,.09,.26,.36,.14,shade(trim,.94));for(const s of [-1,1])fb('s',u+s*(ww/2+.2),wb+wh-.05,.07,.14,.34,.14,shade(trim,.92));}
   if(R.bal==='small'){fb('s',u,y0+.02,.22,ww+.5,.1,.44,trim);railing(fb,u-ww/2-.22,u+ww/2+.22,y0+.07,.42);for(const s of [-1,1])railing((k,uu,y,n,w,hh,d,c)=>fb(k,u+s*(ww/2+.22),y,.22+uu,d,hh,w,c),-.2,.2,y0+.07,0);}
   if(R.shut){for(const s of [-1,1]){fb('s',u+s*(ww/2+.3),wb+wh/2,.02,.5,wh,.05,R.shut);for(let j=1;j<7;j++)fb('s',u+s*(ww/2+.3),wb+wh*j/7,.05,.44,.02,.02,shade(R.shut,.75));}}
   if(R.box){fb('s',u,wb-.02,.16,ww+.1,.16,.2,0x6b4a32);for(let j=0;j<6;j++)fb('s',u-ww/2+.1+j*(ww-.1)/5,wb+.12,.17,.2,.16,.2,[0xc33b3b,0xe36a8a,0xd94f4f,0xf0a03c,0xb93a5a,0xe84a4a][j]);}
  }
  if(R.bal==='long'){fb('s',0,y0+.02,.4,width+.5,.14,.8,trim);for(let i=0;i<=nb;i++)fb('s',-width/2+i*bw+(i===0?.3:i===nb?-.3:0),y0-.22,.26,.2,.36,.5,shade(trim,.9));
   railing(fb,-width/2-.2,width/2+.2,y0+.09,.76);}
  if(R.cornice){fb('s',0,top+slab-.02,.2,width+.5,.2,.5,trim);fb('s',0,top+slab-.2,.1,width+.3,.16,.26,shade(trim,.93));for(let u=-width/2+.2;u<width/2;u+=.44)fb('s',u,top+slab-.34,.08,.18,.14,.2,trim);}
  else fb('s',0,top+.02,.04,width+.06,.1,.1,trim);
 });
 if(o.quoin!==false){const yb=rows[0].y0,yt=rows[rows.length-1].y0+rows[rows.length-1].h;for(const s of [-1,1])for(let y=yb+.3,k=0;y<yt-.3;y+=.56,k++)fb('s',s*(width/2-(k%2?.3:.42)/2+.04),y,.035,k%2?.3:.42,.44,.08,shade(stone,.95));}
 return fb;
}

/* ---------- low-poly street tree ---------- */
function tree(pt,x,y,z,h=5.2,r=rng(3)){pt.s.lathe([[.16,0],[.11,h*.5],[.07,h*.62]],6,x,y,z,0x6a4a33,{flat:true});
 for(let k=0;k<5;k++){const a=k*2.4+r(),rr=k?h*.16:0,R=h*(.2+.08*r()),cx=x+Math.cos(a)*rr,cz=z+Math.sin(a)*rr,cy=y+h*(.62+.1*k*r());
  pt.s.lathe([[R*.2,-R*.8],[R*.85,-R*.35],[R,.1*R],[R*.7,R*.62],[R*.15,R*.95]],6,cx,cy,cz,(i,j)=>[0x5fa24a,0x6fb558,0x4f9140,0x7cc061][(i+j+k)%4],{flat:true,rot:r()*3});}}

/* =====================================================================================
   1 · 奧斯曼公寓（巴黎）：17 × 11 m，一樓店面＋四層住宅＋曼薩爾閣樓
   ===================================================================================== */
function haussmann(){
 const r=rng(20261127),W=17,D=11,t=.35,x0=-W/2,z0=-D/2,SL=.3;
 const LV=[{y:.3,h:3.9},{y:4.5,h:3.5},{y:8.3,h:3.1},{y:11.7,h:3.1},{y:15.1,h:3.0},{y:18.4,h:2.9}],yR=18.4,yT=21.3,inset=1.15;
 const root=new T.Group(),shellG=new T.Group(),frontG=new T.Group(),cutG=new T.Group();
 const sh=part(),fr=part(),ct=part();
 // pavement, kerb, cellar plinth
 sh.s.box(0,.07,0,W+9,.14,D+9,0xbfc1c4);sh.s.box(0,.02,0,W+10.4,.06,D+10.4,0x8f9296);for(let k=-6;k<=6;k++){sh.s.box(k*2,.142,0,.03,.01,D+9,0xa9abae);if(Math.abs(k)<5)sh.s.box(0,.142,k*2,W+9,.01,.03,0xa9abae);}
 sh.s.box(0,.22,0,W,.16,D,0xcfc6b0);
 // three standing elevations (party-wall side kept plain), the street front goes to the removable group
 const upper=(lit)=>[{y0:LV[1].y,h:LV[1].h,noble:true,bal:'long',lit},{y0:LV[2].y,h:LV[2].h,bal:'small',lit},{y0:LV[3].y,h:LV[3].h,bal:'small',lit},{y0:LV[4].y,h:LV[4].h,bal:'long',cornice:true,lit}];
 face(sh,W/2,0,Math.PI/2,D,3,[{y0:LV[0].y,h:LV[0].h,kind:'shop',awn:[1,2],doorAt:-1},...upper()],{r});
 face(sh,-W/2,0,-Math.PI/2,D,3,[{y0:LV[0].y,h:LV[0].h,kind:'shop',lit:false},...upper()],{r,litRate:.2});
 face(sh,0,-D/2,Math.PI,W,5,[{y0:LV[0].y,h:LV[0].h,kind:'shop',lit:false},...upper()],{r,litRate:.2});
 face(fr,0,D/2,0,W,5,[{y0:LV[0].y,h:LV[0].h,kind:'shop',awn:[0,3,4],doorAt:1},...upper()],{r,litRate:.45});
 // mansard: slate courses on four slopes, dormers, zinc flat, chimneys
 const slope=(pt,th,width)=>{const cs=Math.cos(th),sn=Math.sin(th),cx=th===0?0:th===Math.PI?0:(th>0?W/2:-W/2),cz=th===0?D/2:th===Math.PI?-D/2:0,P=(u,y,n)=>[cx+cs*u+sn*n,y,cz-sn*u+cs*n],K=7;
  for(let k=0;k<K;k++){const a=k/K,b=(k+1)/K,ya=yR+.3+(yT-yR-.3)*a,yb=yR+.3+(yT-yR-.3)*b,na=-inset*a,nb=-inset*b,ua=width/2-inset*a,ub=width/2-inset*b;pt.s.q(P(-ua,ya,na),P(ua,ya,na),P(ub,yb,nb),P(-ub,yb,nb),k%2?0x4b5663:0x55616e);}
  const nd=Math.round(width/3.3);for(let i=0;i<nd;i++){const u=-width/2+(i+.5)*width/nd,[px,pz]=[cx+cs*u+sn*-.45,cz-sn*u+cs*-.45];pt.s.box(px,yR+1.35,pz,1.15,1.7,.9,0xe6dcc6,th);pt.s.box(px,yR+2.27,pz,1.4,.16,1.1,0x7d8894,th);
   const [gx,gz]=[cx+cs*u+sn*.02,cz-sn*u+cs*.02],lit=r()<.4;pt[lit?'g':'w'].box(gx,yR+1.3,gz,.75,1.2,.03,lit?0xffe2a6:0x7890a0,th);pt.s.box(gx,yR+1.3,gz,.05,1.2,.05,0xf3f0e8,th);pt.s.box(gx,yR+1.3,gz,.75,.04,.05,0xf3f0e8,th);}
  pt.s.box(cx+sn*-.02,yR+.18,cz+cs*-.02,th%Math.PI?.3:width+.2,.2,th%Math.PI?width+.2:.3,0x7d8894);};
 slope(sh,Math.PI/2,D);slope(sh,-Math.PI/2,D);slope(sh,Math.PI,W);slope(fr,0,W);
 sh.s.box(0,yT+.06,0,W-2*inset+.1,.12,D-2*inset+.1,0x8792a0);for(const s of [-1,1]){sh.s.box(0,yT+.2,s*(D/2-inset),W-2*inset,.12,.1,IRON);sh.s.box(s*(W/2-inset),yT+.2,0,.1,.12,D-2*inset,IRON);}
 for(const [cx,cz,w] of [[-4.6,-2.8,2.0],[3.4,-3.0,1.6],[5.2,1.4,1.2]]){sh.s.box(cx,yT+1.1,cz,w,2.2,.8,0xe3d9c3);sh.s.box(cx,yT+2.25,cz,w+.16,.14,.96,0xcfc4ac);const n=Math.round(w/.42);for(let k=0;k<n;k++)sh.s.lathe([[.13,0],[.1,.55]],8,cx-w/2+.25+k*(w-.5)/Math.max(1,n-1),yT+2.3,cz,0xb5553a);}
 for(const [cx,cz] of [[-W/2+inset,-D/2+inset],[W/2-inset,-D/2+inset],[-W/2+inset,D/2-inset],[W/2-inset,D/2-inset]])sh.s.lathe([[.05,0],[.09,.5],[.01,1.5]],5,cx,yT+.1,cz,IRON,{flat:true});
 // floors, party walls behind the cut, partitions, cut edges
 const PX=[-4.2,-2.2,3.8],bays=[[x0+t,-4.3],[-4.1,-2.3],[-2.1,3.7],[3.9,-x0-t]];
 const slabs=(i,y)=>{const c=0xd9d2c2,zi=D-2*t,L0=x0+t,R0=-x0-t,xr=i===2?3.8:-2.2;
  sh.s.box((L0-4.2)/2,y,0,-4.2-L0,SL,zi,c);sh.s.box((xr+R0)/2,y,0,R0-xr,SL,zi,c);                    // left rooms, right rooms
  sh.s.box(-3.2,y,(1.2+D/2-t)/2,2.0,SL,D/2-t-1.2,c);sh.s.box(-3.2,y,(z0+t-3.0)/2,2.0,SL,-3.0-z0-t,c);   // stair bay: landing front and back, well between
  ct.s.box((x0-4.2)/2,y,D/2-.07,-4.2-x0,SL,.14,CUT);ct.s.box(-3.2,y,D/2-.07,2.0,SL,.14,CUT);ct.s.box((xr-x0)/2,y,D/2-.07,-x0-xr,SL,.14,CUT);};
 LV.forEach((L,i)=>{if(i)slabs(i,L.y-SL/2);if(i===5)return;
  for(const px of PX){const dw=1.0,zc=1.6;sh.s.box(px,L.y+L.h/2,(z0+t+zc-dw/2)/2,.2,L.h,zc-dw/2-z0-t,0xeee9dd);sh.s.box(px,L.y+L.h/2,(zc+dw/2+D/2)/2-.05,.2,L.h,D/2-zc-dw/2-.1,0xeee9dd);sh.s.box(px,L.y+L.h-.4,zc,.2,.8,dw,0xeee9dd);
   ct.s.box(px,L.y+L.h/2,D/2-.07,.2,L.h,.14,CUT);}});
 ct.s.box(0,.22,D/2-.07,W,.16,.14,CUT);for(const s of [-1,1]){ct.s.box(s*(W/2-t/2),(yR+.3)/2,D/2-.07,t,yR-.3,.14,CUT);ct.s.beam([s*W/2,yR+.3,D/2-.02],[s*(W/2-inset),yT,D/2-inset+.05],.16,CUT);}
 ct.s.box(0,yT+.02,D/2-inset+.02,W-2*inset,.16,.14,CUT);
 // rooms
 const levels=[],names=['1F 街角咖啡館與書店','2F 宴會廳、藏書室與沙龍','3F 臥室與起居室','4F 客廳與廚房','5F 書房與主臥','6F 閣樓畫室'];
 const zb=z0+t+.03;                      // inner face of the back wall
 const room=(pt,L,b,floor,wall,dado)=>{const [a,c]=bays[b],w=c-a,xm=(a+c)/2;pt.s.box(xm,L.y+.02,0,w,.04,D-2*t,floor);
  pt.s.box(xm,L.y+L.h/2,zb,w,L.h,.04,wall);for(const [px,s] of [[a,1],[c,-1]]){const wc=shade(wall,.96),X=px+s*.02;if(Math.abs(px)>8)pt.s.box(X,L.y+L.h/2,0,.03,L.h,D-2*t,wc);else{pt.s.box(X,L.y+L.h/2,(z0+t+1.1)/2,.03,L.h,1.1-z0-t,wc);pt.s.box(X,L.y+L.h/2,(2.1+D/2-.1)/2,.03,L.h,D/2-.1-2.1,wc);pt.s.box(X,L.y+L.h-.4,1.6,.03,.8,1.0,wc);}}
  if(dado){pt.s.box(xm,L.y+.5,zb+.03,w,1.0,.04,dado);pt.s.box(xm,L.y+1.02,zb+.05,w,.06,.06,shade(dado,1.1));}pt.s.box(xm,L.y+.08,zb+.04,w,.16,.05,0xf3f0e8);pt.s.box(xm,L.y+L.h-.08,zb+.04,w,.16,.08,0xf6f3ec);return xm;};
 const stairs=(pt,L,up)=>{const [a,c]=bays[1],xm=(a+c)/2,n=Math.round((up)/.19),run=6.2/n;pt.s.box(xm,L.y+.02,0,c-a,.04,D-2*t,0x7b5a40);
  for(let k=0;k<n;k++){pt.s.box(xm,L.y+(k+.5)*up/n,3.4-k*run,c-a-.5,up/n,run+.02,k%2?0xb89a78:0xa98a69);}
  pt.s.beam([xm,L.y-.02,3.4+run/2],[xm,L.y+up-.02,3.4-n*run+run/2],.14,0x6b4e38);for(const s of [-1,1]){pt.s.beam([xm+s*(c-a-.5)/2,L.y+.95,3.6],[xm+s*(c-a-.5)/2,L.y+up+.95,3.4-n*run],.05,0x2c221c);for(let k=0;k<n;k+=2)pt.s.box(xm+s*(c-a-.5)/2,L.y+(k+.5)*up/n+.5,3.4-k*run,.03,.9,.03,IRON);}};
 const chk=(pt,L,b)=>{const [a,c]=bays[b],n=Math.round((c-a)/.5);for(let i=0;i<n;i++)for(let j=0;j<20;j++)if((i+j)%2)pt.s.box(a+(i+.5)*(c-a)/n,L.y+.045,z0+t+.25+j*.5,(c-a)/n,.01,.5,0x202226);};
 const mk=i=>{const g=new T.Group(),pt=part(),L=LV[i];return {g,pt,L};};
 { // 1F
  const {g,pt,L}=mk(0);let xm=room(pt,L,0,0x8a6a4a,0x4f7a62,0x3f5a48);
  for(let k=0;k<3;k++)F.shelf(pt,x0+t+.25,L.y,-3.6+k*2.4,2.0,2.9,Math.PI/2,r);F.shelf(pt,xm+.4,L.y,zb+.25,2.6,2.9,0,r);F.table(pt,xm+.5,L.y,1.4,1.5,.8,0,0x5c3d28);for(let k=0;k<5;k++)pt.s.box(xm+.1+k*.2,L.y+.82,1.4,.16,.06+.03*(k%3),.24,BOOK[k]);F.lamp(pt,xm+1.3,L.y,3.6);F.rug(pt,xm+.4,L.y+.04,1.6,2.6,3.4,0x7a2e2a);
  stairs(pt,L,LV[1].y-L.y);
  xm=room(pt,L,2,0xe9e2d2,0xe3d3b0,0x2d4a3b);chk(pt,L,2);F.counter(pt,xm,L.y,zb+1.0,4.2,0,0x2d4a3b);for(let k=0;k<3;k++)F.put(pt,xm,L.y,zb+.2,0,0,1.5+k*.55,0,4.2,.05,.3,0x3d2c22);
  for(let k=0;k<3;k++)for(let j=0;j<9;j++)pt.s.lathe([[.05,0],[.05,.2],[.02,.3]],6,xm-1.9+j*.47,L.y+1.53+k*.55,zb+.22,[0x3f6247,0x8a5a33,0xcfc4a8,0x7a2e2a][(j+k)%4]);
  for(const [tx,tz] of [[-1.2,.4],[1.0,.2],[-.2,2.4],[2.2,2.6],[-1.8,3.6],[.9,4.2]]){F.round(pt,xm+tx,L.y,tz);F.chair(pt,xm+tx-.6,L.y,tz,Math.PI/2);F.chair(pt,xm+tx+.6,L.y,tz,-Math.PI/2);pt.g.box(xm+tx,L.y+.8,tz,.06,.1,.06,0xffe2a6);}
  for(const tx of [-1.5,0,1.5])pt.g.lathe([[.2,0],[.03,.3]],8,xm+tx,L.y+L.h-.9,1.2,0xffe6b0);F.plant(pt,xm+2.6,L.y,4.4,1.5);
  xm=room(pt,L,3,0xd9c7a8,0xe8c4b4,0x8a3b3b);F.counter(pt,xm,L.y,.6,3.2,0,0xf2eee4);pt.w.box(xm,L.y+1.3,.6,3.0,.5,.5,0xb9d3de);for(let k=0;k<8;k++)pt.s.box(xm-1.3+k*.37,L.y+1.14,.6,.26,.1,.3,[0xe8c27a,0xd9a05a,0xf2d9a0,0xc97a4a][k%4]);
  F.shelf(pt,xm,L.y,zb+.25,3.4,2.6,0,r);F.round(pt,xm-.8,L.y,3.4);F.chair(pt,xm-1.4,L.y,3.4,Math.PI/2);F.chair(pt,xm-.2,L.y,3.4,-Math.PI/2);pt.g.lathe([[.22,0],[.03,.32]],8,xm,L.y+L.h-.9,2,0xffe6b0);
  flush(g,pt,'haussmann 1F');levels.push({group:g,name:names[0],y:L.y,h:L.h,rooms:[{name:'街角咖啡館',pos:[.8,L.y+1.7,3.6],look:[.8,L.y+1.4,-4]},{name:'書店',pos:[-6.2,L.y+1.7,3.8],look:[-6.4,L.y+1.4,-4]},{name:'甜點櫃',pos:[6,L.y+1.7,3.8],look:[6,L.y+1.3,-3]}]});
 }
 { // 2F：藏書室、挑高宴會廳、沙龍
  const {g,pt,L}=mk(1),H2=LV[2].y+LV[2].h-L.y;let xm=room(pt,L,0,0x7b5a40,0x5f8a72,0x4e3524);
  for(let k=0;k<3;k++)F.shelf(pt,x0+t+.25,L.y,-3.6+k*2.4,2.1,3.0,Math.PI/2,r);F.shelf(pt,xm+.3,L.y,zb+.25,3.0,3.0,0,r);F.table(pt,xm+.6,L.y,1.2,1.7,.85,0,0x4e3524);F.chair(pt,xm+.6,L.y,2.0,Math.PI,0x7a2e2a);F.tlamp(pt,xm+1.2,L.y+.78,1.2);
  pt.s.lathe([[.28,0],[.28,.02],[.05,.1],[.05,.6]],8,xm-.9,L.y,3.6,0x3d2c22);pt.s.lathe([[.02,0],[.26,.2],[.3,.34],[.2,.5],[.02,.58]],10,xm-.9,L.y+.62,3.6,(k,j)=>j%3?0x3d6e8a:0x6f9a5a);F.rug(pt,xm+.4,L.y+.04,1.8,2.6,3.6,0x2f4a3a);
  stairs(pt,L,LV[2].y-L.y);
  { const [a,c]=bays[2],w=c-a;xm=(a+c)/2;pt.s.box(xm,L.y+.02,0,w,.04,D-2*t,0x9a7650);for(let i=0;i<8;i++)for(let j=0;j<14;j++)if((i+j)%2)pt.s.box(a+(i+.5)*w/8,L.y+.045,z0+t+.35+j*.73,w/8,.01,.73,0x86623f);
   pt.s.box(xm,L.y+H2/2,zb,w,H2,.04,0xcfdccb);for(const [px,s] of [[a,1],[c,-1]])pt.s.box(px+s*.02,L.y+H2/2,-1.9,.03,H2,D-2*t-3.9,0xc6d4c2);
   for(let k=0;k<7;k++){const u=a+.5+k*(w-1)/6;pt.s.box(u,L.y+H2/2,zb+.03,.06,H2-.5,.03,0xf8f6f0);}pt.s.box(xm,L.y+1.0,zb+.04,w,.08,.05,0xf8f6f0);pt.s.box(xm,L.y+H2-.2,zb+.05,w,.3,.1,0xf8f6f0);
   for(let k=0;k<6;k++)F.pic(pt,a+.75+k*(w-1.5)/5,L.y+3.3,zb+.07,0,.52,.74,[0x2f3d4f,0x4a2f2a,0x3a4a3a,0x513a4a,0x2f4a4f,0x4a3f2a][k]);
   F.fire(pt,xm,L.y,zb+.2);
   F.rug(pt,xm,L.y+.04,1.0,5.0,3.6,0x2f4a78);F.table(pt,xm,L.y,1.0,3.8,1.1,0,0x4a3020,.76);for(let k=0;k<5;k++){F.chair(pt,xm-1.5+k*.75,L.y,.2,0,0xdfe6ea);F.chair(pt,xm-1.5+k*.75,L.y,1.8,Math.PI,0xdfe6ea);pt.s.lathe([[.11,0],[.11,.015]],8,xm-1.5+k*.75,L.y+.8,.7,0xffffff);pt.s.lathe([[.11,0],[.11,.015]],8,xm-1.5+k*.75,L.y+.8,1.3,0xffffff);}
   for(const s of [-1,1]){F.chair(pt,xm+s*2.2,L.y,1.0,-s*Math.PI/2,0xdfe6ea);pt.s.lathe([[.07,0],[.02,.04],[.02,.3]],6,xm+s*.9,L.y+.8,1.0,0xc9a24a);pt.g.box(xm+s*.9,L.y+1.16,1.0,.04,.12,.04,0xfff0c4);}
   F.chand(pt,xm,L.y+H2-1.5,1.0,1.1);pt.s.box(xm,L.y+H2-.5,1.0,.04,1.0,.04,0x8a6a3a);F.counter(pt,c-.45,L.y,3.4,1.8,-Math.PI/2,0x4a3020);F.tlamp(pt,c-.45,L.y+1.06,3.4);F.plant(pt,a+.5,L.y,4.4,1.6); }
  xm=room(pt,L,3,0x8a6a4a,0xb9cbd6,0xf1eee6);F.sofa(pt,xm,L.y,zb+.6,0,2.2);F.fire(pt,-x0-t-.2,L.y,1.0,-Math.PI/2);F.sofa(pt,xm-1.2,L.y,2.6,Math.PI/2,1.5);F.round(pt,xm+.1,L.y,2.4,.45,0x5c3d28);F.piano(pt,xm+.6,L.y,4.2,Math.PI);F.rug(pt,xm,L.y+.04,2.2,3.2,3.2,0x8a3b3b);F.lamp(pt,xm-1.7,L.y,zb+.5);F.pic(pt,xm,L.y+2.3,zb+.07,0,1.2,.8,0x5a7a8a);
  flush(g,pt,'haussmann 2F');levels.push({group:g,name:names[1],y:L.y,h:L.h,rooms:[{name:'挑高宴會廳',pos:[.8,L.y+1.7,4.2],look:[.8,L.y+2.2,-4]},{name:'藏書室',pos:[-6.2,L.y+1.7,3.8],look:[-6.6,L.y+1.5,-4]},{name:'沙龍與鋼琴',pos:[6,L.y+1.7,3.0],look:[6,L.y+1.2,-4]}]});
 }
 { // 3F：臥室｜宴會廳上空｜起居室
  const {g,pt,L}=mk(2);let xm=room(pt,L,0,0x9a7650,0xbcd2bf,0xf1eee6);F.bed(pt,xm-.3,L.y,zb+1.15,0,1.8);for(const s of [-1,1]){pt.s.box(xm-.3+s*1.25,L.y+.28,zb+.35,.45,.56,.4,0x5b4130);F.tlamp(pt,xm-.3+s*1.25,L.y+.56,zb+.35);}
  F.put(pt,x0+t+.35,L.y,2.6,Math.PI/2,0,1.1,0,1.6,2.2,.6,0xf1eee6);F.rug(pt,xm,L.y+.04,2.2,2.6,2.0,0xb9c4b0);F.chair(pt,xm+1.2,L.y,3.6,-2.4,0xe9d9c4);F.pic(pt,xm-.3,L.y+2.2,zb+.07,0,.9,.6,0x7a8a6a);
  stairs(pt,L,LV[3].y-L.y);
  xm=room(pt,L,3,0x9a7650,0xe6cf9f,0xf1eee6);F.sofa(pt,xm,L.y,zb+.6,0,2.0,0xdfe6ea);F.shelf(pt,-x0-t-.25,L.y,1.4,2.2,2.6,-Math.PI/2,r);F.table(pt,xm-.6,L.y,3.4,1.4,.8,0,0x5c3d28);F.chair(pt,xm-.6,L.y,4.1,Math.PI);F.tlamp(pt,xm-1.0,L.y+.78,3.4);F.rug(pt,xm,L.y+.04,2.0,2.8,2.2,0x40546a);F.plant(pt,xm+1.6,L.y,4.4,1.3);
  flush(g,pt,'haussmann 3F');levels.push({group:g,name:names[2],y:L.y,h:L.h,rooms:[{name:'臥室',pos:[-6.2,L.y+1.7,3.8],look:[-6.4,L.y+1.2,-4]},{name:'起居室',pos:[6,L.y+1.7,3.8],look:[6,L.y+1.2,-4]}]});
 }
 { // 4F：臥室｜客廳｜廚房餐廳
  const {g,pt,L}=mk(3);let xm=room(pt,L,0,0x9a7650,0xe6d9bd,0x6f8f7a);F.bed(pt,xm,L.y,zb+1.15,0,1.6,0xe9eef2);pt.s.box(xm+1.2,L.y+.28,zb+.35,.45,.56,.4,0x5b4130);F.tlamp(pt,xm+1.2,L.y+.56,zb+.35);F.shelf(pt,x0+t+.25,L.y,2.4,1.8,2.4,Math.PI/2,r);F.rug(pt,xm,L.y+.04,2.4,2.4,1.8,0xc9b79a);F.table(pt,xm+.8,L.y,4.0,1.2,.6);F.chair(pt,xm+.8,L.y,3.4,0);
  stairs(pt,L,LV[4].y-L.y);
  xm=room(pt,L,2,0x9a7650,0xc9d9d2,0xf6f3ec);F.fire(pt,xm,L.y,zb+.2);F.sofa(pt,xm,L.y,2.6,Math.PI,2.3);F.sofa(pt,xm-2.0,L.y,1.2,Math.PI/2,1.5);F.sofa(pt,xm+2.0,L.y,1.2,-Math.PI/2,1.5);F.table(pt,xm,L.y,1.2,1.2,.7,0,0x5c3d28,.42);F.rug(pt,xm,L.y+.04,1.3,4.2,3.0,0x7a2e2a);
  F.shelf(pt,bays[2][0]+.25,L.y,-3.2,2.0,2.6,Math.PI/2,r);F.lamp(pt,xm+2.4,L.y,zb+.5);F.plant(pt,xm-2.4,L.y,4.4,1.5);F.pic(pt,xm+1.9,L.y+2.0,zb+.07,0,.7,.9,0x5a4a6a);F.pic(pt,xm-1.9,L.y+2.0,zb+.07,0,.7,.9,0x4a6a5a);
  xm=room(pt,L,3,0xcfc7b6,0xdfe9ec,0xdfe6ea);F.counter(pt,xm,L.y,zb+.35,3.6,0,0xf1eee6);pt.s.box(xm-.9,L.y+1.08,zb+.35,.7,.04,.5,0x2a2a2e);pt.s.box(xm+1.0,L.y+1.4,zb+.2,.5,.6,.3,0xb9cbd6);for(let k=0;k<3;k++)F.put(pt,xm,L.y,zb+.18,0,-1.2+k*1.2,2.3,0,1.0,.7,.34,0xf6f3ec);
  F.table(pt,xm,L.y,2.4,1.5,.9);for(const [dx,dz,a] of [[-.5,-.75,0],[.5,-.75,0],[-.5,.75,Math.PI],[.5,.75,Math.PI]])F.chair(pt,xm+dx,L.y,2.4+dz,a);pt.g.lathe([[.24,0],[.03,.3]],8,xm,L.y+L.h-.8,2.4,0xffe6b0);pt.s.lathe([[.1,0],[.14,.12],[.02,.3]],8,xm,L.y+.77,2.4,0xc33b3b);
  flush(g,pt,'haussmann 4F');levels.push({group:g,name:names[3],y:L.y,h:L.h,rooms:[{name:'客廳',pos:[.8,L.y+1.7,4.2],look:[.8,L.y+1.2,-4]},{name:'廚房與餐桌',pos:[6,L.y+1.7,4.0],look:[6,L.y+1.2,-4]},{name:'臥室',pos:[-6.2,L.y+1.7,3.8],look:[-6.4,L.y+1.2,-4]}]});
 }
 { // 5F：書房｜主臥與浴室｜兒童房
  const {g,pt,L}=mk(4);let xm=room(pt,L,0,0x7b5a40,0x4f6f8a,0x4e3524);for(let k=0;k<3;k++)F.shelf(pt,x0+t+.25,L.y,-3.6+k*2.4,2.0,2.5,Math.PI/2,r);F.shelf(pt,xm+.4,L.y,zb+.25,2.6,2.5,0,r);F.table(pt,xm+.4,L.y,1.8,1.6,.8,0,0x4e3524);F.chair(pt,xm+.4,L.y,2.6,Math.PI,0x7a2e2a);F.tlamp(pt,xm+.9,L.y+.78,1.8);F.rug(pt,xm+.3,L.y+.04,2.2,2.6,2.6,0x7a2e2a);
  stairs(pt,L,LV[5].y-L.y);
  xm=room(pt,L,2,0x9a7650,0xd4d0e2,0xf6f3ec);F.bed(pt,xm-1.2,L.y,zb+1.15,0,1.9,0xf2efe8);for(const s of [-1,1]){pt.s.box(xm-1.2+s*1.3,L.y+.28,zb+.35,.45,.56,.4,0x5b4130);F.tlamp(pt,xm-1.2+s*1.3,L.y+.56,zb+.35);}
  pt.s.box(xm+1.5,L.y+L.h/2,-1.2,.12,L.h,D-2*t-5.2,0xeee9dd);pt.s.box(xm+2.25,L.y+.03,-2.6,1.4,.03,4.6,0xd9e4e8);F.tub(pt,xm+2.3,L.y,-3.6,Math.PI/2);pt.s.box(xm+2.5,L.y+.8,-1.2,.5,.12,.4,0xf7f6f2);pt.w.box(xm+2.5,L.y+1.6,zb+.06,.6,.8,.03,0xb9cbd6);
  F.sofa(pt,xm+1.0,L.y,3.4,Math.PI,1.8,0xdfe6ea);F.rug(pt,xm-.8,L.y+.04,2.0,3.0,2.2,0xb9c4b0);F.put(pt,bays[2][0]+.4,L.y,2.8,Math.PI/2,0,1.1,0,1.8,2.2,.6,0xf1eee6);
  xm=room(pt,L,3,0x9a7650,0xf2dfae,0xe7c9a0);F.bed(pt,xm-.9,L.y,zb+1.15,0,1.1,0xf2d9c4);F.shelf(pt,-x0-t-.25,L.y,1.2,1.8,1.6,-Math.PI/2,r);F.table(pt,xm+.9,L.y,3.4,1.2,.6,0,0xb89a78);F.chair(pt,xm+.9,L.y,4.0,Math.PI,0xc33b3b);F.rug(pt,xm,L.y+.04,2.2,2.2,2.2,0xe0a63c);for(let k=0;k<4;k++)F.crate(pt,xm-1.2+k*.5,L.y,3.9,.34,[0xc33b3b,0x2f4b63,0xe0a63c,0x3f6247][k]);
  flush(g,pt,'haussmann 5F');levels.push({group:g,name:names[4],y:L.y,h:L.h,rooms:[{name:'主臥與浴室',pos:[.6,L.y+1.7,4.2],look:[.2,L.y+1.2,-4]},{name:'書房',pos:[-6.2,L.y+1.7,3.8],look:[-6.6,L.y+1.4,-4]},{name:'兒童房',pos:[6,L.y+1.7,3.8],look:[6,L.y+1.2,-4]}]});
 }
 { // 6F：曼薩爾閣樓
  const {g,pt,L}=mk(5);const a=x0+inset+.1,c=-x0-inset-.1;pt.s.box(0,L.y+.02,-.4,W-2*t,.04,D-2*t-.9,0xa98a69);pt.s.box(0,L.y+L.h/2,z0+inset+.25,c-a,L.h-.2,.04,0xe9dcc4);
  F.put(pt,-5.4,L.y,1.2,-.5,0,.9,0,.06,1.8,.06,0x8a6a45);F.put(pt,-5.4,L.y,1.2,-.5,0,1.2,.06,.9,1.1,.04,0xf6f3ec);F.put(pt,-5.4,L.y,1.2,-.5,0,1.25,.085,.6,.7,.02,0x6f9ab0);for(let k=0;k<4;k++)F.put(pt,-6.6+k*.3,L.y,z0+inset+.5,.15,0,.5,0,.7,1.0,.04,[0xd9b89a,0x6f8f7a,0x7a2e2a,0x2f4b63][k]);
  F.table(pt,-4.0,L.y,-1.6,1.4,.7,0,0x8a6a45);for(let k=0;k<5;k++)pt.s.lathe([[.05,0],[.05,.14]],6,-4.4+k*.2,L.y+.77,-1.6,[0xc33b3b,0x2f4b63,0xe0a63c,0x3f6247,0xf6f3ec][k]);F.shelf(pt,-1.6,L.y,z0+inset+.45,2.2,1.8,0,r);
  pt.s.box(-3.2,L.y+.5,1.2,2.0,1.0,.05,IRON);F.bed(pt,1.8,L.y,z0+inset+1.35,0,1.5,0xe9eef2);F.tlamp(pt,2.9,L.y+.56,z0+inset+.6);pt.s.box(2.9,L.y+.28,z0+inset+.6,.45,.56,.4,0x5b4130);F.rug(pt,1.8,L.y+.04,1.6,2.4,1.8,0x8a3b3b);
  F.sofa(pt,5.4,L.y,z0+inset+.9,0,1.8,0xc9b79a);for(const [bx_,bz] of [[4.2,2.6],[4.9,2.9],[4.5,3.3]])F.crate(pt,bx_,L.y,bz,.6);F.barrel(pt,6.2,L.y,2.4);F.plant(pt,0,L.y,2.8,1.2);F.lamp(pt,6.4,L.y,-1.0,1.4);
  flush(g,pt,'haussmann 6F');levels.push({group:g,name:names[5],y:L.y,h:L.h,rooms:[{name:'閣樓畫室',pos:[-4.4,L.y+1.6,2.6],look:[-5.4,L.y+1.2,-3]},{name:'閣樓小臥室',pos:[2.2,L.y+1.6,2.6],look:[1.8,L.y+1.0,-4]}]});
 }
 // street: trees, café terrace, lamp
 for(const [tx,tz] of [[-11.2,6.8],[11.4,7.0],[11.6,-1.6],[-11.4,-3.0],[11.2,-6.6]])tree(sh,tx,.14,tz,5.2,r);
 for(const [tx,tz] of [[10.2,-3.6],[10.4,.6],[10.2,2.6],[6.4,7.0],[3.4,7.2],[.6,7.0]]){F.round(sh,tx,.14,tz,.34);F.chair(sh,tx,.14,tz-.6,0,0xd9c27a);F.chair(sh,tx,.14,tz+.6,Math.PI,0xd9c27a);}
 for(const [lx,lz] of [[-8.8,7.6],[9.8,7.2]]){sh.s.lathe([[.14,0],[.06,.3],[.05,3.6]],6,lx,.14,lz,IRON);sh.g.lathe([[.1,3.6],[.2,3.75],[.16,4.1],[.03,4.2]],6,lx,.14,lz,0xffe9bd);}
 flush(shellG,sh,'haussmann shell');flush(frontG,fr,'haussmann street front');flush(cutG,ct,'haussmann cut edge');
 root.add(shellG,frontG,cutG);levels.forEach(l=>root.add(l.group));
 return {id:'paris',title:'巴黎・奧斯曼公寓（單棟外觀與剖面）',root,exterior:frontG,shell:shellG,cutOnly:cutG,levels,anims:[],bounds:{x:W/2-.8,z:D/2-.8},radius:25,height:24,az:.3,whole:true};
}

/* =====================================================================================
   2 · 童話城堡（自創造型）：外牆與角塔、門樓、主樓四層、螺旋梯塔、藏寶塔、觀星尖塔
   剖面沿主樓正面切開：看得到牆厚、每層房間、螺旋梯與塔內小室
   ===================================================================================== */
const GOLD=0xd9b24a,ROOF=0x2d5aa0;
function tower(pt,cx,cz,r,y0,H,o={}){const a0=o.a0||0,a1=o.a1??TAU,fr=(a1-a0)/TAU,seg=Math.max(8,Math.round(20*fr)),st=o.stone??0xcfc9bb,n=Math.max(3,Math.round((H-y0)/.9)),prof=[],sd=o.seed||1;
 for(let k=0;k<=n;k++)prof.push([r*(1+.01*(k%2)),(H-y0)*k/n]);const sh5=[st,shade(st,.93),shade(st,1.04),shade(st,.89),st,shade(st,.97),st];
 pt.s.lathe(prof,seg,cx,y0,cz,(k,j)=>sh5[(k*7+j*13+sd*5+(k*j)%3)%7],{a0,a1,open:true});
 pt.s.lathe([[r,H-y0-.9],[r+.42,H-y0-.3],[r+.42,H-y0+.75],[r+.12,H-y0+.75]],seg,cx,y0,cz,shade(st,.96),{a0,a1,open:true});
 const nm=Math.max(3,Math.round(14*fr*r/2.4));for(let i=0;i<nm;i++){const a=a0+(a1-a0)*(i+.5)/nm;pt.s.box(cx+Math.cos(a)*(r+.27),H+1.02,cz+Math.sin(a)*(r+.27),.5,.55,.3,shade(st,1.02),Math.PI/2-a);}
 for(let i=0;i<nm*2;i++){const a=a0+(a1-a0)*(i+.5)/(nm*2);pt.s.box(cx+Math.cos(a)*(r+.2),H-.75,cz+Math.sin(a)*(r+.2),.2,.4,.4,shade(st,.86),Math.PI/2-a);}
 if(o.roof){const h=o.roof,rc=o.roofCol??ROOF,R=r+.62,K=7,pr=[];for(let k=0;k<=K;k++)pr.push([Math.max(.03,R*(1-k/K)*(1-.14*Math.sin(Math.PI*k/K))),h*k/K]);
  pt.s.lathe(pr,seg,cx,H+.6,cz,(k,j)=>k%2?rc:shade(rc,.86),{a0,a1,open:true});pt.s.lathe([[R+.03,0],[R+.03,.16]],seg,cx,H+.55,cz,GOLD,{a0,a1,open:true});
  if(o.finial){pt.s.lathe([[.1,0],[.17,.22],[.04,.5],[.025,1.9]],6,cx,H+.5+h,cz,GOLD);pt.s.lathe([[.02,0],[.11,.1],[.02,.2]],6,cx,H+.5+h+.7,cz,GOLD);
   const fy=H+.5+h+1.25,fc=o.flag??0xb3262d;pt.s.q([cx,fy,cz],[cx+.9,fy+.2,cz+.1],[cx+.9,fy+.2,cz+.1],[cx,fy+.5,cz],fc);}}
 return pt;}
const twin=(pt,cx,cz,r,a,y,lit=true,w=.5,h=1.1)=>{const x=cx+Math.cos(a)*(r+.03),z=cz+Math.sin(a)*(r+.03),ry=Math.PI/2-a;pt.s.box(x,y,z,w+.22,h+.26,.08,0xece4d2,ry);
 pt[lit?'g':'w'].box(cx+Math.cos(a)*(r+.08),y-.04,cz+Math.sin(a)*(r+.08),w,h,.04,lit?0xffe1a0:0x53687a,ry);pt.s.box(cx+Math.cos(a)*(r+.1),y+h/2+.16,cz+Math.sin(a)*(r+.1),w+.3,.12,.1,0xd9cfba,ry);};
function castle(){
 const r=rng(424242),root=new T.Group(),shellG=new T.Group(),frontG=new T.Group(),cutG=new T.Group(),sh=part(),fr=part(),ct=part();
 const ST=0xcfc9bb,KST=0xebe3d0,TB=1.6,CZ=2,KX=7,KZ0=-8,WT=.9;                      // terrace top, cut plane, keep half width, keep back, wall thickness
 const LV=[{y:TB,h:5.0},{y:7.0,h:3.8},{y:11.2,h:3.8},{y:15.4,h:3.8}],KT=19.6;
 // --- terrace, lawns, path, moat hint
 sh.s.box(0,TB/2,1.5,36,TB,28,0xb7b1a3);for(let k=1;k<3;k++)sh.s.box(0,TB*k/3,1.5,36.06,.05,28.06,0x9c968a);sh.s.box(0,.05,1.5,46,.1,38,0x6f9a8c);sh.s.box(0,TB+.03,1.5,28.6,.06,20.6,0x7fa45a);
 sh.s.box(0,TB+.05,8,3.6,.06,7,0xcbbfa6);for(let k=0;k<7;k++)sh.s.box(0,TB+.085,5+k,3.6,.01,.05,0xa99f8a);
 // --- curtain wall runs with wall-walk and merlons
 const run=(pt,x0,z0,x1,z1,h=6)=>{const L=Math.hypot(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,ry=Math.atan2(-(z1-z0),x1-x0),nx=Math.sin(ry),nz=Math.cos(ry),out=(Math.abs(cx)>Math.abs(cz-1.5)?Math.sign(cx)*nx:Math.sign(cz-1.5)*nz)>=0?1:-1;
  pt.s.box(cx,TB+h/2,cz,L,h,1.2,ST,ry);for(let k=1;k<h/1;k++)pt.s.box(cx,TB+k*1.0,cz,L+.02,.05,1.24,shade(ST,.82),ry);
  for(let k=0;k<L/2.2;k++){const u=-L/2+1.1+k*2.2,c=Math.cos(ry),s=Math.sin(ry);pt.s.box(cx+c*u,TB+h*.5+.3*((k*3)%4-1.5),cz-s*u,.9,.5,1.25,shade(ST,k%2?.92:1.05),ry);}
  pt.s.box(cx+nx*out*.42,TB+h+.45,cz+nz*out*.42,L,.9,.36,shade(ST,1.02),ry);const nm=Math.round(L/1.5);for(let i=0;i<nm;i++){const u=-L/2+(i+.5)*L/nm;pt.s.box(cx+Math.cos(ry)*u+nx*out*.42,TB+h+1.2,cz-Math.sin(ry)*u+nz*out*.42,.75,.6,.36,shade(ST,1.03),ry);}};
 run(sh,-15,-9.5,15,-9.5);run(sh,-15,-9.5,-15,12.5);run(sh,15,-9.5,15,12.5);run(fr,-15,12.5,-4,12.5);run(fr,4,12.5,15,12.5);
 for(const [x,z,pt,i] of [[-15,-9.5,sh,1],[15,-9.5,sh,2],[-15,12.5,fr,3],[15,12.5,fr,4]]){tower(pt,x,z,2.6,TB-1.2,12.6,{roof:6.2,finial:true,seed:i,flag:i%2?0xb3262d:0x2b62b8});for(const [a,y] of [[.8,6],[2.4,9.5],[4,6.5],[5.4,9.8]])twin(pt,x,z,2.6,a+i,y,r()<.6,.4,1.0);}
 // --- gatehouse (street front only)
 { const g=fr,z=12.5;g.s.box(-2.9,TB+4.8,z,2.2,9.6,3.6,ST);g.s.box(2.9,TB+4.8,z,2.2,9.6,3.6,ST);g.s.box(0,TB+7.6,z,3.6,4.0,3.6,ST);g.s.box(0,TB+2.8,z-.6,3.6,5.6,.3,0x2a2622);
  for(let k=0;k<=8;k++){const a=Math.PI*k/8;g.s.box(Math.cos(a)*2.0,TB+4.9+Math.sin(a)*1.0,z+1.82,.62,.5,.14,k%2?0xece4d2:0xd9cfba,0);}
  for(let k=-3;k<=3;k++)g.s.box(k*.5,TB+3.6,z+1.2,.07,3.4,.07,0x3a3a3e);for(let k=0;k<4;k++)g.s.box(0,TB+2.2+k*.9,z+1.2,3.4,.07,.07,0x3a3a3e);
  g.s.box(0,TB+10.05,z+1.5,8.2,.9,.5,shade(ST,1.02));for(let i=0;i<6;i++)g.s.box(-3.6+i*1.44,TB+10.8,z+1.5,.8,.6,.5,shade(ST,1.03));
  g.s.box(0,TB+7.7,z+1.84,1.7,2.0,.1,0xb3262d);g.s.box(0,TB+7.7,z+1.9,1.2,1.5,.06,GOLD);g.s.box(0,TB+7.7,z+1.94,.3,1.3,.05,0xb3262d);g.s.box(0,TB+7.9,z+1.94,1.0,.3,.05,0xb3262d);
  for(const s of [-1,1]){tower(g,s*4.3,z+1.2,1.35,TB-1.2,12.4,{roof:4.6,finial:true,seed:6+s,flag:0xd9b24a});twin(g,s*4.3,z+1.2,1.35,Math.PI/2,TB+6.2,true,.36,1.0);twin(g,s*4.3,z+1.2,1.35,Math.PI/2,TB+9.2,false,.36,.9);
   g.s.box(s*2.9,TB+6.6,z+1.84,.9,2.6,.06,s>0?0x2b62b8:0xb3262d);g.s.q([s*2.9-.45,TB+5.3,z+1.87],[s*2.9+.45,TB+5.3,z+1.87],[s*2.9,TB+4.7,z+1.87],[s*2.9,TB+4.7,z+1.87],s>0?0x2b62b8:0xb3262d);}
  g.s.box(0,TB-.3,z+5.4,4.4,.5,7.6,0x8a6a45);for(const s of [-1,1]){g.s.box(s*2.3,TB+.35,z+5.4,.2,.9,7.6,0x6b4e38);for(let k=0;k<5;k++)g.s.box(s*2.3,TB+.9,z+2.2+k*1.6,.26,.3,.26,0x5b4130);}
  for(const s of [-1,1])for(const dz of [3,8]){g.s.box(s*2.3,TB-.9,z+dz,.5,1.4,.5,0xa9a294);} }
 // --- keep: three standing walls, floors, partitions; the street wall goes with the removable front
 const KW=2*KX,KD=CZ-KZ0,kzm=(CZ+KZ0)/2;
 const wallBands=(pt,cx,cz,w,d)=>{for(const L of LV.slice(1))pt.s.box(cx,L.y-.2,cz,w+.16,.22,d+.16,shade(KST,.9));for(let y=TB+.9;y<KT;y+=.9)pt.s.box(cx,y,cz,w+.03,.035,d+.03,shade(KST,.88));};
 sh.s.box(0,(TB+KT)/2,KZ0+WT/2,KW,KT-TB,WT,KST);wallBands(sh,0,KZ0+WT/2,KW,WT);for(const s of [-1,1]){sh.s.box(s*(KX-WT/2),(TB+KT)/2,kzm,WT,KT-TB,KD,KST);wallBands(sh,s*(KX-WT/2),kzm,WT,KD);}
 fr.s.box(0,(TB+KT)/2,CZ-WT/2,KW,KT-TB,WT,KST);wallBands(fr,0,CZ-WT/2,KW,WT);
 for(const s of [-1,1])for(const pt of [sh])for(const z of [KZ0+.5]){pt.s.box(s*(KX-.2),TB+6,z,1.3,12,1.3,shade(KST,.96));pt.s.box(s*(KX-.2),TB+12.4,z,1.0,.8,1.0,shade(KST,.9));}
 sh.s.box(0,KT+.2,kzm,KW+.9,.4,KD+.9,shade(KST,.93));for(let i=0;i<19;i++)for(const [pt,z] of [[sh,KZ0-.3],[fr,CZ+.3]])pt.s.box(-KX+.4+i*(KW-.8)/18,KT-.25,z,.34,.5,.34,shade(KST,.86));
 LV.forEach((L,i)=>{if(i){sh.s.box(0,L.y-.2,kzm,KW-2*WT,.4,KD-2*WT,0xa78a66);ct.s.box(0,L.y-.2,CZ-.06,KW,.4,.12,CUT);}});
 ct.s.box(0,TB-.08,CZ-.06,KW,.16,.12,CUT);ct.s.box(0,KT+.2,CZ-.06,KW+.9,.4,.12,CUT);for(const s of [-1,1])ct.s.box(s*(KX-WT/2),(TB+KT)/2,CZ-.06,WT,KT-TB,.12,CUT);
 // roof: steep hipped slate with gold cresting; front slope and gable are removable
 const RY=KT+.4,RH=7.2,RX=KX+.5,RZ0=KZ0-.5,RZ1=CZ+.5,rz=(RZ0+RZ1)/2,rl=3.2,slate=(pt,a,b,c,d)=>{const K=8;for(let k=0;k<K;k++){const u=k/K,v=(k+1)/K,m=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];pt.s.q(m(a,d,u),m(b,c,u),m(b,c,v),m(a,d,v),k%2?ROOF:shade(ROOF,.86));}};
 slate(sh,[RX,RY,RZ0],[-RX,RY,RZ0],[-rl,RY+RH,rz],[rl,RY+RH,rz]);slate(sh,[-RX,RY,RZ0],[-RX,RY,RZ1],[-rl,RY+RH,rz],[-rl,RY+RH,rz]);slate(sh,[RX,RY,RZ1],[RX,RY,RZ0],[rl,RY+RH,rz],[rl,RY+RH,rz]);
 slate(fr,[-RX,RY,RZ1],[RX,RY,RZ1],[rl,RY+RH,rz],[-rl,RY+RH,rz]);sh.s.box(0,RY+RH+.08,rz,2*rl+.3,.16,.2,GOLD);for(let k=0;k<9;k++)sh.s.lathe([[.07,0],[.02,.5]],4,-rl+k*rl/4,RY+RH+.1,rz,GOLD,{flat:true});
 for(const s of [-1,1]){ct.s.beam([s*RX,RY,CZ+.02],[s*rl,RY+RH,rz+.2],.18,CUT);}
 // front gable with rose window, tall lit windows, balcony, great door and steps
 { const z=CZ+.02,g=fr;g.s.q([-3.2,KT,z+.5],[3.2,KT,z+.5],[0,KT+6.4,z+.5],[0,KT+6.4,z+.5],KST);g.s.q([-3.2,KT,z+.5],[-3.2,KT,z-2],[0,KT+6.4,z-2],[0,KT+6.4,z+.5],shade(ROOF,.9));g.s.q([3.2,KT,z-2],[3.2,KT,z+.5],[0,KT+6.4,z+.5],[0,KT+6.4,z-2],shade(ROOF,.9));
  for(const s of [-1,1])g.s.beam([s*3.3,KT,z+.56],[0,KT+6.5,z+.56],.22,GOLD);g.s.lathe([[.1,0],[.16,.22],[.03,.5],[.02,1.5]],6,0,KT+6.4,z+.4,GOLD);
  g.g.lathe([[0,0],[.95,0]],16,0,0,0,0xffe1a0,{open:true});                                  // placeholder ring replaced just below
  const P=g.g.p,st=P.length-16*4*3;for(let i=st;i<P.length;i+=3){const x=P[i],zz=P[i+2];P[i]=x;P[i+1]=KT+2.6+zz;P[i+2]=z+.56;}
  for(let k=0;k<8;k++){const a=k*TAU/8;g.s.beam([0,KT+2.6,z+.6],[Math.cos(a)*.95,KT+2.6+Math.sin(a)*.95,z+.6],.07,KST);}g.s.lathe([[1.0,0],[1.14,0],[1.14,.12],[1.0,.12]],16,0,0,0,0xece4d2,{open:true});
  { const Q=g.s.p,n=16*3*4*3,s0=Q.length-n;for(let i=s0;i<Q.length;i+=3){const x=Q[i],y=Q[i+1],zz=Q[i+2];Q[i]=x;Q[i+1]=KT+2.6+zz;Q[i+2]=z+.5+y;} }
  const win=(x,y,h,w=.9,lit=true)=>{g.s.box(x,y,z,w+.3,h+.3,.1,0xece4d2);g[lit?'g':'w'].box(x,y-.03,z+.05,w,h,.05,lit?0xffe1a0:0x53687a);g.s.box(x,y,z+.08,.06,h,.05,0xece4d2);g.s.box(x,y+h*.18,z+.08,w,.05,.05,0xece4d2);
   for(let k=0;k<=6;k++){const a=Math.PI*k/6;g.s.box(x+Math.cos(a)*(w/2+.06),y+h/2+.1+Math.sin(a)*.3,z+.04,.2,.18,.1,0xd9cfba);}};
  for(const x of [-4.6,-2.3,2.3,4.6]){win(x,LV[1].y+1.9,2.2);win(x,LV[3].y+1.8,2.0,.8,r()<.7);}for(const x of [-4.6,4.6])win(x,LV[2].y+1.9,2.2);win(-2.3,LV[2].y+1.9,2.2,.9,false);win(2.3,LV[2].y+1.9,2.2);
  g.s.box(0,LV[2].y+1.6,z,1.7,3.0,.1,0xece4d2);g.g.box(0,LV[2].y+1.5,z+.05,1.3,2.6,.05,0xffe9bd);g.s.box(0,LV[2].y-.05,z+.75,6.4,.3,1.5,0xd9cfba);for(let k=0;k<4;k++)g.s.box(-2.4+k*1.6,LV[2].y-.5,z+.5,.4,.6,.9,shade(KST,.88));
  for(let k=0;k<=20;k++)g.s.lathe([[.09,0],[.13,.3],[.07,.62],[.11,.8]],6,-3.1+k*.31,LV[2].y+.1,z+1.42,0xece4d2);g.s.box(0,LV[2].y+.95,z+1.42,6.5,.12,.2,0xece4d2);
  g.s.box(0,TB+2.3,z,3.2,4.6,.14,0xd9cfba);g.s.box(0,TB+2.1,z+.06,2.4,4.2,.1,0x5b3d26);g.s.box(0,TB+2.1,z+.12,.06,4.2,.06,0x2c1f16);for(const s of [-1,1]){for(let k=0;k<3;k++)g.s.box(s*.6,TB+.9+k*1.3,z+.12,1.0,.1,.05,0x2a2a2e);g.s.lathe([[.05,0],[.09,.06],[.05,.12]],6,s*.18,TB+2.0,z+.16,GOLD);}
  for(let k=0;k<=8;k++){const a=Math.PI*k/8;g.s.box(Math.cos(a)*1.6,TB+4.4+Math.sin(a)*.5,z+.1,.46,.4,.14,k%2?0xece4d2:0xd9cfba);}
  for(let k=0;k<4;k++)g.s.box(0,TB+.1-k*.0,z+.8+k*.5,4.4-k*.0,.2,.5,0xbfb8a8);for(const x of [-2.3,2.3])win(x,TB+2.6,2.4,.9,true);
  for(const s of [-1,1]){tower(g,s*KX,CZ,.95,LV[3].y-.6,KT+1.2,{roof:3.4,finial:true,seed:9+s,a0:0,a1:Math.PI});tower(sh,s*KX,CZ,.95,LV[3].y-.6,KT+1.2,{roof:3.4,seed:9+s,a0:Math.PI,a1:TAU});g.s.lathe([[.05,0],[.95,1.2]],10,s*KX,LV[3].y-1.8,CZ,shade(KST,.9),{a0:0,a1:Math.PI,open:true});} }
 // side and back lit windows on the standing walls
 for(const L of LV.slice(1))for(const s of [-1,1])for(const z of [-5.4,-1.6]){sh.s.box(s*(KX+.02),L.y+1.9,z,.1,2.4,1.1,0xece4d2);sh[r()<.6?'g':'w'].box(s*(KX+.06),L.y+1.85,z,.05,2.1,.8,r()<.6?0xffe1a0:0x53687a);}
 // --- the two great towers on the cut line and the star spire on the roof
 const TW=[{x:-KX-1.5,r:2.5,H:25.4,roof:7.4,seed:21,flag:0x2b62b8},{x:KX+1.3,r:2.2,H:22.2,roof:6.4,seed:22,flag:0xb3262d}];
 for(const t of TW){tower(sh,t.x,CZ,t.r,TB-1.2,t.H,{roof:t.roof,seed:t.seed,a0:Math.PI,a1:TAU});tower(fr,t.x,CZ,t.r,TB-1.2,t.H,{roof:t.roof,finial:true,seed:t.seed,flag:t.flag,a0:0,a1:Math.PI});
  sh.s.lathe([[t.r-.5,0],[t.r-.5,t.H-TB]],10,t.x,TB,CZ,0xe6dac2,{a0:Math.PI,a1:TAU,open:true});
  for(const s of [-1,1]){ct.s.box(t.x+s*(t.r-.25),(TB+t.H+.75)/2,CZ-.02,.5,t.H+.75-TB,.12,CUT);ct.s.beam([t.x+s*(t.r+.62),t.H+.6,CZ+.02],[t.x,t.H+.6+t.roof,CZ+.02],.16,CUT);}
  for(const [a,y] of [[1.0,6],[2.1,10],[1.3,14],[1.9,18],[1.57,t.H-2.2]])twin(fr,t.x,CZ,t.r,a,y,r()<.75);for(const [a,y] of [[4.2,8],[5.2,13],[4.7,18]])twin(sh,t.x,CZ,t.r,a,y,r()<.5);}
 const SP={x:0,z:-3.4,r:1.9,y0:KT+2.2,H:31.6,roof:9.6};
 tower(sh,SP.x,SP.z,SP.r,SP.y0,SP.H,{roof:SP.roof,seed:31,a0:Math.PI,a1:TAU});tower(fr,SP.x,SP.z,SP.r,SP.y0,SP.H,{roof:SP.roof,finial:true,seed:31,flag:GOLD,a0:0,a1:Math.PI});
 sh.s.lathe([[SP.r-.4,0],[SP.r-.4,SP.H-SP.y0]],10,SP.x,SP.y0,SP.z,0xe6dac2,{a0:Math.PI,a1:TAU,open:true});for(const [a,y] of [[.9,25],[2.2,25],[1.57,29]])twin(fr,SP.x,SP.z,SP.r,a,y,true,.4,1.2);
 for(const s of [-1,1]){ct.s.box(SP.x+s*(SP.r-.2),(SP.y0+3+SP.H+.75)/2,SP.z-.02,.4,SP.H+.75-SP.y0-3,.12,CUT);ct.s.beam([SP.x+s*(SP.r+.62),SP.H+.6,SP.z+.02],[SP.x,SP.H+.6+SP.roof,SP.z+.02],.14,CUT);}
 // courtyard life: fountain, blossom trees, banners
 sh.s.lathe([[1.5,0],[1.6,.4],[1.35,.45],[1.3,.2]],14,-9.5,TB,7,0xd9cfba);sh.w.lathe([[0,.3],[1.3,.3]],14,-9.5,TB,7,0x6fb0c4,{open:true});sh.s.lathe([[.2,.2],[.12,1.2],[.5,1.3],[.1,1.5]],8,-9.5,TB,7,0xd9cfba);
 for(const [x,z,c] of [[9.5,7.5,0xf2a9c0],[11.2,3.2,0xf7bfd0],[-11,-2,0x6fb558],[10.8,-5,0x6fb558]]){sh.s.lathe([[.18,0],[.1,1.6]],6,x,TB,z,0x6a4a33,{flat:true});for(let k=0;k<4;k++){const a=k*1.7,R=1.0+.3*r();sh.s.lathe([[R*.2,-R*.8],[R*.9,-R*.3],[R,.2*R],[R*.6,R*.7],[R*.1,R]],6,x+Math.cos(a)*.6*(k?1:0),TB+2.2+.3*k,z+Math.sin(a)*.6*(k?1:0),(i,j)=>(i+j)%2?c:shade(c,.9),{flat:true,rot:a});}}
 // --- interiors
 const levels=[],zb=KZ0+WT+.03,xi=KX-WT,flo=(pt,L,col,x0=-xi,x1=xi)=>{pt.s.box((x0+x1)/2,L.y+.02,(zb+CZ)/2,x1-x0,.04,CZ-zb-.1,col);};
 const hang=(pt,x,y,z,w,h,col,ry=0)=>{F.put(pt,x,y,z,ry,0,0,0,w,h,.05,col);F.put(pt,x,y,z,ry,0,0,.02,w*.5,h*.5,.04,GOLD);F.put(pt,x,y,z,ry,0,h/2+.06,0,w+.3,.07,.07,0x5b4130);};
 const armor=(pt,x,y,z)=>{pt.s.lathe([[.22,0],[.16,.1],[.14,.8],[.26,.9],[.24,1.45],[.1,1.5]],8,x,y,z,0xaab2ba);pt.s.lathe([[.02,0],[.15,.1],[.16,.24],[.04,.34]],8,x,y+1.5,z,0xc3cad1);pt.s.box(x+.3,y+1.1,z+.05,.04,2.2,.04,0x6b4e38);};
 const stair=(pt,x,y,z,up,ry=0,w=1.2)=>{const n=Math.round(up/.2),run=.3;for(let k=0;k<n;k++)F.put(pt,x,y,z,ry,0,(k+.5)*up/n,-k*run,w,up/n,run+.02,k%2?0xb8ad98:0xa79c88);for(const s of [-1,1])for(let k=0;k<n;k+=3)F.put(pt,x,y,z,ry,s*w/2,(k+.5)*up/n+.5,-k*run,.05,.9,.05,0x4a3326);};
 { const g=new T.Group(),pt=part(),L=LV[0];flo(pt,L,0xb9b1a0);for(let i=0;i<12;i++)for(let j=0;j<8;j++)if((i+j)%2)pt.s.box(-xi+.5+i*(2*xi-1)/11,L.y+.045,zb+.6+j*1.1,1.0,.01,1.0,0xa39a88);
  pt.s.box(0,L.y+L.h/2,zb,2*xi,L.h,.04,0xd9cfba);F.put(pt,0,L.y,zb+.3,0,0,1.3,0,3.2,2.6,.6,0xb7ad9a);F.put(pt,0,L.y,zb+.5,0,0,.9,.1,1.8,1.6,.3,0x1d1a18);F.put(pt,0,L.y,zb+.6,0,0,.5,.1,1.3,.6,.2,0xff9a3c,'g');F.put(pt,0,L.y,zb+.3,0,0,2.75,.05,3.6,.3,.8,0xa39a88);
  hang(pt,-4.4,L.y+3.2,zb+.08,1.4,2.6,0xb3262d);hang(pt,4.4,L.y+3.2,zb+.08,1.4,2.6,0x2b62b8);hang(pt,-2.4,L.y+3.4,zb+.08,.9,2.0,0x2b62b8);hang(pt,2.4,L.y+3.4,zb+.08,.9,2.0,0xb3262d);
  F.rug(pt,0,L.y+.05,-2.2,2.2,7.4,0x8a1f24);F.table(pt,-2.6,L.y,-2.6,1.1,5.2,0,0x5c3d28,.8);F.table(pt,2.6,L.y,-2.6,1.1,5.2,0,0x5c3d28,.8);for(const sx of [-2.6,2.6])for(const s of [-1,1]){F.put(pt,sx+s*.85,L.y,-2.6,0,0,.24,0,.34,.48,5.0,0x6b4e38);for(let k=0;k<5;k++){pt.s.lathe([[.1,0],[.1,.02]],8,sx+s*.25,L.y+.84,-4.6+k*1.0,0xd9d2c4);pt.s.lathe([[.04,0],[.05,.12]],6,sx,L.y+.84,-4.4+k*1.0,GOLD);}}
  F.put(pt,0,L.y,zb+2.6,0,0,.2,0,3.0,.4,1.6,0x8a1f24);F.put(pt,0,L.y,zb+2.3,0,0,1.2,0,.9,1.6,.2,0x6b1a1e);F.put(pt,0,L.y,zb+2.5,0,0,.72,0,.9,.14,.7,0x8a1f24);F.put(pt,0,L.y,zb+2.3,0,0,2.1,0,.5,.24,.22,GOLD);
  for(const s of [-1,1]){armor(pt,s*5.6,L.y,zb+.6);armor(pt,s*5.6,L.y,-1.0);F.barrel(pt,s*5.5,L.y,.9);pt.s.box(s*(xi-.06),L.y+2.6,-3,.06,.5,.5,0x3a3a3e);pt.g.lathe([[.06,0],[.12,.2],[.02,.45]],6,s*(xi-.25),L.y+2.8,-3,0xffb347);}
  pt.s.lathe([[1.5,0],[1.56,.08],[1.5,.16]],16,0,L.y+3.9,-2.4,0x2a2a2e,{open:true});for(let k=0;k<12;k++){const a=k*TAU/12;pt.g.box(Math.cos(a)*1.5,L.y+4.14,-2.4+Math.sin(a)*1.5,.07,.2,.07,0xfff0c4);}for(let k=0;k<3;k++){const a=k*TAU/3;pt.s.beam([Math.cos(a)*1.5,L.y+4.0,-2.4+Math.sin(a)*1.5],[0,L.y+L.h,-2.4],.04,0x2a2a2e);}
  flush(g,pt,'castle 1F');levels.push({group:g,name:'1F 騎士大廳',y:L.y,h:L.h,rooms:[{name:'騎士大廳與壁爐',pos:[0,L.y+1.7,.8],look:[0,L.y+1.8,-7]},{name:'長桌宴席',pos:[-4.6,L.y+1.7,.6],look:[-2,L.y+1.2,-5]}]}); }
 { const g=new T.Group(),pt=part(),L=LV[1];flo(pt,L,0x8a6a4a);pt.s.box(0,L.y+L.h/2,zb,2*xi,L.h,.04,0xe6dac2);pt.s.box(0,L.y+L.h/2,(zb+CZ)/2-1.6,.3,L.h,CZ-zb-3.3,0xd9cfba);ct.s.box(0,L.y+L.h/2,CZ-.06,.3,L.h,.12,CUT);
  for(let k=0;k<6;k++){pt.s.box(-5.6+k*.5,L.y+1.5,zb+.2,.05,2.8,.05,0x6b4e38);pt.s.lathe([[.06,0],[.01,.4]],4,-5.6+k*.5,L.y+2.9,zb+.2,0xc3cad1,{flat:true});}F.put(pt,-4.4,L.y,zb+.25,0,0,.5,0,3.4,.1,.3,0x4a3326);
  for(const [x,c] of [[-2.2,0xb3262d],[-1.2,0x2b62b8]]){pt.s.lathe([[0,0],[.45,.0]],10,0,0,0,c,{open:true});const Q=pt.s.p,s0=Q.length-10*4*3;for(let i=s0;i<Q.length;i+=3){const xx=Q[i],zz=Q[i+2];Q[i]=x+xx;Q[i+1]=L.y+2.2+zz;Q[i+2]=zb+.08;}pt.s.box(x,L.y+2.2,zb+.1,.12,.5,.03,GOLD);}
  armor(pt,-6.0,L.y,-1.6);armor(pt,-6.0,L.y,-3.4);F.table(pt,-3.2,L.y,-2.4,2.2,1.0,0,0x5c3d28);for(let k=0;k<4;k++)pt.s.box(-4.0+k*.5,L.y+.8,-2.4,.08,.06,.9,0xc3cad1);F.crate(pt,-1.0,L.y,.6,.7);F.crate(pt,-1.7,L.y,.9,.5);
  for(let k=0;k<3;k++)F.shelf(pt,1.3+k*1.9,L.y,zb+.25,1.7,3.0,0,r);F.shelf(pt,xi-.25,L.y,-2.6,2.4,3.0,-Math.PI/2,r);F.table(pt,3.0,L.y,-2.2,1.9,.9,0,0x4e3524);F.chair(pt,3.0,L.y,-1.4,Math.PI,0x7a2e2a);F.tlamp(pt,3.6,L.y+.78,-2.2);F.rug(pt,3.2,L.y+.05,-1.6,3.4,3.0,0x2f4a3a);
  pt.s.lathe([[.3,0],[.3,.02],[.05,.1],[.05,.6]],8,5.2,L.y,.4,0x3d2c22);pt.s.lathe([[.02,0],[.28,.2],[.32,.36],[.2,.54],[.02,.62]],10,5.2,L.y+.64,.4,(k,j)=>j%3?0x3d6e8a:0x6f9a5a);
  flush(g,pt,'castle 2F');levels.push({group:g,name:'2F 兵器庫與圖書室',y:L.y,h:L.h,rooms:[{name:'圖書室',pos:[3.4,L.y+1.7,.8],look:[3.4,L.y+1.4,-7]},{name:'兵器庫',pos:[-3.4,L.y+1.7,.8],look:[-3.8,L.y+1.4,-7]}]}); }
 { const g=new T.Group(),pt=part(),L=LV[2];flo(pt,L,0x8a6a4a);pt.s.box(0,L.y+L.h/2,zb,2*xi,L.h,.04,0xe9dcc8);pt.s.box(.6,L.y+L.h/2,(zb+CZ)/2-1.6,.3,L.h,CZ-zb-3.3,0xd9cfba);ct.s.box(.6,L.y+L.h/2,CZ-.06,.3,L.h,.12,CUT);
  F.bed(pt,-3.2,L.y,zb+1.2,0,2.1,0xf2efe8);for(const [dx,dz] of [[-1.1,-.95],[1.1,-.95],[-1.1,.95],[1.1,.95]])pt.s.box(-3.2+dx,L.y+1.4,zb+1.2+dz,.09,2.8,.09,0x4a3326);pt.s.box(-3.2,L.y+2.85,zb+1.2,2.5,.14,2.2,0x8a1f24);for(const s of [-1,1])pt.s.box(-3.2+s*1.2,L.y+2.3,zb+1.2,.05,1.0,2.1,0xb3262d);
  F.fire(pt,-xi+.2,L.y,-1.8,Math.PI/2);F.rug(pt,-3.0,L.y+.05,-1.2,3.0,2.4,0x2b3f78);F.put(pt,-5.6,L.y,.6,Math.PI/2,0,1.1,0,1.6,2.2,.6,0x5b4130);F.chair(pt,-1.2,L.y,.4,-2.3,0x8a1f24);F.tlamp(pt,-1.5,L.y+.56,zb+.4);pt.s.box(-1.5,L.y+.28,zb+.4,.5,.56,.4,0x5b4130);
  pt.s.lathe([[1.5,.76],[1.5,.84]],14,3.6,L.y,-2.6,0x5c3d28);pt.s.lathe([[.3,0],[.12,.1],[.12,.76]],8,3.6,L.y,-2.6,0x4a3326);for(let k=0;k<8;k++){const a=k*TAU/8;F.chair(pt,3.6+Math.cos(a)*2.0,L.y,-2.6+Math.sin(a)*2.0,Math.PI/2-a+Math.PI,0x8a1f24);}
  pt.s.box(3.6,L.y+.86,-2.6,1.2,.02,.9,0xe9dcc0);pt.g.box(3.6,L.y+.95,-2.6,.06,.16,.06,0xfff0c4);hang(pt,3.6,L.y+2.2,zb+.08,2.6,1.8,0x2b62b8);F.chand(pt,3.6,L.y+L.h-1.1,-2.6,.8);
  flush(g,pt,'castle 3F');levels.push({group:g,name:'3F 國王寢殿與議事廳',y:L.y,h:L.h,rooms:[{name:'國王寢殿',pos:[-3.2,L.y+1.7,.8],look:[-3.4,L.y+1.3,-7]},{name:'圓桌議事廳',pos:[3.6,L.y+1.7,.9],look:[3.6,L.y+1.2,-6]}]}); }
 { const g=new T.Group(),pt=part(),L=LV[3];flo(pt,L,0x9a7650);pt.s.box(0,L.y+L.h/2,zb,2*xi,L.h,.04,0xf1e3d6);pt.s.box(-.4,L.y+L.h/2,(zb+CZ)/2-1.6,.3,L.h,CZ-zb-3.3,0xd9cfba);ct.s.box(-.4,L.y+L.h/2,CZ-.06,.3,L.h,.12,CUT);
  F.bed(pt,-3.6,L.y,zb+1.2,0,1.6,0xf7d9e3);pt.s.box(-3.6,L.y+2.5,zb+.6,1.9,.1,1.0,0xf2a9c0);for(const s of [-1,1])pt.s.box(-3.6+s*.9,L.y+1.7,zb+.6,.04,1.5,.9,0xf7bfd0);F.table(pt,-5.6,L.y,-.8,.6,1.2,0,0xe9dcc8);F.put(pt,-5.95,L.y,-.8,Math.PI/2,0,1.5,0,.8,1.0,.05,0xb9cbd6,'w');F.chair(pt,-4.9,L.y,-.8,-Math.PI/2,0xf2a9c0);
  F.rug(pt,-3.4,L.y+.05,-1.2,3.2,2.6,0xe7a6bb);F.plant(pt,-1.4,L.y,.9,1.3);F.shelf(pt,-1.2,L.y,zb+.25,1.4,2.2,0,r);pt.s.beam([-2.2,L.y,.6],[-2.2,L.y+1.9,.3],.06,GOLD);pt.s.beam([-2.2,L.y+1.9,.3],[-1.5,L.y+.3,.8],.05,GOLD);for(let k=0;k<6;k++)pt.s.beam([-2.15+k*.1,L.y+1.7-k*.22,.36+k*.07],[-2.15+k*.1,L.y+.15,.62+k*.03],.012,0xf3f0e8);
  pt.s.box(3.3,L.y+.5,zb+.6,1.8,1.0,.8,0xe9dcc8);pt.s.box(3.3,L.y+1.04,zb+.6,2.0,.08,.9,0xffffff);for(const s of [-1,1]){pt.s.lathe([[.08,0],[.03,.05],[.03,.5]],6,3.3+s*.6,L.y+1.08,zb+.6,GOLD);pt.g.box(3.3+s*.6,L.y+1.66,zb+.6,.05,.14,.05,0xfff0c4);}
  for(let k=0;k<3;k++){const c=[0x2b62b8,0xb3262d,0xe0a63c][k];pt.g.box(2.3+k*1.0,L.y+2.4,zb+.07,.7,1.9,.04,c);pt.g.box(2.3+k*1.0,L.y+2.9,zb+.09,.34,.5,.03,[0xffe1a0,0xffe1a0,0x6fb0c4][k]);pt.s.box(2.3+k*1.0,L.y+2.4,zb+.1,.05,1.9,.03,0x2a2a2e);pt.s.box(2.3+k*1.0,L.y+2.4,zb+.1,.7,.05,.03,0x2a2a2e);}
  for(let k=0;k<3;k++)for(const s of [-1,1])F.put(pt,3.3+s*1.2,L.y,-2.0+k*1.1,0,0,.25,0,1.6,.5,.45,0x6b4e38);F.rug(pt,3.3,L.y+.05,-1.4,1.0,4.6,0x8a1f24);
  flush(g,pt,'castle 4F');levels.push({group:g,name:'4F 公主房與禮拜堂',y:L.y,h:L.h,rooms:[{name:'公主房',pos:[-3.4,L.y+1.7,.8],look:[-3.6,L.y+1.3,-7]},{name:'禮拜堂',pos:[3.3,L.y+1.7,.9],look:[3.3,L.y+1.8,-7]}]}); }
 { // towers: spiral stair on the left, stacked round rooms on the right, star room in the spire
  const g=new T.Group(),pt=part(),A=TW[0],B=TW[1];pt.s.lathe([[.32,0],[.32,A.H-TB-1]],8,A.x,TB,CZ,0xb7ad9a);const ns=Math.round((A.H-TB-2.4)/.21);for(let k=0;k<ns;k++){const a=k*TAU/15,rr=(A.r-.5+.32)/2;pt.s.box(A.x+Math.cos(a)*rr,TB+.2+k*.21,CZ+Math.sin(a)*rr,A.r-.9,.1,.62,k%2?0xb8ad98:0xa79c88,-a);}
  pt.s.lathe([[0,0],[A.r-.5,0]],12,A.x,A.H-2.1,CZ,0xa78a66,{open:true});F.barrel(pt,A.x-.9,A.H-2.1,CZ-.9,.3,.7);pt.s.lathe([[.5,0],[.56,.5],[.2,.9],[.5,1.0],[.3,1.5]],8,A.x+.5,A.H-2.1,CZ-.8,0xc9a24a);
  const fy=[TB,LV[1].y,LV[2].y,LV[3].y];fy.forEach((y,i)=>{if(i)pt.s.lathe([[0,0],[B.r-.5,0],[B.r-.5,-.3]],12,B.x,y,CZ,0xa78a66,{open:true});if(i)ct.s.box(B.x,y-.15,CZ-.02,2*B.r-.9,.3,.12,CUT);});
  F.barrel(pt,B.x-.7,TB,CZ-.9);F.barrel(pt,B.x+.3,TB,CZ-1.2);F.barrel(pt,B.x+.9,TB,CZ-.5,.3,.7);F.crate(pt,B.x-.2,TB,CZ-.3,.5);
  for(const [dx,dz] of [[-.6,-.9],[.5,-1.0],[0,-.3]]){pt.s.box(B.x+dx,fy[1]+.25,CZ+dz,.7,.5,.5,0x6b4e38);pt.s.box(B.x+dx,fy[1]+.56,CZ+dz,.72,.14,.52,0x4a3326);pt.g.box(B.x+dx,fy[1]+.5,CZ+dz+.2,.6,.12,.2,0xffd76a);}
  for(let k=0;k<14;k++)pt.g.lathe([[.07,0],[.07,.03]],6,B.x-.9+r()*1.8,fy[1]+.02,CZ-1.3+r()*1.3,0xffd76a);
  F.table(pt,B.x,fy[2],CZ-.9,1.2,.7,0,0x5c3d28);F.tlamp(pt,B.x+.4,fy[2]+.78,CZ-.9);F.chair(pt,B.x,fy[2],CZ-.3,Math.PI,0x7a2e2a);F.shelf(pt,B.x-.1,fy[2],CZ-1.55,1.4,2.2,0,r);
  F.bed(pt,B.x,fy[3],CZ-.95,Math.PI/2,1.0,0xe9eef2);armor(pt,B.x+1.2,fy[3],CZ-.4);
  const sy=24.4;pt.s.lathe([[0,0],[SP.r-.4,0],[SP.r-.4,-.3]],12,SP.x,sy,SP.z,0xa78a66,{open:true});ct.s.box(SP.x,sy-.15,SP.z-.02,2*SP.r-.7,.3,.12,CUT);pt.s.lathe([[.3,0],[.06,.1],[.06,1.1]],6,SP.x-.3,sy,SP.z-.7,0x4a3326);pt.s.beam([SP.x-.9,sy+.9,SP.z-1.1],[SP.x+.5,sy+1.7,SP.z-.1],.2,0xc9a24a);
  for(let k=0;k<26;k++){const a=Math.PI+r()*Math.PI,yy=sy+1.2+r()*5.4;pt.g.box(SP.x+Math.cos(a)*(SP.r-.46),yy,SP.z+Math.sin(a)*(SP.r-.46),.07,.07,.03,0xfff4c4,Math.PI/2-a);}pt.s.lathe([[SP.r-.42,1.0],[SP.r-.42,7.0]],10,SP.x,sy,SP.z,0x1f2a52,{a0:Math.PI,a1:TAU,open:true});
  flush(g,pt,'castle towers');levels.push({group:g,name:'塔 螺旋梯、藏寶室與觀星室',y:fy[1],h:3.8,rooms:[{name:'藏寶塔',pos:[5.8,fy[1]+1.7,.4],look:[9,fy[1]+1,1.2]},{name:'螺旋梯塔',pos:[-5.8,fy[1]+1.7,.4],look:[-9,fy[1]+2,1.4]}]}); }
 flush(shellG,sh,'castle shell');flush(frontG,fr,'castle front');flush(cutG,ct,'castle cut edge');root.add(shellG,frontG,cutG);levels.forEach(l=>root.add(l.group));
 return {id:'disney',title:'童話城堡（單棟外觀與剖面）',root,exterior:frontG,shell:shellG,cutOnly:cutG,levels,anims:[],bounds:{x:6.0,z:1.0,z0:-6.8},radius:40,height:42,az:.42,whole:true,hasDisneyJumps:true};
}

/* =====================================================================================
   3 · 清真寺（層疊圓頂＋六座宣禮塔＋拱廊前庭）：剖面沿禮拜大殿中線切開，看得到四根巨柱撐起主圓頂、
       半圓頂、側廊看台、米哈拉布與講壇、大吊燈環
   ===================================================================================== */
const LEAD=0x8793a0;
const domeP=(R,k=1,n=9)=>{const p=[];for(let i=0;i<=n;i++){const u=i/n*Math.PI/2;p.push([Math.max(.03,R*Math.cos(u)),R*k*Math.sin(u)]);}return p;};
function minaret(pt,x,z,H,o={}){const st=o.stone??0xe4dfd2,n=H>30?3:2,prof=[[1.25,0],[1.25,2.6],[.92,3.4]],seg=12;for(let i=1;i<=n;i++){const y=3.4+(H-10.4)*i/n;prof.push([.92-.07*i+.07,y-.5],[1.45,y-.1],[1.45,y+.55],[.92-.07*i,y+.6]);}prof.push([.92-.07*n,H-3.6]);
 pt.s.lathe(prof,seg,x,o.y0||0,z,(k,j)=>(k%4===2||k%4===3)&&k>2?shade(st,.9):(j+k)%5?st:shade(st,.96));pt.s.lathe([[.98-.07*n,0],[.5,1.8],[.05,3.6]],seg,x,(o.y0||0)+H-3.6,z,(k,j)=>k?LEAD:shade(LEAD,.86));
 pt.s.lathe([[.06,0],[.12,.2],[.03,.45],[.02,1.3]],6,x,(o.y0||0)+H-.1,z,GOLD);for(let i=1;i<=n;i++){const y=(o.y0||0)+3.4+(H-10.4)*i/n+.75;for(let k=0;k<10;k++){const a=k*TAU/10;pt.s.box(x+Math.cos(a)*1.42,y+.2,z+Math.sin(a)*1.42,.08,.5,.08,shade(st,.8),Math.PI/2-a);}pt.s.lathe([[1.44,.42],[1.44,.5]],seg,x,y,z,shade(st,.85),{open:true});}}
function mosque(){
 const r=rng(1616),root=new T.Group(),shellG=new T.Group(),frontG=new T.Group(),cutG=new T.Group(),sh=part(),fr=part(),ct=part();
 const ST=0xdcd6c8,ST2=shade(ST,.93),HW=14.5,WH=11,UW=8,UH=17,DR=7.7,DY=19.6,TB=.6,TILE=0x2f6f9a,PL=0xf0e9da;
 // terrace and steps
 sh.s.box(0,TB/2,8,HW*2+10,TB,HW*2+46,0xc9c2b2);sh.s.box(0,.05,8,HW*2+22,.1,HW*2+58,0x9aa58a);
 // arched window on a flat wall facing (nx,nz)
 const wwin=(pt,x,y,z,w,h,ry,lit)=>{const [fx,fz]=loc(x,z,ry,0,.06);pt.s.box(fx,y,fz,w+.3,h+.3,.1,shade(ST,1.05),ry);const [px,pz]=loc(x,z,ry,0,.1);pt[lit?'g':'w'].box(px,y-.05,pz,w,h,.05,lit?0xffe2a8:0x3f5f86,ry);
  pt[lit?'g':'w'].box(px,y+h/2+.12,pz,w*.66,.3,.05,lit?0xffe2a8:0x3f5f86,ry);pt.s.box(px,y,pz,.05,h,.07,shade(ST,1.05),ry);};
 const wall=(pt,x0,z0,x1,z1,y0,y1,th=.9,rows=[],out=1)=>{const L=Math.hypot(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,ry=Math.atan2(-(z1-z0),x1-x0);pt.s.box(cx,(y0+y1)/2,cz,L,y1-y0,th,ST,ry);
  for(let y=y0+1;y<y1;y+=1)pt.s.box(cx,y,cz,L+.02,.04,th+.03,shade(ST,.86),ry);pt.s.box(cx,y1+.12,cz,L+.3,.3,th+.3,ST2,ry);
  const nrm=ry+(out>0?0:Math.PI);for(const [yy,ww,hh] of rows){const n=Math.max(1,Math.floor(L/2.7));for(let i=0;i<n;i++){const u=-L/2+(i+.5)*L/n,[wx,wz]=loc(cx,cz,ry,u,out*th/2);wwin(pt,wx,yy,wz,ww,hh,nrm,r()<.62);}}};
 const R1=[[3.2,.9,2.2],[7.6,.9,2.0]],R2=[[14,1.0,2.4]];
 wall(sh,-HW,-HW,HW,-HW,TB,WH,.9,R1,-1);wall(sh,-HW,-HW,-HW,0,TB,WH,.9,R1,1);wall(sh,HW,-HW,HW,0,TB,WH,.9,R1,-1);
 wall(fr,-HW,0,-HW,HW,TB,WH,.9,R1,1);wall(fr,HW,0,HW,HW,TB,WH,.9,R1,-1);wall(fr,-HW,HW,-3,HW,TB,WH,.9,R1,1);wall(fr,3,HW,HW,HW,TB,WH,.9,R1,1);fr.s.box(0,WH-1.6,HW,6,3.4,.9,ST);
 for(let k=0;k<=10;k++){const a=Math.PI*k/10;fr.s.box(Math.cos(a)*2.9,7.6+Math.sin(a)*1.2,HW+.5,.9,.7,.2,k%2?0xf0e9da:0xc9b79a);}fr.s.box(0,4.0,HW-.2,5.0,6.8,.2,0x3a2a1e);fr.g.box(0,7.0,HW+.3,3.4,.8,.1,0xe9c66a);for(const s of [-1,1])fr.s.box(s*1.25,3.6,HW+.02,2.3,6.0,.12,0x5b3d26);
 // flat roof of the low tier, the high cube that carries the drum
 sh.s.box(0,WH+.2,-HW/2,2*HW,.4,HW,0xbfb8a8);fr.s.box(0,WH+.2,HW/2,2*HW,.4,HW,0xbfb8a8);
 wall(sh,-UW,-UW,UW,-UW,WH+.4,UH,.8,R2,-1);wall(sh,-UW,-UW,-UW,0,WH+.4,UH,.8,R2,1);wall(sh,UW,-UW,UW,0,WH+.4,UH,.8,R2,-1);wall(fr,-UW,0,-UW,UW,WH+.4,UH,.8,R2,1);wall(fr,UW,0,UW,UW,WH+.4,UH,.8,R2,-1);wall(fr,-UW,UW,UW,UW,WH+.4,UH,.8,R2,1);
 const lead=(k,j)=>k%3===2?shade(LEAD,.9):LEAD;
 for(const [pt,a0,a1,fin] of [[sh,Math.PI,TAU,0],[fr,0,Math.PI,1]]){pt.s.lathe([[DR,0],[DR,DY-UH]],24,0,UH,0,ST,{a0,a1,open:true});pt.s.lathe(domeP(DR,.92,10),24,0,DY,0,lead,{a0,a1,open:true});pt.s.lathe([[DR+.25,0],[DR+.25,.3]],24,0,DY-.1,0,ST2,{a0,a1,open:true});
  for(let k=0;k<10;k++){const a=a0+(a1-a0)*(k+.5)/10;pt[r()<.7?'g':'w'].box(Math.cos(a)*(DR+.04),UH+1.3,Math.sin(a)*(DR+.04),.8,1.6,.08,0xffe2a8,Math.PI/2-a);}
  if(fin){pt.s.lathe([[.14,0],[.3,.4],[.08,.9],[.2,1.3],[.03,1.7],[.02,3.0]],8,0,DY+DR*.92-.1,0,GOLD);}}
 // semi-domes on the four sides, small domes on the corners, turrets at the drum
 for(const s of [-1,1]){sh.s.lathe(domeP(6.5,.8),16,s*UW,WH+.4,0,lead,{a0:s>0?-Math.PI/2:Math.PI,a1:s>0?0:Math.PI*1.5,open:true});fr.s.lathe(domeP(6.5,.8),16,s*UW,WH+.4,0,lead,{a0:s>0?0:Math.PI/2,a1:s>0?Math.PI/2:Math.PI,open:true});
  ct.s.box(s*(UW+3.25),WH+.3,-.02,6.5,.3,.1,CUT);for(let k=0;k<8;k++){const u0=k/8*Math.PI/2,u1=(k+1)/8*Math.PI/2;ct.s.beam([s*(UW+6.5*Math.cos(u0)),WH+.4+5.2*Math.sin(u0),.02],[s*(UW+6.5*Math.cos(u1)),WH+.4+5.2*Math.sin(u1),.02],.16,CUT);}}
 sh.s.lathe(domeP(6.5,.8),16,0,WH+.4,-UW,lead,{a0:Math.PI,a1:TAU,open:true});fr.s.lathe(domeP(6.5,.8),16,0,WH+.4,UW,lead,{a0:0,a1:Math.PI,open:true});
 for(const sx of [-1,1])for(const sz of [-1,1]){const pt=sz<0?sh:fr;pt.s.lathe([[3.1,0],[3.1,.8]],12,sx*11.3,WH+.4,sz*11.3,ST);pt.s.lathe(domeP(3.0,.85,6),12,sx*11.3,WH+1.2,sz*11.3,lead,{open:true});pt.s.lathe([[.05,0],[.1,.2],[.02,.9]],6,sx*11.3,WH+3.7,sz*11.3,GOLD);
  pt.s.lathe([[1.0,0],[1.0,4.2],[1.2,4.4],[.6,5.6],[.04,6.6]],8,sx*UW,UH-1.2,sz*UW,(k,j)=>k>2?LEAD:ST);minaret(pt,sx*(HW+.2),sz*(HW+.2),36,{y0:TB});}
 // cut outline of drum and main dome
 for(const s of [-1,1]){ct.s.box(s*(DR-.2),(UH+DY)/2,-.02,.4,DY-UH,.1,CUT);ct.s.box(s*(UW-.4),(WH+UH)/2+.2,-.02,.8,UH-WH-.4,.1,CUT);ct.s.box(s*(HW-.45),(TB+WH)/2,-.02,.9,WH-TB,.1,CUT);
  for(let k=0;k<10;k++){const u0=k/10*Math.PI/2,u1=(k+1)/10*Math.PI/2;ct.s.beam([s*DR*Math.cos(u0),DY+DR*.92*Math.sin(u0),.02],[s*DR*Math.cos(u1),DY+DR*.92*Math.sin(u1),.02],.18,CUT);}}
 ct.s.box(0,WH+.2,-.02,2*HW,.4,.1,CUT);ct.s.box(0,TB-.1,-.02,2*HW,.2,.1,CUT);
 // forecourt: paving, arcade with little domes, ablution fountain, far gate, two outer minarets, cypresses
 { const g=fr,Z0=HW,Z1=HW+22,CW=HW;g.s.box(0,TB+.05,(Z0+Z1)/2,2*CW,.1,Z1-Z0,0xd9d2c2);for(let i=-4;i<=4;i++)g.s.box(i*3,TB+.11,(Z0+Z1)/2,.06,.01,Z1-Z0,0xb9b1a0);
  const bay=(x,z,ry)=>{g.s.lathe([[.34,0],[.28,.3],[.26,4.0],[.4,4.3]],8,x,TB+.1,z,0xe9e4d8);g.s.box(x,TB+5.0,z,3.4,1.2,3.4,ST);g.s.lathe(domeP(1.5,.8,5),10,x,TB+5.6,z,lead,{open:true});
   for(let k=0;k<=6;k++){const a=Math.PI*k/6,[ax,az]=loc(x,z,ry,Math.cos(a)*1.45,1.72);g.s.box(ax,TB+4.3+Math.sin(a)*.45,az,.5,.4,.14,k%2?0xf0e9da:0xc9917a,ry);}};
  for(let k=0;k<7;k++){const z=Z0+1.7+k*3.1;bay(-CW+1.7,z,Math.PI/2);bay(CW-1.7,z,-Math.PI/2);}for(let k=1;k<8;k++){const x=-CW+1.7+k*3.2;if(Math.abs(x)>2)bay(x,Z1-1.7,Math.PI);}
  g.s.box(0,TB+3.6,Z1-.4,5.2,7.2,1.4,ST);g.s.box(0,TB+2.8,Z1-.2,2.6,5.4,1.6,0x3a2a1e);g.s.lathe(domeP(2.0,.8,5),10,0,TB+7.2,Z1-.4,lead,{open:true});
  g.s.lathe([[2.2,0],[2.3,.8],[2.0,.85],[2.0,.4]],6,0,TB+.1,Z0+11,0xe9e4d8,{flat:true});g.w.lathe([[0,.6],[2.0,.6]],6,0,TB+.1,Z0+11,0x6fb0c4,{open:true,flat:true});for(let k=0;k<6;k++){const a=k*TAU/6;g.s.lathe([[.14,0],[.12,2.6]],6,Math.cos(a)*2.1,TB+.9,Z0+11+Math.sin(a)*2.1,0xe9e4d8);}g.s.lathe([[2.7,0],[1.6,.7],[.06,1.7]],6,0,TB+3.5,Z0+11,LEAD,{flat:true});
  for(const s of [-1,1]){minaret(g,s*(CW+.2),Z1+.2,27,{y0:TB});for(const z of [Z0+6,Z0+16])g.s.lathe([[.14,0],[.16,.5],[.7,1.2],[.5,3.6],[.04,6.2]],7,s*(CW+4.5),TB,z,(k,j)=>k?0x3f6a4a:0x6a4a33,{flat:true});} }
 // ---------------- interior ----------------
 const levels=[];
 { const g=new T.Group(),pt=part(),y=TB;pt.s.box(0,y+.03,-HW/2,2*HW-1.8,.06,HW-.9,0x9a2b2b);for(let i=-9;i<=9;i++)pt.s.box(i*1.45,y+.065,-HW/2,.1,.01,HW-1,0xc9a24a);for(let k=1;k<9;k++)pt.s.box(0,y+.065,-k*1.5,2*HW-2,.01,.06,0x7a1f24);
  fr.s.box(0,y+.03,HW/2,2*HW-1.8,.06,HW-.9,0x9a2b2b);
  // inner faces: plaster, blue tile bands, painted dome lining
  pt.s.box(0,(y+WH)/2,-HW+.5,2*HW-1,WH-y,.06,PL);pt.s.box(0,y+3.4,-HW+.54,2*HW-1,4.6,.05,TILE);for(let i=-10;i<=10;i++)pt.s.box(i*1.35,y+3.4,-HW+.57,.5,4.0,.03,i%2?0x3f86b4:0xe9e4d8);pt.s.box(0,y+5.9,-HW+.58,2*HW-1,.3,.06,0xc9a24a);
  for(const s of [-1,1]){pt.s.box(s*(HW-.5),(y+WH)/2,-HW/2,.06,WH-y,HW-1,PL);pt.s.box(s*(HW-.54),y+3.4,-HW/2,.05,4.6,HW-1,TILE);pt.s.box(s*(UW-.45),(WH+UH)/2,-UW/2,.06,UH-WH,UW,PL);}
  pt.s.box(0,(WH+UH)/2,-UW+.45,2*UW-.8,UH-WH,.06,PL);pt.s.lathe([[DR-.1,0],[DR-.1,DY-UH]],24,0,UH,0,PL,{a0:Math.PI,a1:TAU,open:true});
  pt.s.lathe(domeP(DR-.12,.92,10),24,0,DY,0,(k,j)=>k===0||k===4?TILE:k===9?0xc9a24a:(j%2?0xf3ecdc:0xe9dfc8),{a0:Math.PI,a1:TAU,open:true});for(const s of [-1,1])pt.s.lathe(domeP(6.38,.8),16,s*UW,WH+.4,0,(k,j)=>k===0?TILE:j%2?0xf3ecdc:0xe9dfc8,{a0:s>0?-Math.PI/2:Math.PI,a1:s>0?0:Math.PI*1.5,open:true});
  pt.s.lathe(domeP(6.38,.8),16,0,WH+.4,-UW,(k,j)=>k===0?TILE:j%2?0xf3ecdc:0xe9dfc8,{a0:Math.PI,a1:TAU,open:true});
  fr.s.lathe(domeP(DR-.12,.92,10),24,0,DY,0,(k,j)=>k===0||k===4?TILE:k===9?0xc9a24a:(j%2?0xf3ecdc:0xe9dfc8),{a0:0,a1:Math.PI,open:true});fr.s.lathe([[DR-.1,0],[DR-.1,DY-UH]],24,0,UH,0,PL,{a0:0,a1:Math.PI,open:true});fr.s.lathe(domeP(6.38,.8),16,0,WH+.4,UW,(k,j)=>k===0?TILE:j%2?0xf3ecdc:0xe9dfc8,{a0:0,a1:Math.PI,open:true});
  for(const s of [-1,1]){fr.s.lathe(domeP(6.38,.8),16,s*UW,WH+.4,0,(k,j)=>k===0?TILE:j%2?0xf3ecdc:0xe9dfc8,{a0:s>0?0:Math.PI/2,a1:s>0?Math.PI/2:Math.PI,open:true});fr.s.box(s*(HW-.5),(y+WH)/2,HW/2,.06,WH-y,HW-1,PL);fr.s.box(s*(HW-.54),y+3.4,HW/2,.05,4.6,HW-1,TILE);}fr.s.box(0,WH+.02,HW/2,2*HW-1.8,.05,HW-.9,PL);pt.s.box(0,WH+.02,-HW/2,2*HW-1.8,.05,HW-.9,PL);
  // the four great piers and the arches they carry
  for(const [px,pz,P] of [[-UW+.9,-UW+.9,pt],[UW-.9,-UW+.9,pt],[-UW+.9,UW-.9,fr],[UW-.9,UW-.9,fr]]){P.s.lathe([[1.9,0],[1.75,.5],[1.6,.9],[1.6,9.4],[1.9,9.9],[1.9,10.6],[1.5,10.9],[1.5,UH-y]],14,px,y,pz,(k,j)=>k===3?(j%2?0xf3ecdc:0xe6dcc8):0xe9e2d2);P.s.lathe([[1.63,2.2],[1.63,5.6]],14,px,y,pz,(k,j)=>j%2?TILE:0x3f86b4,{open:true});
   const a=Math.atan2(-pz,-px);P.s.lathe([[0,0],[.95,0]],14,0,0,0,0x1f3a2a,{open:true});const Q=P.s.p,s0=Q.length-14*4*3,cx=px+Math.cos(a)*1.66,cz=pz+Math.sin(a)*1.66,ry=Math.PI/2-a;for(let i=s0;i<Q.length;i+=3){const lx=Q[i],lz=Q[i+2],[wx,wz]=loc(cx,cz,ry,lx,0);Q[i]=wx;Q[i+1]=y+7.6+lz;Q[i+2]=wz;}
   const [gx,gz]=loc(cx,cz,ry,0,.04);P.s.box(gx,y+7.6,gz,1.0,.14,.03,GOLD,ry);P.s.box(gx,y+7.6,gz,.14,1.0,.03,GOLD,ry);}
  for(const s of [-1,1])for(let k=0;k<=14;k++){const a=Math.PI/2*k/14;pt.s.box(s*(UW-.9),WH+.6+Math.sin(a)*5.0,-(UW-.9)*Math.cos(a),.7,.7,.95,k%2?0xf0e9da:0xc9917a);}
  for(let k=0;k<=28;k++){const a=Math.PI*k/28;pt.s.box(Math.cos(a)*(UW-1.6),WH+.6+Math.sin(a)*5.0,-UW+.9,.9,.7,.7,k%2?0xf0e9da:0xc9917a);}
  // mihrab, minbar, loge
  pt.s.box(0,y+3.2,-HW+.75,3.4,6.4,.5,0xf0e9da);pt.s.box(0,y+2.6,-HW+.95,1.8,5.0,.3,0x1f3a5a);pt.g.box(0,y+2.4,-HW+1.12,1.2,3.6,.06,0xffe7b0);for(let k=0;k<=8;k++){const a=Math.PI*k/8;pt.s.box(Math.cos(a)*1.0,y+5.1+Math.sin(a)*.8,-HW+1.05,.34,.3,.2,GOLD);}pt.s.box(0,y+6.9,-HW+.9,3.0,.5,.3,TILE);
  for(let k=0;k<9;k++)pt.s.box(4.6,y+.2+k*.4,-HW+1.4+k*.5,1.3,.4+k*.0,.55,0xe9e2d2);pt.s.box(4.6,y+4.2,-HW+1.2,1.5,.2,1.5,0xe9e2d2);for(const [dx,dz] of [[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]])pt.s.box(4.6+dx,y+5.1,-HW+1.2+dz,.1,1.8,.1,0xe9e2d2);pt.s.lathe([[1.0,0],[.6,.9],[.04,2.4]],6,4.6,y+6.0,-HW+1.2,0x2f6f6a,{flat:true});pt.s.lathe([[.04,0],[.09,.15],[.02,.6]],5,4.6,y+8.4,-HW+1.2,GOLD);
  for(const s of [-1,1])pt.s.box(4.6+s*.7,y+2.3,-HW+3.4,.08,4.2,4.4,0xdcd4c2);
  pt.s.box(-9.4,y+3.0,-HW+2.6,4.2,.3,4.2,0xe9e2d2);for(const [dx,dz] of [[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[1.8,1.8]])pt.s.lathe([[.22,0],[.18,2.85]],8,-9.4+dx,y,-HW+2.6+dz,0xc9917a);for(let k=0;k<12;k++)pt.s.box(-11.2+k*.33,y+3.6,-HW+4.6,.06,.9,.06,GOLD);pt.s.box(-9.4,y+4.05,-HW+4.6,4.2,.08,.1,GOLD);
  // chandelier rings, lamps on chains
  const ring=(cx,cz,R,n,yy)=>{pt.s.lathe([[R,0],[R+.07,.06],[R,.12]],28,cx,yy,cz,0x2a2a2e,{open:true});for(let k=0;k<n;k++){const a=k*TAU/n;pt.g.lathe([[.05,0],[.14,.12],[.1,.3]],6,cx+Math.cos(a)*R,yy-.32,cz+Math.sin(a)*R,0xffe9b8);}for(let k=0;k<4;k++){const a=k*TAU/4+.4;pt.s.beam([cx+Math.cos(a)*R,yy+.1,cz+Math.sin(a)*R],[cx,yy+9,cz],.03,0x2a2a2e);}};
  ring(0,-4.2,3.6,26,y+3.6);ring(0,-4.2,2.0,14,y+4.3);ring(-10.4,-5,1.3,10,y+3.4);ring(10.4,-5,1.3,10,y+3.4);
  for(const [x,z] of [[-3,-2.4],[2.6,-3.2],[-1,-6.4],[5,-7],[-6,-8.6]]){pt.s.lathe([[.2,0],[.24,.5],[.18,.62]],7,x,y+.06,z,[0x2f4b63,0x6b4e38,0x3f6247,0x7a2e2a,0x40546a][Math.abs(Math.round(x*3))%5]);pt.s.lathe([[.02,0],[.13,.08],[.14,.2],[.03,.28]],6,x,y+.66,z,0xe6c2a4);}
  flush(g,pt,'mosque hall');levels.push({group:g,name:'1F 禮拜大殿',y,h:5,rooms:[{name:'大殿中央・主圓頂下',pos:[0,y+1.7,-1.5],look:[0,y+6,-12]},{name:'米哈拉布與講壇',pos:[2,y+1.7,-7],look:[1,y+2.4,-14]}]}); }
 { const g=new T.Group(),pt=part(),y=6.2;for(const s of [-1,1]){pt.s.box(s*11.4,y-.15,-HW/2-.2,4.6,.3,HW-1.4,0xb89a78);for(let k=0;k<5;k++){pt.s.lathe([[.24,0],[.2,.3],[.18,y-TB-.5],[.3,y-TB-.3]],8,s*9.3,TB,-1.4-k*2.9,0xc9917a);if(k<4)for(let j=0;j<=6;j++){const a=Math.PI*j/6;pt.s.box(s*9.3,y-1.3+Math.sin(a)*.8,-2.85-k*2.9+Math.cos(a)*1.3,.3,.3,.36,j%2?0xf0e9da:0xc9917a);}}
   for(let k=0;k<34;k++)pt.s.box(s*9.2,y+.45,-1.2-k*.36,.06,.9,.06,0xe9e2d2);pt.s.box(s*9.2,y+.92,-HW/2-.2,.12,.1,HW-1.6,0xe9e2d2);F.rug(pt,s*11.4,y+.02,-7,2.6,8.4,0x2f4a78);
   for(let k=0;k<12;k++)pt.s.box(s*(12.6-k*.0),TB+.22+k*.46,-HW+1.0+k*.0+ (k*.42),1.4,.46,.44,0xd9d2c2);}
  flush(g,pt,'mosque gallery');levels.push({group:g,name:'2F 側廊看台',y,h:4.4,rooms:[{name:'東側看台',pos:[11.2,y+1.7,-3],look:[0,y+2,-6]},{name:'西側看台',pos:[-11.2,y+1.7,-3],look:[0,y+2,-6]}]}); }
 flush(shellG,sh,'mosque shell');flush(frontG,fr,'mosque front');flush(cutG,ct,'mosque cut edge');root.add(shellG,frontG,cutG);levels.forEach(l=>root.add(l.group));
 return {id:'istanbul',title:'伊斯坦堡・藍色清真寺（單棟外觀與剖面）',root,exterior:frontG,shell:shellG,cutOnly:cutG,levels,anims:[],bounds:{x:12.5,z:12.5,z0:-12.5},radius:44,height:25,az:.34,extCenter:[0,10],cutR:31,whole:true};
}

/* =====================================================================================
   4 · 敦煌莫高窟九層樓：倚崖而建的九層木構樓閣，樓內是通高的倚坐大佛；兩側崖面有洞窟與棧道相連
       剖面拿掉正面木構，看得到大佛、三層迴廊、樓梯、供桌，以及崖壁
   ===================================================================================== */
function dunhuang(){
 const r=rng(96096),root=new T.Group(),shellG=new T.Group(),frontG=new T.Group(),cutG=new T.Group(),sh=part(),fr=part(),ct=part();
 const RED=0x8e2f24,RED2=0x7a261e,TILEC=0x6f7f72,CREAM=0xe9dcc0,WOOD=0x6b4a33,Y0=1.2,TH=3.5,ZB=-4,N=9;
 const hw=i=>9-i*.72,zf=i=>6-i*.55,ty=i=>Y0+i*TH,ns=(x,y)=>Math.sin(x*.31+y*.17)*.6+Math.sin(x*.83-y*.41)*.3+Math.sin(x*1.9+y*1.3)*.12,cz=(x,y)=>ZB-.25-y*.05-.9*(ns(x,y)*.5+.5);
 // ground, terrace, cliff
 sh.s.box(0,.05,6,90,.1,60,0xd9c08f);sh.s.box(0,Y0/2,5,26,Y0,22,0xcdb98f);for(let k=0;k<5;k++)sh.s.box(0,Y0-.12-k*.24,16.2+k*.5,9,.24,.5,0xbfa97c);
 sh.s.surf((u,v)=>{const x=-36+u*72,y=v*46;return [x,y,cz(x,y)];},48,30,(u,v,p)=>{const k=Math.floor(p[1]/2.3+ns(p[0]*.6,p[1])*.9);return [0xc9a66f,0xbf9a62,0xd4b27c,0xc4a06a,0xb89058][((k%5)+5)%5];});
 sh.s.surf((u,v)=>{const x=-36+u*72;return [x,46+v*2,cz(x,46)-v*22];},20,4,0xcbb27e);
 // one skirt of tiled eave on a wall line; corners sweep upward
 const eave=(pt,i,side)=>{const y=ty(i)+TH-.05,h=hw(i),z1=zf(i),out=1.9,drop=.8,st=.5;
  if(side===0){const W=h+out;for(let u=-W;u<W-.01;u+=st){const a=u,b=Math.min(W,u+st),up=q=>.95*Math.pow(Math.abs(q)/W,4),ci=q=>Math.max(-h,Math.min(h,q)),col=Math.round(u/st)%2?TILEC:shade(TILEC,.84);
    pt.s.q([ci(a),y,z1+.1],[ci(b),y,z1+.1],[b,y-drop+up(b),z1+out],[a,y-drop+up(a),z1+out],col);}
   pt.s.box(0,y-drop-.02,z1+out-.05,2*W*.86,.1,.12,0x4a5a4f);}
  else{const L0=ZB,L1=z1+out;for(let w=L0;w<L1-.01;w+=st){const a=w,b=Math.min(L1,w+st),up=q=>.95*Math.pow(Math.max(0,(q-L0)/(L1-L0)),5),ci=q=>Math.min(z1,q),col=Math.round(w/st)%2?TILEC:shade(TILEC,.84);
    pt.s.q([side*h,y,ci(b)],[side*h,y,ci(a)],[side*(h+out),y-drop+up(a),a],[side*(h+out),y-drop+up(b),b],col);}}};
 for(let i=0;i<N;i++){const y=ty(i),h=hw(i),z1=zf(i);
  for(const s of [-1,1]){sh.s.box(s*(h-.15),y+TH/2,(ZB+z1)/2,.3,TH,z1-ZB,RED);sh.s.box(s*(h+.02),y+2.75,(ZB+z1)/2,.1,.3,z1-ZB,0x2f6f6a);for(let k=0;k<(z1-ZB)/1.1;k++)sh.s.box(s*(h+.06),y+2.5,ZB+.6+k*1.1,.16,.3,.3,k%2?0x2f6f9a:0xc9a24a);
   if(i<N-1)for(const zz of [ZB+2.2,z1-1.6]){if(zz<ZB+1)continue;sh.s.box(s*(h+.03),y+1.5,zz,.08,1.5,1.3,CREAM);for(let k=-1;k<=1;k++){sh.s.box(s*(h+.08),y+1.5,zz+k*.4,.05,1.5,.05,RED2);sh.s.box(s*(h+.08),y+1.5+k*.45,zz,.05,.05,1.3,RED2);}}
   eave(sh,i,s);ct.s.box(s*(h-.15),y+TH/2,z1-.02,.34,TH,.12,CUT);}
  // street front: plinth beam, columns, lattice bays, bracket band
  fr.s.box(0,y+TH/2,z1-.15,2*h,TH,.3,RED);fr.s.box(0,y+.15,z1+.06,2*h+.3,.3,.3,RED2);fr.s.box(0,y+2.75,z1+.08,2*h+.2,.3,.16,0x2f6f6a);for(let k=0;k<2*h/.7;k++)fr.s.box(-h+.35+k*.7,y+2.5,z1+.16,.3,.3,.2,k%2?0x2f6f9a:0xc9a24a);
  const nb=Math.max(2,Math.round(2*h/2.3));for(let k=0;k<=nb;k++)fr.s.lathe([[.24,0],[.2,.2],[.19,2.6],[.26,2.75]],8,-h+.1+k*(2*h-.2)/nb,y+.1,z1+.12,RED2);
  for(let k=0;k<nb;k++){const u=-h+.1+(k+.5)*(2*h-.2)/nb,w=(2*h-.2)/nb-.6;if(i===0&&k===Math.floor(nb/2)){fr.s.box(u,y+1.3,z1+.04,w,2.4,.1,0x3a1a14);fr.g.box(u,y+1.2,z1+.1,w-.4,2.1,.05,0xffd9a0);continue;}
   fr.s.box(u,y+1.45,z1+.03,w,1.7,.08,CREAM);for(let q=1;q<5;q++)fr.s.box(u-w/2+q*w/5,y+1.45,z1+.08,.05,1.7,.04,RED2);for(const q of [-.5,0,.5])fr.s.box(u,y+1.45+q,z1+.08,w,.05,.04,RED2);fr.s.box(u,y+.45,z1+.03,w,.3,.1,RED2);}
  eave(fr,i,0);}
 // top: pyramidal tiled roof with bronze finial
 { const y=ty(N-1)+TH,h=hw(N-1)+1.2,zc0=(ZB+zf(N-1))/2,d=(zf(N-1)-ZB)/2+1.2;sh.s.lathe([[1.42,-.5],[1.0,.5],[.62,1.9],[.3,3.6],[.07,5.4]],4,0,y,zc0,(k,j)=>k%2?TILEC:shade(TILEC,.84),{rot:Math.PI/4,sx:h,sz:d,flat:true});
  sh.s.lathe([[.5,0],[.6,.3],[.25,.5],[.45,.9],[.2,1.2],[.34,1.6],[.08,2.0],[.04,3.2]],8,0,y+5.3,zc0,0xb88a3c); }
 // cave mouths, plank walkways with rails, stair flights on the cliff face
 const rows=[6.2,13.2,20.2];rows.forEach((y,ri)=>{for(const s of [-1,1]){const x0=s*(hw(Math.round((y-Y0)/TH))+.4),x1=s*30;
   sh.s.box((x0+x1)/2,y-.1,ZB+.75-y*.05,Math.abs(x1-x0),.16,1.5,WOOD);for(let k=0;k<=Math.abs(x1-x0)/2.2;k++){const x=x0+s*k*2.2,zc0=ZB+.75-y*.05;sh.s.beam([x,y-.15,zc0+.6],[x,y-2.0,zc0-.8],.14,0x5b3d26);sh.s.box(x,y+.5,zc0+.7,.08,1.1,.08,0x5b3d26);}
   sh.s.box((x0+x1)/2,y+1.02,ZB+1.45-y*.05,Math.abs(x1-x0),.08,.1,0x5b3d26);sh.s.box((x0+x1)/2,y+.55,ZB+1.45-y*.05,Math.abs(x1-x0),.05,.06,0x5b3d26);
   for(let k=0;k<4;k++){const x=s*(13.5+k*4.4+(ri%2)*1.6),zz=cz(x,y+1.2)+.2;sh.s.box(x,y+1.35,zz,2.1,2.9,.3,CREAM);sh.s.box(x,y+1.15,zz+.12,1.3,2.3,.3,0x1c1410);sh.s.box(x,y+2.5,zz+.2,1.7,.2,.2,RED2);if((k+ri)%2)sh.g.box(x,y+.9,zz+.3,.5,.9,.05,0xffc98a);}
   if(ri<2){const up=rows[ri+1]-y,n=Math.round(up/.25),xa=s*(22+ri*3),zc0=ZB+.75-y*.05;for(let k=0;k<n;k++)sh.s.box(xa+s*k*.3,y+(k+.5)*up/n,zc0-(k/n)*(up*.05),.32,up/n+.02,1.3,k%2?0x7a5a3d:WOOD);sh.s.beam([xa,y+1,zc0+.7],[xa+s*n*.3,y+up+1,zc0+.7-up*.05],.07,0x5b3d26);}}});
 // forecourt: incense burner, flag poles, poplars
 sh.s.lathe([[.9,0],[.6,.3],[.5,.9],[1.1,1.2],[1.2,1.9],[.9,2.0]],10,0,Y0,11,0x4a4f55);sh.s.lathe([[1.3,0],[.9,.5],[.1,1.3]],6,0,Y0+2.6,11,0x3a3f45,{flat:true});for(const [dx,dz] of [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]])sh.s.box(dx,Y0+2.3,11+dz,.1,.7,.1,0x3a3f45);
 for(const s of [-1,1]){sh.s.lathe([[.12,0],[.08,9]],6,s*11.5,Y0,13,0x7a261e);for(let k=0;k<5;k++)sh.s.q([s*11.5,Y0+8.6-k*1.2,13],[s*11.5+1.0,Y0+8.5-k*1.2,13],[s*11.5+1.0,Y0+7.7-k*1.2,13],[s*11.5,Y0+7.6-k*1.2,13],[0x2f6f9a,0xf2efe6,0xb3262d,0x3f8a4a,0xe0a63c][k]);
  for(const [x,z,h] of [[17,15,11],[21,11,9.5],[25,16,12],[30,12,10]]){sh.s.lathe([[.2,0],[.12,h*.4]],6,s*x,.1,z,0x8a7a5a,{flat:true});sh.s.lathe([[.3,h*.2],[1.3,h*.45],[1.0,h*.75],[.1,h]],7,s*x,.1,z,(k,j)=>j%2?0x6f9a4f:0x5f8a45,{flat:true});}}
 // ---------------- interior ----------------
 const levels=[],SK=0xe0c59a,ROBE=0xa5523a,HAIR=0x23283f;
 { const g=new T.Group(),pt=part();
  // back wall plaster with halo and mandorla, floor
  pt.s.box(0,Y0+.03,(ZB+zf(0))/2,2*hw(0)-.6,.06,zf(0)-ZB,0x8a6a4a);for(let i=0;i<N;i++){const y=ty(i),h=hw(i);pt.s.box(0,y+TH/2,ZB+.12,2*h-.6,TH,.1,i>5?0x2f4a6a:0xdcc9a0);
   for(const s of [-1,1]){pt.s.box(s*(h-.33),y+TH/2,(ZB+zf(i))/2,.06,TH,zf(i)-ZB-.3,0xd9c59a);for(let a=0;a<Math.floor((zf(i)-ZB-1)/1.0);a++)for(let b=0;b<3;b++){pt.s.box(s*(h-.38),y+.75+b*.95,ZB+.9+a*1.0,.04,.7,.62,[0x2f6f6a,0xb3523a,0x2f4a78,0xc9a24a][(a+b+i)%4]);pt.s.box(s*(h-.41),y+.72+b*.95,ZB+.9+a*1.0,.03,.4,.3,0xe6cfa0);}}}
  pt.s.disc(0,22.6,ZB+.2,6.4,0x2f6f6a,24);pt.s.disc(0,22.6,ZB+.24,5.4,0xb3523a,24);pt.s.disc(0,22.6,ZB+.28,4.5,0xc9a24a,24);pt.s.disc(0,22.6,ZB+.32,3.7,0x2f4a78,24);pt.g.disc(0,22.6,ZB+.36,3.0,0xf3d9a0,24);
  for(let k=0;k<16;k++){const a=k*TAU/16;pt.s.box(Math.cos(a)*4.95,22.6+Math.sin(a)*4.95,ZB+.3,.5,.5,.06,0xf2efe6,0);}
  pt.s.lathe([[7.6,0],[8.0,7],[7.0,12],[5.4,15.5]],20,0,Y0+3,ZB+.16,(k,j)=>[0x3f8a6a,0xc9a24a,0xb3523a][(j+k)%3],{a0:0,a1:Math.PI,sz:.02,open:true});
  // throne, feet on lotus, legs, lap
  pt.s.box(0,Y0+1.5,-.6,10,3.0,5.6,0xb9a070);pt.s.box(0,Y0+3.1,-.6,10.6,.3,6.0,0xc9a24a);for(let k=0;k<12;k++)pt.s.box(-4.6+k*.84,Y0+1.5,2.24,.5,2.2,.06,k%2?0x2f6f6a:0xb3523a);
  for(const s of [-1,1]){pt.s.lathe([[1.5,0],[1.7,.3],[1.3,.6]],10,s*1.9,Y0,3.6,0xd9a0a8);pt.s.box(s*1.9,Y0+.95,3.7,1.5,.7,2.6,SK);pt.s.lathe([[1.05,0],[1.25,3.0],[1.5,6.4]],10,s*1.9,Y0+1.2,2.9,ROBE,{sz:.9});pt.s.lathe([[1.7,0],[1.9,1.2],[1.5,2.2]],10,s*2.0,Y0+7.0,1.6,ROBE,{sz:1.7});}
  pt.s.box(0,Y0+8.2,.2,7.8,2.4,5.0,ROBE);for(let k=0;k<7;k++)pt.s.box(0,Y0+4+k*.55,3.86-k*.02,2.2-k*.2,.1,.1,shade(ROBE,.8));
  // torso, chest, shoulders, arms, hands
  pt.s.lathe([[3.3,0],[3.5,2.6],[3.8,6.2],[3.5,8.4],[1.5,9.8]],16,0,Y0+9.2,-.9,ROBE,{sz:.72});pt.s.lathe([[1.7,0],[2.3,1.2],[2.5,3.2],[1.2,4.4]],12,0,Y0+14.2,.9,SK,{sz:.5,a0:0,a1:Math.PI,open:true});
  for(let k=0;k<6;k++)pt.s.beam([-2.6+k*.2,Y0+17.6-k*.9,1.75-k*.05],[2.9-k*.5,Y0+12.4-k*.2,2.0],.1,shade(ROBE,.82));
  pt.s.beam([-3.6,Y0+17.4,-.6],[-4.2,Y0+12.2,.8],1.9,ROBE);pt.s.beam([-4.2,Y0+12.2,.8],[-2.4,Y0+10.0,3.4],1.4,ROBE);pt.s.box(-2.2,Y0+9.9,3.9,1.7,.5,1.5,SK);for(let k=0;k<4;k++)pt.s.box(-2.8+k*.4,Y0+9.75,4.8,.3,.3,.9,SK);
  pt.s.beam([3.6,Y0+17.4,-.6],[4.3,Y0+12.8,1.2],1.9,ROBE);pt.s.beam([4.3,Y0+12.8,1.2],[3.1,Y0+15.4,3.6],1.3,ROBE);pt.s.box(3.0,Y0+16.6,3.9,1.5,2.0,.5,SK);for(let k=0;k<4;k++)pt.s.box(2.4+k*.4,Y0+18.2,3.9,.3,1.3,.4,SK);
  // neck, head, hair, features
  pt.s.lathe([[1.3,0],[1.15,1.0]],12,0,Y0+18.6,-.5,SK);const HY=Y0+21.9,sp=[];for(let k=0;k<=10;k++){const u=-Math.PI/2+Math.PI*k/10;sp.push([Math.max(.05,2.15*Math.cos(u)),2.5*Math.sin(u)]);}pt.s.lathe(sp,18,0,HY,-.3,SK,{sz:.95});
  pt.s.lathe(sp.slice(7).map(([a,b])=>[a*1.07,b*1.05]),18,0,HY+.05,-.45,HAIR,{sz:.98});pt.s.lathe([[.9,0],[.95,.5],[.5,1.0],[.05,1.2]],12,0,HY+2.4,-.5,HAIR);for(const s of [-1,1]){pt.s.box(s*2.12,HY-.3,-.4,.24,1.9,.7,SK);pt.s.box(s*.85,HY+.35,1.72,.8,.1,.08,0x1c1410);pt.s.box(s*.85,HY+.8,1.6,.95,.07,.08,0x2a2018);}
  pt.s.box(0,HY-.25,1.95,.42,.9,.36,shade(SK,.94));pt.s.box(0,HY-1.05,1.68,.95,.16,.1,0xb3523a);pt.g.disc(0,HY+1.05,1.72,.14,0xffe9a8,8);
  // altar, offerings, lamps, cushions, pilgrims
  F.table(pt,0,Y0,4.9,4.2,1.0,0,0x7a261e,.95);pt.s.box(0,Y0+.5,5.42,4.2,.9,.04,0xc9a24a);pt.s.lathe([[.3,0],[.2,.15],[.36,.4],[.3,.55]],8,0,Y0+.98,4.9,0x8a6a3a);for(const s of [-1,1]){pt.s.lathe([[.14,0],[.05,.1],[.05,.5]],6,s*1.2,Y0+.98,4.9,GOLD);pt.g.box(s*1.2,Y0+1.6,4.9,.07,.2,.07,0xffd27a);for(let k=0;k<3;k++)pt.s.lathe([[.14,0],[.16,.1],[.02,.22]],6,s*(.5+.0*k),Y0+.98,4.6+k*.3,[0xe0a63c,0xc33b3b,0xf2efe6][k]);
   pt.s.lathe([[.3,0],[.08,.2],[.07,2.6]],6,s*6.2,Y0,4.6,0x4a3326);pt.g.lathe([[.3,2.6],[.36,2.9],[.2,3.3]],8,s*6.2,Y0,4.6,0xffd27a);}
  for(const [x,z,c] of [[-1.4,6.2,0x7a2e2a],[0,6.3,0x2f4b63],[1.4,6.2,0xc9a24a]]){pt.s.lathe([[.4,0],[.42,.12],[.3,.18]],8,x,Y0+.06,z-.6+0*r(),0xb3523a);}
  flush(g,pt,'dunhuang hall');levels.push({group:g,name:'1F 大佛殿（蓮座前）',y:Y0,h:TH,rooms:[{name:'大佛蓮座前',pos:[0,Y0+1.7,5.4],look:[0,Y0+14,-3]},{name:'供桌與長明燈',pos:[4.6,Y0+1.7,5.0],look:[0,Y0+4,3]}]}); }
 for(const [lv,nm,rm] of [[3,'4F 迴廊（佛手高度）','佛手迴廊'],[6,'7F 迴廊（佛首高度）','佛首迴廊']]){const g=new T.Group(),pt=part(),y=ty(lv),h=hw(lv),z1=zf(lv),up=ty(lv+3)-y;
  for(const s of [-1,1]){pt.s.box(s*(h-1.2),y-.1,(ZB+z1)/2,1.9,.2,z1-ZB-.2,0x8a6a4a);for(let k=0;k<(z1-ZB)/.5;k++)pt.s.box(s*(h-2.1),y+.5,ZB+.3+k*.5,.07,1.0,.07,RED2);pt.s.box(s*(h-2.1),y+1.02,(ZB+z1)/2,.1,.1,z1-ZB-.2,RED2);
   for(let k=0;k<3;k++)pt.s.beam([s*(h-.4),y-.2,ZB+1.2+k*2.6],[s*(h-2.0),y-.2,ZB+1.2+k*2.6],.2,0x5b3d26);
   if(lv<6){const n=Math.round(up/.26),z0=z1-.6;for(let k=0;k<n;k++)pt.s.box(s*(h-.95),y+(k+.5)*up/n,z0-k*(z0-ZB-1.2)/n,1.2,up/n+.02,.34,k%2?0x9a7650:0x8a6a4a);pt.s.beam([s*(h-1.6),y+1,z0],[s*(h-1.6),y+up+1,ZB+1.2],.07,RED2);}
   else{F.table(pt,s*(h-1.2),y,1.2,.9,.5,0,0x7a261e,.7);pt.g.box(s*(h-1.2),y+.9,1.2,.08,.2,.08,0xffd27a);}}
  fr.s.box(0,y-.1,z1-.9,2*h-4.2,.2,1.6,0x8a6a4a);for(let k=0;k<(2*h-4.2)/.5;k++)fr.s.box(-h+2.1+k*.5,y+.5,z1-1.65,.07,1.0,.07,RED2);fr.s.box(0,y+1.02,z1-1.65,2*h-4.2,.1,.1,RED2);
  flush(g,pt,'dunhuang gallery '+lv);levels.push({group:g,name:nm,y,h:TH,rooms:[{name:rm+'・東',pos:[h-1.2,y+1.7,z1-.9],look:[0,y+4.5,-2.5]},{name:rm+'・西',pos:[-h+1.2,y+1.7,z1-.9],look:[0,y+4.5,-2.5]}]});}
 flush(shellG,sh,'dunhuang shell');flush(frontG,fr,'dunhuang front');flush(cutG,ct,'dunhuang cut edge');root.add(shellG,frontG,cutG);levels.forEach(l=>root.add(l.group));
 return {id:'dunhuang',title:'敦煌・莫高窟九層樓（倚崖樓閣外觀與剖面）',root,exterior:frontG,shell:shellG,cutOnly:cutG,levels,anims:[],bounds:{x:7.4,z:5.4,z0:-3.2},radius:44,height:40,az:.26,cutR:36,whole:true};
}

/* =====================================================================================
   5 · 聖托里尼崖邊小教堂：白牆藍頂教堂＋三鐘鐘牆、崖洞屋、白風車。剖面拿掉面海的牆，
       看得到教堂主殿與聖幛、崖洞屋的拱頂起居與臥龕、風車的磨石與木齒輪
   ===================================================================================== */
function santorini(){
 const r=rng(3615),root=new T.Group(),shellG=new T.Group(),frontG=new T.Group(),cutG=new T.Group(),sh=part(),fr=part(),ct=part();
 const WH=0xf6f4ee,WH2=0xe9e6dd,BLUE=0x2a5fb0,BL2=0x3f7fd0,ROCK=0x7a5646,T1=3.4,T2=7.0;
 const vaultX=(pt,x0,x1,y,zc,rr,col,a0,a1,n=8)=>{for(let k=0;k<n;k++){const a=a0+(a1-a0)*k/n,b=a0+(a1-a0)*(k+1)/n;pt.s.q([x0,y+Math.sin(a)*rr,zc+Math.cos(a)*rr],[x1,y+Math.sin(a)*rr,zc+Math.cos(a)*rr],[x1,y+Math.sin(b)*rr,zc+Math.cos(b)*rr],[x0,y+Math.sin(b)*rr,zc+Math.cos(b)*rr],col);}};
 // volcanic cliff in three terraces, whitewashed parapets, the sea below
 sh.s.box(0,-.6,8,60,1.2,60,0x3f78a8);sh.s.surf((u,v)=>{const x=-15+u*30,z=11-v*5.5,n=Math.sin(x*.9)*.3+Math.sin(x*2.3+v*4)*.14;return [x,-.1+v*.2*0+ (1-v)*-.0+ (v<.02?-1.2:0)+n*.2,z+n];},30,6,(u,v)=>v<.3?0x5e4236:ROCK);
 sh.s.box(0,-.5,2.6,30,1.2,12,ROCK);sh.s.box(0,T1/2,-2.4,30,T1,7.6,ROCK);sh.s.box(0,T2/2,-8.2,30,T2,5.6,shade(ROCK,.92));sh.s.box(0,T2+2,-12.5,30,T2+4,3.4,shade(ROCK,.85));
 sh.s.box(0,.12,5.6,29,.14,5.6,WH2);sh.s.box(0,T1+.06,-2.6,29,.12,6.9,WH2);sh.s.box(0,T2+.06,-8.2,29,.12,5.4,WH2);
 for(const [x0,x1,y,z] of [[-14.5,-4.2,.2,8.3],[3.2,14.5,.2,8.3],[-14.5,-7.2,T1+.1,.75],[5.6,14.5,T1+.1,.75],[-14.5,-1,T2+.1,-5.6],[5.4,14.5,T2+.1,-5.6]]){sh.s.box((x0+x1)/2,y+.4,z,x1-x0,.8,.34,WH);sh.s.box((x0+x1)/2,y+.84,z,x1-x0+.1,.1,.44,WH2);}
 // stairs between the terraces
 for(let k=0;k<10;k++)sh.s.box(11.8,.2+(k+.5)*(T1-.2)/10,5.2-k*.42,2.0,(T1-.2)/10+.02,.44,k%2?WH:WH2);for(let k=0;k<10;k++)sh.s.box(-11.6,T1+.1+(k+.5)*(T2-T1)/10,.2-k*.5,2.0,(T2-T1)/10+.02,.52,k%2?WH:WH2);
 // ---- cave house on the low terrace: vaulted room dug into the cliff, white front with blue door
 const CX=-.5,CW=7.4,CD=5.6,CZ1=2.9;sh.s.box(CX,1.75,CZ1-CD-.2,CW+.8,3.3,.4,WH);for(const s of [-1,1])sh.s.box(CX+s*(CW/2+.2),1.75,CZ1-CD/2,.4,3.3,CD,WH);sh.s.box(CX,3.22,CZ1-CD/2,CW+.8,.36,CD+.4,WH);
 fr.s.box(CX,1.75,CZ1,CW+.8,3.3,.36,WH);fr.s.box(CX-1.9,1.25,CZ1+.2,1.1,2.3,.1,BLUE);fr.s.box(CX-1.9,2.6,CZ1+.2,1.1,.4,.08,BL2);for(const x of [CX+.6,CX+2.5]){fr.s.box(x,1.75,CZ1+.2,1.0,1.2,.08,WH2);fr.w.box(x,1.75,CZ1+.22,.8,1.0,.05,0x6f9ab8);for(const q of [-1,1])fr.s.box(x+q*.72,1.75,CZ1+.24,.4,1.2,.05,BLUE);}
 for(const s of [-1,1])ct.s.box(CX+s*(CW/2+.2),1.75,CZ1+.02,.4,3.3,.1,CUT);ct.s.box(CX,3.22,CZ1+.02,CW+.8,.36,.1,CUT);ct.s.box(CX,.1,CZ1+.02,CW+.8,.16,.1,CUT);
 // ---- church on the middle terrace: nave with barrel vault, drum and blue dome, apse, belfry wall
 const NX0=-6.4,NX1=4.6,NZ=-2.9,NR=2.6,NH=3.0,NY=T1+.12;                                  // nave axis along x, half-width NR
 sh.s.box((NX0+NX1)/2,NY+NH/2,NZ-NR+.2,NX1-NX0,NH,.4,WH);sh.s.box(NX0+.2,NY+NH/2,NZ,.4,NH,2*NR,WH);sh.s.box(NX1-.2,NY+NH/2,NZ-NR/2,.4,NH,NR,WH);fr.s.box(NX1-.2,NY+NH/2,NZ+NR/2,.4,NH,NR,WH);
 vaultX(sh,NX0,NX1,NY+NH,NZ,NR,WH,Math.PI/2,Math.PI);vaultX(fr,NX0,NX1,NY+NH,NZ,NR,WH,0,Math.PI/2);for(const x of [NX0,NX1]){sh.s.lathe([[0,0],[NR,0]],10,0,0,0,WH,{open:true});const Q=sh.s.p,s0=Q.length-10*4*3;for(let i=s0;i<Q.length;i+=3){const lx=Q[i],lz=Q[i+2];Q[i]=x;Q[i+1]=NY+NH+Math.abs(lz);Q[i+2]=NZ+lx;}}
 fr.s.box((NX0+NX1)/2,NY+NH/2,NZ+NR-.2,NX1-NX0,NH,.4,WH);for(const x of [-3.6,-.8,2]){fr.s.box(x,NY+1.7,NZ+NR+.02,.9,1.5,.08,WH2);fr.w.box(x,NY+1.7,NZ+NR+.05,.6,1.2,.05,0x5f8fc0);fr.s.box(x,NY+2.5,NZ+NR+.04,.6,.3,.06,BLUE);}fr.s.box(-5.2,NY+1.15,NZ+NR+.04,1.0,2.2,.1,BLUE);
 const DX=2.2,DRm=2.25,DY0=NY+NH+1.5;for(const [pt,a0,a1,top] of [[sh,Math.PI,TAU,0],[fr,0,Math.PI,1]]){pt.s.lathe([[DRm,0],[DRm,1.5]],16,DX,DY0,NZ,WH,{a0,a1,open:true});pt.s.lathe(domeP(DRm+.05,1.0,8),16,DX,DY0+1.5,NZ,(k,j)=>k%4===3?BL2:BLUE,{a0,a1,open:true});pt.s.lathe([[DRm+.18,1.4],[DRm+.18,1.56]],16,DX,DY0,NZ,WH2,{a0,a1,open:true});
  for(let k=0;k<4;k++){const a=a0+(a1-a0)*(k+.5)/4;pt.w.box(DX+Math.cos(a)*(DRm+.03),DY0+.8,NZ+Math.sin(a)*(DRm+.03),.4,.8,.06,0x5f8fc0,Math.PI/2-a);}
  if(top){pt.s.box(DX,DY0+4.2,NZ,.07,.9,.07,WH);pt.s.box(DX,DY0+4.4,NZ,.5,.07,.07,WH);}}
 sh.s.lathe([[1.5,0],[1.5,NH-.4]],10,NX1,NY,NZ,WH,{a0:-Math.PI/2,a1:0,open:true});fr.s.lathe([[1.5,0],[1.5,NH-.4]],10,NX1,NY,NZ,WH,{a0:0,a1:Math.PI/2,open:true});sh.s.lathe(domeP(1.5,1,5),10,NX1,NY+NH-.4,NZ,WH,{a0:-Math.PI/2,a1:0,open:true});fr.s.lathe(domeP(1.5,1,5),10,NX1,NY+NH-.4,NZ,WH,{a0:0,a1:Math.PI/2,open:true});
 { const bx=NX0-.2,bz=NZ;sh.s.box(bx,NY+3.6,bz,.6,7.2,4.4,WH);for(const [y,zz] of [[NY+5.0,-1.1],[NY+5.0,1.1],[NY+6.6,0]]){sh.s.box(bx,y,bz+zz,.66,1.25,.95,0x8fb0c8);sh.s.lathe([[.3,0],[.34,.1],[.2,.5],[.1,.6]],8,bx,y-.4,bz+zz,0xb88a3c);}sh.s.box(bx,NY+7.5,bz,.6,.9,1.7,WH);sh.s.box(bx,NY+8.4,bz,.08,.9,.08,WH);sh.s.box(bx,NY+8.6,bz,.08,.08,.5,WH); }
 for(const s of [NX0,NX1])ct.s.box(s+(s<0?.2:-.2),NY+NH/2,NZ+NR,.4,NH,.1,CUT);ct.s.box((NX0+NX1)/2,NY-.06,NZ+NR,NX1-NX0,.14,.1,CUT);
 // ---- windmill and a cube house on the upper terrace
 const MX=8.6,MZ=-8.4,MR=2.3,MY=T2+.12,MH=5.6;for(const [pt,a0,a1] of [[sh,Math.PI,TAU],[fr,0,Math.PI]]){pt.s.lathe([[MR+.25,0],[MR,1.2],[MR-.25,MH]],16,MX,MY,MZ,WH,{a0,a1,open:true});pt.s.lathe([[MR+.2,0],[MR*.55,1.6],[.06,3.0]],12,MX,MY+MH-.05,MZ,(k,j)=>j%2?0x8a6a45:0x7a5a3a,{a0,a1,open:true});}
 for(const s of [-1,1])ct.s.box(MX+s*(MR-.15),MY+MH/2,MZ+.02,.3,MH,.1,CUT);fr.s.box(MX,MY+1.1,MZ+MR+.12,.9,2.0,.1,BLUE);fr.w.box(MX,MY+3.6,MZ+MR-.2,.6,.7,.08,0x5f8fc0);
 { const hx=MX,hy=MY+MH-.9,hz=MZ+MR+.5;fr.s.beam([hx,hy,MZ],[hx,hy,hz+.3],.22,0x5b4130);for(let k=0;k<8;k++){const a=k*TAU/8,ex=hx+Math.cos(a)*3.6,ey=hy+Math.sin(a)*3.6;fr.s.beam([hx,hy,hz],[ex,ey,hz],.09,0x5b4130);const b=a+.42;fr.s.q([hx+Math.cos(a)*.9,hy+Math.sin(a)*.9,hz+.04],[ex,ey,hz+.04],[hx+Math.cos(b)*3.0,hy+Math.sin(b)*3.0,hz+.04],[hx+Math.cos(b)*.9,hy+Math.sin(b)*.9,hz+.04],0xf7f5ef);}
  for(let k=0;k<8;k++){const a=k*TAU/8,b=a+TAU/8;fr.s.beam([hx+Math.cos(a)*3.6,hy+Math.sin(a)*3.6,hz],[hx+Math.cos(b)*3.6,hy+Math.sin(b)*3.6,hz],.04,0x8a7a5a);} }
 sh.s.box(-6.4,MY+1.6,-9.0,5.2,3.2,3.6,WH);sh.s.box(-6.4,MY+3.3,-9.0,5.4,.2,3.8,WH2);fr.s.box(-7.4,MY+1.2,-7.16,1.0,2.2,.08,BLUE);for(const x of [-5.4])for(const q of [-1,1])fr.s.box(x+q*.7,MY+1.8,-7.16,.4,1.1,.06,BLUE);fr.w.box(-5.4,MY+1.8,-7.17,.9,1.0,.05,0x6f9ab8);
 for(const [x,y,z,n] of [[-3.4,MY,-7.4,9],[-9.2,MY,-7.6,7],[4.4,.2,6.6,8],[-12.6,T1+.1,-.6,7]]){for(let k=0;k<n;k++)sh.s.lathe([[.3,-.3],[.5,0],[.3,.4]],5,x+(r()-.5)*1.4,y+1.2+r()*1.5,z+(r()-.5)*.6,[0xd9388a,0xe3559a,0xc92f7a][k%3],{flat:true});sh.s.beam([x,y,z],[x+.2,y+1.4,z],.1,0x5b4130);}
 for(const [x,y,z] of [[9.2,.2,6.4],[10.6,.2,5.0],[-9.4,T1+.1,-1.2],[2.2,T2+.1,-6.4]]){sh.s.lathe([[.26,0],[.34,.5],[.26,.62]],8,x,y,z,0xb5673f);sh.s.lathe([[.1,.5],[.4,.9],[.1,1.3]],6,x,y,z,0x4f8a45,{flat:true});}
 sh.s.box(-9.6,.16,4.6,5.4,.3,3.0,WH);sh.w.box(-9.6,.33,4.6,4.8,.04,2.4,0x45b5d6);for(const [x,z] of [[6.6,5.2],[8.2,6.6]]){F.round(sh,x,.2,z,.4,WH);F.chair(sh,x-.65,.2,z,Math.PI/2,BLUE);F.chair(sh,x+.65,.2,z,-Math.PI/2,BLUE);}
 // ---------------- interiors ----------------
 const levels=[];
 { const g=new T.Group(),pt=part(),y=.2,x0=CX-CW/2,z0=CZ1-CD;pt.s.box(CX,y+.02,CZ1-CD/2,CW,.05,CD-.2,0xd9cdb8);vaultX(pt,x0,x0+CW,y+1.7,CZ1-CD/2,CD/2-.1,0xfbfaf6,Math.PI/2,Math.PI,8);
  pt.s.box(x0+1.3,y+.35,z0+1.1,2.4,.7,1.8,WH);pt.s.box(x0+1.3,y+.78,z0+1.1,2.2,.2,1.6,0x5f8fc0);for(const q of [-.5,.5])pt.s.box(x0+1.3+q,y+.95,z0+.5,.7,.16,.4,0xffffff);pt.s.box(x0+1.3,y+1.9,z0+.3,2.6,1.8,.1,WH2);
  pt.s.box(x0+CW-1.0,y+.45,z0+.6,1.8,.9,.7,WH);pt.s.box(x0+CW-1.0,y+.93,z0+.6,1.9,.06,.8,0x8fb0c8);for(let k=0;k<4;k++)pt.s.lathe([[.1,0],[.13,.16],[.07,.24]],6,x0+CW-1.7+k*.45,y+.96,z0+.6,[0xb5673f,BLUE,0xf7f5ef,0xe0a63c][k]);pt.s.box(x0+CW-1.0,y+2.0,z0+.36,1.6,.06,.3,0x8a6a45);
  pt.s.box(CX+.6,y+.3,CZ1-1.6,2.6,.5,.9,WH);pt.s.box(CX+.6,y+.6,CZ1-1.6,2.5,.14,.8,BL2);for(const q of [-.8,0,.8])pt.s.box(CX+.6+q,y+.86,CZ1-1.95,.6,.4,.16,[0xf7f5ef,0xe0a63c,0xf7f5ef][q+.8>1?2:q?0:1]);F.round(pt,CX+.6,y,CZ1-2.9,.42,0x8a6a45);F.rug(pt,CX+.4,y+.05,CZ1-2.6,2.6,1.8,0x2a5fb0);F.tlamp(pt,x0+2.9,y+.7,z0+.5);pt.s.box(x0+2.9,y+.35,z0+.5,.5,.7,.5,WH);
  flush(g,pt,'santorini cave house');levels.push({group:g,name:'B1 崖洞屋（拱頂起居與臥龕）',y,h:3,rooms:[{name:'拱頂起居',pos:[CX,y+1.6,1.6],look:[CX,y+1.2,-3]}]}); }
 { const g=new T.Group(),pt=part(),y=NY,L=NX1-NX0;pt.s.box((NX0+NX1)/2,y+.02,NZ,L-.6,.05,2*NR-.6,0xf2efe6);for(let i=0;i<18;i++)for(let j=0;j<8;j++)if((i+j)%2)pt.s.box(NX0+.6+i*(L-1.2)/17,y+.05,NZ-NR+.6+j*(2*NR-1.2)/7,.56,.01,.56,BLUE);
  vaultX(pt,NX0+.4,NX1-.4,y+NH,NZ,NR-.12,0xfbfaf6,Math.PI/2,Math.PI,8);pt.s.box((NX0+NX1)/2,y+NH/2,NZ-NR+.42,L-.8,NH,.05,0xfbfaf6);
  const ix=2.9;pt.s.box(ix,y+1.3,NZ,.14,2.6,2*NR-.9,0x6b4a2a);for(let k=0;k<5;k++){pt.s.box(ix-.08,y+1.55,NZ-1.7+k*.85,.04,1.0,.6,GOLD);pt.s.box(ix-.1,y+1.6,NZ-1.7+k*.85,.03,.6,.36,[0x2a4f8a,0x8a2f2a,0x2f6a4a,0x8a2f2a,0x2a4f8a][k]);}pt.s.box(ix-.08,y+2.75,NZ,.06,.3,2*NR-1.0,GOLD);pt.s.box(ix-.1,y+3.2,NZ,.05,.6,.05,GOLD);pt.s.box(ix-.1,y+3.3,NZ,.05,.05,.4,GOLD);
  for(let k=0;k<4;k++)for(const s of [-1,1]){pt.s.box(-4.4+k*1.5,y+.42,NZ+s*1.2,.5,.08,1.5,0x6b4a2a);pt.s.box(-4.62+k*1.5,y+.7,NZ+s*1.2,.07,.6,1.5,0x6b4a2a);}
  pt.s.lathe([[.9,0],[.94,.06],[.9,.12]],14,-1.4,y+2.9,NZ,GOLD,{open:true});for(let k=0;k<8;k++){const a=k*TAU/8;pt.g.box(-1.4+Math.cos(a)*.9,y+3.08,NZ+Math.sin(a)*.9,.07,.18,.07,0xfff0c4);}pt.s.box(-1.4,y+3.9,NZ,.03,1.6,.03,GOLD);
  for(const [x,c] of [[-4.6,0x8a2f2a],[-2.4,0x2a4f8a],[-.2,0x2f6a4a]])F.pic(pt,x,y+1.9,NZ-NR+.48,0,.5,.7,c);pt.s.lathe([[.3,0],[.1,.1],[.08,1.0],[.34,1.1]],8,1.6,y,NZ-1.4,GOLD);for(let k=0;k<6;k++)pt.g.box(1.6+Math.cos(k)*.2,y+1.25,NZ-1.4+Math.sin(k)*.2,.04,.2,.04,0xffd27a);
  pt.s.lathe(domeP(DRm-.1,1.0,8),16,DX,DY0+1.5,NZ,(k,j)=>k>5?0x2a4f8a:0xfbfaf6,{a0:Math.PI,a1:TAU,open:true});pt.s.lathe([[DRm-.08,0],[DRm-.08,1.5]],16,DX,DY0,NZ,0xfbfaf6,{a0:Math.PI,a1:TAU,open:true});
  flush(g,pt,'santorini church');levels.push({group:g,name:'1F 藍頂教堂主殿與聖幛',y,h:NH+1,rooms:[{name:'主殿',pos:[-3.6,y+1.6,NZ+.4],look:[4,y+1.6,NZ]},{name:'聖幛前',pos:[.6,y+1.6,NZ],look:[4,y+1.8,NZ]}]}); }
 { const g=new T.Group(),pt=part(),y=MY;pt.s.lathe([[0,0],[MR-.2,0]],14,MX,y+.03,MZ,0x9a7650,{open:true});pt.s.lathe([[0,0],[MR-.4,0],[MR-.4,-.18]],14,MX,y+2.9,MZ,0x8a6a45,{a0:Math.PI,a1:TAU,open:true});ct.s.box(MX,y+2.82,MZ+.02,2*MR-.7,.18,.1,CUT);
  pt.s.lathe([[1.0,0],[1.0,.34]],14,MX,y+.5,MZ-.2,0xb9b1a0);pt.s.lathe([[.95,0],[.95,.3]],14,MX,y+.9,MZ-.2,0xa39a88);pt.s.lathe([[.14,0],[.14,4.4]],8,MX,y+.3,MZ-.2,0x6b4a2a);pt.s.box(MX,y+.25,MZ-.2,2.4,.5,2.4,0x7a5a3a);
  for(const [dx,dz] of [[-1.4,-.9],[-1.6,-.2],[1.5,-1.0]]){pt.s.lathe([[.3,0],[.36,.3],[.3,.7],[.12,.8]],7,MX+dx,y+.03,MZ+dz,0xd9c9a0);}
  pt.s.lathe([[1.25,0],[1.25,.16]],16,MX,y+4.0,MZ-.2,0x8a6a45);for(let k=0;k<16;k++){const a=k*TAU/16;pt.s.box(MX+Math.cos(a)*1.32,y+4.08,MZ-.2+Math.sin(a)*1.32,.14,.3,.14,0x6b4a2a,Math.PI/2-a);}pt.s.beam([MX,y+MH-.9,MZ-.9],[MX,y+MH-.9,MZ+MR],.2,0x5b4130);pt.s.lathe([[.5,0],[.5,.5]],10,MX,y+MH-1.4,MZ+.6,0x7a5a3a,{flat:true});
  for(let k=0;k<9;k++)pt.s.box(MX-1.5,y+.2+k*.32,MZ-1.0+k*.02,.5,.05,.08,0x6b4a2a);for(const q of [-.24,.24])pt.s.beam([MX-1.5+q,y,MZ-1.0],[MX-1.5+q,y+3.0,MZ-.82],.05,0x6b4a2a);
  flush(g,pt,'santorini windmill');levels.push({group:g,name:'2F 白風車磨坊（磨石與木齒輪）',y,h:MH,rooms:[{name:'磨石層',pos:[MX-.6,y+1.6,MZ+.6],look:[MX,y+1.2,MZ-2]}]}); }
 flush(shellG,sh,'santorini shell');flush(frontG,fr,'santorini sea front');flush(cutG,ct,'santorini cut edge');root.add(shellG,frontG,cutG);levels.forEach(l=>root.add(l.group));
 return {id:'santorini',title:'聖托里尼・藍頂教堂、崖洞屋與白風車（外觀與剖面）',root,exterior:frontG,shell:shellG,cutOnly:cutG,levels,anims:[],bounds:{x:12,z:6,z0:-10},radius:30,height:14,az:.3,extCenter:[0,-2],whole:true};
}

window.Kit70={G,F,part,flush,face,railing,tree,tower,twin,rng,shade,rgb,mats,haussmann,castle,mosque,dunhuang,santorini,minaret,domeP,IRON,CUT,GOLD,ROOF,LEAD};
})();
