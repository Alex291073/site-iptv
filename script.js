async function carregarListaM3U() {
    const containerCanais = document.getElementById('lista-canais');
    containerCanais.innerText = "Processando lista...";

    const nomesPossiveis = ['/lista.m3u8', '/lista.m3u', '/lista', '/m3u8 m3u playlist file'];
    let textoM3U = null;

    for (const nome of nomesPossiveis) {
        try {
            const resposta = await fetch(nome);
            if (resposta.ok) {
                textoM3U = await resposta.text();
                break;
            }
        } catch (e) {
            // Avança para a próxima tentativa
        }
    }
    
    if (!textoM3U) {
        containerCanais.innerHTML = "<span style='color: #ff4a4a;'>⚠️ Erro: Arquivo de lista não encontrado.</span>";
        return;
    }

    const linhas = textoM3U.split(/\r?\n/);
    containerCanais.innerHTML = ""; 
    
    let nomeCanal = "";
    let urlLogo = ""; 
    let contadorCanais = 0;
    const playerVideo = document.getElementById('player');

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i].trim();

        if (!linha) continue;

        if (linha.toUpperCase().startsWith('#EXTINF:')) {
            const partes = linha.split(',');
            nomeCanal = partes[partes.length - 1].trim();

            const regexLogo = /tvg-logo="([^"]+)"/i;
            const resultadoLogo = linha.match(regexLogo);
            if (resultadoLogo && resultadoLogo[1]) {
                urlLogo = resultadoLogo[1]; 
            } else {
                urlLogo = ""; 
            }
        } 
        // CORREÇÃO: "linha" escrito corretamente com "a" no final nesta linha abaixo
        else if (linha.toLowerCase().startsWith('http://') || linha.toLowerCase().startsWith('https://')) {
            const urlCanal = linha;

            const botao = document.createElement('button');
            botao.className = 'canal-btn';

            if (urlLogo) {
                const img = document.createElement('img');
                img.src = urlLogo;
                img.className = 'canal-logo';
                img.alt = "logo";
                botao.appendChild(img); 
            }

            const textoNome = document.createElement('span');
            textoNome.innerText = nomeCanal || `Canal Sem Nome (${contadorCanais + 1})`;
            botao.appendChild(textoNome); 
            
            botao.onclick = () => {
                const botaoAtivoAnterior = document.querySelector('.canal-btn.ativo');
                if (botaoAtivoAnterior) {
                    botaoAtivoAnterior.classList.remove('ativo');
                }
                botao.classList.add('ativo');

                playerVideo.src = urlCanal;
                playerVideo.play().catch(error => {
                    console.log("Autoplay bloqueado pelo navegador", error);
                });
            };

            containerCanais.appendChild(botao);
            
            nomeCanal = ""; 
            urlLogo = ""; 
            contadorCanais++;
        }
    }

    if (contadorCanais === 0) {
        containerCanais.innerHTML = "<span style='color: #ffb700;'>⚠️ Nenhum canal válido encontrado.</span>";
    }
}

function filtrarCanais() {
    const termoBusca = document.getElementById('busca').value.toLowerCase();
    const botoes = document.querySelectorAll('.canal-btn');

    botoes.forEach(botao => {
        const nomeCanal = botao.innerText.toLowerCase();
        if (nomeCanal.includes(termoBusca)) {
            botao.style.display = "flex"; 
        } else {
            botao.style.display = "none";
        }
    });
}

carregarListaM3U();
