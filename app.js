'use strict';

const STORAGE_KEY = 'dabernaz_state_v1';
const cloneData = value => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const defaultState = {
  username: 'بازیکن مهمان', memberId: '100001', balance: 12450, joined: [], transactions: [],
  settings: { sounds: true, notifications: true, privacy: true, vibration: false },
  referralCode: 'DABERNAZ100001', gamesPlayed: 23, wins: 14, points: 46860
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return cloneData(defaultState);
    return {
      ...cloneData(defaultState), ...saved,
      balance: Number.isFinite(Number(saved.balance)) ? Math.max(0, Number(saved.balance)) : defaultState.balance,
      joined: Array.isArray(saved.joined) ? saved.joined : [],
      transactions: Array.isArray(saved.transactions) ? saved.transactions.slice(0, 30) : [],
      settings: { ...defaultState.settings, ...(saved.settings || {}) }
    };
  } catch (_) { return cloneData(defaultState); }
}
let state = loadState();
let currentPage = 'home';
let toastTimer = null;
let bingoGame = null;

const $ = (selector, root = document) => root.querySelector(selector);
const money = value => Number(value).toLocaleString('en-US');
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { showToast('فضای ذخیره‌سازی مرورگر در دسترس نیست'); } }
function showToast(message) {
  const toast = $('#toast'); if (!toast) return;
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function updateHeader() {
  $('#headerName').textContent = state.username;
  $('#headerId').textContent = `ID: ${state.memberId}`;
  $('#headerBalance').textContent = money(state.balance);
}
function setPage(page) {
  const allowed = ['home','games','tournaments','invite','wallet','account','settings','support'];
  if (!allowed.includes(page)) page = 'home';
  currentPage = page;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function heading(title, subtitle, label = '') {
  return `<div class="page-heading"><div><span class="eyebrow">${label || 'DABERNAZ CLUB'}</span><h1>${title}</h1><p>${subtitle}</p></div></div>`;
}
function section(title, action = '', page = '') {
  return `<div class="section-title"><h2>${title}</h2>${action ? `<button data-page="${page}">${action}</button>` : ''}</div>`;
}
function renderHome() {
  return `${heading('خوش اومدی ' + escapeHTML(state.username) + ' 👑', 'برای یک رقابت هیجان‌انگیز آماده‌ای؟', 'باشگاه بازی دابرناز')}
  <section class="hero"><div class="hero-copy"><span class="eyebrow">بازی کن · رقابت کن · بدرخش</span><h1>قهرمان بعدی<br><em>شاید تو باشی!</em></h1><p>وارد دنیای بازی‌های دابرناز شو و مهارتت رو به چالش بکش.</p><button class="btn btn-primary" data-page="games">ورود به اتاق بازی <span>‹</span></button></div><div class="hero-art"><div class="art-orb">🂡</div></div></section>
  <div class="shortcut-grid">
    <button class="shortcut" data-page="games"><span class="symbol">🎮</span><b>اتاق بازی</b><small>شروع بازی</small></button>
    <button class="shortcut" data-page="tournaments"><span class="symbol">🏆</span><b>تورنمنت</b><small>رقابت آنلاین</small></button>
    <button class="shortcut" data-page="invite"><span class="symbol">🎁</span><b>دعوت دوستان</b><small>دعوت و همراهی</small></button>
    <button class="shortcut" data-page="wallet"><span class="symbol">👛</span><b>کیف پول</b><small>موجودی سکه</small></button>
  </div>
  <div class="promo"><div class="promo-art">🎯</div><div class="promo-copy"><b>چالش روزانه دابرناز</b><p>هر روز وارد شو و مأموریت‌های تازه رو دنبال کن.</p></div><button class="btn btn-outline" data-page="games">مشاهده</button></div>
  ${section('بازی‌های محبوب', 'همه بازی‌ها', 'games')}
  <div class="game-grid">${gameCard('bingo','🎱','Bingo','شانس و تمرکز','رایگان')}${gameCard('poker','🃏','Poker','میز تمرینی','رایگان')}${gameCard('slots','🎰','Slots','گردونه شانس دمو','۱۰۰ سکه آزمایشی')}</div>
  ${section('وضعیت حساب', 'حساب کاربری', 'account')}
  <div class="mini-stats"><div class="stat-card"><b>${money(state.gamesPlayed)}</b><small>بازی انجام‌شده</small></div><div class="stat-card"><b>${money(state.wins)}</b><small>بردها</small></div><div class="stat-card"><b>${money(state.points)}</b><small>امتیاز کل</small></div></div>
  <div class="ticker"><span>⭐ وضعیت عضویت</span><strong>عضو فعال دابرناز</strong><span>● آنلاین</span></div>`;
}
function gameCard(id, symbol, name, desc, price) {
  return `<article class="game-card"><div class="game-cover">${symbol}</div><h3>${name}</h3><p>${desc}</p><button class="btn btn-primary" data-game="${id}">ورود به بازی</button><div class="price">${price}</div></article>`;
}
function renderGames() {
  return `${heading('اتاق بازی', 'بازی مورد علاقه‌ات رو انتخاب کن و وارد رقابت شو.', 'GAME ROOM')}
  <div class="filter-row"><button class="filter-pill active" data-game-filter="all">همه بازی‌ها</button><button class="filter-pill" data-game-filter="skill">مهارتی</button><button class="filter-pill" data-game-filter="fun">سرگرمی</button></div>
  <div class="game-list">
    ${gameListItem('bingo','🎱','Bingo','کارت خودت رو بساز و اعداد رو پیدا کن.','سرگرمی')}
    ${gameListItem('poker','🃏','Poker','یک دست پوکر تمرینی و بدون پول واقعی.','مهارتی')}
    ${gameListItem('slots','🎰','Slots','اسلات تک‌نفره با سکه‌های مجازی.','سرگرمی')}
    ${gameListItem('memory','🧠','حافظه طلایی','جفت کارت‌های مشابه رو پیدا کن.','مهارتی')}
  </div><p class="muted-note">تمام بازی‌های این نسخه نمایشی هستند. سکه‌ها مجازی‌اند و ارزش نقدی یا امکان برداشت ندارند.</p>`;
}
function gameListItem(id, symbol, name, desc, type) {
  return `<div class="game-list-item" data-category="${type === 'مهارتی' ? 'skill' : 'fun'}"><div class="symbol">${symbol}</div><div class="info"><b>${name}</b><small>${desc}</small></div><button class="btn btn-primary" data-game="${id}">شروع</button></div>`;
}
const tournaments = [
  { id:'t1', name:'تورنمنت آزاد دابرناز', kind:'عمومی', prize:'۵,۰۰۰', players:'۱۲۸', time:'امروز · ۲۰:۳۰', icon:'🏆' },
  { id:'t2', name:'جام طلایی VIP', kind:'ویژه', prize:'۱۲,۰۰۰', players:'۶۴', time:'فردا · ۱۹:۰۰', icon:'👑' },
  { id:'t3', name:'چالش قهرمانان', kind:'مهارتی', prize:'۲,۵۰۰', players:'۳۲', time:'شنبه · ۱۸:۰۰', icon:'🥇' }
];
function renderTournaments() {
  return `${heading('تورنمنت‌ها', 'در رقابت‌های دابرناز شرکت کن و امتیاز بگیر.', 'CHAMPIONS ARE MADE HERE')}
  <div class="panel" style="padding:13px;margin-bottom:13px;display:flex;align-items:center;gap:12px"><span style="font-size:33px">🏆</span><div><b style="font-size:12px">وقت درخشیدنه!</b><p class="muted-note" style="margin:3px 0 0">تورنمنت دلخواهت رو انتخاب کن و ثبت‌نام نمایشی انجام بده.</p></div></div>
  ${tournaments.map(t => `<article class="tournament-card"><div class="tournament-top"><div class="tournament-emblem">${t.icon}</div><div><h3>${t.name}</h3><p>${t.time} · ${t.kind}</p></div><span class="tag">آماده ثبت‌نام</span></div><div class="tournament-meta"><span><b>${t.prize}</b>جایزه مجازی</span><span><b>${t.players}</b>ظرفیت</span><span><b>رایگان</b>ورود</span></div><button class="btn ${state.joined.includes(t.id) ? 'btn-muted' : 'btn-primary'} btn-block" data-action="join-tournament" data-id="${t.id}" ${state.joined.includes(t.id) ? 'disabled' : ''}>${state.joined.includes(t.id) ? '✓ ثبت‌نام شدی' : 'ثبت‌نام در تورنمنت'}</button></article>`).join('')}
  <p class="muted-note">ثبت‌نام در این نسخه فقط روی همین دستگاه ذخیره می‌شود و به سرور مسابقات متصل نیست.</p>`;
}
function renderInvite() {
  return `${heading('دعوت از دوستان', 'دوستات رو به دابرناز دعوت کن و کنار هم بازی کنین.', 'INVITE & ENJOY')}
  <section class="invite-hero"><div class="invite-visual">👥</div><span class="eyebrow">با دوستانت بیشتر خوش بگذرون</span><h2>دعوت کن، همراه شو!</h2><p>کد دعوت اختصاصی خودت رو برای دوستات بفرست. سیستم پاداش این نسخه به صورت نمایشی طراحی شده.</p><div class="reward-number">۳۰,۰۰۰ <small style="font-size:11px">سکهٔ مجازی</small></div><div class="ref-box"><input id="refCode" value="${escapeHTML(state.referralCode)}" readonly aria-label="کد دعوت"><button class="btn btn-primary" data-action="copy-ref">کپی کد</button></div><button class="btn btn-gold btn-block" style="margin-top:9px" data-action="share-ref">اشتراک‌گذاری لینک دعوت</button></section>
  ${section('چطور دوستات رو دعوت کنی؟')}
  <div class="steps"><div class="step"><i>🔗</i><b>۱. کد رو کپی کن</b><small>کد اختصاصی خودت رو بردار.</small></div><div class="step"><i>📨</i><b>۲. برای دوستت بفرست</b><small>از پیام‌رسان دلخواهت استفاده کن.</small></div><div class="step"><i>🎉</i><b>۳. همراه شو</b><small>با هم وارد دابرناز بشین.</small></div></div>
  <div class="panel" style="padding:14px;margin-top:13px"><div class="section-title" style="margin:0 0 8px"><h2>آمار دعوت‌ها</h2><span class="gold-text">آزمایشی</span></div><div class="mini-stats"><div class="stat-card"><b>۰</b><small>دعوت‌شده</small></div><div class="stat-card"><b>۰</b><small>دعوت موفق</small></div><div class="stat-card"><b>۰</b><small>پاداش دریافت‌شده</small></div></div></div>`;
}
function renderWallet() {
  const rows = state.transactions.length ? state.transactions.map(tx => `<div class="transaction"><div class="transaction-icon ${tx.amount < 0 ? 'out' : ''}">${tx.amount < 0 ? '↗' : '↙'}</div><div class="transaction-info"><b>${escapeHTML(tx.title)}</b><small>${escapeHTML(tx.date)}</small></div><span class="transaction-amount ${tx.amount < 0 ? 'negative' : 'positive'}">${tx.amount > 0 ? '+' : ''}${money(tx.amount)}</span></div>`).join('') : `<div class="empty"><span>🪙</span>هنوز تراکنشی ثبت نشده است.</div>`;
  return `${heading('کیف پول من', 'موجودی سکه‌های مجازی و گردش حساب.', 'MY WALLET')}
  <section class="wallet-hero"><small>موجودی سکه‌های آزمایشی</small><div class="wallet-balance">${money(state.balance)} <span style="font-size:19px">◈</span></div><p>این موجودی صرفاً نمایشی است و ارزش پول واقعی ندارد.</p><div class="wallet-actions"><button class="btn btn-gold" data-action="demo-credit">+ دریافت آزمایشی</button><button class="btn btn-outline" data-action="wallet-info">شارژ حساب</button><button class="btn btn-outline" data-action="wallet-info">برداشت</button></div></section>
  ${section('تاریخچه تراکنش‌ها')}<section class="panel" style="padding:2px 12px">${rows}</section>
  <p class="muted-note">درگاه پرداخت، واریز بانکی و برداشت وجه در این نسخه فعال نیست.</p>`;
}
function renderAccount() {
  return `${heading('حساب کاربری', 'پروفایل و دستاوردهای خودت رو مدیریت کن.', 'PLAYER PROFILE')}
  <section class="profile-hero"><div class="avatar avatar-large">♛</div><div class="profile-info"><h2>${escapeHTML(state.username)}</h2><small>شناسه بازیکن: ${state.memberId}</small><div class="level"><span></span></div><div class="profile-score">سطح ۷ · ${money(state.points)} امتیاز</div></div><button class="btn btn-outline" data-action="edit-profile">ویرایش</button></section>
  <div class="profile-stat-grid"><div class="profile-stat"><b>${money(state.gamesPlayed)}</b><small>بازی‌ها</small></div><div class="profile-stat"><b>${money(state.wins)}</b><small>بردها</small></div><div class="profile-stat"><b>${money(state.points)}</b><small>امتیاز</small></div><div class="profile-stat"><b>${state.joined.length}</b><small>تورنمنت</small></div></div>
  ${section('مدیریت حساب')}
  ${accountRow('✎','اطلاعات شخصی','نام نمایشی و مشخصات حساب','edit-profile')}
  ${accountRow('🛡','امنیت حساب','مدیریت امنیت و حریم خصوصی','security')}
  ${accountRow('🎖','دستاوردهای من','مشاهده رکوردها و امتیازها','achievements')}
  ${accountRow('⚙','تنظیمات حساب','تنظیمات و ترجیحات','settings')}
  ${accountRow('⇥','خروج از حساب','پاک‌کردن اطلاعات محلی این نسخه','logout')}`;
}
function accountRow(icon, title, desc, action) { return `<button class="list-row" data-action="${action}"><span class="row-icon">${icon}</span><span class="row-copy"><b>${title}</b><small>${desc}</small></span><span class="chevron">‹</span></button>`; }
function renderSettings() {
  const sw = (key, title, desc) => `<div class="setting-row"><div class="setting-copy"><b>${title}</b><small>${desc}</small></div><button class="switch ${state.settings[key] ? 'on' : ''}" role="switch" aria-checked="${!!state.settings[key]}" aria-label="${title}" data-setting="${key}"></button></div>`;
  return `${heading('تنظیمات', 'دابرناز رو مطابق سلیقه خودت تنظیم کن.', 'PREFERENCES')}
  <section class="setting-group"><h3 class="settings-title">تنظیمات عمومی</h3>${sw('sounds','صدای بازی','فعال یا غیرفعال کردن صداها')}${sw('notifications','اعلان‌ها','دریافت اعلان‌های داخل سایت')}${sw('vibration','لرزش','بازخورد لرزشی در دستگاه‌های پشتیبانی‌شده')}</section>
  <section class="setting-group"><h3 class="settings-title">حریم خصوصی</h3>${sw('privacy','نمایش وضعیت آنلاین','اجازه نمایش آنلاین بودن در نسخه نمایشی')}</section>
  <section class="setting-group"><h3 class="settings-title">درباره برنامه</h3><div class="setting-row"><div class="setting-copy"><b>زبان برنامه</b><small>فارسی</small></div><span class="tag">FA</span></div><div class="setting-row"><div class="setting-copy"><b>نسخه دابرناز</b><small>نسخه نمایشی وب‌اپ</small></div><span class="muted-note">1.0.0</span></div></section>
  <button class="btn btn-outline btn-block" data-action="reset-settings">بازنشانی تنظیمات</button>`;
}
const faqs = [
  ['چطور وارد اتاق بازی بشم؟','از صفحه خانه روی «اتاق بازی» بزن یا از کارت بازی مورد علاقه‌ات وارد شو.'],
  ['سکه‌های کیف پول واقعی هستند؟','خیر. در این نسخه تمام سکه‌ها آزمایشی هستند، ارزش نقدی ندارند و قابل واریز یا برداشت نیستند.'],
  ['چطور در تورنمنت شرکت کنم؟','وارد بخش تورنمنت شو و روی دکمه ثبت‌نام تورنمنت دلخواهت بزن. ثبت‌نام در این نسخه روی همین دستگاه ذخیره می‌شود.'],
  ['اطلاعات من کجا ذخیره می‌شود؟','اطلاعات نمایشی این نسخه در حافظه محلی مرورگر همین دستگاه ذخیره می‌شود. با پاک کردن داده‌های مرورگر ممکن است حذف شود.'],
  ['چطور با پشتیبانی ارتباط بگیرم؟','فرم پایین صفحه را تکمیل کن. پیام در این نسخه فقط به‌صورت محلی نمایش داده می‌شود و به اپراتور ارسال نمی‌شود.']
];
function renderSupport() {
  return `${heading('پشتیبانی دابرناز', 'کنارت هستیم تا تجربه بهتری داشته باشی.', 'WE ARE HERE FOR YOU')}
  <section class="invite-hero" style="text-align:right;padding:15px"><div style="display:flex;align-items:center;gap:13px"><div style="font-size:48px;filter:drop-shadow(0 0 12px #f32b43)">🎧</div><div><span class="eyebrow">پشتیبانی آنلاین</span><h2 style="font-size:18px;margin:4px 0;color:#fff">همیشه همراه تو هستیم</h2><p style="margin:0;font-size:9px">سوال یا مشکلی داری؟ راه‌های ارتباطی و پاسخ سوالات متداول رو ببین.</p></div></div></section>
  ${section('راه‌های ارتباطی')}
  <div class="support-grid"><div class="support-card"><span>✈️</span><b>تلگرام</b><small>آیدی پشتیبانی ثبت نشده</small></div><div class="support-card"><span>💬</span><b>گفت‌وگوی آنلاین</b><small>در نسخه نمایشی غیرفعال</small></div><div class="support-card"><span>✉️</span><b>ایمیل</b><small>آدرس ایمیل ثبت نشده</small></div><div class="support-card"><span>📞</span><b>تماس با ما</b><small>شماره تماس ثبت نشده</small></div></div>
  ${section('سوالات متداول')}
  ${faqs.map((f,i) => `<div class="faq-item"><button class="faq-question" data-action="faq" data-id="${i}"><span>${f[0]}</span><span class="chevron">⌄</span></button><div class="faq-answer">${f[1]}</div></div>`).join('')}
  ${section('ارسال پیام به پشتیبانی')}
  <form id="supportForm" class="panel form-stack" style="padding:13px"><input class="form-control" name="subject" maxlength="70" placeholder="موضوع پیام" required><textarea class="form-control" name="message" rows="4" maxlength="1000" placeholder="پیام خودت رو بنویس..." required></textarea><button class="btn btn-primary btn-block" type="submit">ارسال پیام</button><small class="muted-note">فرم در این نسخه نمایشی است و پیام به سرور ارسال نمی‌شود.</small></form>`;
}
function render() {
  const pages = { home:renderHome, games:renderGames, tournaments:renderTournaments, invite:renderInvite, wallet:renderWallet, account:renderAccount, settings:renderSettings, support:renderSupport };
  $('#appView').innerHTML = pages[currentPage]();
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === (currentPage === 'games' ? 'home' : currentPage)));
  updateHeader();
}
function addTransaction(title, amount) {
  state.balance = Math.max(0, state.balance + amount);
  state.transactions.unshift({ title, amount, date: new Date().toLocaleString('fa-IR') });
  state.transactions = state.transactions.slice(0, 30);
  saveState();
}
function openModal(title, content) {
  $('#modalRoot').innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}"><div class="modal-head"><h3>${title}</h3><button class="close-btn" data-action="close-modal" aria-label="بستن">×</button></div>${content}</section></div>`;
}
function closeModal() { $('#modalRoot').innerHTML = ''; }
function launchGame(game) {
  if (game === 'slots') {
    openModal('🎰 اسلات دمو', `<p class="muted-note">برای هر بار چرخش ۱۰۰ سکه مجازی کم می‌شود. این بازی هیچ جایزه نقدی ندارد.</p><div class="slot-result" id="slotResult"><span>❔</span><span>❔</span><span>❔</span></div><p id="slotMessage" class="muted-note" style="text-align:center">آماده‌ای؟</p><button class="btn btn-primary btn-block" data-action="spin-slot">چرخاندن · ۱۰۰ سکه</button><p class="muted-note" style="text-align:center">موجودی: <b class="gold-text">${money(state.balance)}</b> سکه</p>`);
  } else if (game === 'bingo') {
    const nums = Array.from({length:25}, (_,i) => i+1).sort(() => Math.random()-.5);
    bingoGame = { nums, marked:[], calls:0, called:[], won:false };
    openModal('🎱 بینگو تمرینی', `<p class="muted-note">روی عددی که اعلام می‌شود بزن. پنج خانه پشت سر هم را کامل کن.</p><div class="ticker"><span>عدد بعدی</span><strong id="bingoCall">شروع نشده</strong><span id="bingoCount">۰ از ۲۵</span></div><div class="bingo-board">${nums.map(n => `<button class="bingo-cell" data-action="mark-bingo" data-num="${n}">${n}</button>`).join('')}</div><button class="btn btn-primary btn-block" data-action="call-bingo">اعلام عدد جدید</button>`);
  } else if (game === 'poker') {
    const deck = ['A♠','K♥','Q♦','J♣','10♠','9♥','8♦','7♣'];
    const cards = deck.sort(() => Math.random()-.5).slice(0,5);
    openModal('🃏 میز پوکر تمرینی', `<p class="muted-note">یک دست کارت تمرینی برای سرگرمی؛ بدون شرط‌بندی و پول واقعی.</p><div class="card-hand">${cards.map(c => `<span class="playing-card ${/[♥♦]/.test(c) ? 'red' : ''}">${c}</span>`).join('')}</div><p class="muted-note" style="text-align:center">کارت‌های تمرینی تو آماده شدند.</p><button class="btn btn-primary btn-block" data-action="new-poker">گرفتن دست جدید</button>`);
  } else {
    memoryOpen = []; memoryMatched = [];
    const icons = ['🍒','🍋','🍇','🍒','🍋','🍇'];
    openModal('🧠 حافظه طلایی', `<p class="muted-note">کارت‌ها رو یکی‌یکی باز کن و جفت‌های مشابه رو پیدا کن.</p><div class="bingo-board" id="memoryBoard">${[...icons].sort(() => Math.random()-.5).map((v,i) => `<button class="bingo-cell" data-action="memory-card" data-value="${v}" data-index="${i}">✦</button>`).join('')}</div><p id="memoryStatus" class="muted-note" style="text-align:center">جفت‌های پیدا شده: ۰</p>`);
  }
}
let bingoLastCall = null;
let memoryOpen = [];
let memoryMatched = [];
function checkBingoWin() {
  const marked = bingoGame.marked;
  const lines = [];
  for (let r=0;r<5;r++) lines.push(Array.from({length:5},(_,c)=>r*5+c));
  for (let c=0;c<5;c++) lines.push(Array.from({length:5},(_,r)=>r*5+c));
  lines.push([0,6,12,18,24],[4,8,12,16,20]);
  return lines.some(line => line.every(index => marked.includes(bingoGame.nums[index])));
}

document.addEventListener('click', async event => {
  const pageButton = event.target.closest('[data-page]');
  if (pageButton) { event.preventDefault(); setPage(pageButton.dataset.page); return; }
  const gameButton = event.target.closest('[data-game]');
  if (gameButton) { launchGame(gameButton.dataset.game); return; }
  const filter = event.target.closest('[data-game-filter]');
  if (filter) {
    document.querySelectorAll('[data-game-filter]').forEach(el => el.classList.toggle('active', el === filter));
    document.querySelectorAll('.game-list-item').forEach(el => el.hidden = filter.dataset.gameFilter !== 'all' && el.dataset.category !== filter.dataset.gameFilter);
    return;
  }
  const setting = event.target.closest('[data-setting]');
  if (setting) { const key = setting.dataset.setting; state.settings[key] = !state.settings[key]; saveState(); renderSettingsIntoView(); return; }
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  if (action === 'close-modal' || (action === 'backdrop-close' && event.target === actionEl)) { closeModal(); return; }
  if (action === 'copy-ref') {
    try { await navigator.clipboard.writeText(state.referralCode); showToast('کد دعوت کپی شد'); }
    catch (_) { const input = $('#refCode'); input?.select(); showToast('کد دعوت را به‌صورت دستی کپی کن'); }
  } else if (action === 'share-ref') {
    const shareData = { title:'دعوت به دابرناز', text:`با کد ${state.referralCode} به دابرناز بیا!`, url:location.href };
    if (navigator.share) { try { await navigator.share(shareData); } catch (_) {} }
    else { try { await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`); showToast('متن دعوت کپی شد'); } catch (_) { showToast('اشتراک‌گذاری در این مرورگر پشتیبانی نمی‌شود'); } }
  } else if (action === 'demo-credit') {
    addTransaction('هدیه آزمایشی کیف پول', 5000); render(); showToast('۵,۰۰۰ سکه آزمایشی اضافه شد');
  } else if (action === 'wallet-info') showToast('اتصال درگاه و برداشت در نسخه نمایشی فعال نیست');
  else if (action === 'join-tournament') {
    const id = actionEl.dataset.id;
    if (!state.joined.includes(id)) { state.joined.push(id); saveState(); render(); showToast('ثبت‌نام نمایشی با موفقیت انجام شد'); }
  } else if (action === 'faq') actionEl.parentElement.classList.toggle('open');
  else if (action === 'spin-slot') spinSlot();
  else if (action === 'call-bingo') callBingo();
  else if (action === 'mark-bingo') markBingo(Number(actionEl.dataset.num));
  else if (action === 'new-poker') launchGame('poker');
  else if (action === 'memory-card') revealMemory(actionEl);
  else if (action === 'edit-profile') editProfile();
  else if (action === 'settings') setPage('settings');
  else if (action === 'security') showToast('بخش امنیت در نسخه نمایشی فعال نیست');
  else if (action === 'achievements') showToast(`تعداد بردهای ثبت‌شده: ${state.wins}`);
  else if (action === 'logout') confirmReset();
  else if (action === 'reset-settings') { state.settings = { ...defaultState.settings }; saveState(); render(); showToast('تنظیمات بازنشانی شد'); }
});
function renderSettingsIntoView() { const y = window.scrollY; render(); window.scrollTo(0,y); }
function spinSlot() {
  if (state.balance < 100) { $('#slotMessage').textContent = 'موجودی سکه آزمایشی کافی نیست.'; return; }
  addTransaction('هزینه بازی اسلات دمو', -100);
  const symbols = ['🍒','🍋','🍇','💎','👑','7️⃣'];
  const result = Array.from({length:3}, () => symbols[Math.floor(Math.random()*symbols.length)]);
  const counts = result.reduce((acc,v) => (acc[v]=(acc[v]||0)+1,acc),{});
  const max = Math.max(...Object.values(counts));
  let prize = max === 3 ? (result[0] === '7️⃣' ? 1000 : 500) : max === 2 ? 150 : 0;
  if (prize) addTransaction('جایزه اسلات دمو', prize);
  $('#slotResult').innerHTML = result.map(v => `<span>${v}</span>`).join('');
  $('#slotMessage').textContent = prize ? `تبریک! ${money(prize)} سکه مجازی بردی.` : 'این بار برنده نشدی؛ دوباره تلاش کن.';
  const bal = $('#modalRoot .modal .muted-note:last-child'); if (bal) bal.innerHTML = `موجودی: <b class="gold-text">${money(state.balance)}</b> سکه`;
  state.gamesPlayed++; if (prize) state.wins++; saveState(); updateHeader();
}
function callBingo() {
  if (!bingoGame || bingoGame.calls >= 25) return;
  const remaining = bingoGame.nums.filter(n => !bingoGame.called?.includes(n));
  if (!bingoGame.called) bingoGame.called = [];
  const number = remaining[Math.floor(Math.random()*remaining.length)]; bingoGame.called.push(number); bingoGame.calls++;
  $('#bingoCall').textContent = number; $('#bingoCount').textContent = `${bingoGame.calls} از ۲۵`;
  const cell = [...document.querySelectorAll('.bingo-cell')].find(el => Number(el.dataset.num) === number);
  cell?.classList.add('marked');
  if (!bingoGame.marked.includes(number)) bingoGame.marked.push(number);
  if (!bingoGame.won && checkBingoWin()) { bingoGame.won = true; $('#bingoCall').textContent = `${number} · بینگو!`; showToast('آفرین! یک خط کامل کردی.'); state.wins++; state.gamesPlayed++; saveState(); }
}
function markBingo(number) {
  if (!bingoGame || !bingoGame.called?.includes(number)) { showToast('اول صبر کن این عدد اعلام بشه'); return; }
  const cell = [...document.querySelectorAll('.bingo-cell')].find(el => Number(el.dataset.num) === number);
  cell?.classList.add('marked');
}
function revealMemory(button) {
  const index = Number(button.dataset.index);
  if (memoryMatched.includes(index) || memoryOpen.some(x => x.index === index)) return;
  button.textContent = button.dataset.value; button.classList.add('marked'); memoryOpen.push({ index, value:button.dataset.value, button });
  if (memoryOpen.length === 2) {
    const pair = memoryOpen.slice(); memoryOpen = [];
    if (pair[0].value === pair[1].value) {
      memoryMatched.push(pair[0].index,pair[1].index); $('#memoryStatus').textContent = `جفت‌های پیدا شده: ${memoryMatched.length/2}`;
      if (memoryMatched.length === 6) { showToast('آفرین! همه جفت‌ها پیدا شدند.'); state.wins++; state.gamesPlayed++; saveState(); }
    } else setTimeout(() => pair.forEach(x => { if (x.button.isConnected) { x.button.textContent='✦'; x.button.classList.remove('marked'); } }), 700);
  }
}
function editProfile() {
  openModal('ویرایش اطلاعات حساب', `<form id="profileForm" class="form-stack"><label class="muted-note">نام نمایشی</label><input class="form-control" name="username" maxlength="22" minlength="2" value="${escapeHTML(state.username)}" required><p class="muted-note">شناسه بازیکن: ${state.memberId}</p><button class="btn btn-primary btn-block" type="submit">ذخیره تغییرات</button></form>`);
}
function confirmReset() {
  openModal('پاک کردن اطلاعات محلی؟', `<p class="muted-note">با این کار اطلاعات نمایشی این مرورگر به حالت اولیه برمی‌گردد.</p><div style="display:flex;gap:8px"><button class="btn btn-muted" style="flex:1" data-action="close-modal">انصراف</button><button class="btn btn-primary" style="flex:1" data-action="confirm-reset">تأیید و بازنشانی</button></div>`);
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-action="confirm-reset"]');
  if (button) { state = cloneData(defaultState); saveState(); closeModal(); setPage('home'); showToast('اطلاعات محلی بازنشانی شد'); }
});
document.addEventListener('submit', event => {
  if (event.target.id === 'profileForm') {
    event.preventDefault(); const name = new FormData(event.target).get('username').toString().trim();
    if (name.length < 2) { showToast('نام باید حداقل ۲ حرف داشته باشد'); return; }
    state.username = name; saveState(); closeModal(); render(); showToast('نام نمایشی ذخیره شد');
  }
  if (event.target.id === 'supportForm') {
    event.preventDefault(); const data = new FormData(event.target);
    if (!data.get('subject').toString().trim() || !data.get('message').toString().trim()) return;
    event.target.reset(); showToast('پیام در نسخه نمایشی ثبت شد؛ به سرور ارسال نشده است.');
  }
});

render();
