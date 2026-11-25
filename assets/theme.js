/* SHIFT — JS vanilla, sans build. Panier via Shopify AJAX API. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=window.themeRoot||'/';
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const body=document.body;

/* header : état au scroll */
const header=$('.header');
const onScroll=()=>{header&&header.classList.toggle('is-stuck',scrollY>24)};
onScroll();addEventListener('scroll',onScroll,{passive:true});

/* menu mobile + recherche */
const mm=$('#mmenu'),burger=$('[data-burger]'),sp=$('#search-pop');
const setMenu=o=>{if(!mm)return;mm.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);body.style.overflow=o?'hidden':''};
burger&&burger.addEventListener('click',()=>setMenu(!mm.classList.contains('open')));
$$('#mmenu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
const setSearch=o=>{if(!sp)return;sp.classList.toggle('open',o);if(o)setTimeout(()=>$('input',sp).focus(),200)};
$$('[data-search-toggle]').forEach(b=>b.addEventListener('click',()=>setSearch(!sp.classList.contains('open'))));

/* reveal au scroll */
const revealEls=$$('.reveal');
if('IntersectionObserver' in window&&!reduce){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  revealEls.forEach(el=>io.observe(el));
}else revealEls.forEach(el=>el.classList.add('in'));

/* ---------- panier ---------- */
const openCart=()=>{body.classList.add('cart-open');const d=$('#cart-drawer');d&&d.setAttribute('aria-hidden','false');setTimeout(()=>{const c=d&&$('[data-cart-close]',d);c&&c.focus()},300)};
const closeCart=()=>{body.classList.remove('cart-open');const d=$('#cart-drawer');d&&d.setAttribute('aria-hidden','true')};
const setCount=n=>$$('[data-cart-count]').forEach(el=>{el.dataset.count=n;el.textContent=n;el.classList.add('bump');setTimeout(()=>el.classList.remove('bump'),350)});
async function refreshCart(){
  const r=await fetch(`${root}?sections=cart-drawer`);const j=await r.json();
  const doc=new DOMParser().parseFromString(j['cart-drawer'],'text/html');
  const next=$('[data-cart-inner]',doc),cur=$('[data-cart-inner]');
  if(next&&cur){cur.innerHTML=next.innerHTML;setCount(next.dataset.count||0)}
}
async function cartPost(url,data){
  const r=await fetch(root+url,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
  const j=await r.json();if(!r.ok)throw new Error(j.description||j.message||'Erreur panier');return j;
}
async function addToCart(id,qty=1,btn){
  if(btn)btn.disabled=true;
  try{await cartPost('cart/add.js',{items:[{id:Number(id),quantity:Number(qty)}]});await refreshCart();openCart()}
  catch(e){alert(e.message)}
  finally{if(btn)btn.disabled=false}
}
document.addEventListener('click',async e=>{
  const t=e.target.closest('button,a,.overlay');if(!t)return;
  if(t.matches('[data-cart-open]')){e.preventDefault();await refreshCart();openCart()}
  else if(t.matches('[data-cart-close],.overlay'))closeCart();
  else if(t.matches('[data-quick-add]'))addToCart(t.dataset.variantId,1,t);
  else if(t.matches('[data-line-change]')){
    try{await cartPost('cart/change.js',{line:Number(t.dataset.line),quantity:Number(t.dataset.qty)});await refreshCart()}catch(err){alert(err.message)}
  }
});
addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();setMenu(false);setSearch(false)}});

/* ---------- cartes produit : choix du coloris ---------- */
document.addEventListener('click',e=>{
  const sw=e.target.closest('[data-card-swatch]');if(!sw)return;
  const card=sw.closest('.card');
  $$('[data-card-swatch]',card).forEach(s=>s.setAttribute('aria-pressed',s===sw));
  const add=$('[data-quick-add]',card);
  if(add){const ok=sw.dataset.available==='true';add.dataset.variantId=sw.dataset.variantId;add.disabled=!ok;add.textContent=ok?add.dataset.label:add.dataset.soldout}
  const img=$('.card__media img',card);if(img&&sw.dataset.image){img.src=sw.dataset.image;img.removeAttribute('srcset')}
});

/* ---------- formulaire produit ---------- */
$$('[data-product-form]').forEach(form=>{
  const data=JSON.parse($('[data-variants]',form).textContent);
  const priceEl=$('[data-price]',form),stock=$('[data-stock]',form),idIn=$('[name=id]',form),btn=$('[data-submit]',form),qty=$('[name=quantity]',form);
  const sticky=$(`[data-sticky="${form.dataset.productForm}"]`);
  const current=()=>{const sel=$$('input[type=radio]:checked',form).map(i=>i.value);return data.find(v=>v.options.every((o,i)=>o===sel[i]))};
  const update=()=>{
    $$('[data-opt-label]',form).forEach(l=>{const c=$(`input[name="opt${l.dataset.optLabel}"]:checked`,form);if(c)l.textContent=c.value});
    const v=current();
    if(!v){btn.disabled=true;btn.textContent=form.dataset.unavailable;return}
    idIn.value=v.id;priceEl.innerHTML=v.compare?`<s>${v.compare}</s>${v.price}`:v.price;
    btn.disabled=!v.available;btn.textContent=v.available?form.dataset.add:form.dataset.soldout;
    if(stock){stock.className='stock'+(v.available?'':' out');$('span',stock).textContent=v.available?(v.low?form.dataset.low.replace('{n}',v.low):form.dataset.instock):form.dataset.soldout}
    if(sticky){$('[data-sticky-price]',sticky).textContent=v.price;$('button',sticky).disabled=!v.available}
    if(form.dataset.syncUrl==='true'){const u=new URL(location.href);u.searchParams.set('variant',v.id);history.replaceState({},'',u)}
    if(v.media){const f=$(`[data-media-id="${v.media}"]`);f&&f.scrollIntoView({behavior:reduce?'auto':'smooth',block:'nearest',inline:'center'})}
  };
  form.addEventListener('change',e=>{if(e.target.matches('input[type=radio]'))update()});
  form.addEventListener('submit',e=>{e.preventDefault();addToCart(idIn.value,qty.value,btn)});
  $$('[data-qty]',form).forEach(b=>b.addEventListener('click',()=>{qty.value=Math.max(1,Number(qty.value)+Number(b.dataset.qty))}));
  if(sticky){
    $('button',sticky).addEventListener('click',()=>addToCart(idIn.value,qty.value));
    new IntersectionObserver(([en])=>sticky.classList.toggle('show',!en.isIntersecting&&en.boundingClientRect.top<0)).observe(btn);
  }
  update();
});

/* ---------- zoom au survol ---------- */
if(matchMedia('(hover:hover)').matches&&!reduce){
  $$('[data-zoom]').forEach(box=>{const img=$('img',box);if(!img)return;
    box.addEventListener('mousemove',e=>{const r=box.getBoundingClientRect();img.style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`;img.style.transform='scale(1.9)'});
    box.addEventListener('mouseleave',()=>{img.style.transform=''});
  });
}

/* ---------- recommandations / produits complémentaires ---------- */
$$('[data-recs]').forEach(async el=>{
  const hide=()=>{const s=el.closest('section');if(s)s.hidden=true};
  try{const r=await fetch(el.dataset.url);if(!r.ok)throw 0;
    const doc=new DOMParser().parseFromString(await r.text(),'text/html');const n=$('[data-recs]',doc);
    if(n&&n.querySelector('.card')){el.innerHTML=n.innerHTML;$$('.reveal',el).forEach(x=>x.classList.add('in'))}else hide();
  }catch(e){hide()}
});

/* ---------- filtres collection ---------- */
$$('[data-auto-submit]').forEach(f=>f.addEventListener('change',()=>f.submit()));
})();
