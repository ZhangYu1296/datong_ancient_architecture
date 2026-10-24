import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

// ===== Data =====
const D={
daxiong:{title:'大雄宝殿',subtitle:'DA XIONG BAO DIAN · 主殿',tags:['辽代建筑','面阔九间','中国现存最大辽金佛殿'],stats:[{v:'53.75m',l:'面阔'},{v:'29m',l:'进深'},{v:'23.18m',l:'殿高'}],sections:[{label:'建筑形制',text:'单檐庑殿顶，面阔九间，进深五间。庑殿顶是中国古建筑最高等级的屋顶形式，仅有正脊和四条戗脊。大雄宝殿体量恢宏，为中国现存最大的辽金佛殿之一。'},{label:'历史沿革',text:'始建于辽代清宁八年（1062年），辽保大二年（1122年）毁于兵火，金代天眷三年（1140年）重建。后世屡有修葺，但主体构架仍保持辽金建筑风格。'},{label:'殿内造像',text:'殿内正中供奉五方佛，两侧为胁侍菩萨二十尊。佛像高约3.5米，庄严雄浑，是辽代彩塑艺术的巅峰之作。四壁绘有壁画，规模宏大。'}]},
bojia:{title:'薄伽教藏殿',subtitle:'BO JIA JIAO ZANG DIAN · 藏经殿',tags:['辽代建筑','单檐歇山顶','海内孤品'],stats:[{v:'五间',l:'面阔'},{v:'四间',l:'进深'},{v:'1038年',l:'始建'}],sections:[{label:'建筑形制',text:'单檐歇山顶，面阔五间，进深四间。歇山顶仅次于庑殿顶，由一条正脊、四条垂脊和四条戗脊组成。殿内采用减柱造，空间开阔。'},{label:'天宫楼阁',text:'殿内沿壁设有小木作天宫楼阁，共三十八间，是国内现存最精美的小木作建筑模型，被梁思成先生誉为"海内孤品"。楼阁雕工精细，斗栱飞檐无一不备。'},{label:'辽代彩塑',text:'殿内现存辽代彩塑三十一尊，其中合掌露齿菩萨最为著名，体态婀娜，微笑含蓄，被誉为"东方维纳斯"。'}]},
yuetai:{title:'月台与台基',subtitle:'YUE TAI YU TAI JI · 基座',tags:['石作台基','须弥座','月台'],stats:[{v:'1.5m',l:'台基高'},{v:'青石',l:'材质'}],sections:[{label:'台基形制',text:'大雄宝殿筑于高大台基之上，前出月台。台基以青石砌筑，周边施以雕刻。月台宽敞，为礼佛仪式之用。'},{label:'建筑等级',text:'高台基是建筑等级的重要标志。华严寺大殿台基高大厚重，配合庑殿顶，彰显皇家寺院之尊贵地位。'}]},
chiwen:{title:'屋顶鸱吻',subtitle:'CHI WEN · 正脊兽',tags:['辽代遗物','正脊鸱吻','建筑装饰'],stats:[{v:'4.5m',l:'高度'},{v:'辽代',l:'年代'}],sections:[{label:'鸱吻形制',text:'大雄宝殿正脊两端的鸱吻高达4.5米，为国内现存最大的琉璃鸱吻之一。鸱吻造型雄健，鳞甲分明，龙口大张吞咬正脊。'},{label:'文化寓意',text:'鸱吻又称螭吻，传为龙生九子之一，性好吞，故立于屋脊以镇火灾。其形象既有装饰之美，亦含辟火祈福之意。'}]},
wufangfo:{title:'五方佛彩塑',subtitle:'WU FANG FO · 五智如来',tags:['辽代彩塑','泥塑彩绘','国宝造像'],stats:[{v:'5尊',l:'数量'},{v:'3.5m',l:'高度'}],sections:[{label:'造像内容',text:'大雄宝殿内供奉五方佛：中尊毗卢遮那佛，东方阿閦佛，南方宝生佛，西方阿弥陀佛，北方不空成就佛。五佛代表五智，是密宗供奉的主尊。'},{label:'艺术特征',text:'佛像面相丰满，肉髻高隆，双目微垂，神态庄严而慈悲。身披袈裟，衣纹流畅有力。辽代彩塑融合了唐代的雄浑与契丹的民族特色。'}]},
pusa:{title:'合掌露齿菩萨',subtitle:'东方维纳斯',tags:['辽代彩塑','合掌微笑','镇寺之宝'],stats:[{v:'辽代',l:'年代'},{v:'薄伽教藏殿',l:'所在'}],sections:[{label:'造像特征',text:'菩萨立于薄伽教藏殿内，双手合十，面露微笑，微微露齿。体态婀娜，上身微侧，足踏莲花。打破了传统佛教造像庄严肃穆的模式。'},{label:'艺术价值',text:'此尊菩萨被学者誉为"东方维纳斯"，是辽代彩塑艺术的巅峰之作。其微笑之神态在中国佛教造像中极为罕见。'},{label:'历史评价',text:'梁思成先生曾评价辽代彩塑"其妙丽之至，可谓冠绝古今"。合掌露齿菩萨更是其中翘楚。'}]},
tiangong:{title:'天宫楼阁',subtitle:'TIAN GONG LOU GE · 小木作',tags:['辽代小木作','海内孤品','藏经壁橱'],stats:[{v:'38间',l:'间数'},{v:'辽代',l:'年代'}],sections:[{label:'建筑形制',text:'薄伽教藏殿内沿墙壁设有木制壁橱，外观仿楼阁建筑，分上下两层，设勾栏、飞檐、斗栱。共三十八间，环绕大殿三面墙壁。'},{label:'功能用途',text:'天宫楼阁实为藏经之用，内部分层存放经卷。既是实用的藏经橱，又是一件巨大的建筑模型艺术品。'},{label:'文物价值',text:'梁思成先生誉其为"海内孤品"，是国内现存最早、最完整的小木作建筑实物。'}]},
peidian:{title:'配殿与廊庑',subtitle:'附属建筑',tags:['配殿','廊庑','寺院布局'],stats:[{v:'东西',l:'方位'}],sections:[{label:'布局特征',text:'华严寺整体坐西朝东，体现了契丹族崇拜太阳的习俗。上华严寺以大雄宝殿为中心，下华严寺以薄伽教藏殿为主体，两组建筑群以廊庑相连。'},{label:'建筑功能',text:'配殿用于供奉次要佛像或作为僧人日常修行之所。廊庑既围合寺院空间，又连接各主要殿堂。'}]}
};

// ===== Scene =====
const container=document.getElementById('canvas-container');
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x1a1410,0.008);
const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,0.1,1000);
camera.position.set(60,38,60);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;
container.appendChild(renderer.domElement);
const ctrl=new OrbitControls(camera,renderer.domElement);
ctrl.enableDamping=true;ctrl.dampingFactor=0.05;ctrl.minDistance=20;ctrl.maxDistance=130;ctrl.maxPolarAngle=Math.PI/2.1;
ctrl.target.set(0,8,0);

// Lights
scene.add(new THREE.AmbientLight(0x4a3520,0.5));
const sun=new THREE.DirectionalLight(0xffd89e,1.2);
sun.position.set(40,50,30);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.near=1;sun.shadow.camera.far=200;
sun.shadow.camera.left=-70;sun.shadow.camera.right=70;
sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;
sun.shadow.bias=-0.0005;scene.add(sun);
const fill=new THREE.DirectionalLight(0x6b4423,0.3);
fill.position.set(-30,20,-20);scene.add(fill);
const rim=new THREE.PointLight(0xe8c876,0.5,80);
rim.position.set(0,25,-25);scene.add(rim);

// Ground
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x2a1f15,roughness:0.9}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const grid=new THREE.GridHelper(160,40,0x3d2b1f,0x2a2018);
grid.position.y=0.01;grid.material.opacity=0.25;grid.material.transparent=true;scene.add(grid);

// Materials
const M={
wD:new THREE.MeshStandardMaterial({color:0x3d2b1f,roughness:0.85}),
wM:new THREE.MeshStandardMaterial({color:0x6b4423,roughness:0.8}),
wL:new THREE.MeshStandardMaterial({color:0x9c6b3f,roughness:0.75}),
rT:new THREE.MeshStandardMaterial({color:0x4a3020,roughness:0.7,metalness:0.1}),
rD:new THREE.MeshStandardMaterial({color:0x2a1810,roughness:0.65,metalness:0.15}),
g:new THREE.MeshStandardMaterial({color:0xc9a04e,roughness:0.3,metalness:0.8,emissive:0xc9a04e,emissiveIntensity:0.05}),
gB:new THREE.MeshStandardMaterial({color:0xe8c876,roughness:0.2,metalness:0.9,emissive:0xe8c876,emissiveIntensity:0.1}),
r:new THREE.MeshStandardMaterial({color:0x8b3a1e,roughness:0.7}),
rD2:new THREE.MeshStandardMaterial({color:0x5c2410,roughness:0.75}),
s:new THREE.MeshStandardMaterial({color:0x6a6058,roughness:0.9}),
sD:new THREE.MeshStandardMaterial({color:0x4a4038,roughness:0.9}),
w:new THREE.MeshStandardMaterial({color:0x5c4030,roughness:0.85}),
wC:new THREE.MeshStandardMaterial({color:0x8a7560,roughness:0.85}),
b:new THREE.MeshStandardMaterial({color:0xb8843e,roughness:0.4,metalness:0.3,emissive:0xb8843e,emissiveIntensity:0.03}),
bG:new THREE.MeshStandardMaterial({color:0xd4a850,roughness:0.3,metalness:0.7,emissive:0xd4a850,emissiveIntensity:0.08}),
lo:new THREE.MeshStandardMaterial({color:0xc99a5e,roughness:0.5}),
};

// Build state
const temple=new THREE.Group();
const clickables=[];
const layerGroups={};
let exploded=false,autoRotate=false;

function reg(mesh,key,name,layer){
  mesh.userData={partKey:key,displayName:name,layerKey:layer};
  mesh.traverse(c=>{
    if(c.isMesh){
      c.userData.partKey=key;c.userData.displayName=name;c.userData.layerKey=layer;
      c.userData.oe=c.material.emissive?c.material.emissive.clone():new THREE.Color(0,0,0);
      c.userData.oei=c.material.emissiveIntensity||0;
    }
  });
  clickables.push(mesh);
  if(!layerGroups[layer])layerGroups[layer]=[];
  layerGroups[layer].push(mesh);
}

function box(w,h,d,x,y,z,mat){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;
  return m;
}
function cyl(rt,rb,h,x,y,z,mat,seg=16){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;
  return m;
}

// ===== PLATFORM =====
(function(){
  const g=new THREE.Group();
  g.add(box(72,2.5,48,0,1.25,0,M.sD));
  for(let i=0;i<3;i++) g.add(box(32-i*2,0.5,3,0,0.25+i*0.5,25+i*1.5,M.s));
  const moon=new THREE.Mesh(new THREE.CylinderGeometry(16,17,1.2,8),M.s);
  moon.rotation.y=Math.PI/8;moon.position.set(0,1.8,30);moon.castShadow=true;moon.receiveShadow=true;g.add(moon);
  g.add(box(42,1.5,32,-38,0.75,-16,M.sD));
  for(let i=0;i<2;i++) g.add(box(20-i*2,0.4,2.5,-38,0.2+i*0.4,1+i*1.2,M.s));
  reg(g,'yuetai','月台与台基','yuetai');
  temple.add(g);
})();

// ===== ROOF BUILDER =====
function buildRoof(w,d,h,type,opts={}){
  const g=new THREE.Group();
  const mat=opts.mat||M.rT;
  const ew=w+5,ed=d+5;
  g.add(box(ew,h*0.5,ed,0,h*0.25,0,mat));
  g.add(box(ew+3,h*0.12,2,0,h*0.08,d/2+2.5,mat));
  g.add(box(ew+3,h*0.12,2,0,h*0.08,-d/2-2.5,mat));
  g.add(box(2,h*0.12,ed+3,-ew/2-2.5,h*0.08,0,mat));
  g.add(box(2,h*0.12,ed+3,ew/2+2.5,h*0.08,0,mat));
  g.add(box(ew-3,0.7,0.9,0,h*0.5+0.35,0,M.rD));
  if(type==='wudian'){
    for(let sx of[-1,1])for(let sz of[-1,1]){
      const dx=(ew-3)/2*sx,dz=ed/2*sz,dy=h*0.5;
      const len=Math.max(0.1,Math.sqrt(dx*dx+dy*dy+dz*dz));
      const ridge=box(0.4,0.4,len,0,0,0,M.rD);
      ridge.position.set(dx/2,h*0.5+dy/2,dz/2);
      ridge.lookAt(new THREE.Vector3(dx,h*0.5+0.5,dz));
      ridge.rotateX(Math.PI/2);
      g.add(ridge);
    }
  }else{
    for(let sx of[-1,1]){
      g.add(box(0.3,h*0.6,ed-2,sx*(ew-3)/2,h*0.55,0,M.wD));
      for(let sz of[-1,1]){
        const dx=(ew-3)/2*sx,dz=(ed-4)/2*sz,dy=h*0.45;
        const len=Math.max(0.1,Math.sqrt(dx*dx+dy*dy+dz*dz));
        const ridge=box(0.35,0.35,len,0,0,0,M.rD);
        ridge.position.set(dx*0.5,h*0.5+dy*0.5,dz*0.5);
        ridge.lookAt(new THREE.Vector3(dx,h*0.5+0.3,dz));
        ridge.rotateX(Math.PI/2);
        g.add(ridge);
      }
    }
  }
  if(opts.chiwen!==false){
    for(let sx of[-1,1]){
      const cw=new THREE.Group();
      cw.add(box(1.2,2.5,1.2,0,1.25,0,M.g));
      cw.add(box(0.8,1.5,0.8,0,2.8,0.3,M.gB));
      cw.add(box(0.5,1,0.5,sx*0.4,2.2,-0.3,M.g));
      cw.position.set(sx*(ew-3)/2,h*0.5+0.7,0);
      reg(cw,'chiwen','屋顶鸱吻','chiwen');
      g.add(cw);
    }
  }
  return g;
}

// ===== DAXIONG BAO DIAN =====
(function(){
  const g=new THREE.Group();
  const w=36,h=14,d=20;
  g.add(box(w,h,d,0,h/2+2.5,0,M.w));
  const colSpacing=w/10;
  for(let i=0;i<=10;i++){
    const x=-w/2+i*colSpacing;
    g.add(box(0.8,h+2,0.8,x,h/2+2.5,d/2+0.5,M.wD));
    g.add(box(0.8,h+2,0.8,x,h/2+2.5,-d/2-0.5,M.wD));
  }
  for(let i=1;i<5;i++){
    const z=-d/2+i*(d/5);
    g.add(box(0.8,h+2,0.8,-w/2-0.5,h/2+2.5,z,M.wD));
    g.add(box(0.8,h+2,0.8,w/2+0.5,h/2+2.5,z,M.wD));
  }
  g.add(box(4,5,0.3,0,5,d/2+0.6,M.rD2));
  for(let x of[-10,10]) g.add(box(3,3,0.3,x,6,d/2+0.6,M.wD));
  const roof=buildRoof(w,d,8,'wudian',{mat:M.rT});
  roof.position.y=h+2.5;
  g.add(roof);
  for(let i=0;i<=10;i++){
    const x=-w/2+1+i*colSpacing;
    g.add(box(1,1,1.5,x,h+2.5,d/2+1,M.wM));
    g.add(box(1,1,1.5,x,h+2.5,-d/2-1,M.wM));
  }
  // Five Buddhas
  for(let i=0;i<5;i++){
    const bx=-12+i*6;
    const bg=new THREE.Group();
    bg.add(cyl(1.2,1.5,0.6,bx,3.4,0,M.lo));
    bg.add(cyl(0.8,1.0,3,bx,5.5,0,M.b));
    bg.add(cyl(0.5,0.6,1.2,bx,7.8,0,M.bG));
    bg.add(cyl(0.25,0.3,0.4,bx,8.6,0,M.bG));
    reg(bg,'wufangfo','五方佛彩塑','wufangfo');
    g.add(bg);
  }
  reg(g,'daxiong','大雄宝殿','daxiong');
  temple.add(g);
})();

// ===== BOJIA JIAO ZANG DIAN =====
(function(){
  const g=new THREE.Group();
  const w=22,h=10,d=14;
  g.position.set(-38,2.5,-16);
  g.add(box(w,h,d,0,h/2,0,M.w));
  const cs=w/6;
  for(let i=0;i<=6;i++){
    const x=-w/2+i*cs;
    g.add(box(0.7,h+1.5,0.7,x,h/2,d/2+0.4,M.wD));
    g.add(box(0.7,h+1.5,0.7,x,h/2,-d/2-0.4,M.wD));
  }
  g.add(box(3,4,0.3,0,4,d/2+0.5,M.rD2));
  const roof=buildRoof(w,d,5,'xieshan',{mat:M.rT});
  roof.position.y=h+1.5;
  g.add(roof);
  // Tian Gong Lou Ge (wall cabinets)
  const tg=new THREE.Group();
  for(let i=0;i<8;i++){
    const x=-9+i*2.6;
    // Lower level
    tg.add(box(2,2.5,0.6,x,4,-d/2-0.3,M.wL));
    // Upper level with mini eave
    tg.add(box(2,1.8,0.8,x,6.4,-d/2-0.4,M.wM));
    tg.add(box(2.2,0.2,1,x,7.4,-d/2-0.5,M.wD));
    // Mini roof
    tg.add(box(2.4,0.3,0.6,x,7.6,-d/2-0.6,M.rD));
  }
  // Side walls cabinets
  for(let i=0;i<4;i++){
    const z=-5+i*3.3;
    tg.add(box(0.6,2.5,2.5,-w/2-0.3,4,z,M.wL));
    tg.add(box(0.8,1.8,2,-w/2-0.4,6.4,z,M.wM));
    tg.add(box(1,0.2,2.2,-w/2-0.5,7.4,z,M.wD));
  }
  reg(tg,'tiangong','天宫楼阁','tiangong');
  g.add(tg);
  // Luchi Pusa (合掌露齿菩萨)
  const ps=new THREE.Group();
  ps.add(cyl(0.7,0.9,0.4,5,3.2,0,M.lo));
  ps.add(cyl(0.4,0.6,2.5,5,5,0,M.b));
  ps.add(cyl(0.35,0.4,0.8,5,7,0,M.bG));
  // Arms (合掌)
  ps.add(box(0.2,0.8,0.2,5.3,5.5,0.3,M.b));
  ps.add(box(0.2,0.8,0.2,4.7,5.5,0.3,M.b));
  // Hands together
  ps.add(box(0.3,0.3,0.3,5,6.0,0.4,M.bG));
  reg(ps,'pusa','合掌露齿菩萨','pusa');
  g.add(ps);
  // Other statues (simplified)
  for(let i=0;i<3;i++){
    const sx=-6+i*4;
    const st=new THREE.Group();
    st.add(cyl(0.6,0.8,0.3,sx,3.1,0,M.lo));
    st.add(cyl(0.4,0.55,2.2,sx,4.6,0,M.b));
    st.add(cyl(0.3,0.35,0.7,sx,6.3,0,M.bG));
    g.add(st);
  }
  reg(g,'bojia','薄伽教藏殿','bojia');
  temple.add(g);
})();

// ===== PEIDIAN & LANGWU =====
(function(){
  const g=new THREE.Group();
  // Left corridor connecting upper and lower temples
  g.add(box(3,6,25,-20,5,5,M.w));
  g.add(box(3.5,0.5,25.5,-20,8.5,5,M.rD));
  // Right corridor
  g.add(box(3,6,25,20,5,5,M.w));
  g.add(box(3.5,0.5,25.5,20,8.5,5,M.rD));
  // Small side halls
  for(let sx of[-1,1]){
    const sh=box(8,7,10,sx*28,5.5,-10,M.w);
    g.add(sh);
    g.add(box(9,0.8,11,sx*28,9.5,-10,M.rT));
    g.add(box(8.5,0.5,0.6,sx*28,10,-10+5.5,M.rD));
    // Columns
    for(let i=0;i<4;i++){
      g.add(box(0.5,7,0.5,sx*28-3.5+i*2.3,5.5,-5,M.wD));
      g.add(box(0.5,7,0.5,sx*28-3.5+i*2.3,5.5,-15,M.wD));
    }
  }
  // Back corridor
  g.add(box(60,5,3,0,4,-28,M.w));
  g.add(box(61,0.4,3.5,0,7,-28,M.rD));
  // Columns on corridors
  for(let i=0;i<10;i++){
    const x=-27+i*6;
    g.add(box(0.4,6,0.4,x,4,8,M.wD));
    g.add(box(0.4,6,0.4,x,4,2,M.wD));
  }
  reg(g,'peidian','配殿与廊庑','peidian');
  temple.add(g);
})();

scene.add(temple);

// Store original positions for explode
const explodeData=[];
temple.traverse(c=>{
  if(c.isMesh&&c.parent!==temple){
    // Skip - we handle groups
  }
});
// Collect groups for explode
temple.children.forEach((child,i)=>{
  explodeData.push({obj:child,origY:child.position.y||0,origX:child.position.x||0,origZ:child.position.z||0});
});

// ===== Raycaster =====
const raycaster=new THREE.Raycaster();
const mouse=new THREE.Vector2();
let hovered=null;

function onPointerMove(e){
  mouse.x=(e.clientX/innerWidth)*2-1;
  mouse.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const intersects=raycaster.intersectObjects(clickables,true);
  const tooltip=document.getElementById('tooltip');
  if(intersects.length>0){
    const hit=intersects[0].object;
    const name=hit.userData.displayName;
    if(name){
      tooltip.textContent=name;
      tooltip.style.left=(e.clientX+15)+'px';
      tooltip.style.top=(e.clientY-10)+'px';
      tooltip.classList.add('show');
      document.body.style.cursor='pointer';
      // Highlight
      if(hovered!==hit.userData.partKey){
        unhighlightAll();
        highlightPart(hit.userData.partKey);
        hovered=hit.userData.partKey;
      }
      return;
    }
  }
  tooltip.classList.remove('show');
  document.body.style.cursor='default';
  if(hovered){unhighlightAll();hovered=null;}
}

function highlightPart(key){
  clickables.forEach(c=>{
    c.traverse(m=>{
      if(m.isMesh&&m.userData.partKey===key){
        if(m.material.emissive){
          m.material.emissive.setHex(0xe8c876);
          m.material.emissiveIntensity=0.3;
        }
      }
    });
  });
}
function unhighlightAll(){
  clickables.forEach(c=>{
    c.traverse(m=>{
      if(m.isMesh&&m.userData.oe){
        m.material.emissive.copy(m.userData.oe);
        m.material.emissiveIntensity=m.userData.oei;
      }
    });
  });
}

function onClick(e){
  mouse.x=(e.clientX/innerWidth)*2-1;
  mouse.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const intersects=raycaster.intersectObjects(clickables,true);
  if(intersects.length>0){
    const hit=intersects[0].object;
    const key=hit.userData.partKey;
    if(key&&D[key]) showInfo(key);
  }
}

renderer.domElement.addEventListener('pointermove',onPointerMove);
renderer.domElement.addEventListener('click',onClick);

// ===== Info Panel =====
function showInfo(key){
  const d=D[key];if(!d)return;
  document.getElementById('info-title').textContent=d.title;
  document.getElementById('info-subtitle').textContent=d.subtitle;
  let html='<div style="margin-bottom:.8rem">';
  d.tags.forEach(t=>html+=`<span class="info-tag">${t}</span>`);
  html+='</div>';
  if(d.stats){
    html+='<div class="info-stat">';
    d.stats.forEach(s=>html+=`<div class="stat-item"><div class="stat-value">${s.v}</div><div class="stat-label">${s.l}</div></div>`);
    html+='</div>';
  }
  d.sections.forEach(s=>{
    html+=`<div class="info-section"><div class="info-label">${s.label}</div><div class="info-text">${s.text}</div></div>`;
  });
  document.getElementById('info-body').innerHTML=html;
  document.getElementById('info-panel').classList.add('show');
}
document.getElementById('info-close').addEventListener('click',()=>{
  document.getElementById('info-panel').classList.remove('show');
});

// ===== Buttons =====
document.getElementById('btn-rotate').addEventListener('click',function(){
  autoRotate=!autoRotate;
  this.classList.toggle('active',autoRotate);
  ctrl.autoRotate=autoRotate;
  ctrl.autoRotateSpeed=1.5;
});

document.getElementById('btn-explode').addEventListener('click',function(){
  exploded=!exploded;
  this.classList.toggle('active',exploded);
  if(exploded){
    temple.children.forEach((child,i)=>{
      const dir=child.position.clone().normalize();
      if(dir.length()<0.1)dir.set(0,1,0);
      child.position.x+=dir.x*8;
      child.position.y+=8+dir.y*5;
      child.position.z+=dir.z*8;
    });
  }else{
    explodeData.forEach(ed=>{
      ed.obj.position.set(ed.origX,ed.origY,ed.origZ);
    });
  }
});

document.getElementById('btn-reset').addEventListener('click',()=>{
  camera.position.set(60,38,60);
  ctrl.target.set(0,8,0);
  if(exploded){
    exploded=false;
    document.getElementById('btn-explode').classList.remove('active');
    explodeData.forEach(ed=>ed.obj.position.set(ed.origX,ed.origY,ed.origZ));
  }
});

// ===== Layer Selector =====
document.querySelectorAll('.layer-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.layer-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const layer=btn.dataset.layer;
    if(layer==='all'){
      temple.visible=true;
      temple.traverse(c=>{if(c.isMesh||c.isGroup)c.visible=true;});
    }else{
      // Show only selected layer
      Object.keys(layerGroups).forEach(k=>{
        layerGroups[k].forEach(obj=>{
          obj.visible=(k===layer);
        });
      });
      // Always show platform
      if(layer!=='yuetai'&&layerGroups['yuetai']){
        layerGroups['yuetai'].forEach(obj=>obj.visible=true);
      }
    }
  });
});

// ===== Compass =====
const compassArrow=document.getElementById('compass-arrow');

// ===== Resize =====
addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

// ===== Animate =====
function animate(){
  requestAnimationFrame(animate);
  ctrl.update();
  // Update compass
  const angle=camera.position.clone().sub(ctrl.target).angleTo(new THREE.Vector3(1,0,0));
  compassArrow.style.transform=`rotate(${-camera.position.x*0+Math.atan2(camera.position.x,camera.position.z)*180/Math.PI}deg)`;
  renderer.render(scene,camera);
}

// ===== Start rendering immediately (behind loader) =====
animate();

// ===== Loader =====
const loaderBar=document.getElementById('loader-bar');
const loaderPercent=document.getElementById('loader-percent');
let progress=0;
const loadInterval=setInterval(()=>{
  progress+=Math.random()*15+5;
  if(progress>=100){
    progress=100;
    clearInterval(loadInterval);
    setTimeout(()=>{
      document.getElementById('loader').classList.add('hidden');
    },400);
  }
  loaderBar.style.width=progress+'%';
  loaderPercent.textContent=Math.floor(progress)+'%';
},100);