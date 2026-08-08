import {
    buscarPopulares,
    buscarEmAlta,
    buscarPorCategoria,
    buscarPorTexto,
    buscarDetalhes,
    buscarTrailer,
    GENEROS,
} from './services/tmdbService.js';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function cardHTML(item) {
    const poster = item.poster ||
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750"><rect width="100%25" height="100%25" fill="%23222"/></svg>';
    return `
        <div class="item">
            <div class="box-filme card" data-id="${item.id}" data-tipo="${item.tipo}"
                 title="${escapeAttr(item.titulo)}">
                <img class="box-filme-img" loading="lazy" src="${poster}" alt="${escapeAttr(item.titulo)}">
                <span class="card-nota"><i class="fa-solid fa-star"></i> ${item.nota}</span>
            </div>
        </div>`;
}

function skeletonHTML(qtd = 6) {
    return Array.from({ length: qtd })
        .map(() => `<div class="item"><div class="skeleton-card"></div></div>`)
        .join('');
}

function escapeAttr(str = '') {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function preencherCarrossel(selector, fetchPromise, titulo) {
    const el = $(selector);
    if (!el) return;

    const carousel = $('.owl-carousel', el) || el;
    carousel.innerHTML = skeletonHTML();

    try {
        const items = await fetchPromise;
        if (!items.length) {
            carousel.innerHTML = `<div class="sem-resultado">Nenhum título encontrado.</div>`;
            return;
        }
        carousel.innerHTML = items.map(cardHTML).join('');
        if (typeof window.iniciarOwl === 'function') {
            window.iniciarOwl('#' + carousel.id);
        }
    } catch (err) {
        carousel.innerHTML = `<div class="erro-carrossel">${escapeAttr(err.message)}</div>`;
    }
}

async function preencherDestaque(selector) {
    const el = $(selector);
    if (!el) return;
    try {
        const emAlta = await buscarEmAlta();
        const top = emAlta.find((i) => i.backdrop) || emAlta[0];
        if (!top) return;

        const detalhes = await buscarDetalhes(top.id, top.tipo);
        el.style.backgroundImage = detalhes.backdrop
            ? `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url('${detalhes.backdrop}')`
            : '';
        $('.titulo', el).textContent = detalhes.titulo;
        $('.descricao', el).textContent = detalhes.sinopse;

        const btn = $('.assistir', el);
        if (btn) {
            btn.dataset.id = detalhes.id;
            btn.dataset.tipo = detalhes.tipo;
        }
    } catch (err) {
        console.warn('Destaque não carregado:', err.message);
    }
}

async function abrirModal(id, tipo) {
    const modal = $('#modal');
    if (!modal) return;

    const corpo = $('#modal-corpo');
    corpo.innerHTML = `<div class="modal-loading">Carregando…</div>`;
    modal.classList.add('aberto');
    document.body.style.overflow = 'hidden';

    try {
        const [detalhes, trailerKey] = await Promise.all([
            buscarDetalhes(id, tipo),
            buscarTrailer(id, tipo),
        ]);

        const trailerEl = document.createElement('div');
        trailerEl.className = 'modal-player';

        if (trailerKey) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(trailerKey)}?autoplay=1&rel=0`;
            iframe.title = `Trailer de ${detalhes.titulo}`;
            iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
            iframe.allowFullscreen = true;
            trailerEl.appendChild(iframe);
        } else {
            trailerEl.innerHTML = `
                <div class="modal-sem-trailer">
                    <i class="fa-solid fa-circle-info"></i>
                    <p>Trailer não disponível para este título.</p>
                </div>`;
        }

        const cabecalho = document.createElement('div');
        cabecalho.className = 'modal-cabecalho';
        cabecalho.innerHTML = `
            <h2>${escapeAttr(detalhes.titulo)}</h2>
            <div class="modal-meta">
                <span><i class="fa-solid fa-star"></i> ${detalhes.nota}</span>
                <span>${detalhes.ano || '—'}</span>
                <span class="modal-tipo">${detalhes.tipo === 'tv' ? 'Série' : 'Filme'}</span>
            </div>`;

        const sinopse = document.createElement('p');
        sinopse.className = 'modal-sinopse';
        sinopse.textContent = detalhes.sinopse;

        const corpo = $('#modal-corpo');
        corpo.innerHTML = '';
        corpo.append(cabecalho, trailerEl, sinopse);
    } catch (err) {
        corpo.innerHTML = `<div class="erro-carrossel">${escapeAttr(err.message)}</div>`;
    }
}

function fecharModal() {
    const modal = $('#modal');
    if (!modal) return;
    modal.classList.remove('aberto');
    $('#modal-corpo').innerHTML = '';
    document.body.style.overflow = '';
}

function configurarBusca() {
    const form = $('#form-busca');
    const input = $('#input-busca');
    const secao = $('#secao-busca');
    const resultados = $('#resultados-busca');
    if (!form || !input) return;

    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        const q = input.value.trim();
        if (q.length < 2) {
            if (secao) secao.style.display = 'none';
            return;
        }
        timer = setTimeout(async () => {
            if (secao) secao.style.display = 'block';
            if (resultados) resultados.innerHTML = skeletonHTML(6);
            try {
                const items = await buscarPorTexto(q);
                if (resultados) {
                    resultados.innerHTML = items.length
                        ? items.map(cardHTML).join('')
                        : `<div class="sem-resultado">Nenhum resultado para "${escapeAttr(q)}".</div>`;
                }
            } catch (err) {
                if (resultados) resultados.innerHTML = `<div class="erro-carrossel">${escapeAttr(err.message)}</div>`;
            }
        }, 400);
    });
}

function inicializar() {
    preencherDestaque('.filme-principal');

    preencherCarrossel('#carrossel-populares', buscarPopulares('movie'), 'Populares');
    preencherCarrossel('#carrossel-series', buscarPopulares('tv'), 'Séries populares');
    preencherCarrossel('#carrossel-alahta', buscarEmAlta(), 'Em alta');
    preencherCarrossel('#carrossel-acao', buscarPorCategoria(GENEROS.acao), 'Ação');
    preencherCarrossel('#carrossel-comedia', buscarPorCategoria(GENEROS.comedia), 'Comédia');

    preencherCarrossel('#carrossel-filmes-pop', buscarPopulares('movie'), 'Filmes populares');
    preencherCarrossel('#carrossel-filmes-drama', buscarPorCategoria(GENEROS.drama), 'Drama');
    preencherCarrossel('#carrossel-filmes-ficcao', buscarPorCategoria(GENEROS.ficcao), 'Ficção');

    preencherCarrossel('#carrossel-series-pop', buscarPopulares('tv'), 'Séries populares');
    preencherCarrossel('#carrossel-series-anim', buscarPorCategoria(GENEROS.animacao, 'tv'), 'Animação');

    configurarBusca();

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        const assistir = e.target.closest('.assistir');
        if (card) {
            abrirModal(card.dataset.id, card.dataset.tipo);
        } else if (assistir) {
            e.preventDefault();
            abrirModal(assistir.dataset.id, assistir.dataset.tipo);
        } else if (e.target.matches('#modal, #modal-fechar')) {
            fecharModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModal();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}
