import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagePath = path.join(__dirname, "../app/new-and-trending/page.tsx");
let content = fs.readFileSync(pagePath, "utf8");

const script = `const mainNav = document.getElementById('mainNav');
const searchOpenBtn = document.getElementById('searchOpenBtn');
const searchCloseBtn = document.getElementById('searchCloseBtn');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

function closeSearch(){
  mainNav.classList.remove('is-search-active');
  searchInput.blur();
}
function openSearch(){
  mainNav.classList.add('is-search-active');
  searchInput.value = '';
  requestAnimationFrame(() => searchInput.focus());
}
searchOpenBtn.addEventListener('click', openSearch);
searchCloseBtn.addEventListener('click', closeSearch);
searchForm.addEventListener('submit', e => { e.preventDefault(); closeSearch(); });
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && mainNav.classList.contains('is-search-active')) closeSearch();
});

const overlay = document.getElementById('overlay');
const drawer = document.getElementById('filterDrawer');
const openBtn = document.getElementById('openFilter');
const closeBtn = document.getElementById('closeFilter');

function openDrawer(){
  if (!drawer || !overlay) return;
  drawer.classList.add('open');
  overlay.classList.add('show');
  drawer.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeDrawer(){
  if (!drawer || !overlay) return;
  drawer.classList.remove('open');
  overlay.classList.remove('show');
  drawer.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
if (openBtn) openBtn.addEventListener('click', openDrawer);
if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
if (overlay) overlay.addEventListener('click', closeDrawer);

document.querySelectorAll('.accordion-section').forEach(section=>{
  const header = section.querySelector('.accordion-header');
  const content = section.querySelector('.accordion-content');
  if (!header || !content) return;
  header.addEventListener('click', ()=>{
    const isOpen = section.classList.contains('open');
    document.querySelectorAll('.accordion-section').forEach(s=>{
      s.classList.remove('open');
      const c = s.querySelector('.accordion-content');
      if (c) c.style.maxHeight = null;
    });
    if(!isOpen){
      section.classList.add('open');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });
});

window.addEventListener('load', ()=>{
  const openSection = document.querySelector('.accordion-section.open .accordion-content');
  if(openSection) openSection.style.maxHeight = openSection.scrollHeight + 'px';
});

const showMoreBtn = document.getElementById('showMoreCategory');
if (showMoreBtn) {
  showMoreBtn.addEventListener('click', ()=>{
    const extra = document.querySelector('.extra-options');
    if (!extra) return;
    extra.classList.toggle('hide');
    const span = showMoreBtn.querySelector('span');
    if (span) span.textContent = extra.classList.contains('hide') ? 'VOIR PLUS' : 'VOIR MOINS';
    showMoreBtn.firstChild.textContent = extra.classList.contains('hide') ? '+ ' : '− ';
    const openContent = document.querySelector('.accordion-section.open .accordion-content');
    if(openContent) openContent.style.maxHeight = openContent.scrollHeight + 'px';
  });
}`;

const start = content.indexOf("inlineScripts={[");
const endMarker = "\n    />\n  );";
const end = content.indexOf(endMarker);
if (start === -1 || end === -1) {
  console.error("Could not locate inlineScripts block");
  process.exit(1);
}

const before = content.slice(0, start);
const after = content.slice(end);
content = before + "inlineScripts={[" + JSON.stringify(script) + "]}" + after;
fs.writeFileSync(pagePath, content);
console.log("Updated new-and-trending page");
