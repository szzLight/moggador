let gameState = { 
    playerName: "Moggador", 
    currentStep: "start", 
    musicStarted: false, 
    aura: 100, 
    enemyHP: 100, 
    enemyMaxHP: 100 
};
let currentAttackGif = null;

// --- SISTEMA DE ÁUDIO ---
function playSound(file, vol = 1) { 
    const audio = new Audio(`assets/sounds/${file}`);
    audio.volume = vol;
    audio.play().catch(() => {});
}

function startMusic() {
    if (!gameState.musicStarted) {
        const m = document.getElementById('bg-music');
        if (m) { 
            m.volume = 0.15; 
            m.loop = true; 
            m.play().catch(() => {}); 
            gameState.musicStarted = true; 
        }
    }
}

// --- SISTEMA DE SALVAMENTO (SAVE GAME) ---
function saveGame() { 
    localStorage.setItem('moggador_save_file', JSON.stringify(gameState)); 
    alert("JOGO SALVO COM SUCESSO."); 
}

function loadGame() {
    const data = localStorage.getItem('moggador_save_file');
    if (data) { 
        gameState = JSON.parse(data); 
        // Esconde a UI do inimigo se não estiver em luta ao carregar
        document.getElementById('enemy-ui').style.display = (gameState.currentStep.includes('luta') || gameState.currentStep.includes('atq')) ? "block" : "none"; 
        updateAuraUI(); 
        render(); 
        alert("SAVE CARREGADO."); 
    } else {
        alert("NENHUM SAVE ENCONTRADO.");
    }
}

// --- INTERFACE E STATUS ---
function updateAuraUI() {
    const fill = document.getElementById('aura-fill');
    const rank = document.getElementById('aura-rank');
    if (fill) fill.style.width = gameState.aura + "%";
    if (rank) {
        let r = "BETA";
        if (gameState.aura >= 91) r = "SIGMA";
        else if (gameState.aura >= 61) r = "ALPHA";
        else if (gameState.aura >= 31) r = "GAMMA";
        else if (gameState.aura > 0) r = "OMEGA";
        rank.innerText = r;
    }
    if (gameState.aura <= 0) { 
        gameState.aura = 0; 
        gameState.currentStep = "descansar"; 
        render(); 
    }
}

// --- VISUAIS DE ATAQUE ---
function showAttackGif(path) {
    const overlay = document.getElementById('attack-gif-overlay');
    if (!overlay) return;
    overlay.innerHTML = '';
    const img = document.createElement('img');
    img.src = path;
    img.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:450px;max-width:85vw;max-height:70vh;pointer-events:none;z-index:50;border-radius:15px;box-shadow:0 0 40px rgba(0,255,100,0.9);animation:pulseGlow 1s ease-in-out infinite alternate;";
    overlay.appendChild(img);
    currentAttackGif = img;
}

function clearAttackGif() { 
    if (currentAttackGif && currentAttackGif.parentElement) {
        currentAttackGif.parentElement.removeChild(currentAttackGif);
    }
    currentAttackGif = null; 
}

document.head.insertAdjacentHTML('beforeend', `<style>@keyframes pulseGlow{from{box-shadow:0 0 30px rgba(0,255,100,0.8)}to{box-shadow:0 0 70px rgba(0,255,100,1)}}</style>`);

const attackGifs = { 
    mewing: "assets/gifs/mewing.gif", 
    olhar: "assets/gifs/olhar-superior.gif", 
    ignore: "assets/gifs/ignore.gif", 
    risos: "assets/gifs/risos-internos.gif" 
};

// --- MECÂNICAS DE COMBATE ---
function playerAttack(dmg, cost = 0, gain = 0, vol = 0.5, gif = "mewing") {
    gameState.enemyHP = Math.max(0, gameState.enemyHP - dmg);
    gameState.aura = Math.max(0, Math.min(100, gameState.aura - cost + gain));
    playSound('vine-boom.mp3', vol);
    document.getElementById('enemy-hp-fill').style.width = (gameState.enemyHP / gameState.enemyMaxHP * 100) + "%";
    updateAuraUI();
    showAttackGif(attackGifs[gif] || attackGifs.mewing);
}

function enemyAttack() {
    const attacks = [
        { text: "Ele tenta te ensinar Java. ABSURDO! (-12 Aura)", dmg: 12 },
        { text: "Ele te mostra um labubu. CRINGE! (-20 Aura)", dmg: 20 },
        { text: "Ele pergunta se você acompanha o Davi Brito. BIZARRO! (-5 Aura)", dmg: 5 },
        { text: "Ele recomenda um anime de 1000 episódios. 'FICA BOM DEPOIS DO 500 EU JURO!' (-15 Aura)", dmg: 15 },
        { text: "Ele jura que a terra é uma bola. COMO ASSIM?! (-8 Aura)", dmg: 8 }
    ];
    const i = Math.floor(Math.random() * attacks.length);
    const atq = attacks[i];
    gameState.aura = Math.max(0, gameState.aura - atq.dmg);
    updateAuraUI();
    return atq.text;
}

function startCombat() { 
    gameState.enemyHP = gameState.enemyMaxHP = 100; 
    document.getElementById('enemy-ui').style.display = "block"; 
    document.getElementById('enemy-hp-fill').style.width = "100%"; 
}

function endCombat() { 
    document.getElementById('enemy-ui').style.display = "none"; 
    gameState.aura = Math.min(100, gameState.aura + 25); 
    updateAuraUI(); 
}

// --- ROTEIRO E DIÁLOGOS ---
const gameScript = {
    start: { 
        name: "SISTEMA", 
        text: "Tá pronto para farmar aura?", 
        next: "ask_name" 
    },
    ask_name: { 
        name: "SISTEMA", 
        text: "Identifique-se, jovem sigma. Qual seu nome?", 
        type: "input", 
        saveVar: "playerName", 
        next: "bullying" 
    },
    bullying: { 
        name: "SISTEMA", 
        text: () => `Esse é teu nome mesmo? "${gameState.playerName}"? Tu deve ter sofrido bullying na infância.`, 
        type: "choice", 
        options: [{text: "Que isso cara :(", next: "welcome"}] 
    },
    welcome: { 
        name: "NARRADOR", 
        text: () => `Enfim, ${gameState.playerName}... O povo de Xique-Xique não entende seu jeito alpha. (Inveja)`, 
        next: "pergunta_moggar" 
    },
    pergunta_moggar: { 
        name: "NARRADOR", 
        text: "Como tá o mewing? Vamos moggar os betinhas?", 
        type: "choice", 
        options: [
            {text: "Sim (Iniciar Jornada)", next: "menu_principal"}, 
            {text: "Não (Sou um Beta)", next: "video_beta"}
        ] 
    },
    video_beta: { 
        name: "SISTEMA", 
        text: "FRAQUEZA DETECTADA.", 
        action: () => window.open('https://www.youtube.com/shorts/WUX8gflwXEE', '_blank'), 
        next: "pergunta_moggar" 
    },
    menu_principal: { 
        name: "VOCÊ", 
        text: "O que faremos agora?", 
        type: "choice", 
        options: [
            {text: "Procurar Betinhas", next: "encontro"}, 
            {text: "Descansar um pouco", next: "descansar"}
        ] 
    },
    encontro: { 
        name: "NARRADOR", 
        text: "ALERTA! Um betinha anda na mesma calçada que você. Ele está usando uma camisa de anime e cheira a salgadinho (eca).", 
        action: startCombat, 
        next: "luta" 
    },
    luta: { 
        name: "COMBATE", 
        text: () => `O inimigo está tentando falar com você.\nHP Inimigo: ${gameState.enemyHP}/100`, 
        type: "choice", 
        options: [
            {text: "Mewing Silencioso (-30 HP)", next: "atq_mewing"},
            {text: "Olhar Superior (-50 HP / -10 Aura)", next: "atq_olhar"},
            {text: "Ignore Total (-20 HP / +5 Aura)", next: "atq_ignore"},
            {text: "Risos Internos (-40 HP)", next: "atq_risos"},
            {text: "Fugir (Perde 15 Aura)", next: "fugir"}
        ]
    },
    atq_mewing: { name: "VOCÊ", text: "🤫🧏‍♂️...", action: () => playerAttack(30,0,0,0.5,"mewing"), next: "check" },
    atq_olhar: { name: "VOCÊ", text: "Sua aura esmaga ele!", action: () => playerAttack(50,10,0,0.8,"olhar"), next: "check" },
    atq_ignore: { name: "VOCÊ", text: "Você passa reto como se ele não existisse.", action: () => playerAttack(20,0,5,0.4,"ignore"), next: "check" },
    atq_risos: { name: "VOCÊ", text: "(Risos internos)", action: () => playerAttack(40,5,0,0.6,"risos"), next: "check" },
    fugir: { name: "VOCÊ", text: "Covarde! Você foge...", action: () => { gameState.aura = Math.max(0, gameState.aura - 15); updateAuraUI(); endCombat(); clearAttackGif(); }, next: "menu_principal" },
    check: { 
        name: "SISTEMA", 
        text: "QUANTA AURA!", 
        action: () => setTimeout(() => { 
            gameState.currentStep = gameState.enemyHP <= 0 ? "vitoria" : "turno_beta"; 
            render(); 
        }, 800) 
    },
    turno_beta: { 
        name: "BETINHA", 
        text: "", 
        action: () => document.getElementById('text-content').innerText = enemyAttack(), 
        next: "luta" 
    },
    vitoria: { 
        name: "NARRADOR", 
        text: "MOGGADO! Ele fugiu pro Discord chorando.", 
        action: endCombat, 
        next: "final_demo" 
    },
   final_demo: { 
    name: "SISTEMA", 
    text: "Como essa é a versão 0.0.0.0.1, o jogo acabou, fazer o que né?\n\n" +
          "AGRADECIMENTOS:\n" +
          "YouTube, Reddit, e um monte de IA", 
    type: "choice", 
    options: [{text: "Voltar ao Menu Principal", next: "menu_principal"}] 
},
    descansar: { 
        name: "SISTEMA", 
        text: "ERRO FATAL: DESCANSO É COISA DE BETA!", 
        action: () => {
            playSound('beta-fail.mp3', 0.3);
            const gif = document.getElementById('aura-gif'); if (gif) gif.src = "assets/gifs/beta.gif";
            const fill = document.getElementById('aura-fill'); if (fill) fill.style.width = "0%";
            const rank = document.getElementById('aura-rank'); if (rank) rank.innerText = "BETA";
            setTimeout(() => location.reload(), 5000);
        }
    }
};

// RENDERIZAÇÃO ---
function render() {
    const step = gameScript[gameState.currentStep];
    if (!step) return;

    const nameEl = document.getElementById('character-name');
    const textEl = document.getElementById('text-content');
    const inter = document.getElementById('interactive-content');
    
    if (nameEl) nameEl.innerText = step.name;
    if (textEl) textEl.innerText = typeof step.text === 'function' ? step.text() : step.text;
    if (inter) inter.innerHTML = "";
    if (step.action) step.action();

    if (step.type === "input") {
        const div = document.createElement('div'); 
        div.style.marginTop = "20px";
        const input = document.createElement('input'); 
        input.type = "text"; 
        input.placeholder = "Digite seu nome sigma..."; 
        input.style.cssText = "padding:10px;font-size:16px;width:70%;max-width:300px;background:#111;color:#0f9;border:1px solid #0f9;";
        
        const btn = document.createElement('button'); 
        btn.className = "action-btn"; 
        btn.innerText = "Confirmar"; 
        btn.style.cssText = "margin-left:10px;padding:10px 20px;font-size:16px;";
        
        div.append(input, btn); 
        inter.appendChild(div);
        setTimeout(() => input.focus(), 100);

        btn.onclick = () => {
            const val = input.value.trim();
            if (!val) return alert("Digite um nome, beta!"), input.focus();
            
            
            if (["brayan","bryan","braian","brian"].includes(val.toLowerCase())) {
                alert("Nem tenta.");
                input.value = "";
                input.focus();
                return;
            }
            
            startMusic(); 
            gameState[step.saveVar] = val; 
            gameState.currentStep = step.next; 
            render();
        };

        
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btn.click();
            }
        };

    } else if (step.type === "choice") {
        step.options.forEach(opt => {
            const b = document.createElement('button'); 
            b.className = "choice-btn"; 
            b.innerText = opt.text;
            b.onclick = () => { 
                clearAttackGif(); 
                if (opt.action) opt.action(); 
                startMusic(); 
                gameState.currentStep = opt.next; 
                render(); 
            };
            inter.appendChild(b);
        });
    } else if (gameState.currentStep !== "check") {
        const b = document.createElement('button'); 
        b.className = "action-btn"; 
        b.innerText = "Continuar >>";
        b.onclick = () => { 
            clearAttackGif(); 
            startMusic(); 
            gameState.currentStep = step.next; 
            render(); 
        };
        inter.appendChild(b);
    }
}

window.onload = () => {
    document.getElementById('enemy-ui').style.display = "none";
    updateAuraUI();
    render();
};