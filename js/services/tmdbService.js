const TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMG = 'https://image.tmdb.org/t/p';
export const GENEROS = {
    acao: 28,
    comedia: 35,
    drama: 18,
    ficcao: 878,
    animacao: 16,
};

function getApiKey() {
    return (window.CONFIG && window.CONFIG.TMDB_API_KEY) || '';
}

async function tmdbFetch(endpoint, params = {}) {
    const key = getApiKey();
    if (!key) {
        throw new Error(
            'TMDB_API_KEY não configurada. Copie js/config.example.js para js/config.js ' +
            'e insira sua chave gratuita de https://www.themoviedb.org/settings/api'
        );
    }

    const url = new URL(TMDB_BASE + endpoint);
    url.searchParams.set('language', 'pt-BR');
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${key}`,
            'Accept': 'application/json',
        },
    });

    if (res.status === 401) {
        const body = await res.json().catch(() => ({}));
        const msg = body.status_message || 'Chave inválida ou inativa.';
        throw new Error(`TMDB 401: ${msg} Verifique se a chave em js/config.js está correta e ativada em https://www.themoviedb.org/settings/api`);
    }
    if (res.status === 429) {
        throw new Error('Limite de requisições da TMDB atingido (rate limit). Aguarde alguns segundos.');
    }
    if (!res.ok) {
        throw new Error(`Erro na TMDB (HTTP ${res.status}).`);
    }

    return res.json();
}

export async function buscarPopulares(tipo = 'movie') {
    const path = tipo === 'tv' ? '/tv/popular' : '/movie/popular';
    const data = await tmdbFetch(path);
    return (data.results || []).map((item) => normalizeItem(item, tipo));
}

export async function buscarEmAlta() {
    const data = await tmdbFetch('/trending/all/week');
    return (data.results || []).map((item) =>
        normalizeItem(item, item.media_type === 'tv' ? 'tv' : 'movie')
    );
}

export async function buscarPorCategoria(generoId, tipo = 'movie') {
    const mediaType = tipo === 'tv' ? 'tv' : 'movie';
    const data = await tmdbFetch(`/discover/${mediaType}`, { with_genres: generoId });
    return (data.results || []).map((item) => normalizeItem(item, mediaType));
}

export async function buscarPorTexto(query) {
    const data = await tmdbFetch('/search/multi', { query, page: 1 });
    return (data.results || [])
        .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item) => normalizeItem(item, item.media_type === 'tv' ? 'tv' : 'movie'));
}

export async function buscarDetalhes(id, tipo = 'movie') {
    const path = tipo === 'tv' ? `/tv/${id}` : `/movie/${id}`;
    const data = await tmdbFetch(path);
    return normalizeItem(data, tipo);
}

export async function buscarTrailer(id, tipo = 'movie') {
    const path = tipo === 'tv' ? `/tv/${id}/videos` : `/movie/${id}/videos`;
    const data = await tmdbFetch(path);
    const videos = data.results || [];

    const trailer =
        videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
        videos.find((v) => v.site === 'YouTube');

    return trailer ? trailer.key : null;
}

function normalizeItem(item, tipo) {
    const titulo = item.title || item.name || 'Sem título';
    const dataLancamento = item.release_date || item.first_air_date || '';
    const ano = dataLancamento ? dataLancamento.slice(0, 4) : '';

    return {
        id: item.id,
        tipo,
        titulo,
        ano,
        sinopse: item.overview || 'Sinopse não disponível.',
        nota: item.vote_average != null ? item.vote_average.toFixed(1) : '—',
        poster: item.poster_path ? `${TMDB_IMG}/w500${item.poster_path}` : null,
        backdrop: item.backdrop_path ? `${TMDB_IMG}/original${item.backdrop_path}` : null,
    };
}
