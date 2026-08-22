// Game State
let balance = 10;
let fans = 5000;
let boardConfidence = 100;
let ticketPrice = 15;
let currentTactic = "Balanced";
let wins = 0;
let leagueTitles = 0;
let cupTitles = 0;

let activeSponsor = null;

let squad = [
    { name: "John Doe", pos: "FW", rating: 72, wage: 5000 },
    { name: "Alex Smith", pos: "MF", rating: 70, wage: 4000 },
    { name: "David Ray", pos: "DF", rating: 68, wage: 3500 },
    { name: "Mark Cole", pos: "GK", rating: 71, wage: 4000 }
];

let market = [
    { name: "Carlos Silva", pos: "FW", rating: 80, price: 500000, wage: 12000 },
    { name: "Liam Brown", pos: "MF", rating: 76, price: 300000, wage: 8000 },
    { name: "Erick Hansen", pos: "DF", rating: 78, price: 400000, wage: 9500 },
    { name: "Sergio Ramos", pos: "DF", rating: 12060, price: 50000000, wage: 999999 }
];

const sponsors = [
    { name: "Fly High Airways", payout: 50000, reqWins: 3 },
    { name: "TechCorp Global", payout: 100000, reqWins: 5 }
];

// Attach Event Listeners
function setupEventListeners() {
    // Play Match Button
    const playBtn = document.getElementById('play-match-btn');
    if (playBtn) playBtn.addEventListener('click', playMatch);

    // Navigation Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.target.getAttribute('data-tab');
            switchTab(tabId, e.target);
        });
    });

    // Tactics Selector
    const tacticsSelect = document.getElementById('tactics-select');
    if (tacticsSelect) {
        tacticsSelect.addEventListener('change', (e) => {
            currentTactic = e.target.value;
        });
    }

    // Ticket Slider
    const ticketSlider = document.getElementById('ticket-price');
    if (ticketSlider) {
        ticketSlider.addEventListener('input', (e) => {
            ticketPrice = parseInt(e.target.value);
            document.getElementById('ticket-price-val').innerText = ticketPrice;
        });
    }
}

function init() {
    setupEventListeners();
    updateUI();
    renderSquad();
    renderMarket();
    renderSponsors();
}

function updateUI() {
    document.getElementById('balance').innerText = balance.toLocaleString();
    document.getElementById('fans').innerText = fans.toLocaleString();
    document.getElementById('board-confidence').innerText = boardConfidence;
    document.getElementById('league-trophies').innerText = leagueTitles;
    document.getElementById('cup-trophies').innerText = cupTitles;
    
    if (boardConfidence <= 0) {
        alert("GAME OVER! You have been sacked by the board.");
        location.reload();
    }
}

function switchTab(tabId, clickedBtn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');
    if (clickedBtn) clickedBtn.classList.add('active');
}

function renderSquad() {
    const list = document.getElementById('squad-list');
    list.innerHTML = "";
    squad.forEach(player => {
        list.innerHTML += `<li>
            <span><strong>${player.name}</strong> (${player.pos}) - Rating: ${player.rating}</span>
            <small>$${player.wage}/match</small>
        </li>`;
    });
}

function getTeamRating() {
    const total = squad.reduce((sum, p) => sum + p.rating, 0);
    return Math.round(total / squad.length);
}

function renderMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = "";
    market.forEach((player, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${player.name}</strong> (${player.pos}) - OVR: ${player.rating}</span>`;
        
        const buyBtn = document.createElement('button');
        buyBtn.innerText = `Buy $${player.price.toLocaleString()}`;
        buyBtn.addEventListener('click', () => buyPlayer(index));
        
        li.appendChild(buyBtn);
        list.appendChild(li);
    });
}

function buyPlayer(index) {
    const player = market[index];
    if (balance >= player.price) {
        balance -= player.price;
        squad.push(player);
        market.splice(index, 1);
        renderSquad();
        renderMarket();
        updateUI();
        logCommentary(`SIGNED! ${player.name} joined the club for $${player.price.toLocaleString()}.`);
    } else {
        alert("Not enough funds!");
    }
}

async function playMatch() {
    const btn = document.getElementById('play-match-btn');
    if (!btn || btn.disabled) return;
    
    btn.disabled = true;

    // Deduct Wages
    const totalWages = squad.reduce((sum, p) => sum + p.wage, 0);
    balance -= totalWages;

    // Attendance based on ticket price
    const attendanceFactor = Math.max(0.2, 1 - (ticketPrice - 15) * 0.03);
    const matchAttendance = Math.floor(fans * attendanceFactor);
    const matchIncome = matchAttendance * ticketPrice;
    balance += matchIncome;

    logCommentary(`--- MATCHDAY STARTED ---`);
    logCommentary(`Attendance: ${matchAttendance} fans. Gate Receipt: $${matchIncome.toLocaleString()}`);

    // Match Simulation
    let myScore = 0;
    let oppScore = 0;
    let teamPower = getTeamRating() + (currentTactic === "Gegenpressing" ? 5 : 0);
    let oppPower = 70 + Math.floor(Math.random() * 8);

    for (let min = 15; min <= 90; min += 25) {
        await new Promise(r => setTimeout(r, 500));
        
        if (Math.random() * teamPower > Math.random() * oppPower) {
            myScore++;
            logCommentary(`[${min}'] GOAL! Great team attack scored! (${myScore}-${oppScore})`);
        } else if (Math.random() * 100 > 60) {
            oppScore++;
            logCommentary(`[${min}'] GOAL! Opposition scores! (${myScore}-${oppScore})`);
        } else {
            logCommentary(`[${min}'] Solid defending from both sides.`);
        }
    }

    // Match Outcome Processing
    if (myScore > oppScore) {
        logCommentary(`FULL TIME: VICTORY! Final score ${myScore}-${oppScore}.`);
        fans += 150;
        boardConfidence = Math.min(100, boardConfidence + 5);
        wins++;
        checkTrophyProgress();
    } else if (myScore === oppScore) {
        logCommentary(`FULL TIME: DRAW! Final score ${myScore}-${oppScore}.`);
    } else {
        logCommentary(`FULL TIME: DEFEAT! Final score ${myScore}-${oppScore}.`);
        fans = Math.max(100, fans - 100);
        boardConfidence -= 8;
    }

    // Process Active Sponsor
    if (activeSponsor) {
        activeSponsor.reqWins--;
        if (activeSponsor.reqWins <= 0) {
            balance += activeSponsor.payout;
            logCommentary(`SPONSOR COMPLETED! Received $${activeSponsor.payout.toLocaleString()}.`);
            activeSponsor = null;
            renderSponsors();
        }
    }

    updateUI();
    btn.disabled = false;
}

function logCommentary(msg) {
    const box = document.getElementById('commentary-box');
    if (box) {
        box.innerHTML += `<p>${msg}</p>`;
        box.scrollTop = box.scrollHeight;
    }
}

function renderSponsors() {
    const container = document.getElementById('sponsor-container');
    if (!container) return;
    
    container.innerHTML = "";
    if (activeSponsor) {
        container.innerHTML = `<p><strong>Active Sponsor:</strong> ${activeSponsor.name}</p>
        <p>Wins remaining needed: ${activeSponsor.reqWins}</p>`;
    } else {
        sponsors.forEach((s, idx) => {
            const div = document.createElement('div');
            div.style.marginTop = "10px";
            div.innerHTML = `<strong>${s.name}</strong> - $${s.payout.toLocaleString()} payout (Win ${s.reqWins} matches) `;
            
            const signBtn = document.createElement('button');
            signBtn.innerText = "Sign Deal";
            signBtn.addEventListener('click', () => signSponsor(idx));
            
            div.appendChild(signBtn);
            container.appendChild(div);
        });
    }
}

function signSponsor(idx) {
    activeSponsor = { ...sponsors[idx] };
    renderSponsors();
}

function checkTrophyProgress() {
    if (wins % 5 === 0) {
        cupTitles++;
        alert("🏆 CONGRATULATIONS! You won a Domestic Cup!");
    }
    if (wins % 10 === 0) {
        leagueTitles++;
        alert("🏆 CHAMPIONS! You won the League Title!");
    }
}

// Start Game
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}