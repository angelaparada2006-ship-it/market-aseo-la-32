(function () {
  'use strict';
  var C = window.SITE_CONFIG || {}, N = C.negocio || {}, API = C.api || {};
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.from((r || document).querySelectorAll(s)); }
  function get(o, p) { return p.split('.').reduce(function (v, k) { return v && v[k]; }, o); }
  function el(tag, props) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'text') n.textContent = props[k]; else n.setAttribute(k, props[k]);
    });
    return n;
  }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function wa(text) {
    var n = digits(N.whatsapp);
    return n ? 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '') : '#';
  }
  function safeUrl(u) { return /^(https?:\/\/|\/|[\w.-]+\/)/i.test(u || '') && !/^\s*javascript:/i.test(u) ? u : ''; }

  $$('[data-cfg]').forEach(function (n) {
    var v = get(C, n.getAttribute('data-cfg')); if (v) n.textContent = v;
  });
  $$('.js-wa').forEach(function (a) {
    a.href = wa(a.getAttribute('data-wa-text') || ''); if (wa() === '#') a.hidden = true;
  });
  $$('.js-tel').forEach(function (a) {
    var n = digits(N.telefono); if (n) a.href = 'tel:+57' + n.replace(/^57/, '');
  });
  if (N.email) { $('#filaEmail').hidden = false; $('#enlaceEmail').href = 'mailto:' + N.email; $('#enlaceEmail').textContent = N.email; }
  if (N.horario) $('#filaHorario').hidden = false;
  var socials = C.redes || {}, socialBox = $('#redes');
  [['facebook','Facebook'],['instagram','Instagram'],['tiktok','TikTok']].forEach(function (x) {
    var u = safeUrl(socials[x[0]]);
    if (u) socialBox.appendChild(el('a', {href:u,target:'_blank',rel:'noopener',text:x[1]}));
  });
  if (C.mapa && safeUrl(C.mapa.embedUrl)) { $('#mapa').src = C.mapa.embedUrl; $('#bloqueMapa').hidden = false; }
  if (C.dominio && C.dominio.url) {
    var base = C.dominio.url.replace(/\/$/, '');
    document.head.appendChild(el('link',{rel:'canonical',href:base+'/'}));
    document.head.appendChild(el('meta',{property:'og:url',content:base+'/'}));
  }
  $('#anio').textContent = new Date().getFullYear();

  function apiFetch(path, options) {
    options = options || {};
    if (!API.baseUrl) return Promise.reject(new Error('API no configurada'));
    var controller = new AbortController(), timer = setTimeout(function(){controller.abort();}, API.timeoutMs || 8000);
    var headers = Object.assign({Accept:'application/json'}, API.headers || {}, options.headers || {});
    return fetch(API.baseUrl.replace(/\/$/,'') + path, Object.assign({},options,{headers:headers,signal:controller.signal}))
      .then(function(r){if(!r.ok) throw new Error('HTTP '+r.status); return r.json();})
      .finally(function(){clearTimeout(timer);});
  }
  window.MarketAPI = {fetch:apiFetch};

  function price(v) {
    var n = Number(v); return isFinite(n) && n > 0 ? new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n) : '';
  }
  function drawProducts(products) {
    var list = $('#listaProductos'), filters = $('#filtros'), cats = [];
    products.forEach(function(p){if(p.categoria && cats.indexOf(p.categoria)<0) cats.push(p.categoria);});
    function render(cat) {
      list.textContent = '';
      products.filter(function(p){return !cat || p.categoria === cat;}).forEach(function(p){
        var body = el('div',{class:'prod-body'});
        if(p.categoria) body.appendChild(el('span',{class:'prod-cat',text:p.categoria}));
        body.appendChild(el('h3',{text:p.nombre}));
        if(p.descripcion) body.appendChild(el('p',{text:p.descripcion}));
        var formatted = price(p.precio);
        if(formatted) body.appendChild(el('span',{class:'prod-precio',text:formatted}));
        body.appendChild(el('a',{class:'btn btn-wa',target:'_blank',rel:'noopener',href:wa('Hola, quiero pedir: '+p.nombre),text:'Pedir por WhatsApp'}));
        var card = el('article',{class:'card prod'}), img = safeUrl(p.imagen);
        if(img) card.appendChild(el('img',{src:img,alt:p.nombre,loading:'lazy'}));
        card.appendChild(body); list.appendChild(card);
      });
    }
    filters.textContent = '';
    if(cats.length > 1) {
      var buttons = [];
      ['Todos'].concat(cats).forEach(function(cat,i){
        var b = el('button',{type:'button',class:'chip','aria-pressed':i===0?'true':'false',text:cat});
        b.addEventListener('click',function(){
          buttons.forEach(function(x){x.setAttribute('aria-pressed','false');});
          b.setAttribute('aria-pressed','true'); render(i===0?'':cat);
        });
        buttons.push(b); filters.appendChild(b);
      });
    }
    render(''); $('#catalogo').hidden = false; $('#navCatalogo').hidden = false;
  }
  var productsSource = API.baseUrl ? apiFetch(API.productosPath || '/productos') :
    fetch('products.json').then(function(r){if(!r.ok) throw new Error('No se encontró products.json'); return r.json();});
  productsSource.then(function(data){
    var items = Array.isArray(data) ? data : (data && (data.productos || data.data || data.items)) || [];
    items = items.filter(function(p){return p && p.nombre;});
    if(items.length) drawProducts(items);
  }).catch(function(){});

  var form = $('#formContacto'), msg = $('#formMsg');
  function notice(t, type){msg.textContent=t; msg.className='form-msg '+(type||'');}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var fields=form.elements, data={
      nombre:fields.nombre.value.trim(),
      contacto:fields.contacto.value.trim(),
      mensaje:fields.mensaje.value.trim()
    };
    if(fields.web.value) return;
    if(!data.nombre || !data.contacto || !data.mensaje){notice('Por favor completa todos los campos.','error');return;}
    var cfg=C.formulario || {};
    if(!cfg.endpoint){
      window.open(wa('Hola, soy '+data.nombre+' ('+data.contacto+'). '+data.mensaje),'_blank','noopener');
      notice('Te llevamos a WhatsApp para enviar tu mensaje.','ok'); return;
    }
    notice('Enviando…','');
    fetch(cfg.endpoint,{method:cfg.metodo || 'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)})
      .then(function(r){if(!r.ok) throw new Error('HTTP '+r.status);form.reset();notice('¡Gracias! Recibimos tu mensaje y te responderemos pronto.','ok');})
      .catch(function(){notice('No pudimos enviar el mensaje. Escríbenos por WhatsApp.','error');});
  });

  var analytics=C.analitica || {};
  if(analytics.googleAnalyticsId && /^G-[A-Z0-9]+$/i.test(analytics.googleAnalyticsId)){
    var script=el('script',{async:'',src:'https://www.googletagmanager.com/gtag/js?id='+analytics.googleAnalyticsId});
    document.head.appendChild(script); window.dataLayer=window.dataLayer || [];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date()); window.gtag('config',analytics.googleAnalyticsId);
  }
  (analytics.scriptsExtra || []).forEach(function(src){
    if(/^https:\/\//i.test(src)) document.head.appendChild(el('script',{async:'',src:src}));
  });
})();