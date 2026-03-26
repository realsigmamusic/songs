import { parseSong, renderSong } from 'https://cdn.jsdelivr.net/npm/chord-mark@0.17.0/+esm';

let tamanhoFonte = parseInt(localStorage.getItem('tamanhoFonte')) || 80; // 80% do tamanho da fonte

let tomAtual = 0; 
let textoCifraOriginal = ""; // Guarda apenas o texto bruto
let tituloAtual = ""; 

async function carregarMusicaDaURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let songUrl = urlParams.get('song');
    const container = document.getElementById('chord-container');

    if (!songUrl) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <h4>Nenhuma música encontrada</h4>
                <p>Acesse usando um link direto. Exemplo:<br><code>https://realsigmamusic.github.io/songs/?song=nome+da+música.txt</code></p>
            </div>`;
        return;
    }

    if (!songUrl.endsWith('.txt')) songUrl += '.txt';

    container.innerHTML = `<div class="text-center py-5">Carregando cifra...</div>`;

    try {
        const resposta = await fetch(`songs/${songUrl}`);
        if (!resposta.ok) throw new Error(`O arquivo <b>${songUrl}</b> não foi encontrado na pasta songs/.`);
        
        textoCifraOriginal = await resposta.text();
        tituloAtual = songUrl.replace('.txt', '').replace(/\//g, ' - ');

        renderizarCifra();
        
        document.title = `${tituloAtual} - Real Sigma Music`;

    } catch (erro) {
        console.error(erro);
        container.innerHTML = `<div class="alert alert-danger">${erro.message}</div>`;
    }
}

function renderizarCifra() {
    if (!textoCifraOriginal) return;

    const parsedSong = parseSong(textoCifraOriginal);

    const htmlOutput = renderSong(parsedSong, {
        alignBars: false,
        alignChordsWithLyrics: true,
        transposeValue: tomAtual,
        printBarSeparators: 'always',
        printChordsDuration: 'always',
        printSubBeatDelimiters: true
    });

    const container = document.getElementById('chord-container');
    
    const badgeTom = tomAtual === 0 ? '' : `<span class="badge bg-secondary ms-2 fs-6 align-middle">${tomAtual > 0 ? '+' : ''}${tomAtual}</span>`;

    container.innerHTML = `
        <h3 class="mb-4 text-capitalize">${tituloAtual} ${badgeTom}</h3>
        <div id="render-area">${htmlOutput}</div>
    `;

    aplicarFonte();
}

carregarMusicaDaURL();


// CONTROLES DE FONTE
window.mudarTamanhoFonte = function(delta) {
    tamanhoFonte += delta;
    if (tamanhoFonte < 50) tamanhoFonte = 50;
    if (tamanhoFonte > 250) tamanhoFonte = 250;
    localStorage.setItem('tamanhoFonte', tamanhoFonte);
    aplicarFonte();
}

window.resetarFonte = function() {
    tamanhoFonte = 80; // 80% do tamanho da fonte
    localStorage.setItem('tamanhoFonte', tamanhoFonte);
    aplicarFonte();
}

function aplicarFonte() {
    const area = document.getElementById('render-area');
    if (area) area.style.fontSize = `${tamanhoFonte}%`;
}


// CONTROLES DE TOM
window.mudarTom = function(delta) {
    tomAtual += delta;
    if (tomAtual < -12) tomAtual = -12;
    if (tomAtual > 12) tomAtual = 12;
    renderizarCifra();
}

window.resetarTom = function() {
    tomAtual = 0;
    renderizarCifra();
}

// CONTROLE DE TEMA
const getPreferredTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const setTheme = theme => document.documentElement.setAttribute('data-bs-theme', theme);      
setTheme(getPreferredTheme());
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTheme(getPreferredTheme()));
