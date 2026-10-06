const restaurants = [
  {id:1,name:"Spice Route",cuisine:"North Indian",emoji:"🍛",rating:4.5,time:30,price:250,menu:[["Butter Chicken",320],["Paneer Tikka",260],["Garlic Naan",60]]},
  {id:2,name:"Pizza Corner",cuisine:"Pizza",emoji:"🍕",rating:4.2,time:25,price:300,menu:[["Margherita",249],["Pepperoni",349],["Garlic Bread",129]]},
  {id:3,name:"Burger Barn",cuisine:"Burgers",emoji:"🍔",rating:4.0,time:20,price:180,menu:[["Classic Burger",149],["Cheese Fries",99],["Chocolate Shake",119]]},
  {id:4,name:"Dragon Wok",cuisine:"Chinese",emoji:"🥡",rating:4.3,time:35,price:220,menu:[["Veg Noodles",169],["Chilli Chicken",229],["Fried Rice",179]]},
  {id:5,name:"Dosa Junction",cuisine:"South Indian",emoji:"🥞",rating:4.6,time:22,price:120,menu:[["Masala Dosa",89],["Idli Sambar",69],["Filter Coffee",40]]},
  {id:6,name:"Sweet Tooth",cuisine:"Desserts",emoji:"🍰",rating:4.4,time:28,price:150,menu:[["Brownie Sundae",159],["Cheesecake",189],["Gulab Jamun",79]]},
  {id:7,name:"Biryani House",cuisine:"Biryani",emoji:"🍚",rating:4.7,time:40,price:280,menu:[["Chicken Biryani",290],["Veg Biryani",220],["Raita",40]]},
  {id:8,name:"Sushi Zen",cuisine:"Japanese",emoji:"🍣",rating:4.1,time:45,price:450,menu:[["Salmon Roll",399],["Veg Maki",299],["Miso Soup",149]]}
];
const cuisines = ["All",...new Set(restaurants.map(r=>r.cuisine))];
let cuisine="All", cart={}, view=null;
const $ = id => document.getElementById(id);
const inr = n => "₹"+n;

function renderChips(){
  $("chips").innerHTML = cuisines.map(c=>`<button class="chip ${c===cuisine?'on':''}" data-c="${c}">${c}</button>`).join("");
}
function renderGrid(){
  const q=$("q").value.toLowerCase(), s=$("sort").value;
  let list=restaurants.filter(r=>(cuisine==="All"||r.cuisine===cuisine)&&(r.name+r.cuisine).toLowerCase().includes(q));
  if(s==="rating") list.sort((a,b)=>b.rating-a.rating);
  if(s==="time") list.sort((a,b)=>a.time-b.time);
  if(s==="price") list.sort((a,b)=>a.price-b.price);
  $("title").textContent = `${list.length} restaurants`;
  $("grid").innerHTML = list.length ? list.map(r=>`
    <div class="card" data-id="${r.id}">
      <div class="pic">${r.emoji}</div>
      <div class="info">
        <div class="row"><span class="name">${r.name}</span><span class="rate">★ ${r.rating}</span></div>
        <div class="meta">${r.cuisine} · ${r.time} min · ${inr(r.price)} for one</div>
      </div>
    </div>`).join("") : `<p class="empty">No restaurants match your search. Try another cuisine.</p>`;
}
const cartItems = () => Object.entries(cart).map(([k,v])=>({key:k,...v}));
const total = () => cartItems().reduce((t,i)=>t+i.price*i.qty,0);

function renderPanel(){
  let html=`<button class="close" id="x">×</button>`;
  if(view){
    const r=restaurants.find(r=>r.id===view);
    html+=`<h2>${r.emoji} ${r.name}</h2><p class="meta">${r.cuisine} · ★ ${r.rating} · ${r.time} min</p><h3>Menu</h3>`+
      r.menu.map(([n,p],i)=>`<div class="item"><div><div class="name">${n}</div><div class="meta">${inr(p)}</div></div><button class="add" data-add="${r.id}:${i}">Add</button></div>`).join("")+
      `<p style="margin-top:18px"><button class="add" id="toCart">View cart (${count()})</button></p>`;
  } else {
    html+=`<h2>Your cart</h2>`;
    const items=cartItems();
    html+= items.length ? items.map(i=>`<div class="item"><div><div class="name">${i.name}</div><div class="meta">${inr(i.price)}</div></div>
      <div class="qty"><button data-dec="${i.key}">−</button>${i.qty}<button data-inc="${i.key}">+</button></div></div>`).join("")+
      `<div class="total"><span>Total</span><span>${inr(total())}</span></div><button class="order" id="order">Place order</button>`
      : `<p class="empty">Your cart is empty. Pick a restaurant and add dishes.</p>`;
  }
  $("panel").innerHTML=html;
}
const count = () => cartItems().reduce((t,i)=>t+i.qty,0);
function update(){ $("count").textContent=count(); renderPanel(); }
function open(v){ view=v; renderPanel(); $("panel").classList.add("open"); $("overlay").classList.add("open"); }
function close(){ $("panel").classList.remove("open"); $("overlay").classList.remove("open"); }
function toast(msg){ const t=$("toast"); t.textContent=msg; t.style.display="block"; clearTimeout(t._h); t._h=setTimeout(()=>t.style.display="none",2200); }

document.addEventListener("click",e=>{
  const t=e.target, d=t.dataset;
  if(d.c){ cuisine=d.c; renderChips(); renderGrid(); }
  const card=t.closest(".card"); if(card) open(+card.dataset.id);
  if(d.add){ const [rid,i]=d.add.split(":"); const r=restaurants.find(r=>r.id==rid), [n,p]=r.menu[i];
    const k=rid+"-"+i; cart[k]=cart[k]?{...cart[k],qty:cart[k].qty+1}:{name:n,price:p,qty:1}; update(); toast(n+" added to cart"); }
  if(d.inc) { cart[d.inc].qty++; update(); }
  if(d.dec) { if(--cart[d.dec].qty<1) delete cart[d.dec]; update(); }
  if(t.id==="x"||t.id==="overlay") close();
  if(t.id==="toCart") open(null);
  if(t.id==="order"){ cart={}; update(); close(); toast("Order placed! Arriving in about 30 minutes."); }
});
$("openCart").onclick=()=>open(null);
$("q").oninput=renderGrid; $("sort").onchange=renderGrid;
renderChips(); renderGrid(); update();
