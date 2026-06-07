const App = (() => {
  const LS = 'teacher_ai_toolkit_vercel_v4_6';
  const REMOVE_BG_API_URL = 'https://api.onlinesysweb.com/api/remove-bg';
  const ADMIN_PASSWORD = 'admin123';
  let state = load();
  if(localStorage.getItem('teacher_ai_toolkit_admin_authed')==='yes') state.adminAuthed=true;
  let currentToolFilter = '全部';

  function seed(){
    return {
      currentUserId:null,
      adminAuthed:false,
      users:[],
      toolkits:[
        {id:'question-bank',name:'AI题库生成工具包',category:'文字类',price:49,duration:'一年',desc:'输入科目、年级、主题，快速生成选择题、是非题、填充题、答案与解析。',features:['题型选择','难度分级','答案解析','复制下载'],status:'上架',cover:'📝'},
        {id:'image-splitter',name:'AI切图工具包',category:'图片类',price:29,duration:'永久',desc:'上传教学图片，模拟切成1×2、2×2、3×3、4×4，适合做拼图、图卡和课堂游戏。',features:['多种切割比例','预览切图','下载记录','适合图卡活动'],status:'上架',cover:'🖼️'},
        {id:'lesson-planner',name:'AI备课工具包',category:'文字类',price:69,duration:'一年',desc:'自动生成教学目标、课堂流程、导入活动、学习单和老师口播稿。',features:['教案生成','学习单','课堂活动','口播稿'],status:'上架',cover:'📚'},
        {id:'classroom-game',name:'AI课堂游戏生成工具包',category:'游戏类',price:99,duration:'一年',desc:'根据教学主题生成抢答、配对、转盘、闯关等课堂游戏设计。',features:['游戏规则','题目生成','活动流程','课堂互动'],status:'上架',cover:'🎲'},
        {id:'comment-helper',name:'AI评语生成工具包',category:'文字类',price:39,duration:'一年',desc:'快速生成学生表现评语、作文评语、家长沟通文字，支持中英马三语方向。',features:['表现评语','作文评语','家长沟通','三语方向'],status:'上架',cover:'💬'},
        {id:'background-remover',name:'AI去背景工具包',category:'图片类',price:59,duration:'一年',desc:'上传图片后，系统会自动去除接近背景色的区域，并输出透明PNG，适合制作PPT素材、图卡和海报。',features:['上传图片','自动去背景','透明PNG','下载图片'],status:'上架',cover:'🪄'}
      ],
      orders:[],
      userToolkits:[],
      trialRequests:[],
      adminNotifications:[],
      emailLogs:[],
      usageLogs:[],
      adminCurrentTab:'trials',
      editingToolkitId:null
    };
  }
  function load(){ try{return normalize(JSON.parse(localStorage.getItem(LS)) || seed())}catch(e){return seed()} }
  function normalize(data){
    const base=seed();
    return {...base,...data,
      users:(data.users||[]).map(u=>({phone:'',...u})), toolkits:(data.toolkits||base.toolkits).map((t,i)=>({cover:['📝','🖼️','📚','🎲','💬','🗂️'][i%6],...t})), orders:(data.orders||[]).map(o=>({paymentProofData:'',...o})), userToolkits:data.userToolkits||[],
      trialRequests:data.trialRequests||[], adminNotifications:data.adminNotifications||[], emailLogs:data.emailLogs||[], usageLogs:data.usageLogs||[],
      adminCurrentTab:data.adminCurrentTab||'trials', editingToolkitId:data.editingToolkitId||null};
  }
  function save(){ localStorage.setItem(LS, JSON.stringify(state)); updateNav(); }
  function $(id){ return document.getElementById(id); }
  function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'),2200); }
  function money(n){ return 'RM' + Number(n).toFixed(2); }
  function user(){ return state.users.find(u=>u.id===state.currentUserId); }
  function uid(prefix){ return prefix + '_' + Math.random().toString(36).slice(2,8) + Date.now().toString(36).slice(-4); }
  function updateNav(){
    const logged = !!state.currentUserId;
    $('navDashboard')?.classList.toggle('hidden', !logged);
    $('navLogout')?.classList.toggle('hidden', !logged);
  }

  function go(page, params={}){
    const app=$('app');
    const routeAlias={tools:'catalog',toolkits:'catalog',price:'pricing',peripherals:'products',peripheral:'products',around:'products'};
    page = routeAlias[page] || page || 'home';
    if(!app){ console.error('App root #app not found'); return; }
    updateNav();
    if(page==='home') return renderHome(app);
    if(page==='catalog') return renderCatalog(app);
    if(page==='toolkitDetail') return renderToolkitDetail(app, params.id);
    if(page==='pricing') return renderPricing(app);
    if(page==='products') return renderProducts(app);
    if(page==='register') return renderRegister(app);
    if(page==='verify') return renderVerify(app, params.email);
    if(page==='login') return renderLogin(app);
    if(page==='dashboard') return requireUser(()=>renderDashboard(app));
    if(page==='orders') return requireUser(()=>renderOrders(app));
    if(page==='adminTool') return requireAdmin(()=>renderTool(app, params.id, true));
    if(page==='tool') return requireUser(()=>renderTool(app, params.id, false));
    if(page==='checkout') return requireUser(()=>renderCheckout(app, params.id));
    if(page==='admin') return renderAdmin(app);
    return renderHome(app);
  }
  function requireUser(fn){ if(!state.currentUserId){toast('请先登入会员'); return renderLogin($('app'));} fn(); }
  function requireAdmin(fn){ if(!state.adminAuthed){toast('请先登入后台'); return renderAdmin($('app'));} fn(); }

  function renderHome(app){
    app.innerHTML = `
      <section class="hero">
        <div>
          <div class="badge">Vercel v4.6｜修正JS启动空白版</div>
          <h1>老师专用的 AI 教学工具包订购网站</h1>
          <p>老师不用学习复杂 Prompt，只要注册、订购、付款确认，就能开通自己的教学工具包：出题、备课、切图、课堂游戏、评语、图片分类等。</p>
          <div class="row">
            <button class="primary" onclick="App.go('catalog')">查看工具包</button>
            <button class="ghost" onclick="App.go('register')">注册老师账号</button>
            <button class="soft" onclick="App.demoLogin()">一键体验老师账号</button>
          </div>
          <div class="chips"><span class="chip">题库生成</span><span class="chip">AI备课</span><span class="chip">教学切图</span><span class="chip">课堂游戏</span><span class="chip">周边商品</span><span class="chip">后台数据分析</span></div>
        </div>
        <div class="hero-panel">
          <h2>测试流程</h2><p class="muted">电脑版适合管理订单，手机版适合老师注册、订购、上传付款截图与使用工具。</p>
          <p>1. 注册电邮账号<br>2. 输入验证码完成认证<br>3. 可先申请一次试用，等待后台批准<br>4. 或选择工具包下单<br>5. 上传付款截图模拟付款<br>6. 后台确认付款/批准试用并开通<br>7. 系统模拟发电邮通知老师</p>
          <hr>
          <p class="muted">后台测试密码：<strong>admin123</strong></p>
        </div>
      </section>
      <section>
        <div class="section-title"><div><h2>推荐工具包</h2><p>第一版先做订购流程与几个可测试工具。</p></div></div>
        <div class="grid">${state.toolkits.slice(0,3).map(toolCardHtml).join('')}</div>
      </section>
      <section class="trial-section">
        <div class="section-title"><div><h2>老师一次试用申请</h2><p>老师必须先注册、填写电邮与电话、登入后才能申请试用。后台批准后，系统会模拟发电邮通知申请者。</p></div><button class="primary" onclick="App.go('catalog')">申请试用工具包</button></div>
        <div class="trial-flow"><span>注册</span><span>登入</span><span>申请试用</span><span>后台通知</span><span>批准开通</span><span>电邮通知</span></div>
      </section>
      <section class="coming-section">
        <div class="section-title"><div><h2>周边商品区</h2><p>未来可销售教学卡、AI课程教材、桌游、贴纸、证书纸、老师礼盒等。</p></div><button class="ghost" onclick="App.go('products')">查看周边区</button></div>
        <div class="coming-card">
          <div><div class="badge">敬请期待</div><h3>阿虎老师教学周边商品区</h3><p>这一区先作为预告展示，不开放购买。未来可接入商品订购、库存、配送、付款和订单管理。</p></div>
          <div class="coming-visual">🎁</div>
        </div>
      </section>`;
  }

  function coverHtml(t){
    const c=t?.cover||'🧰';
    return c.startsWith('data:image') ? `<img src="${c}" alt="${t.name}封面">` : `<span>${c}</span>`;
  }
  function toolCardHtml(t){
    const off=t.status==='下架';
    return `<article class="card tool-card ${off?'tool-off':''}"><div class="tool-cover">${coverHtml(t)}</div><div class="badge">${t.category}</div><h3>${t.name}</h3><p>${t.desc}</p><div class="meta">${t.features.join(' · ')}</div><div class="price">${money(t.price)}</div><div class="meta">期限：${t.duration} ｜ ${status(t.status)}</div><div class="card-actions"><button onclick="App.viewToolkit('${t.id}')" class="ghost">查看详情</button><button onclick="App.go('checkout',{id:'${t.id}'})" class="primary" ${off?'disabled':''}>立即订购</button><button class="soft" onclick="App.requestTrial('${t.id}')" ${off?'disabled':''}>申请试用</button></div></article>`;
  }

  function renderCatalog(app){
    const cats=['全部',...new Set(state.toolkits.map(t=>t.category))];
    const tools=state.toolkits.filter(t=>currentToolFilter==='全部'||t.category===currentToolFilter);
    app.innerHTML=`<div class="section-title"><div><h2>工具包商店</h2><p>老师可以多次订购，每个账号拥有自己的工具包权限；每位老师可申请一次试用。</p></div><button onclick="App.go('dashboard')">我的工具包</button></div>
    <div class="tabs">${cats.map(c=>`<button class="${c===currentToolFilter?'active':''}" onclick="App.setFilter('${c}')">${c}</button>`).join('')}</div>
    <div class="grid">${tools.map(toolCardHtml).join('')}</div>`;
  }
  function setFilter(c){ currentToolFilter=c; go('catalog'); }
  function viewToolkit(id){ go('toolkitDetail',{id}); }
  function renderToolkitDetail(app,id){
    const t=state.toolkits.find(x=>x.id===id);
    if(!t) return renderCatalog(app);
    const off=t.status==='下架';
    app.innerHTML=`<div class="toolkit-detail card">
      <div class="detail-cover">${coverHtml(t)}</div>
      <div>
        <div class="badge">${t.category}</div>
        <h1>${t.name}</h1>
        <p>${t.desc}</p>
        <div class="price">${money(t.price)}</div>
        <p class="muted">使用期限：${t.duration} ｜ 状态：${status(t.status)}</p>
        <h3>主要功能</h3>
        <div class="chips">${t.features.map(f=>`<span class="chip">${f}</span>`).join('')}</div>
        <div class="row" style="margin-top:16px">
          <button class="primary" onclick="App.go('checkout',{id:'${t.id}'})" ${off?'disabled':''}>立即订购</button>
          <button class="soft" onclick="App.requestTrial('${t.id}')" ${off?'disabled':''}>申请试用</button>
          <button class="ghost" onclick="App.go('catalog')">返回工具包</button>
        </div>
      </div>
    </div>`;
  }
  function previewTool(id){ viewToolkit(id); }


  function renderProducts(app){
    const items=[
      {icon:'📚',name:'AI教学教材包',desc:'AI课程讲义、学生学习单、老师教学手册。'},
      {icon:'🃏',name:'课堂游戏卡',desc:'配对卡、题目卡、任务卡、分组挑战卡。'},
      {icon:'🎲',name:'AI桌游套装',desc:'适合课堂互动、AI素养活动和培训破冰。'},
      {icon:'🏷️',name:'老师贴纸与奖励卡',desc:'用于课堂奖励、分组积分和学生鼓励。'},
      {icon:'📄',name:'证书与活动模板',desc:'培训证书、活动海报、报名表与反馈表模板。'},
      {icon:'🎁',name:'教师节礼盒',desc:'未来可做成学校或培训机构订购的礼品组合。'}
    ];
    app.innerHTML=`<div class="section-title"><div><h2>周边商品区</h2><p>这一版先显示「敬请期待」，让老师知道未来除了AI工具包，也会有教学实体商品和教材资源。</p></div></div>
      <div class="coming-hero card"><div><div class="badge">COMING SOON｜敬请期待</div><h1>阿虎老师教学周边商品区</h1><p>未来这里可以销售教材、课堂游戏卡、AI桌游、图卡、证书纸、奖励贴纸和老师礼盒。第一版先不开放购买，避免订购流程太复杂。</p><button class="primary" onclick="App.go('catalog')">先查看AI工具包</button></div><div class="coming-visual big">🎁</div></div>
      <div class="grid products-grid">${items.map(i=>`<div class="card product-card"><div class="product-icon">${i.icon}</div><h3>${i.name}</h3><p>${i.desc}</p><span class="status pending">敬请期待</span></div>`).join('')}</div>`;
  }

  function renderRegister(app){
    app.innerHTML=`<div class="form card"><h2>注册老师账号</h2><p class="muted">测试版会在画面显示验证码，正式版才接电邮发送。注册必须留下电邮和联络电话，方便后台人工审核收据或联系老师。</p>
      <div class="field"><label>姓名</label><input id="regName" placeholder="例如：阿虎老师"></div>
      <div class="field"><label>电邮</label><input id="regEmail" type="email" placeholder="teacher@email.com"></div>
      <div class="field"><label>联络电话</label><input id="regPhone" placeholder="例如：012-3456789 / 07-XXXXXXX"></div>
      <div class="field"><label>密码</label><input id="regPass" type="password" placeholder="至少6位"></div>
      <button class="primary" onclick="App.register()">注册并发送确认码</button>
      <button class="ghost" onclick="App.go('login')">已有账号，去登入</button>
    </div>`;
  }
  function register(){
    const name=$('regName').value.trim(), email=$('regEmail').value.trim().toLowerCase(), phone=$('regPhone').value.trim(), pass=$('regPass').value;
    if(!name||!email||!phone||pass.length<6) return toast('请填写姓名、电邮、联络电话，密码至少6位');
    if(state.users.some(u=>u.email===email)) return toast('这个电邮已经注册');
    const code=String(Math.floor(100000+Math.random()*900000));
    state.users.push({id:uid('u'),name,email,phone,password:pass,emailVerified:false,verificationCode:code,status:'active',createdAt:new Date().toISOString(),lastLoginAt:null});
    save(); toast('验证码已生成：'+code); go('verify',{email});
  }
  function renderVerify(app,email=''){
    const u=state.users.find(x=>x.email===email);
    app.innerHTML=`<div class="form card"><h2>电邮确认</h2><p class="muted">测试版验证码：<strong>${u?u.verificationCode:'请回注册页重新注册'}</strong></p>
      <div class="field"><label>电邮</label><input id="verEmail" value="${email||''}"></div>
      <div class="field"><label>确认码</label><input id="verCode" placeholder="输入6位数"></div>
      <button class="primary" onclick="App.verify()">确认注册</button></div>`;
  }
  function verify(){
    const email=$('verEmail').value.trim().toLowerCase(), code=$('verCode').value.trim();
    const u=state.users.find(x=>x.email===email);
    if(!u||u.verificationCode!==code) return toast('确认码不正确');
    u.emailVerified=true; u.verificationCode=''; state.currentUserId=u.id; u.lastLoginAt=new Date().toISOString(); save(); toast('注册成功，已登入'); go('dashboard');
  }
  function renderLogin(app){
    app.innerHTML=`<div class="form card"><h2>会员登入</h2>
      <div class="field"><label>电邮</label><input id="loginEmail"></div>
      <div class="field"><label>密码</label><input id="loginPass" type="password"></div>
      <button class="primary" onclick="App.login()">登入</button>
      <button class="ghost" onclick="App.go('register')">注册新账号</button>
      <button class="soft" onclick="App.demoLogin()">一键体验老师账号</button>
    </div>`;
  }
  function login(){
    const email=$('loginEmail').value.trim().toLowerCase(), pass=$('loginPass').value;
    const u=state.users.find(x=>x.email===email&&x.password===pass);
    if(!u) return toast('电邮或密码错误');
    if(!u.emailVerified) return go('verify',{email});
    state.currentUserId=u.id; u.lastLoginAt=new Date().toISOString(); save(); toast('登入成功'); go('dashboard');
  }
  function demoLogin(){
    let u=state.users.find(x=>x.email==='demo@teacher.ai');
    if(!u){u={id:uid('u'),name:'测试老师',email:'demo@teacher.ai',phone:'012-3456789',password:'123456',emailVerified:true,verificationCode:'',status:'active',createdAt:new Date().toISOString(),lastLoginAt:null};state.users.push(u)}
    state.currentUserId=u.id; u.lastLoginAt=new Date().toISOString(); save(); toast('已登入测试老师账号'); go('dashboard');
  }
  function logout(){ state.currentUserId=null; save(); toast('已登出'); go('home'); }

  function renderDashboard(app){
    const u=user(); const my=state.userToolkits.filter(x=>x.userId===u.id&&x.status==='active');
    const orders=state.orders.filter(o=>o.userId===u.id).slice(-5).reverse();
    app.innerHTML=`<div class="section-title"><div><h2>${u.name} 的会员中心</h2><p>这里会显示已开通工具包、订单和个人使用数据。</p></div><button onclick="App.go('catalog')" class="primary">订购更多工具</button></div>
      <div class="grid">
        <div class="card stat"><span class="muted">已开通工具包</span><strong>${my.length}</strong></div>
        <div class="card stat"><span class="muted">我的订单</span><strong>${state.orders.filter(o=>o.userId===u.id).length}</strong></div>
        <div class="card stat"><span class="muted">总使用次数</span><strong>${state.usageLogs.filter(l=>l.userId===u.id).length}</strong></div>
      </div>
      <div class="section-title"><div><h2>我的工具包</h2><p>已开通后可直接进入工具。</p></div></div>
      ${my.length?`<div class="grid">${my.map(ut=>{const t=state.toolkits.find(x=>x.id===ut.toolkitId);return `<div class="card"><div class="badge">${t.category}</div><h3>${t.name}</h3><p>${t.desc}</p><div class="meta">${ut.accessType==='trial'?'试用':'正式'}权限 ｜ 开通：${new Date(ut.startDate).toLocaleDateString()} ｜ 到期：${ut.endDate?new Date(ut.endDate).toLocaleDateString():'永久'}</div><button class="primary" onclick="App.go('tool',{id:'${t.id}'})">进入工具</button></div>`}).join('')}</div>`:`<div class="card"><p>你还没有已开通的工具包。可以先到工具包商店下单，或到后台确认测试订单。</p></div>`}
      <div class="section-title"><div><h2>我的试用申请</h2><p>每位老师只能申请一次试用，需等后台管理员批准。</p></div></div>
      ${trialStatusHtml(u.id)}
      <div class="section-title"><div><h2>系统电邮通知</h2></div></div>
      ${emailLogsHtml(u.email)}
      <div class="section-title"><div><h2>最近订单</h2></div><button class="ghost" onclick="App.go('orders')">查看全部</button></div>
      ${ordersTable(orders)}`;
  }
  function trialStatusHtml(userId){
    const reqs=state.trialRequests.filter(r=>r.userId===userId).slice().reverse();
    if(!reqs.length) return `<div class="card"><p class="muted">你还没有申请试用。可到工具包商店选择一个工具包申请试用。</p><button class="soft" onclick="App.go('catalog')">去申请试用</button></div>`;
    return `<table class="table"><thead><tr><th>工具包</th><th>申请时间</th><th>状态</th><th>备注</th></tr></thead><tbody>${reqs.map(r=>{const t=state.toolkits.find(x=>x.id===r.toolkitId);return `<tr><td data-label="工具包">${t?.name||'-'}</td><td data-label="申请时间">${new Date(r.createdAt).toLocaleString()}</td><td data-label="状态">${status(r.status)}</td><td data-label="备注">${r.adminNote||'等待管理员处理'}</td></tr>`}).join('')}</tbody></table>`;
  }
  function emailLogsHtml(email){
    const logs=state.emailLogs.filter(e=>e.to===email).slice().reverse();
    if(!logs.length) return `<div class="card"><p class="muted">暂无系统电邮通知。</p></div>`;
    return `<div class="grid">${logs.map(e=>`<div class="card email-card"><div class="badge">系统电邮</div><h3>${e.subject}</h3><p>${e.body}</p><div class="meta">发送时间：${new Date(e.sentAt).toLocaleString()}</div></div>`).join('')}</div>`;
  }

  function ordersTable(orders){
    if(!orders.length) return `<div class="card"><p class="muted">暂无订单。</p></div>`;
    return `<table class="table"><thead><tr><th>订单</th><th>工具包</th><th>金额</th><th>付款</th><th>开通</th><th>操作</th></tr></thead><tbody>${orders.map(o=>{const t=state.toolkits.find(x=>x.id===o.toolkitId);return `<tr><td data-label="订单">${o.orderNo}</td><td data-label="工具包">${t.name}</td><td data-label="金额">${money(o.amount)}</td><td data-label="付款">${status(o.paymentStatus)}</td><td data-label="开通">${status(o.activationStatus)}</td><td data-label="操作">${o.paymentStatus==='待付款'?`<button class="small" onclick="App.go('checkout',{id:'${o.toolkitId}'})">继续付款</button>`:''}</td></tr>`}).join('')}</tbody></table>`;
  }
  function status(s){ const cls=(s==='已付款'||s==='上架')?'paid':(s==='已开通'||s==='active')?'active':(s==='已取消'||s==='下架'||s==='已拒绝')?'cancel':'pending'; return `<span class="status ${cls}">${s}</span>`; }

  function renderOrders(app){ const u=user(); app.innerHTML=`<div class="section-title"><div><h2>我的订单</h2><p>查看订购、付款和开通状态。</p></div></div>${ordersTable(state.orders.filter(o=>o.userId===u.id).reverse())}`; }

  function requestTrial(toolkitId){
    const u=user();
    if(!u){ toast('请先注册并登入，才能申请试用'); return go('register'); }
    if(!u.emailVerified){ toast('请先完成电邮确认'); return go('verify',{email:u.email}); }
    if(!u.phone){
      const phone=prompt('申请试用必须填写手机号码，请输入手机号码：');
      if(!phone) return toast('未填写电话，无法申请试用');
      u.phone=phone.trim();
    }
    const existing=state.trialRequests.find(r=>r.userId===u.id);
    if(existing){
      const t=state.toolkits.find(x=>x.id===existing.toolkitId);
      return toast(`你已经申请过一次试用：${t?.name||''}（${existing.status}）`);
    }
    const t=state.toolkits.find(x=>x.id===toolkitId);
    if(t?.status==='下架') return toast('这个工具包目前已下架，暂时不能申请试用');
    const req={id:uid('trial'),userId:u.id,toolkitId,status:'待审核',adminNote:'',createdAt:new Date().toISOString(),reviewedAt:null};
    state.trialRequests.push(req);
    state.adminNotifications.push({id:uid('note'),type:'trial_request',title:'新的试用申请',message:`${u.name} 申请试用 ${t.name}。电邮：${u.email}，电话：${u.phone}`,read:false,createdAt:new Date().toISOString()});
    save();
    toast('试用申请已提交，后台管理员会收到通知');
    go('dashboard');
  }

  function renderCheckout(app,id){
    const t=state.toolkits.find(x=>x.id===id); if(!t) return go('catalog'); if(t.status==='下架'){toast('这个工具包目前已下架，暂时不能订购'); return go('toolkitDetail',{id});}
    app.innerHTML=`<div class="grid two"><div class="card"><div class="badge">${t.category}</div><h2>${t.name}</h2><p>${t.desc}</p><div class="price">${money(t.price)}</div><p class="muted">期限：${t.duration}</p><hr><h3>付款方式：测试版模拟</h3><p>请上传付款截图。后台确认后会自动开通工具包。</p>
      <div class="field"><label>付款收据截图</label><input id="payProof" type="file" accept="image/*" onchange="App.previewReceipt(event)"></div><div id="receiptPreview" class="receipt-preview hidden"></div>
      <button class="primary" onclick="App.placeOrder('${t.id}')">提交订单与付款截图</button></div>
      <div class="card"><h3>正式版可连接</h3><p>Billplz、ToyyibPay、SenangPay、Stripe 或 Touch ’n Go QR。第一版先用人工确认，最快可以测试完整商业流程。</p></div></div>`;
  }
  function previewReceipt(e){
    const f=e.target.files[0];
    const box=$('receiptPreview');
    if(!box) return;
    if(!f){ box.classList.add('hidden'); box.innerHTML=''; return; }
    const reader=new FileReader();
    reader.onload=()=>{
      box.classList.remove('hidden');
      box.innerHTML=`<p class="muted">收据预览：</p><img src="${reader.result}" alt="付款收据预览">`;
    };
    reader.readAsDataURL(f);
  }
  function placeOrder(toolkitId){
    const u=user(), t=state.toolkits.find(x=>x.id===toolkitId), file=$('payProof').files[0];
    const saveOrder=(proofName,proofData)=>{
      const existing=state.orders.find(o=>o.userId===u.id&&o.toolkitId===toolkitId&&o.paymentStatus==='待付款');
      if(existing){
        existing.paymentProof=proofName;
        existing.paymentProofData=proofData||existing.paymentProofData||'';
        existing.updatedAt=new Date().toISOString();
      } else {
        state.orders.push({id:uid('o'),orderNo:'ORD'+Date.now().toString().slice(-8),userId:u.id,toolkitId,amount:t.price,paymentStatus:'待付款',activationStatus:'待开通',paymentMethod:'上传付款截图',paymentProof:proofName,paymentProofData:proofData||'',paidAt:null,createdAt:new Date().toISOString()});
      }
      save(); toast('订单已提交，请到后台确认付款'); go('orders');
    };
    if(file){
      const reader=new FileReader();
      reader.onload=()=>saveOrder(file.name, reader.result);
      reader.readAsDataURL(file);
    }else{
      saveOrder('未上传截图-测试订单','');
    }
  }

  function renderTool(app,id,adminMode=false){
    const t=state.toolkits.find(x=>x.id===id);
    if(!t) return app.innerHTML=`<div class="card"><h2>找不到工具包</h2><p>这个工具包可能已经被删除。</p><button onclick="App.go('catalog')" class="ghost">返回工具包</button></div>`;

    if(!adminMode){
      const u=user();
      const access=state.userToolkits.find(x=>x.userId===u.id&&x.toolkitId===id&&x.status==='active');
      if(!access) return app.innerHTML=`<div class="card"><h2>尚未开通</h2><p>你还没有订购或开通 ${t?.name||'此工具'}。</p><button class="primary" onclick="App.go('checkout',{id:'${id}'})">立即订购</button></div>`;
    }

    if(id==='question-bank') return renderQuestionBank(app,t,adminMode);
    if(id==='image-splitter') return renderImageSplitter(app,t,adminMode);
    if(id==='lesson-planner') return renderLessonPlanner(app,t,adminMode);
    if(id==='classroom-game') return renderGame(app,t,adminMode);
    if(id==='background-remover') return renderBackgroundRemover(app,t,adminMode);
    return renderGenericTool(app,t,adminMode);
  }
  function log(toolkitId, action, extra={}){ state.usageLogs.push({id:uid('log'),userId:state.currentUserId||'admin',role:state.currentUserId?'teacher':'admin',toolkitId,action,...extra,createdAt:new Date().toISOString()}); save(); }
  function adminToolBanner(t,adminMode){
    return adminMode ? `<div class="admin-tool-banner"><strong>管理员测试模式</strong><span>你正在直接测试「${t.name}」，不需要购买、不需要付款、不需要申请试用。</span><button class="ghost small" onclick="App.go('admin')">返回后台</button></div>` : '';
  }
  function renderQuestionBank(app,t,adminMode=false){
    app.innerHTML=adminToolBanner(t,adminMode)+`<div class="section-title"><div><h2>${t.name}</h2><p>上传 PDF 后，系统会使用 PDF.js 读取文字；若是扫描图片 PDF，会自动启动 OCR 识别，再分析重点并生成题库。</p></div></div>
    <div class="toolbox pdf-question-tool">
      <div class="pdf-flow">
        <div class="flow-step active">1 上传PDF</div>
        <div class="flow-step">2 PDF.js读取</div>
        <div class="flow-step">3 OCR识别</div>
        <div class="flow-step">4 生成题库</div>
      </div>

      <div class="card soft-card">
        <h3>上传教学 PDF</h3>
        <p class="muted">正式线上版已接入 PDF.js 与 Tesseract OCR。文字型PDF会直接读取；扫描PDF会尝试OCR识别。OCR第一次载入会较慢。</p>
        <div class="field"><label>PDF 档案</label><input id="qbPdfFile" type="file" accept=".pdf,application/pdf" onchange="App.readQuestionPdf(event)"></div>
        <div class="grid three">
          <div class="field"><label>读取模式</label><select id="pdfReadMode">
            <option value="auto">自动：先PDF.js，必要时OCR</option>
            <option value="pdfjs">只用PDF.js文字层</option>
            <option value="ocr">强制OCR扫描识别</option>
          </select></div>
          <div class="field"><label>OCR语言</label><select id="ocrLang">
            <option value="chi_sim+eng">中文简体 + 英文</option>
            <option value="chi_tra+eng">中文繁体 + 英文</option>
            <option value="eng">英文</option>
            <option value="msa+eng">马来文 + 英文</option>
          </select></div>
          <div class="field"><label>OCR页数上限</label><input id="ocrPageLimit" type="number" min="1" max="20" value="6"></div>
        </div>
        <div id="pdfInfo" class="pdf-info muted">尚未上传 PDF</div>
        <div id="pdfProgress" class="pdf-progress hidden"><div id="pdfProgressBar"></div></div>
        <div class="row wrap">
          <button class="primary" onclick="App.forceReadSelectedPdf()">读取 / 重新分析 PDF</button>
          <button class="ghost" onclick="App.clearQuestionPdf()">清除 PDF</button>
        </div>
      </div>

      <div class="grid two">
        <div class="card">
          <h3>PDF 内容分析</h3>
          <div id="pdfAnalysis" class="analysis-box">上传 PDF 后，这里会显示读取摘要、关键词和可能出题重点。</div>
        </div>
        <div class="card">
          <h3>出题条件</h3>
          <div class="grid two">
            <div class="field"><label>科目</label><input id="qbSub" value="综合"></div>
            <div class="field"><label>年级</label><input id="qbGrade" value="小学高年级"></div>
          </div>
          <div class="grid two">
            <div class="field"><label>题目数量</label><input id="qbCount" type="number" min="1" max="50" value="10"></div>
            <div class="field"><label>难度</label><select id="qbLevel"><option>容易</option><option selected>中等</option><option>较难</option></select></div>
          </div>
          <div class="field"><label>题型</label><select id="qbType">
            <option value="mixed">混合题型</option>
            <option value="mcq">选择题</option>
            <option value="tf">是非题</option>
            <option value="blank">填充题</option>
            <option value="short">简答题</option>
          </select></div>
          <div class="field"><label>出题重点 / 范围</label><input id="qbFocus" placeholder="例如：只出定义、原因、步骤、比较题，可留空"></div>
          <button class="primary" onclick="App.generateQB()">根据PDF生成题库</button>
          <button class="ghost" onclick="App.downloadText('pdf-question-bank.txt','qbOut')">下载TXT</button>
        </div>
      </div>

      <div class="card">
        <h3>PDF 读取文字预览</h3>
        <div id="pdfTextPreview" class="pdf-text-preview">尚未读取 PDF。</div>
      </div>

      <div class="card">
        <h3>生成结果</h3>
        <div id="qbOut" class="tool-output"></div>
      </div>
    </div>`;
    window.pdfQuestionData={fileName:'',text:'',keywords:[],summary:'',sections:[],method:''};
    setupPdfJsWorker();
  }

  function setupPdfJsWorker(){
    if(window.pdfjsLib){
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  function setPdfProgress(percent,msg=''){
    const wrap=$('pdfProgress'), bar=$('pdfProgressBar');
    if(wrap) wrap.classList.remove('hidden');
    if(bar) bar.style.width=Math.max(0,Math.min(100,percent))+'%';
    if(msg && $('pdfInfo')) $('pdfInfo').innerHTML=msg;
  }

  function hidePdfProgress(){
    setTimeout(()=>{$('pdfProgress')?.classList.add('hidden');},900);
  }

  function forceReadSelectedPdf(){
    const input=$('qbPdfFile');
    if(!input || !input.files || !input.files[0]) return toast('请先选择 PDF 档案');
    readQuestionPdf({target:input});
  }

  function clearQuestionPdf(){
    if($('qbPdfFile')) $('qbPdfFile').value='';
    window.pdfQuestionData={fileName:'',text:'',keywords:[],summary:'',sections:[],method:''};
    if($('pdfInfo')) $('pdfInfo').textContent='尚未上传 PDF';
    if($('pdfAnalysis')) $('pdfAnalysis').textContent='上传 PDF 后，这里会显示读取摘要、关键词和可能出题重点。';
    if($('pdfTextPreview')) $('pdfTextPreview').textContent='尚未读取 PDF。';
    if($('qbOut')) $('qbOut').textContent='';
    $('pdfProgress')?.classList.add('hidden');
  }

  async function readTextWithPdfJs(buffer){
    if(!window.pdfjsLib) throw new Error('PDF.js 尚未载入，请检查网络或 CDN');
    setupPdfJsWorker();
    const loadingTask=pdfjsLib.getDocument({data:buffer});
    const pdf=await loadingTask.promise;
    let allText='';
    for(let p=1;p<=pdf.numPages;p++){
      setPdfProgress((p/pdf.numPages)*45,`PDF.js 正在读取第 ${p} / ${pdf.numPages} 页...`);
      const page=await pdf.getPage(p);
      const content=await page.getTextContent();
      const pageText=content.items.map(it=>it.str||'').join(' ');
      allText += `\n\n【第${p}页】\n` + pageText;
    }
    return {text:allText.replace(/\s+/g,' ').trim(), pages:pdf.numPages, pdf};
  }

  async function ocrPdfWithTesseract(buffer, pageLimit=6, lang='chi_sim+eng'){
    if(!window.pdfjsLib) throw new Error('PDF.js 尚未载入，无法把PDF转成图片');
    if(!window.Tesseract) throw new Error('Tesseract OCR 尚未载入，请检查网络或 CDN');
    setupPdfJsWorker();
    const pdf=await pdfjsLib.getDocument({data:buffer}).promise;
    const maxPages=Math.min(pdf.numPages, pageLimit);
    let text='';
    for(let p=1;p<=maxPages;p++){
      setPdfProgress(45+(p/maxPages)*50,`OCR 正在识别第 ${p} / ${maxPages} 页，请稍候...`);
      const page=await pdf.getPage(p);
      const viewport=page.getViewport({scale:1.8});
      const canvas=document.createElement('canvas');
      const ctx=canvas.getContext('2d');
      canvas.width=viewport.width;
      canvas.height=viewport.height;
      await page.render({canvasContext:ctx,viewport}).promise;
      const result=await Tesseract.recognize(canvas, lang, {
        logger:m=>{
          if(m.status==='recognizing text'){
            const local=45+((p-1)+(m.progress||0))/maxPages*50;
            setPdfProgress(local,`OCR 第 ${p} 页：${Math.round((m.progress||0)*100)}%`);
          }
        }
      });
      text += `\n\n【OCR第${p}页】\n` + (result.data.text||'');
    }
    return {text:text.replace(/\s+/g,' ').trim(), pages:pdf.numPages, ocrPages:maxPages};
  }

  function splitSections(text){
    const cleaned=(text||'').replace(/\s+/g,' ').trim();
    const sentences=cleaned.split(/[。！？.!?\n]/).map(x=>x.trim()).filter(x=>x.length>8 && !/^\d+$/.test(x));
    if(sentences.length) return sentences.slice(0,30);
    return cleaned.match(/.{1,100}/g)||[];
  }

  function extractKeywords(text){
    const stop='这个 一个 以及 因为 所以 可以 进行 学生 老师 内容 通过 使用 了解 认识 说明 什么 如何 为什么 但是 如果 他们 我们 你们 这里 那里 学习 教学 由于 其中 需要 主要 例如 the and for with this that from are was were have has into about';
    const words=(text.match(/[\u4e00-\u9fa5]{2,8}|[A-Za-z]{4,}/g)||[])
      .map(x=>x.trim())
      .filter(x=>x && !stop.includes(x.toLowerCase()) && !/^\d+$/.test(x));
    const freq={};
    words.forEach(w=>freq[w]=(freq[w]||0)+1);
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,18).map(x=>x[0]);
  }

  function analyzePdfText(fileName,text,method,pages=0){
    const keywords=extractKeywords(text);
    const sections=splitSections(text);
    const summary=sections.slice(0,6).join('。') + (sections.length?'。':'');
    window.pdfQuestionData={fileName,text,keywords,summary,sections,method,pages};

    const readable=text.length>120;
    $('pdfInfo').innerHTML=`已上传：<strong>${fileName}</strong> ｜ 读取方式：<strong>${method}</strong> ｜ 页数：${pages||'-'} ｜ 文字约 <strong>${text.length}</strong> 字`;
    $('pdfAnalysis').innerHTML=`
      <p><strong>档案：</strong>${fileName}</p>
      <p><strong>读取方式：</strong>${method}</p>
      <p><strong>读取状态：</strong>${readable?'已读取 / 识别到 PDF 内容':'读取文字较少，可能是图片品质低或扫描不清楚'}</p>
      <p><strong>关键词：</strong>${keywords.map(k=>`<span class="chip">${k}</span>`).join('') || '<span class="muted">暂时无法取得关键词</span>'}</p>
      <p><strong>可能出题重点：</strong></p>
      <ol>${sections.slice(0,8).map(x=>`<li>${x}</li>`).join('') || '<li>无法分析重点，请换更清楚PDF或增加OCR页数。</li>'}</ol>
      <p><strong>摘要：</strong></p>
      <div class="summary-box">${summary || '无法读取足够文字。'}</div>`;
    $('pdfTextPreview').textContent=text.slice(0,5000) || '无法读取文字。请尝试强制OCR，或上传更清楚的PDF。';
  }

  async function readQuestionPdf(event){
    const file=event.target.files?.[0];
    if(!file) return;
    if(!file.name.toLowerCase().endsWith('.pdf') && file.type!=='application/pdf') return toast('请上传 PDF 档案');

    $('pdfInfo').innerHTML=`正在上传并读取：<strong>${file.name}</strong>（${Math.round(file.size/1024)} KB）`;
    $('pdfAnalysis').innerHTML='正在读取 PDF，请稍候...';
    $('pdfTextPreview').textContent='读取中...';
    setPdfProgress(5,'正在载入 PDF...');

    try{
      const buffer=await file.arrayBuffer();
      const mode=$('pdfReadMode')?.value||'auto';
      const lang=$('ocrLang')?.value||'chi_sim+eng';
      const limit=Math.max(1,Math.min(20,Number($('ocrPageLimit')?.value||6)));

      let finalText='', method='', pages=0;

      if(mode==='ocr'){
        const ocr=await ocrPdfWithTesseract(buffer,limit,lang);
        finalText=ocr.text; method=`OCR扫描识别（${lang}，${ocr.ocrPages}/${ocr.pages}页）`; pages=ocr.pages;
      }else{
        const pdfjs=await readTextWithPdfJs(buffer);
        finalText=pdfjs.text; method='PDF.js文字层读取'; pages=pdfjs.pages;

        if(mode==='auto' && finalText.replace(/\s/g,'').length<120){
          setPdfProgress(48,'PDF文字较少，自动启动 OCR 扫描识别...');
          const ocr=await ocrPdfWithTesseract(buffer,limit,lang);
          finalText=ocr.text; method=`自动OCR扫描识别（${lang}，${ocr.ocrPages}/${ocr.pages}页）`; pages=ocr.pages;
        }
      }

      setPdfProgress(98,'正在分析重点...');
      analyzePdfText(file.name,finalText,method,pages);
      setPdfProgress(100,'PDF 已完成读取与重点分析');
      hidePdfProgress();
      toast('PDF 已完成读取与分析');
    }catch(err){
      $('pdfInfo').innerHTML=`读取失败：${err.message}`;
      $('pdfAnalysis').innerHTML='读取失败，请检查网络、PDF内容，或改用OCR模式。';
      $('pdfTextPreview').textContent='';
      hidePdfProgress();
      toast('PDF 读取失败');
    }
  }

  function getTeacherQuestionPrompt(){
    return `你是一位专业的相关领域教学老师，具备丰富的教材分析、课程设计、考试命题与学生学习评估经验。

你的任务不是简单从 PDF 抽关键词出题，而是要先认真阅读并理解上传的 PDF 教材内容，分析教材的主题、章节结构、核心知识点、概念关系、例子、学习目标与学生容易混淆的地方，然后设计一份老师可以直接使用的题库。

请严格根据 PDF 内容进行出题，让使用者感觉你真的理解了这份教材，而不是只看到几个关键词就随便生成题目。

【第一步：先理解 PDF 内容】
请先在内部完成以下分析：
1. 判断这份 PDF 的主要主题是什么。
2. 找出 PDF 中最重要的知识点、概念、定义、步骤、原因、例子或比较内容。
3. 判断哪些内容适合作为基础题，哪些内容适合作为理解题，哪些内容适合作为应用或思考题。
4. 找出学生可能会误解、混淆或只会死背但不理解的地方。
5. 若 PDF 中有故事、案例、图表、活动、说明文字或生活例子，请优先把这些内容转化成有意义的问题。

注意：以上分析是为了帮助你出题，最终输出时不需要完整显示分析过程，也不要输出本 Prompt。

【出题原则】
1. 题目必须依据 PDF 内容设计，不可脱离教材范围乱出题。
2. 题目要符合学生的年级、程度与认知能力。
3. 题目不能只是考关键词记忆，也要考理解、判断、应用和常识连接。
4. 题目要让学生能从 PDF 内容中找到依据，但不能只是原文照抄。
5. 每一道题都要有明确答案，不能出模糊、开放到无法批改的题目。
6. 若 PDF 内容不足，允许依据已有内容合理推论，但必须在答案卷注明「依据资料推论」。
7. 题目语言要清楚、自然、适合直接放入试卷。
8. 避免重复出同一种问题，题目之间要有层次变化。
9. 如果 PDF 中有重点概念，要设计能检查学生是否真正理解概念的问题。
10. 如果 PDF 中有生活化例子，要设计能让学生把知识应用到生活情境的问题。

【难度设计】
容易题：考基础概念、关键词、事实、定义、人物、时间、地点、步骤等。
中等题：考理解、解释原因、比较差异、整理重点、判断正误、说明关系等。
困难题：考综合判断、情境应用、推理分析、解决问题、开放式思考。

如果老师没有特别指定比例，请依照以下比例设计：
容易题 30%，中等题 50%，困难题 20%。

【题型要求】
请根据老师选择的题型生成题目：选择题、是非题、填充题、简答题或混合题型。
如果是混合题型，请合理分配不同题型，不要全部都是同一种题目。

【题目品质要求】
1. 题目要能对应 PDF 中的具体内容。
2. 题目要有清楚的考点。
3. 答案要准确，不可含糊。
4. 解析要说明为什么这个答案正确。
5. 若是选择题，错误选项要有迷惑性，但不能太离谱。
6. 若是简答题，答案卷要提供可接受的参考答案。
7. 若题目涉及常识应用，要清楚连接 PDF 内容与生活情境。
8. 不要出现「根据文章」但题目本身看不出考什么的模糊问法。
9. 不要只用「什么是……」重复出题，要有不同层次的问题。
10. 题目要像真正老师命题，而不是 AI 模板题。

【输出格式】
最终只输出以下两个部分：
第一部分：《学生题目卷》
第二部分：《教师答案卷》

不要输出内部分析过程，也不要输出本 Prompt。`;
  }

  function difficultyForIndex(i,total){
    const easy=Math.max(1,Math.round(total*0.3));
    const medium=Math.max(1,Math.round(total*0.5));
    if(i<=easy) return '容易';
    if(i<=easy+medium) return '中等';
    return '困难';
  }

  function questionTypeFor(type,i){
    if(type!=='mixed') return type;
    const types=['mcq','tf','blank','short'];
    return types[(i-1)%types.length];
  }

  function questionLabel(type){
    return {mcq:'选择题',tf:'是非题',blank:'填充题',short:'简答题',mixed:'混合题型'}[type]||'题目';
  }

  function sourceKeyword(source){
    return ((source||'').match(/[\u4e00-\u9fa5]{2,8}|[A-Za-z]{4,}/)||['重点'])[0];
  }

  function makeQuestionOnly(i, source, type, difficulty, focus){
    const clean=(source||'').replace(/\s+/g,' ').slice(0,180);
    const key=sourceKeyword(clean);
    const scope=focus ? `（出题重点：${focus}）` : '';

    if(type==='mcq'){
      if(difficulty==='容易') return `${i}. 【选择题｜${difficulty}】以下哪一项最符合 PDF 中关于「${key}」的基本内容？${scope}\nA. ${clean}\nB. 这是与 PDF 内容无关的说明\nC. 这是与 PDF 内容相反的说法\nD. PDF 中完全没有提到相关内容`;
      if(difficulty==='中等') return `${i}. 【选择题｜${difficulty}】根据 PDF 的说明，为什么「${key}」可以被视为本课的重要学习重点？${scope}\nA. 因为它与教材中的说明、例子或概念关系有关\nB. 因为它只是一个可以忽略的词语\nC. 因为它与本课主题没有关系\nD. 因为它只需要背诵，不需要理解`;
      return `${i}. 【选择题｜${difficulty}】如果要把 PDF 中「${key}」的内容应用到实际学习或生活情境，哪一种做法最合理？${scope}\nA. 先理解 PDF 中的重点，再结合具体情境说明或判断\nB. 只记住字面意思，不需要理解原因\nC. 完全脱离 PDF 内容自由发挥\nD. 只看标题，不阅读具体说明`;
    }

    if(type==='tf'){
      if(difficulty==='容易') return `${i}. 【是非题｜${difficulty}】PDF 内容中有提到「${key}」相关概念或重点。`;
      if(difficulty==='中等') return `${i}. 【是非题｜${difficulty}】只要记住「${key}」这个词，就等于完全理解 PDF 中相关内容。`;
      return `${i}. 【是非题｜${difficulty}】理解「${key}」时，需要结合 PDF 中的上下文、例子或说明来判断，不能只看单一词语。`;
    }

    if(type==='blank'){
      if(difficulty==='容易') return `${i}. 【填充题｜${difficulty}】根据 PDF 内容，本题相关的重点关键词是「______」。提示：${clean.slice(0,70)}。`;
      if(difficulty==='中等') return `${i}. 【填充题｜${difficulty}】根据 PDF 内容，「______」与以下说明有关：${clean.slice(0,90)}。`;
      return `${i}. 【填充题｜${difficulty}】请填写最能概括以下 PDF 内容的关键词：「______」。内容提示：${clean.slice(0,100)}。`;
    }

    if(difficulty==='容易') return `${i}. 【简答题｜${difficulty}】请根据 PDF 内容，简单说明「${key}」是什么。${scope}`;
    if(difficulty==='中等') return `${i}. 【简答题｜${difficulty}】请根据 PDF 内容，说明「${key}」为什么是本课需要理解的重点，并写出一个相关说明。${scope}`;
    return `${i}. 【简答题｜${difficulty}】请根据 PDF 内容，结合生活常识或学习情境，说明如何理解或应用「${key}」。${scope}`;
  }

  function makeAnswerOnly(i, source, type, difficulty){
    const clean=(source||'').replace(/\s+/g,' ').slice(0,220);
    const key=sourceKeyword(clean);
    if(type==='mcq'){
      return `${i}. 答案：A\n解析：A项最符合 PDF 中关于「${key}」的内容。依据 PDF 重点：「${clean}」。其他选项不是脱离教材，就是过度简化或与教材内容相反。`;
    }
    if(type==='tf'){
      if(difficulty==='容易') return `${i}. 答案：正确\n解析：PDF 内容中确实出现并说明了「${key}」相关内容，可作为基础理解重点。依据内容：「${clean}」。`;
      if(difficulty==='中等') return `${i}. 答案：错误\n解析：只记住词语不代表真正理解。学生还需要结合 PDF 中的说明、例子或概念关系来理解「${key}」。依据内容：「${clean}」。`;
      return `${i}. 答案：正确\n解析：较高层次的理解需要结合上下文和实际应用，而不只是背关键词。依据内容：「${clean}」。`;
    }
    if(type==='blank'){
      return `${i}. 答案：${key}\n解析：这个关键词来自 PDF 内容，并能概括题目提示中的重点：「${clean}」。`;
    }
    return `${i}. 参考答案：学生应能围绕「${key}」作答，并结合 PDF 内容说明其意思、重要性或应用方式。可接受答案应包含以下重点：${clean}\n解析：这题主要考学生是否真正理解 PDF 内容，而不是只背关键词。\n评分建议：提到关键词1分，能说明意思2分，能结合例子、原因或应用3分。`;
  }

  function cleanQuestionBankOutput(text){
    let out = String(text || '');
    const studentIndex = out.indexOf('《学生题目卷》');
    if(studentIndex >= 0) out = out.slice(studentIndex);

    // Remove any accidental prompt fragments that appear before the real paper title.
    out = out.replace(/^([\s\S]*?)(?=《学生题目卷》)/, '');

    // Remove known internal headings if they somehow remain.
    out = out.replace(/你是一位专业的相关领域教学老师[\s\S]*?(?=《学生题目卷》)/g, '');
    out = out.replace(/【出题原则】[\s\S]*?(?=《学生题目卷》)/g, '');
    out = out.replace(/【输出格式】[\s\S]*?(?=《学生题目卷》)/g, '');
    out = out.replace(/【题目比例】[\s\S]*?(?=《学生题目卷》)/g, '');

    return out.trim();
  }

  function generateQB(){
    const data=window.pdfQuestionData||{text:'',keywords:[],summary:'',sections:[]};
    const sub=$('qbSub')?.value||'综合';
    const grade=$('qbGrade')?.value||'学生';
    const count=Math.max(1, Math.min(50, Number($('qbCount')?.value||10)));
    const selectedLevel=$('qbLevel')?.value||'中等';
    const type=$('qbType')?.value||'mixed';
    const focus=$('qbFocus')?.value.trim()||'';

    if(!data.text || data.text.length<50){
      toast('PDF 内容还没成功读取，请先上传并读取 PDF');
    }

    const sources=(data.sections&&data.sections.length?data.sections:data.keywords&&data.keywords.length?data.keywords:['请先上传可读取文字的PDF']);

    let studentPaper=`《学生题目卷》\n`;
    studentPaper+=`科目：${sub}\n年级：${grade}\n来源PDF：${data.fileName||'尚未成功读取PDF'}\n`;
    studentPaper+=`题型：${$('qbType')?.selectedOptions?.[0]?.textContent||'混合题型'} ｜ 题数：${count}\n`;
    studentPaper+=`难度设计：容易30%，中等50%，困难20%`;
    if(selectedLevel && selectedLevel!=='中等') studentPaper+=`（老师指定整体难度倾向：${selectedLevel}）`;
    if(focus) studentPaper+=`\n出题重点：${focus}`;
    studentPaper+=`\n\n注意：请根据题目作答，学生题目卷不显示答案。\n\n`;

    let answerPaper=`《教师答案卷》\n`;
    answerPaper+=`科目：${sub}\n年级：${grade}\n来源PDF：${data.fileName||'尚未成功读取PDF'}\n`;
    answerPaper+=`读取方式：${data.method||'-'}\n`;
    answerPaper+=`说明：答案卷包含标准答案与简短解析，方便老师批改。\n\n`;

    for(let i=1;i<=count;i++){
      const src=sources[(i-1)%sources.length];
      const qType=questionTypeFor(type,i);
      let difficulty=difficultyForIndex(i,count);
      if(selectedLevel==='容易' && i>Math.ceil(count*0.7)) difficulty='中等';
      if(selectedLevel==='较难' && i>Math.ceil(count*0.4)) difficulty='困难';

      studentPaper+=makeQuestionOnly(i, src, qType, difficulty, focus)+`\n\n`;
      answerPaper+=`【${questionLabel(qType)}｜${difficulty}】\n`+makeAnswerOnly(i, src, qType, difficulty)+`\n\n`;
    }

    const out=`${studentPaper}
==================================================
${answerPaper}`;
    $('qbOut').textContent=cleanQuestionBankOutput(out);
    log('question-bank','generate',{outputCount:count,source:data.fileName?'pdf':'empty'});
  }

  function renderLessonPlanner(app,t,adminMode=false){ app.innerHTML=adminToolBanner(t,adminMode)+`<div class="section-title"><div><h2>${t.name}</h2><p>输入课题，生成一份简易教案。</p></div></div><div class="toolbox"><div class="field"><label>课题</label><input id="lpTopic" value="认识人工智能"></div><div class="field"><label>学生年龄</label><input id="lpAge" value="10-12岁"></div><button class="primary" onclick="App.generateLesson()">生成教案</button><button class="ghost" onclick="App.downloadText('lesson-plan.txt','lpOut')">下载TXT</button><div id="lpOut" class="tool-output"></div></div>`; }
  function generateLesson(){ const topic=$('lpTopic').value, age=$('lpAge').value; const txt=`课题：${topic}\n对象：${age}\n\n教学目标：\n1. 学生能用生活例子说明${topic}。\n2. 学生能完成一个小活动。\n\n课堂流程：\n导入5分钟：用生活问题引起兴趣。\n讲解10分钟：老师用简单例子说明重点。\n活动15分钟：小组完成任务。\n总结5分钟：学生分享学习收获。\n\n老师口播稿：同学们，今天我们用最简单的方法认识「${topic}」。`; $('lpOut').textContent=txt; log('lesson-planner','generate',{outputCount:1}); }
  function renderGame(app,t,adminMode=false){
    app.innerHTML=adminToolBanner(t,adminMode)+`<div class="section-title"><div><h2>${t.name}</h2><p>老师可自订游戏标题、题数、题目内容、版型风格与子版型，并加入背景图、学校 Logo、开始页 / 结束页、全屏播放和背景音乐。</p></div></div>
    <div class="toolbox game-builder">
      <div class="grid two">
        <div class="field"><label>游戏标题</label><input id="gameTitle" value="AI课堂挑战赛" placeholder="例如：三年级成语闯关赛"></div>
        <div class="field"><label>教学主题</label><input id="gameTopic" value="人工智能"></div>
      </div>
      <div class="grid four game-settings-grid">
        <div class="field"><label>游戏类型</label><select id="gameType">
          <option value="quiz">抢答游戏</option>
          <option value="match">配对游戏</option>
          <option value="wheel">转盘游戏</option>
          <option value="quest">闯关游戏</option>
        </select></div>
        <div class="field"><label>出题题数</label><input id="gameCount" type="number" min="1" max="50" value="5"></div>
        <div class="field"><label>抢答组数</label><input id="quizGroupCount" type="number" min="2" max="10" value="2"></div>
        <div class="field"><label>版型风格</label><select id="gameTheme" onchange="App.updateSubthemeOptions()">
          <option value="basic">基本版型</option>
          <option value="cute">可爱版型</option>
          <option value="pro">专业版型</option>
        </select></div>
      </div>
      <div class="grid two">
        <div class="field"><label>子版型</label><select id="gameSubtheme"></select></div>
        <div class="field"><label>内置背景图</label><select id="gameBuiltInBg">
          <option value="auto">依版型自动搭配</option>
          <option value="classroom">教室光影</option>
          <option value="stars">星空学习</option>
          <option value="grid">科技网格</option>
          <option value="pastel">粉彩泡泡</option>
          <option value="nature">清新草地</option>
          <option value="stage">舞台聚光</option>
        </select></div>
      </div>
      <div class="game-upload-grid">
        <div class="field"><label>老师上传背景图</label><input id="gameBgFile" type="file" accept="image/*" onchange="App.previewGameAsset(event,'bg')"><input id="gameBgData" type="hidden"><div id="gameBgPreview" class="asset-preview muted">未上传背景图</div></div>
        <div class="field"><label>加入学校 Logo</label><input id="gameLogoFile" type="file" accept="image/*" onchange="App.previewGameAsset(event,'logo')"><input id="gameLogoData" type="hidden"><div id="gameLogoPreview" class="asset-preview muted">未上传学校 Logo</div></div>
      </div>
      <div class="field"><label>题目 / 答案内容（每行一题，格式：题目|答案）</label><textarea id="gameItems" rows="6">AI是什么意思？|人工智能
AI可以帮老师做什么？|备课
ChatGPT属于什么工具？|对话AI
学生使用AI时要注意什么？|诚信
AI绘图可以用来制作什么？|教学图片
AI生成内容前要给它什么？|清楚指令
使用AI时为什么要检查答案？|避免错误</textarea></div>
      <div class="row">
        <button class="primary" onclick="App.generateGame()">生成可玩网页游戏</button>
        <button class="ghost" onclick="App.downloadGeneratedGame()">下载HTML游戏</button>
      </div>
      <p class="muted">提醒：若题数设为 5，系统会取前 5 行题目。题目和答案之间请用 | 分隔。上传背景图会优先使用；若未上传，则使用内置背景图。生成后可开启 / 关闭背景音乐，也可切换全屏。</p>
      <div id="gameOut" class="game-stage"></div>
    </div>`;
    updateSubthemeOptions();
  }

  function gameThemes(){
    return {
      basic:[{id:'sky',name:'天空教室'},{id:'board',name:'黑板教室'},{id:'mint',name:'清新学习'}],
      cute:[{id:'candy',name:'糖果乐园'},{id:'animal',name:'动物伙伴'},{id:'rainbow',name:'彩虹泡泡'}],
      pro:[{id:'tech',name:'科技蓝光'},{id:'navy',name:'深蓝讲堂'},{id:'gold',name:'金质简报'}]
    };
  }

  function updateSubthemeOptions(){
    const theme=$('gameTheme')?.value||'basic';
    const subSel=$('gameSubtheme'); if(!subSel) return;
    const items=gameThemes()[theme]||[];
    const prev=subSel.value;
    subSel.innerHTML=items.map(x=>`<option value="${x.id}">${x.name}</option>`).join('');
    if(items.some(x=>x.id===prev)) subSel.value=prev;
  }

  function previewGameAsset(event,type){
    const file=event.target.files?.[0];
    const input=type==='bg' ? $('gameBgData') : $('gameLogoData');
    const box=type==='bg' ? $('gameBgPreview') : $('gameLogoPreview');
    if(!file){ input.value=''; box.innerHTML='未上传'; box.className='asset-preview muted'; return; }
    const reader=new FileReader();
    reader.onload=()=>{
      input.value=reader.result;
      box.className='asset-preview has-image';
      box.innerHTML=`<img src="${reader.result}" alt="${type==='bg'?'背景图':'学校Logo'}预览">`;
    };
    reader.readAsDataURL(file);
  }

  function parseGameItems(){
    const raw=($('gameItems')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean);
    const count=Math.max(1, Math.min(50, Number($('gameCount')?.value||raw.length||1)));
    return raw.slice(0,count).map((line,i)=>{
      const parts=line.split('|').map(x=>x.trim());
      return {q:parts[0]||`题目${i+1}`, a:parts[1]||parts[0]||`答案${i+1}`, done:false};
    });
  }

  function builtInBackground(value, theme, subtheme){
    const picked=value&&value!=='auto' ? value : (
      theme==='cute' ? 'pastel' : theme==='pro' ? 'grid' : subtheme==='board' ? 'classroom' : 'stars'
    );
    const map={
      classroom:"linear-gradient(135deg,rgba(255,255,255,.72),rgba(219,234,254,.78)),radial-gradient(circle at 15% 20%,rgba(59,130,246,.25),transparent 25%),linear-gradient(90deg,rgba(30,64,175,.09) 1px,transparent 1px),linear-gradient(rgba(30,64,175,.09) 1px,transparent 1px)",
      stars:"radial-gradient(circle at 20% 20%,rgba(255,255,255,.95) 0 2px,transparent 3px),radial-gradient(circle at 80% 30%,rgba(255,255,255,.85) 0 2px,transparent 3px),linear-gradient(135deg,#dbeafe,#f8fafc,#e0f2fe)",
      grid:"linear-gradient(135deg,rgba(15,23,42,.96),rgba(30,64,175,.88)),linear-gradient(90deg,rgba(56,189,248,.18) 1px,transparent 1px),linear-gradient(rgba(56,189,248,.18) 1px,transparent 1px)",
      pastel:"radial-gradient(circle at 15% 25%,rgba(244,114,182,.38),transparent 24%),radial-gradient(circle at 82% 20%,rgba(253,224,71,.38),transparent 22%),radial-gradient(circle at 65% 82%,rgba(147,197,253,.42),transparent 25%),linear-gradient(135deg,#fff1f2,#fae8ff)",
      nature:"radial-gradient(circle at 20% 20%,rgba(134,239,172,.36),transparent 24%),linear-gradient(135deg,#ecfccb,#dcfce7,#e0f2fe)",
      stage:"radial-gradient(circle at 50% 0%,rgba(255,255,255,.62),transparent 28%),linear-gradient(135deg,#111827,#7f1d1d,#1e3a8a)"
    };
    return {key:picked, css:map[picked]||map.stars};
  }

  function gameMeta(){
    const title=($('gameTitle')?.value||'课堂游戏').trim();
    const topic=($('gameTopic')?.value||'课堂主题').trim();
    const theme=($('gameTheme')?.value||'basic').trim();
    const subtheme=($('gameSubtheme')?.value||(gameThemes()[theme]?.[0]?.id)||'sky').trim();
    const themeNames={basic:'基本版型', cute:'可爱版型', pro:'专业版型'};
    const subName=(gameThemes()[theme]||[]).find(x=>x.id===subtheme)?.name || subtheme;
    const builtBg=builtInBackground($('gameBuiltInBg')?.value||'auto', theme, subtheme);
    return {
      title, topic, theme, subtheme,
      themeName:themeNames[theme]||'基本版型',
      subthemeName:subName,
      bgData:$('gameBgData')?.value||'',
      builtInBgKey:builtBg.key,
      builtInBgCss:builtBg.css,
      logoData:$('gameLogoData')?.value||'',
      quizGroupCount:Math.max(2, Math.min(10, Number($('quizGroupCount')?.value||2)))
    };
  }

  function buildGameShell(meta, intro, inner){
    const bgStyle=meta.bgData ? `style="--custom-game-bg:url('${meta.bgData}')"` : '';
    const logoStart=meta.logoData ? `<img class="school-logo start-logo" src="${meta.logoData}" alt="学校Logo">` : '';
    const logoPlay=meta.logoData ? `<img class="school-logo" src="${meta.logoData}" alt="学校Logo">` : '';
    return `<div id="gameShell" class="game-theme-shell theme-${meta.theme} sub-${meta.subtheme} ${meta.bgData?'has-custom-bg':''}" ${bgStyle}>
      <div class="game-topbar">
        <div class="theme-mini-tags"><span>${meta.themeName}</span><span>${meta.subthemeName}</span></div>
        <div class="row compact"><button class="soft" id="musicToggleBtn" onclick="App.toggleThemeMusic()">开启音乐</button><button class="ghost" onclick="App.enterGameFullscreen()">全屏播放</button></div>
      </div>
      <div id="gameStartScreen" class="game-screen start-screen">
        ${logoStart}
        <div class="theme-tag">${meta.themeName} · ${meta.subthemeName}</div>
        <h1>${meta.title}</h1>
        <p>主题：${meta.topic}</p>
        <p class="muted">${intro}</p>
        <div class="row center wrap"><button class="primary" onclick="App.startGeneratedGame()">开始游戏</button><button class="ghost" onclick="App.enterGameFullscreen()">全屏播放</button><button class="soft" onclick="App.toggleThemeMusic()">开启 / 关闭音乐</button></div>
      </div>
      <div id="gamePlayArea" class="game-play hidden">
        <div class="theme-hero">
          <div class="hero-main">${logoPlay}<div><div class="theme-tag">${meta.themeName} · ${meta.subthemeName}</div><h2>${meta.title}</h2><p>主题：${meta.topic}</p></div></div>
          <div class="row compact wrap"><button class="ghost" onclick="App.toggleThemeMusic()">音乐开 / 关</button><button class="ghost" onclick="App.enterGameFullscreen()">全屏</button><button class="danger" onclick="App.finishCurrentGame()">结束游戏</button></div>
        </div>
        <div class="play-card">${inner}</div>
      </div>
      <div id="gameEndScreen" class="game-screen end-screen hidden"></div>
    </div>`;
  }

  function generateGame(){
    const items=parseGameItems();
    if(!items.length) return toast('请先输入至少一题');
    const meta={...gameMeta(), type:$('gameType').value, items};
    window.currentGeneratedGame=meta;
    stopThemeMusic();
    if(meta.type==='quiz') renderQuizGame(meta);
    if(meta.type==='match') renderMatchGame(meta);
    if(meta.type==='wheel') renderWheelGame(meta);
    if(meta.type==='quest') renderQuestGame(meta);
    log('classroom-game','generate',{outputCount:items.length,gameType:meta.type,theme:meta.theme,subtheme:meta.subtheme});
  }

  function startGeneratedGame(){
    $('gameStartScreen')?.classList.add('hidden');
    $('gamePlayArea')?.classList.remove('hidden');
  }

  function replayCurrentGame(){
    stopThemeMusic();
    generateGame();
  }

  function enterGameFullscreen(){
    const el=$('gameShell'); if(!el) return;
    if(document.fullscreenElement){ document.exitFullscreen?.(); }
    else if(el.requestFullscreen) el.requestFullscreen();
  }

  function musicSequence(theme,subtheme){
    const seq={
      basic:{sky:[523.25,659.25,783.99,659.25], board:[392,523.25,587.33,523.25], mint:[440,493.88,587.33,659.25]},
      cute:{candy:[659.25,783.99,880,783.99], animal:[523.25,587.33,659.25,587.33], rainbow:[698.46,783.99,880,987.77]},
      pro:{tech:[392,493.88,587.33,739.99], navy:[329.63,392,493.88,587.33], gold:[440,554.37,659.25,880]}
    };
    return (seq[theme] && seq[theme][subtheme]) || [523.25,659.25,783.99,659.25];
  }

  function playTone(ctx,freq,duration,volume=0.04){
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type='sine';
    osc.frequency.value=freq;
    gain.gain.setValueAtTime(volume,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime+duration);
  }

  function updateMusicButtons(){
    const on=!!window.gameMusicActive;
    document.querySelectorAll('#musicToggleBtn').forEach(b=>b.textContent=on?'关闭音乐':'开启音乐');
  }

  function startThemeMusic(){
    const meta=window.currentGeneratedGame; if(!meta) return;
    stopThemeMusic();
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return toast('浏览器不支持音乐播放');
    const ctx=new AC();
    const notes=musicSequence(meta.theme,meta.subtheme);
    let idx=0;
    window.gameMusicCtx=ctx;
    window.gameMusicTimer=setInterval(()=>{ playTone(ctx, notes[idx % notes.length], 0.42, meta.theme==='pro'?0.028:0.04); idx++; }, 620);
    window.gameMusicActive=true;
    updateMusicButtons();
  }

  function stopThemeMusic(){
    if(window.gameMusicTimer){ clearInterval(window.gameMusicTimer); window.gameMusicTimer=null; }
    if(window.gameMusicCtx){ try{ window.gameMusicCtx.close(); }catch(e){} window.gameMusicCtx=null; }
    window.gameMusicActive=false;
    updateMusicButtons();
  }

  function toggleThemeMusic(){
    if(window.gameMusicActive) stopThemeMusic();
    else startThemeMusic();
  }

  function finishCurrentGame(customText=''){
    const meta=window.currentGeneratedGame; if(!meta) return;
    $('gamePlayArea')?.classList.add('hidden');
    const end=$('gameEndScreen'); if(!end) return;
    let summary='';
    if(meta.type==='quiz' && window.quizState) summary=window.quizState.groups.map(g=>`${g}组得分：${window.quizState.scores[g]||0}`).join(' ｜ ');
    if(meta.type==='match' && window.matchState) summary=`完成配对：${window.matchState.done} / ${window.matchState.total}`;
    if(meta.type==='wheel' && window.wheelState){
      const cur=window.wheelState.current;
      summary=cur===undefined?'本次尚未抽题':`最后抽中的题目：${window.wheelState.items[cur].q}`;
    }
    if(meta.type==='quest' && window.questState) summary=`已闯到第 ${Math.min(window.questState.index+1, meta.items.length)} 关 / 共 ${meta.items.length} 关`;
    end.classList.remove('hidden');
    const endTime=new Date().toLocaleString();
    end.innerHTML=`${meta.logoData?`<img class="school-logo end-logo" src="${meta.logoData}" alt="学校Logo">`:''}<div class="theme-tag">游戏结束</div><h2>${meta.title}</h2><p>${customText || '本次游戏已结束，可重新开始。'}</p><p class="end-summary">${summary}</p><p class="end-time">游戏结束时间：${endTime}</p><div class="row center wrap"><button class="primary" onclick="App.replayCurrentGame()">再玩一次</button><button class="ghost" onclick="App.toggleThemeMusic()">开启 / 关闭音乐</button></div>`;
  }

  function renderQuizGame(meta){
    const groupCount=meta.quizGroupCount||2;
    const groups=Array.from({length:groupCount},(_,i)=>String.fromCharCode(65+i));
    const scoreBoard=groups.map(g=>`<span>${g}组 <b id="score${g}">0</b></span>`).join('');
    const scoreButtons=groups.map(g=>`<button onclick="App.quizScore('${g}')">${g}组答对 +10</button>`).join('');
    const inner=`<div class="game-header"><div><h3>${meta.title}</h3><p>老师点击「下一题」，学生举手 / 抢答。答对即可加分。当前共 ${groupCount} 组。</p></div><div class="score-board">${scoreBoard}</div></div>
      <div id="quizQuestion" class="big-question">${meta.items[0]?.q||'请先输入题目'}</div>
      <div id="quizAnswer" class="answer-box hidden">答案：${meta.items[0]?.a||''}</div>
      <div class="row wrap">
        ${scoreButtons}
        <button class="ghost" onclick="App.quizShowAnswer()">显示答案</button>
        <button class="primary" onclick="App.quizNext()">下一题</button>
      </div>
      <p class="muted">第 <span id="quizIndex">1</span> / ${meta.items.length} 题</p>`;
    $('gameOut').innerHTML=buildGameShell(meta,'适合课堂分组抢答挑战，也可投影到大屏幕使用。',inner);
    const scores={}; groups.forEach(g=>scores[g]=0);
    window.quizState={items:meta.items,index:0,scores,groups};
  }

  function quizScore(team){
    const st=window.quizState; if(!st) return;
    st.scores[team]=(st.scores[team]||0)+10;
    const el=$('score'+team);
    if(el) el.textContent=st.scores[team];
  }
  function quizShowAnswer(){ $('quizAnswer')?.classList.remove('hidden'); }
  function quizNext(){
    const st=window.quizState; if(!st||!st.items.length) return;
    st.index=(st.index+1)%st.items.length;
    $('quizQuestion').textContent=st.items[st.index].q;
    $('quizAnswer').textContent='答案：'+st.items[st.index].a;
    $('quizAnswer').classList.add('hidden');
    $('quizIndex').textContent=st.index+1;
  }

  function renderMatchGame(meta){
    const left=meta.items.map((it,i)=>`<button class="match-card" data-side="q" data-i="${i}" onclick="App.matchPick(this)">${it.q}</button>`).join('');
    const shuffled=[...meta.items].map((it,i)=>({text:it.a,i})).sort(()=>Math.random()-.5);
    const right=shuffled.map(x=>`<button class="match-card" data-side="a" data-i="${x.i}" onclick="App.matchPick(this)">${x.text}</button>`).join('');
    const inner=`<div class="game-header"><div><h3>${meta.title}</h3><p>点击左边题目，再点击右边答案。配对正确会变绿色。</p></div><div class="score-board"><span>完成 <b id="matchScore">0</b> / ${meta.items.length}</span></div></div><div class="match-board"><div>${left}</div><div>${right}</div></div>`;
    $('gameOut').innerHTML=buildGameShell(meta,'适合课堂复习、词语配对、概念与答案连线。',inner);
    window.matchState={first:null,done:0,total:meta.items.length};
  }

  function matchPick(btn){
    const st=window.matchState; if(!st||btn.classList.contains('matched')) return;
    if(!st.first){ st.first=btn; btn.classList.add('selected'); return; }
    if(st.first===btn){ btn.classList.remove('selected'); st.first=null; return; }
    const ok=st.first.dataset.i===btn.dataset.i && st.first.dataset.side!==btn.dataset.side;
    if(ok){
      st.first.classList.add('matched'); btn.classList.add('matched'); st.first.classList.remove('selected'); st.done++; $('matchScore').textContent=st.done; st.first=null;
      if(st.done>=st.total) setTimeout(()=>finishCurrentGame('恭喜，全部配对完成！'), 500);
    }else{
      btn.classList.add('wrong');
      setTimeout(()=>{ st.first.classList.remove('selected'); btn.classList.remove('wrong'); st.first=null; }, 550);
    }
  }

  function renderWheelGame(meta){
    const sectors=meta.items.map(it=>`<li>${it.q}</li>`).join('');
    const inner=`<div class="game-header"><div><h3>${meta.title}</h3><p>点击转盘抽题，适合课堂随机点题、分组挑战。</p></div></div>
      <div class="wheel-wrap"><div id="wheel" class="wheel">转</div><div><h3>题库</h3><ol>${sectors}</ol></div></div>
      <div id="wheelResult" class="big-question small">点击开始转盘</div>
      <div id="wheelAnswer" class="answer-box hidden"></div>
      <div class="row wrap"><button class="primary" onclick="App.spinWheel()">开始转盘</button><button class="ghost" onclick="App.showWheelAnswer()">显示答案</button></div>`;
    $('gameOut').innerHTML=buildGameShell(meta,'适合随机抽题、幸运轮盘、课堂点名问答。',inner);
    window.wheelState={items:meta.items,angle:0,current:undefined};
  }

  function spinWheel(){
    const st=window.wheelState; if(!st||!st.items.length) return;
    const idx=Math.floor(Math.random()*st.items.length);
    st.current=idx; st.angle += 720 + idx*37 + Math.floor(Math.random()*60);
    $('wheel').style.transform=`rotate(${st.angle}deg)`;
    $('wheelAnswer').classList.add('hidden'); $('wheelAnswer').textContent='';
    setTimeout(()=>{ $('wheelResult').textContent=`抽中题目：${st.items[idx].q}`; }, 700);
  }
  function showWheelAnswer(){
    const st=window.wheelState; if(!st||st.current===undefined) return toast('请先转盘抽题');
    $('wheelAnswer').textContent='答案：'+st.items[st.current].a; $('wheelAnswer').classList.remove('hidden');
  }

  function renderQuestGame(meta){
    const inner=`<div class="game-header"><div><h3>${meta.title}</h3><p>学生逐关回答，答对才能进入下一关。</p></div><div class="score-board"><span>关卡 <b id="questLevel">1</b> / ${meta.items.length}</span></div></div>
      <div class="quest-map">${meta.items.map((_,i)=>`<div class="quest-node ${i===0?'active':''}" id="node${i}">${i+1}</div>`).join('')}</div>
      <div id="questQuestion" class="big-question">${meta.items[0]?.q||'请先输入题目'}</div>
      <div class="field"><label>输入答案</label><input id="questAnswer" placeholder="输入答案后点击检查"></div>
      <div class="row wrap"><button class="primary" onclick="App.checkQuest()">检查答案</button><button class="ghost" onclick="App.showQuestAnswer()">显示答案</button></div>
      <div id="questMsg" class="answer-box hidden"></div>`;
    $('gameOut').innerHTML=buildGameShell(meta,'适合闯关学习、复习挑战、课堂游戏化任务。',inner);
    window.questState={items:meta.items,index:0};
  }

  function checkQuest(){
    const st=window.questState; if(!st||!st.items.length) return;
    const ans=($('questAnswer').value||'').trim().toLowerCase();
    const correct=(st.items[st.index].a||'').trim().toLowerCase();
    const msg=$('questMsg'); msg.classList.remove('hidden');
    if(ans && (correct.includes(ans)||ans.includes(correct))){
      msg.textContent='答对了！进入下一关。';
      $('node'+st.index)?.classList.add('passed');
      st.index++;
      if(st.index>=st.items.length){ finishCurrentGame('恭喜完成全部关卡！'); return; }
      $('node'+st.index)?.classList.add('active');
      $('questLevel').textContent=st.index+1;
      $('questQuestion').textContent=st.items[st.index].q;
      $('questAnswer').value='';
    }else msg.textContent='还不正确，再试一次。';
  }
  function showQuestAnswer(){
    const st=window.questState; if(!st||!st.items.length) return;
    const msg=$('questMsg'); msg.classList.remove('hidden'); msg.textContent='答案：'+st.items[st.index].a;
  }

  function downloadGeneratedGame(){
    const g=window.currentGeneratedGame; if(!g) return toast('请先生成游戏');
    const heroText = g.theme==='pro' ? '#fff' : '#0f172a';
    const bgCss=g.bgData ? `linear-gradient(rgba(255,255,255,.16),rgba(255,255,255,.16)),url('${g.bgData}')` : (g.builtInBgCss||'linear-gradient(135deg,#f8fafc,#e2e8f0)');
    const backgroundStyle = `background-image:${bgCss};background-size:cover;background-position:center;`;
    const html=`<!doctype html><html lang="zh-Hans"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${g.title}</title><style>
      body{font-family:Arial,'Microsoft YaHei',sans-serif;background:#f8fafc;padding:24px;margin:0;color:#0f172a}
      .shell{max-width:980px;margin:auto;border-radius:28px;padding:18px;box-shadow:0 20px 50px rgba(15,23,42,.16);${backgroundStyle}}
      .hero{background:${g.theme==='basic'?'linear-gradient(135deg,#e0f2fe,#dbeafe)':g.theme==='cute'?'linear-gradient(135deg,#fbcfe8,#fde68a,#bfdbfe)':'linear-gradient(135deg,#111827,#1d4ed8)'};border-radius:22px;padding:22px;color:${heroText}}
      .tag{display:inline-block;background:rgba(255,255,255,.75);padding:6px 12px;border-radius:999px;font-weight:800;margin-bottom:8px}
      .logo{max-height:72px;max-width:72px;border-radius:16px;background:white;padding:6px;margin-bottom:10px}
      .card{margin-top:16px;background:rgba(255,255,255,.95);border-radius:22px;padding:22px}
      .chip{display:inline-block;background:#eef2ff;padding:8px 12px;border-radius:999px;margin:0 8px 8px 0;font-weight:700}
      pre{white-space:pre-wrap;background:#0f172a;color:white;padding:18px;border-radius:14px;line-height:1.6}
    </style></head><body><div class="shell"><div class="hero">${g.logoData?`<img class="logo" src="${g.logoData}" alt="学校Logo">`:''}<div class="tag">${g.themeName} · ${g.subthemeName}</div><h1>${g.title}</h1><p>主题：${g.topic}</p></div><div class="card"><p>这是由阿虎老师AI工具包生成的 HTML 游戏资料页。正式版可继续扩充成完整独立互动游戏。</p><div>${g.items.map((x,i)=>`<span class="chip">${i+1}. ${x.q}</span>`).join('')}</div><pre>${g.items.map((x,i)=>`${i+1}. ${x.q}｜${x.a}`).join('\n')}</pre></div></div></body></html>`;
    const blob=new Blob([html],{type:'text/html'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${g.title}-课堂游戏.html`; a.click();
    log('classroom-game','download',{downloadCount:1,theme:g.theme,subtheme:g.subtheme});
  }

  function renderImageSplitter(app,t,adminMode=false){
    app.innerHTML=adminToolBanner(t,adminMode)+`<div class="section-title"><div><h2>${t.name}</h2><p>上传图片后，系统会依照选择的切割方式，直接切成多张小图给老师预览与下载。</p></div></div>
    <div class="toolbox splitter-tool">
      <div class="card soft-card">
        <h3>上传图片并选择切割方式</h3>
        <div class="grid three">
          <div class="field"><label>上传图片</label><input id="splitImageFile" type="file" accept="image/*" onchange="App.loadSplitImage(event)"></div>
          <div class="field"><label>切割方式</label><select id="splitMode" onchange="App.generateImageSlices()">
            <option value="1x2">1 × 2</option>
            <option value="2x1">2 × 1</option>
            <option value="2x2" selected>2 × 2</option>
            <option value="3x1">3 × 1</option>
            <option value="1x3">1 × 3</option>
            <option value="3x2">3 × 2</option>
            <option value="2x3">2 × 3</option>
            <option value="3x3">3 × 3</option>
            <option value="4x4">4 × 4</option>
          </select></div>
          <div class="field"><label>输出格式</label><select id="splitFormat" onchange="App.generateImageSlices()">
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
          </select></div>
        </div>
        <div class="row wrap">
          <button class="primary" onclick="App.generateImageSlices()">直接切图预览</button>
          <button class="ghost" onclick="App.downloadAllSlicesZip()">下载全部ZIP</button>
          <button class="soft" onclick="App.resetSplitter()">重新上传</button>
        </div>
        <div id="splitInfo" class="pdf-info muted">尚未上传图片。</div>
      </div>

      <div class="grid two">
        <div class="card">
          <h3>原图</h3>
          <div class="split-original-wrap"><canvas id="splitOriginalCanvas"></canvas></div>
        </div>
        <div class="card">
          <h3>切图结果</h3>
          <div id="splitPreview" class="split-preview-empty">切图后会显示在这里。</div>
        </div>
      </div>
    </div>`;
    window.splitImage=null;
    window.splitSlices=[];
    window.splitFileName='image';
  }

  function loadSplitImage(event){
    const file=event.target.files?.[0];
    if(!file) return;
    const img=new Image();
    img.onload=()=>{
      window.splitImage=img;
      window.splitFileName=(file.name||'image').replace(/\.[^.]+$/,'');
      const canvas=$('splitOriginalCanvas');
      const ctx=canvas.getContext('2d');
      const maxW=720;
      const scale=Math.min(1,maxW/img.width);
      canvas.width=Math.round(img.width*scale);
      canvas.height=Math.round(img.height*scale);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      $('splitInfo').innerHTML=`已载入：<strong>${file.name}</strong> ｜ 原图 ${img.width} × ${img.height}`;
      generateImageSlices();
    };
    img.src=URL.createObjectURL(file);
  }

  function parseSplitMode(){
    const [cols,rows]=($('splitMode')?.value||'2x2').split('x').map(Number);
    return {cols:cols||2, rows:rows||2};
  }

  function generateImageSlices(){
    const img=window.splitImage;
    if(!img){
      if($('splitPreview')) $('splitPreview').innerHTML='<div class="split-preview-empty">请先上传图片。</div>';
      return;
    }
    const {cols,rows}=parseSplitMode();
    const format=$('splitFormat')?.value||'png';
    const mime=format==='jpeg'?'image/jpeg':'image/png';
    const sourceW=img.width, sourceH=img.height;
    const tileW=Math.floor(sourceW/cols);
    const tileH=Math.floor(sourceH/rows);
    const slices=[];
    let html=`<div class="split-grid" style="grid-template-columns:repeat(${cols},minmax(80px,1fr))">`;
    let index=1;
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const sx=c*tileW, sy=r*tileH;
        const sw=(c===cols-1)?sourceW-sx:tileW;
        const sh=(r===rows-1)?sourceH-sy:tileH;
        const canvas=document.createElement('canvas');
        canvas.width=sw; canvas.height=sh;
        canvas.getContext('2d').drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
        const dataUrl=canvas.toDataURL(mime,0.92);
        const filename=`${window.splitFileName}_切图_${String(index).padStart(2,'0')}.${format==='jpeg'?'jpg':'png'}`;
        slices.push({index,filename,dataUrl,width:sw,height:sh});
        html+=`<div class="slice-card">
          <img src="${dataUrl}" alt="切图${index}">
          <div class="slice-meta"><strong>${index}</strong><span>${sw}×${sh}</span></div>
          <button class="ghost tiny" onclick="App.downloadSlice(${index-1})">下载这张</button>
        </div>`;
        index++;
      }
    }
    html+='</div>';
    window.splitSlices=slices;
    $('splitPreview').innerHTML=html;
    $('splitInfo').innerHTML=`已切成 <strong>${cols} × ${rows}</strong>，共 <strong>${slices.length}</strong> 张小图。`;
    log('image-splitter','split',{outputCount:slices.length});
  }

  function dataUrlToBytes(dataUrl){
    const bin=atob(dataUrl.split(',')[1]);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    return bytes;
  }

  function downloadSlice(i){
    const slice=window.splitSlices?.[i];
    if(!slice) return toast('请先切图');
    const a=document.createElement('a');
    a.href=slice.dataUrl; a.download=slice.filename; a.click();
    log('image-splitter','download-one',{downloadCount:1});
  }

  function makeZipStore(files){
    const encoder=new TextEncoder();
    let offset=0, chunks=[], central=[];
    const u16=n=>[n&255,(n>>8)&255], u32=n=>[n&255,(n>>8)&255,(n>>16)&255,(n>>24)&255];
    function crc32(bytes){let c=~0;for(let i=0;i<bytes.length;i++){c^=bytes[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
    files.forEach(f=>{
      const nameBytes=encoder.encode(f.name), data=f.bytes, crc=crc32(data);
      const local=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(nameBytes.length),...u16(0)]);
      chunks.push(local,nameBytes,data);
      central.push({nameBytes,crc,size:data.length,offset});
      offset+=local.length+nameBytes.length+data.length;
    });
    let centralSize=0;
    central.forEach(c=>{
      const h=new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(c.crc),...u32(c.size),...u32(c.size),...u16(c.nameBytes.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(c.offset)]);
      chunks.push(h,c.nameBytes); centralSize+=h.length+c.nameBytes.length;
    });
    chunks.push(new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(central.length),...u16(central.length),...u32(centralSize),...u32(offset),...u16(0)]));
    return new Blob(chunks,{type:'application/zip'});
  }

  function downloadAllSlicesZip(){
    const slices=window.splitSlices||[];
    if(!slices.length) return toast('请先切图');
    const files=slices.map(s=>({name:s.filename,bytes:dataUrlToBytes(s.dataUrl)}));
    const blob=makeZipStore(files);
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`${window.splitFileName}_切图.zip`;
    a.click();
    log('image-splitter','download-zip',{downloadCount:slices.length});
  }

  function resetSplitter(){
    window.splitImage=null; window.splitSlices=[]; window.splitFileName='image';
    if($('splitImageFile')) $('splitImageFile').value='';
    const c=$('splitOriginalCanvas');
    if(c){ const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); c.width=0; c.height=0; }
    if($('splitPreview')) $('splitPreview').innerHTML='<div class="split-preview-empty">切图后会显示在这里。</div>';
    if($('splitInfo')) $('splitInfo').textContent='尚未上传图片。';
  }

  function renderGenericTool(app,t,adminMode=false){ app.innerHTML=adminToolBanner(t,adminMode)+`<div class="card"><h2>${t.name}</h2><p>${t.desc}</p><div class="toolbox"><p>这个工具的操作界面会在下一版细化。当前已可测试订购、开通与使用记录。</p><button onclick="App.log('${t.id}','open')">记录一次使用</button></div></div>`; }
  function downloadText(filename,outId){ const text=$(outId)?.textContent||''; if(!text) return toast('请先生成内容'); const blob=new Blob([text],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); log(outId.includes('qb')?'question-bank':'lesson-planner','download',{downloadCount:1}); }

  function renderAdmin(app){
    if(!state.adminAuthed){ app.innerHTML=`<div class="card admin-login"><h2>后台登入</h2><p class="muted">测试密码：admin123</p><div class="field"><label>后台密码</label><input id="adminPass" type="password"></div><button class="primary" onclick="App.adminLogin()">登入后台</button></div>`; return; }
    const paid=state.orders.filter(o=>o.paymentStatus==='已付款').length, pending=state.orders.filter(o=>o.paymentStatus==='待付款').length, trialPending=state.trialRequests.filter(r=>r.status==='待审核').length, sales=state.orders.filter(o=>o.paymentStatus==='已付款').reduce((s,o)=>s+o.amount,0);
    app.innerHTML=`<div class="section-title"><div><h2>后台管理</h2><p>电脑版看总览更舒服；手机版会自动改成卡片式订单，方便临时确认付款。</p></div><button class="ghost" onclick="App.adminLogout()">退出后台</button></div>
      <div class="grid admin-stats"><div class="card stat"><span class="muted">注册老师</span><strong>${state.users.length}</strong></div><div class="card stat"><span class="muted">待审核试用</span><strong>${trialPending}</strong></div><div class="card stat"><span class="muted">待付款订单</span><strong>${pending}</strong></div><div class="card stat"><span class="muted">已付款订单</span><strong>${paid}</strong></div><div class="card stat"><span class="muted">销售额</span><strong>${money(sales)}</strong></div><div class="card stat"><span class="muted">已开通工具包</span><strong>${state.userToolkits.length}</strong></div><div class="card stat"><span class="muted">使用记录</span><strong>${state.usageLogs.length}</strong></div></div>
      <div class="tabs"><button onclick="App.adminTab('trials')">试用审核</button><button onclick="App.adminTab('orders')">订单管理</button><button onclick="App.adminTab('users')">老师管理</button><button onclick="App.adminTab('tools')">工具包管理</button><button onclick="App.adminTab('notifications')">后台通知</button><button onclick="App.adminTab('usage')">使用数据</button></div><div id="adminBody"></div>`;
    adminTab(state.adminCurrentTab||'trials');
  }
  function adminLogin(){
    const input=$('adminPass') || $('adminPwd') || $('adminPassword');
    const pwd=(input?.value||'').trim();
    if(pwd===ADMIN_PASSWORD || pwd==='admin123'){
      state.adminAuthed=true;
      localStorage.setItem('teacher_ai_toolkit_admin_authed','yes');
      save();
      toast('后台登入成功');
      go('admin');
    }else{
      toast('后台密码错误');
    }
  }
  function adminLogout(){
    state.adminAuthed=false;
    localStorage.removeItem('teacher_ai_toolkit_admin_authed');
    save();
    go('admin');
  }
  function adminTab(tab){
    state.adminCurrentTab=tab;
    save();
    document.querySelectorAll('.tabs button').forEach(b=>{
      const isActive = b.getAttribute('onclick')?.includes(`'${tab}'`);
      b.classList.toggle('active', !!isActive);
    });
    const el=$('adminBody');
    if(tab==='trials') el.innerHTML=`<h2>试用申请审核</h2>${adminTrialsTable()}`;
    if(tab==='orders') el.innerHTML=`<h2>订单管理</h2>${adminOrdersTable()}`;
    if(tab==='users') el.innerHTML=`<h2>老师会员</h2>${adminUsersTable()}`;
    if(tab==='tools') el.innerHTML=`<h2>工具包管理</h2>${adminToolsPanel()}`;
    if(tab==='notifications') el.innerHTML=`<h2>后台即时通知</h2>${adminNotificationsHtml()}`;
    if(tab==='usage') el.innerHTML=`<h2>使用数据分析</h2>${adminUsage()}`;
  }
  function adminTrialsTable(){
    if(!state.trialRequests.length)return '<div class="card"><p>暂无试用申请。</p></div>';
    return `<table class="table"><thead><tr><th>申请老师</th><th>工具包</th><th>联络电话</th><th>申请时间</th><th>状态</th><th>操作</th></tr></thead><tbody>${state.trialRequests.slice().reverse().map(r=>{const u=state.users.find(x=>x.id===r.userId),t=state.toolkits.find(x=>x.id===r.toolkitId);return `<tr><td data-label="申请老师">${u?.name}<br><span class="muted">${u?.email}</span></td><td data-label="工具包">${t?.name}</td><td data-label="联络电话">${u?.phone||'-'}</td><td data-label="申请时间">${new Date(r.createdAt).toLocaleString()}</td><td data-label="状态">${status(r.status)}</td><td data-label="操作"><button class="small primary" onclick="App.approveTrial('${r.id}')">批准并开通试用</button> <button class="small danger" onclick="App.rejectTrial('${r.id}')">拒绝</button></td></tr>`}).join('')}</tbody></table>`;
  }
  function approveTrial(id){
    const r=state.trialRequests.find(x=>x.id===id); if(!r)return;
    const u=state.users.find(x=>x.id===r.userId), t=state.toolkits.find(x=>x.id===r.toolkitId);
    r.status='已开通'; r.adminNote='管理员已批准7天试用'; r.reviewedAt=new Date().toISOString();
    const end=new Date(); end.setDate(end.getDate()+7);
    if(!state.userToolkits.some(x=>x.userId===r.userId&&x.toolkitId===r.toolkitId)){
      state.userToolkits.push({id:uid('ut'),userId:r.userId,toolkitId:r.toolkitId,orderId:null,trialRequestId:r.id,accessType:'trial',accessUrl:'/my-tools/'+r.toolkitId,startDate:new Date().toISOString(),endDate:end.toISOString(),status:'active',createdAt:new Date().toISOString()});
    }
    state.emailLogs.push({id:uid('email'),to:u.email,subject:'你的AI工具包试用已开通',body:`${u.name}老师您好，您申请试用的「${t.name}」已经开通。请登入会员中心，在「我的工具包」进入试用。试用期7天。`,sentAt:new Date().toISOString()});
    save(); toast('已批准试用，并模拟发送电邮通知'); go('admin');
  }
  function rejectTrial(id){
    const r=state.trialRequests.find(x=>x.id===id); if(!r)return;
    const u=state.users.find(x=>x.id===r.userId), t=state.toolkits.find(x=>x.id===r.toolkitId);
    r.status='已拒绝'; r.adminNote='管理员未批准本次试用'; r.reviewedAt=new Date().toISOString();
    state.emailLogs.push({id:uid('email'),to:u.email,subject:'你的AI工具包试用申请结果',body:`${u.name}老师您好，您申请试用的「${t.name}」暂时未获批准。如有疑问，请联系管理员。`,sentAt:new Date().toISOString()});
    save(); toast('已拒绝试用，并模拟发送电邮通知'); go('admin');
  }
  function adminNotificationsHtml(){
    if(!state.adminNotifications.length)return '<div class="card"><p>暂无后台通知。</p></div>';
    return `<div class="grid">${state.adminNotifications.slice().reverse().map(n=>`<div class="card notice-card"><div class="badge">${n.type}</div><h3>${n.title}</h3><p>${n.message}</p><div class="meta">${new Date(n.createdAt).toLocaleString()}</div></div>`).join('')}</div>`;
  }

  function adminOrdersTable(){
    if(!state.orders.length)return '<div class="card"><p>暂无订单。</p></div>';
    return `<table class="table"><thead><tr><th>订单</th><th>老师资料</th><th>工具包</th><th>金额</th><th>付款收据</th><th>状态</th><th>操作</th></tr></thead><tbody>${state.orders.slice().reverse().map(o=>{
      const u=state.users.find(x=>x.id===o.userId),t=state.toolkits.find(x=>x.id===o.toolkitId);
      const receipt=o.paymentProofData
        ? `<button class="receipt-link" onclick="App.viewReceipt('${o.id}')"><img class="receipt-thumb" src="${o.paymentProofData}" alt="收据缩略图"><span>查看收据图</span><small>${o.paymentProof||'已上传'}</small></button>`
        : `<button class="receipt-link no-image" onclick="App.viewReceipt('${o.id}')"><span>只有文件名</span><small>${o.paymentProof||'未上传收据'}</small></button>`;
      return `<tr><td data-label="订单">${o.orderNo}</td><td data-label="老师资料">${u?.name||'-'}<br><span class="muted">${u?.email||'-'}</span><br><strong>电话：</strong>${u?.phone||'<span class="warn-text">未填写</span>'}</td><td data-label="工具包">${t?.name||'-'}</td><td data-label="金额">${money(o.amount)}</td><td data-label="付款收据">${receipt}</td><td data-label="状态">${status(o.paymentStatus)} ${status(o.activationStatus)}</td><td data-label="操作"><button class="small primary" onclick="App.confirmOrder('${o.id}')">确认付款并开通</button> <button class="small danger" onclick="App.cancelOrder('${o.id}')">取消</button></td></tr>`}).join('')}</tbody></table>`;
  }
  function viewReceipt(orderId){
    const o=state.orders.find(x=>x.id===orderId);
    if(!o) return toast('找不到这个订单');
    const u=state.users.find(x=>x.id===o.userId);
    const t=state.toolkits.find(x=>x.id===o.toolkitId);
    const overlay=document.createElement('div');
    overlay.className='modal-overlay';
    const receiptContent=o.paymentProofData
      ? `<img class="receipt-large" src="${o.paymentProofData}" alt="付款收据图">`
      : `<div class="no-receipt-box"><h3>这个订单目前只有文件名，没有可预览图片</h3><p>文件名：<strong>${o.paymentProof||'未上传'}</strong></p><p class="muted">原因通常是：这个订单是在旧版本测试时建立的，当时系统只保存文件名，没有保存图片资料。请老师重新上传付款收据，或管理员要求老师补发收据。</p></div>`;
    overlay.innerHTML=`<div class="modal-card"><div class="section-title"><div><h2>付款收据预览</h2><p>${u?.name||'-'} ｜ 电话：${u?.phone||'-'} ｜ ${t?.name||'-'}</p></div><button class="ghost" onclick="this.closest('.modal-overlay').remove()">关闭</button></div>${receiptContent}<p class="muted">订单：${o.orderNo} ｜ 文件：${o.paymentProof||'-'}</p></div>`;
    document.body.appendChild(overlay);
  }
  function confirmOrder(id){ const o=state.orders.find(x=>x.id===id); if(!o)return; o.paymentStatus='已付款'; o.activationStatus='已开通'; o.paidAt=new Date().toISOString(); if(!state.userToolkits.some(x=>x.userId===o.userId&&x.toolkitId===o.toolkitId)){ state.userToolkits.push({id:uid('ut'),userId:o.userId,toolkitId:o.toolkitId,orderId:o.id,accessType:'paid',accessUrl:'/my-tools/'+o.toolkitId,startDate:new Date().toISOString(),endDate:null,status:'active',createdAt:new Date().toISOString()}); } save(); toast('已确认付款并开通'); go('admin'); }
  function cancelOrder(id){ const o=state.orders.find(x=>x.id===id); if(o){o.paymentStatus='已取消';o.activationStatus='已取消'; save(); go('admin');} }
  function adminUsersTable(){
    if(!state.users.length)return '<div class="card"><p>暂无老师。</p></div>';
    return `<table class="table"><thead><tr><th>老师资料</th><th>联络电话</th><th>注册</th><th>已开通工具</th><th>试用申请</th><th>消费</th><th>最近登入</th></tr></thead><tbody>${state.users.map(u=>{const uts=state.userToolkits.filter(x=>x.userId===u.id), orders=state.orders.filter(o=>o.userId===u.id&&o.paymentStatus==='已付款');return `<tr><td data-label="老师资料">${u.name}<br><span class="muted">${u.email}</span></td><td data-label="联络电话">${u.phone||'<span class="warn-text">未填写</span>'}</td><td data-label="注册">${new Date(u.createdAt).toLocaleString()}</td><td data-label="已开通工具">${uts.length}</td><td data-label="试用申请">${state.trialRequests.filter(r=>r.userId===u.id).length}</td><td data-label="消费">${money(orders.reduce((s,o)=>s+o.amount,0))}</td><td data-label="最近登入">${u.lastLoginAt?new Date(u.lastLoginAt).toLocaleString():'-'}</td></tr>`}).join('')}</tbody></table>`;
  }
  function adminToolsPanel(){
    const editing = state.editingToolkitId ? state.toolkits.find(t=>t.id===state.editingToolkitId) : null;
    return `<div class="section-title"><div><p class="muted">这里可以新增、修改、删除工具包基本资料，上传封面、切换上下架，并用上移/下移调整前台显示顺序。管理员可点击「直接测试」进入工具，不需要购买或申请试用。</p></div><button class="primary" onclick="App.newToolkit()">新增工具包</button></div>${adminToolkitForm(editing)}${adminToolsTable()}`;
  }
  function adminToolkitForm(t){
    const isEdit = !!t;
    return `<div class="card form"><h3>${isEdit?'修改工具包':'新增工具包'}</h3>
      <div class="tool-cover-editor">
        <div class="tool-cover preview">${t?coverHtml(t):'<span>🧰</span>'}</div>
        <div>
          <div class="field"><label>封面图片上传</label><input id="toolCoverFile" type="file" accept="image/*" onchange="App.previewToolkitCover(event)"></div>
          <div class="field"><label>或输入Emoji封面</label><input id="toolCoverEmoji" value="${(t?.cover&&!t.cover.startsWith('data:image'))?t.cover:''}" placeholder="例如：📝、🎲、🖼️"></div>
          <input id="toolCoverData" type="hidden" value="${t?.cover?.startsWith('data:image')?t.cover:''}">
          <p class="muted">测试版会把图片存在浏览器 localStorage，正式版需要上传到服务器或对象储存。</p>
        </div>
      </div>
      <div class="grid two">
        <div class="field"><label>工具包名称</label><input id="toolName" value="${t?.name||''}" placeholder="例如：AI学习单生成工具包"></div>
        <div class="field"><label>分类</label><input id="toolCategory" value="${t?.category||''}" placeholder="例如：文字类 / 图片类 / 游戏类"></div>
      </div>
      <div class="grid two">
        <div class="field"><label>价格（RM）</label><input id="toolPrice" type="number" min="0" step="0.01" value="${t?.price ?? ''}" placeholder="49"></div>
        <div class="field"><label>使用期限</label><input id="toolDuration" value="${t?.duration||''}" placeholder="例如：一年 / 永久"></div>
      </div>
      <div class="field"><label>工具简介</label><textarea id="toolDesc" rows="3" placeholder="请填写工具包简介">${t?.desc||''}</textarea></div>
      <div class="field"><label>功能标签（用逗号分隔）</label><input id="toolFeatures" value="${t?.features?.join('，')||''}" placeholder="例如：题型选择，难度分级，答案解析"></div>
      <div class="field"><label>状态</label><div class="switch-row"><button type="button" id="toolStatusSwitch" class="status-switch ${t?.status==='下架'?'off':'on'}" onclick="App.toggleToolkitStatusForm()"><span></span><b>${t?.status==='下架'?'下架':'上架'}</b></button><input id="toolStatus" type="hidden" value="${t?.status==='下架'?'下架':'上架'}"></div></div>
      <div class="row"><button class="primary" onclick="App.saveToolkit()">${isEdit?'保存修改':'确认新增'}</button>${isEdit?`<button class="ghost" onclick="App.newToolkit()">取消修改</button>`:''}</div>
    </div>`;
  }
  function adminToolsTable(){
    return `<table class="table"><thead><tr><th>排序</th><th>封面</th><th>工具包</th><th>分类</th><th>价格</th><th>期限</th><th>购买人数</th><th>使用次数</th><th>状态</th><th>操作</th></tr></thead><tbody>${state.toolkits.map((t,i)=>`<tr><td data-label="排序"><button class="small" onclick="App.moveToolkit('${t.id}',-1)" ${i===0?'disabled':''}>↑</button> <button class="small" onclick="App.moveToolkit('${t.id}',1)" ${i===state.toolkits.length-1?'disabled':''}>↓</button></td><td data-label="封面"><div class="table-cover">${coverHtml(t)}</div></td><td data-label="工具包">${t.name}<br><span class="muted">${t.desc}</span></td><td data-label="分类">${t.category}</td><td data-label="价格">${money(t.price)}</td><td data-label="期限">${t.duration}</td><td data-label="购买人数">${state.userToolkits.filter(x=>x.toolkitId===t.id).length}</td><td data-label="使用次数">${state.usageLogs.filter(x=>x.toolkitId===t.id).length}</td><td data-label="状态"><button class="status-pill ${t.status==='上架'?'on':'off'}" onclick="App.toggleToolkitStatus('${t.id}')">${t.status}</button></td><td data-label="操作"><button class="small primary" onclick="App.go('adminTool',{id:'${t.id}'})">直接测试</button> <button class="small" onclick="App.editToolkit('${t.id}')">修改</button> <button class="small danger" onclick="App.deleteToolkit('${t.id}')">删除</button></td></tr>`).join('')}</tbody></table>`;
  }
  function newToolkit(){
    state.editingToolkitId=null;
    save();
    adminTab('tools');
  }
  function makeToolkitId(name){
    const base = (name||'toolkit').toLowerCase().trim().replace(/[^a-z0-9一-龥]+/g,'-').replace(/^-+|-+$/g,'').replace(/-+/g,'-');
    let id = base || uid('tool');
    while(state.toolkits.some(t=>t.id===id)) id = `${base||'toolkit'}-${Math.random().toString(36).slice(2,5)}`;
    return id;
  }
  function previewToolkitCover(e){
    const f=e.target.files[0]; if(!f) return;
    const reader=new FileReader();
    reader.onload=()=>{
      $('toolCoverData').value=reader.result;
      $('toolCoverEmoji').value='';
      const box=document.querySelector('.tool-cover.preview');
      if(box) box.innerHTML=`<img src="${reader.result}" alt="封面预览">`;
    };
    reader.readAsDataURL(f);
  }
  function toggleToolkitStatusForm(){
    const input=$('toolStatus'), btn=$('toolStatusSwitch');
    const next=input.value==='上架'?'下架':'上架';
    input.value=next;
    btn.className='status-switch '+(next==='上架'?'on':'off');
    btn.querySelector('b').textContent=next;
  }
  function toggleToolkitStatus(id){
    const t=state.toolkits.find(x=>x.id===id); if(!t) return;
    t.status=t.status==='上架'?'下架':'上架';
    save();
    toast(`已${t.status}：${t.name}`);
    adminTab('tools');
  }
  function moveToolkit(id,dir){
    const i=state.toolkits.findIndex(t=>t.id===id);
    const j=i+dir;
    if(i<0||j<0||j>=state.toolkits.length) return;
    const [item]=state.toolkits.splice(i,1);
    state.toolkits.splice(j,0,item);
    save();
    adminTab('tools');
  }
  function saveToolkit(){
    const name=$('toolName')?.value.trim();
    const category=$('toolCategory')?.value.trim();
    const price=Number($('toolPrice')?.value||0);
    const duration=$('toolDuration')?.value.trim();
    const desc=$('toolDesc')?.value.trim();
    const featuresRaw=$('toolFeatures')?.value.trim();
    const statusValue=$('toolStatus')?.value||'上架';
    const coverData=$('toolCoverData')?.value.trim();
    const coverEmoji=$('toolCoverEmoji')?.value.trim();
    const cover=coverData||coverEmoji||'🧰';
    if(!name||!category||!duration||!desc) return toast('请先填写完整资料');
    const features = featuresRaw ? featuresRaw.split(/[，,]/).map(x=>x.trim()).filter(Boolean) : ['基本功能'];
    if(state.editingToolkitId){
      const t=state.toolkits.find(x=>x.id===state.editingToolkitId); if(!t) return;
      Object.assign(t,{name,category,price,duration,desc,features,status:statusValue,cover});
      toast('工具包资料已更新');
    }else{
      state.toolkits.unshift({id:makeToolkitId(name),name,category,price,duration,desc,features,status:statusValue,cover});
      toast('已新增工具包');
    }
    state.editingToolkitId=null;
    save();
    adminTab('tools');
  }
  function editToolkit(id){
    state.editingToolkitId=id;
    save();
    adminTab('tools');
  }
  function deleteToolkit(id){
    const t=state.toolkits.find(x=>x.id===id); if(!t) return;
    const relatedOrders=state.orders.filter(o=>o.toolkitId===id).length;
    const relatedAccess=state.userToolkits.filter(ut=>ut.toolkitId===id).length;
    const first = relatedOrders||relatedAccess
      ? `注意：「${t.name}」已有 ${relatedOrders} 笔订单、${relatedAccess} 个开通记录。\n\n删除后：\n1. 前台不再显示这个工具包\n2. 历史订单和使用记录仍会保留\n3. 已开通老师可能无法再从列表进入这个工具\n\n是否继续？`
      : `你即将删除「${t.name}」。\n\n是否继续？`;
    if(!confirm(first)) return;
    const typed=prompt(`二次确认：请输入「删除」两个字，才会删除「${t.name}」。`);
    if(typed!=='删除') return toast('已取消删除');
    state.toolkits = state.toolkits.filter(x=>x.id!==id);
    if(state.editingToolkitId===id) state.editingToolkitId=null;
    save();
    toast('工具包已删除');
    adminTab('tools');
  }
  function adminUsage(){ const rows=state.toolkits.map(t=>({t,logs:state.usageLogs.filter(l=>l.toolkitId===t.id)})); return `<div class="grid">${rows.map(r=>`<div class="card"><h3>${r.t.name}</h3><p>总使用：<strong>${r.logs.length}</strong></p><p>老师使用：${r.logs.filter(l=>l.role!=='admin').length} ｜ 管理员测试：${r.logs.filter(l=>l.role==='admin').length}</p><p>生成：${r.logs.filter(l=>l.action==='generate').length} ｜ 下载：${r.logs.filter(l=>l.action==='download').length} ｜ 预览：${r.logs.filter(l=>l.action==='preview').length}</p></div>`).join('')}</div>`; }

  function resetDemo(){ localStorage.removeItem(LS); state=seed(); save(); go('home'); }

  document.addEventListener('keydown', function(e){
    if(e.key==='Enter' && e.target && (e.target.id==='adminPass' || e.target.id==='adminPwd' || e.target.id==='adminPassword')){
      e.preventDefault();
      adminLogin();
    }
  });
  const adminEnterLoginFixV45=true;

  document.addEventListener('click', function(e){
    const routeNode=e.target.closest('[data-route]');
    if(routeNode){
      e.preventDefault();
      go(routeNode.getAttribute('data-route')||'home');
      return;
    }
    const hashNode=e.target.closest('a[href^="#"]');
    if(hashNode){
      const route=(hashNode.getAttribute('href')||'').replace('#','');
      if(['home','catalog','tools','pricing','products','peripherals','admin','login','register','dashboard'].includes(route)){
        e.preventDefault();
        go(route);
      }
    }
  });
  const navigationClickFixV45=true;


  // v4.6 compatibility aliases: prevent startup crash from old exported names.
  function previewImage(){
    toast('此工具已升级，请使用新版切图或去背景工具。');
  }
  function splitPreview(){
    return generateImageSlices();
  }
  function fakeDownloadZip(){
    return downloadAllSlicesZip();
  }

  window.addEventListener('load',()=>go('home'));
    function loadBgRemoveImage(){ console.warn('Compatibility stub: loadBgRemoveImage'); }
  function downloadBgRemoved(){ console.warn('Compatibility stub: downloadBgRemoved'); }
  function updateRemoveLabels(){ console.warn('Compatibility stub: updateRemoveLabels'); }
  function fitCanvas(){ console.warn('Compatibility stub: fitCanvas'); }
  function useSampleBgRemove(){ console.warn('Compatibility stub: useSampleBgRemove'); }
  function aiRemoveBackground(){ console.warn('Compatibility stub: aiRemoveBackground'); }
  function applyOutputBackground(){ console.warn('Compatibility stub: applyOutputBackground'); }
  function callRealRemoveBgApi(){ console.warn('Compatibility stub: callRealRemoveBgApi'); }
  function saveRemoveBgApiUrl(){ console.warn('Compatibility stub: saveRemoveBgApiUrl'); }
  function resetBgRemoveTool(){ console.warn('Compatibility stub: resetBgRemoveTool'); }
return {go,setFilter,previewTool,requestTrial,register,verify,login,demoLogin,logout,placeOrder,generateQB,generateLesson,generateGame,previewImage,splitPreview,fakeDownloadZip,downloadText,log,adminLogin,adminLogout,adminTab,confirmOrder,cancelOrder,approveTrial,rejectTrial,viewToolkit,newToolkit,saveToolkit,editToolkit,deleteToolkit,previewReceipt,viewReceipt,previewToolkitCover,toggleToolkitStatusForm,toggleToolkitStatus,moveToolkit,resetDemo,quizScore,quizShowAnswer,quizNext,matchPick,spinWheel,checkQuest,showQuestAnswer,downloadGeneratedGame,showWheelAnswer,updateSubthemeOptions,previewGameAsset,startGeneratedGame,replayCurrentGame,enterGameFullscreen,toggleThemeMusic,finishCurrentGame,loadBgRemoveImage,downloadBgRemoved,updateRemoveLabels,fitCanvas,useSampleBgRemove,aiRemoveBackground,applyOutputBackground,callRealRemoveBgApi,saveRemoveBgApiUrl,resetBgRemoveTool,readQuestionPdf,forceReadSelectedPdf,clearQuestionPdf,loadSplitImage,generateImageSlices,downloadSlice,downloadAllSlicesZip,resetSplitter};
})();
