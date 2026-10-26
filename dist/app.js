(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const titles={home:'Research & Engineering',research:'Research',projects:'Projects',about:'About'};
  let routed=false;
  function route(){
    let [requested,anchor]=location.hash.slice(1).split('/');
    if(anchor==='gallery'){history.replaceState(null,'','#home');requested='home';anchor=null;}
    const active=Object.hasOwn(titles,requested)?requested:'home';
    document.body.dataset.page=active;
    $$('.page').forEach(page=>page.hidden=page.id!==active);
    $$('a[data-page]').forEach(link=>link.dataset.page===active?link.setAttribute('aria-current','page'):link.removeAttribute('aria-current'));
    document.title=`Azaan Noman — ${titles[active]}`;
    window.scrollTo({top:0,behavior:'instant'});
    if(routed)requestAnimationFrame(()=>$('#content').focus({preventScroll:true}));
    if(anchor)requestAnimationFrame(()=>document.getElementById(anchor)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));
    routed=true;window.dispatchEvent(new Event('pond:layout'));
  }
  $('.skip').addEventListener('click',event=>{event.preventDefault();$('#content').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});});
  window.addEventListener('hashchange',route);route();
  function updateTheme(){
    const light=document.documentElement.dataset.theme==='light';
    $$('.theme-toggle').forEach(button=>{button.setAttribute('aria-label',`Switch to ${light?'dark':'light'} mode`);button.firstElementChild.textContent=light?'☾':'☼';});
    $('meta[name=theme-color]').content=light?'#f5f4f1':'#1a1917';
    window.dispatchEvent(new Event('pond:theme'));
  }
  $$('.theme-toggle').forEach(button=>button.addEventListener('click',()=>{
    const theme=document.documentElement.dataset.theme==='light'?'dark':'light';
    document.documentElement.dataset.theme=theme;try{localStorage.setItem('az-theme',theme);}catch{}updateTheme();
  }));
  updateTheme();
})();
