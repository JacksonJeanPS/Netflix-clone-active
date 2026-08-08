# Clone-Netflix (estudo de interface + TMDB API)

Recriação da interface da Netflix usando **HTML5, CSS3 e JavaScript puro (sem frameworks, sem build)**.
O projeto evoluiu de um mock estático para consumir a **TMDB API** (catálogo real, pôsteres, sinopses,
avaliações) e reproduzir **trailers oficiais via YouTube embed** — tudo 100% client-side.

> ⚠️ Projeto de estudo. Nenhum conteúdo protegido é distribuído: o player reproduz apenas
> trailers oficiais (licenciados) do YouTube retornados pela TMDB.

## Funcionalidades

- Catálogo real da TMDB: filmes/séries populares, em alta, por gênero.
- Busca de filmes e séries (`/search/multi`).
- Modal estilo Netflix com detalhes (sinopse, ano, nota) e trailer oficial.
- Skeleton loading nos carrosséis e estados de erro tratados.
- Rodapé com a atribuição obrigatória da TMDB.

## Como configurar a API key (TMDB)

A TMDB API v3 exige autenticação via header `Authorization: Bearer <token>`.
Documentação: https://developer.themoviedb.org/reference/getting-started

1. Crie uma conta gratuita em <https://www.themoviedb.org>.
2. Acesse **Settings → API** (<https://www.themoviedb.org/settings/api>) e gere uma **API Key (v3 auth)**.
3. Copie o modelo e crie o arquivo local de configuração:

   ```bash
   cp js/config.example.js js/config.js
   ```

4. Edite `js/config.js` e cole sua chave. Esse é o local usado quando você roda o projeto localmente:

   ```js
   window.CONFIG = {
       TMDB_API_KEY: 'SUA_CHAVE_AQUI',
   };
   ```

   O arquivo `js/config.js` está no `.gitignore` e **não deve ser commitado**.

## Como rodar

Como é 100% estático, basta abrir o `index.html` no navegador. Para evitar restrições de
`módulos ES` em `file://`, use um servidor local simples:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

### GitHub Pages

O deploy é feito pelo workflow `.github/workflows/deploy-pages.yml`. Antes do primeiro push, crie um Secret no repositório:

1. Abra **Settings → Secrets and variables → Actions** no GitHub.
2. Crie o secret `TMDB_API_KEY` com a sua chave.
3. Em **Settings → Pages**, selecione **GitHub Actions** como fonte.

O workflow gera `js/config.js` somente no artefato publicado. Esse arquivo não entra no Git.

## Estrutura

```
index.html              Home (hero + carrosséis dinâmicos + busca)
pages/Filmes.html       Vitrine de filmes
pages/Series.html       Vitrine de séries
js/
  config.example.js     Modelo de configuração (sem segredo)
  config.js             Sua chave local (gitignored)
  services/
    tmdbService.js      Camada de serviço: todas as chamadas à TMDB
  ui.js                 Renderização, busca e modal de trailer
  owl/                  Carrossel (jQuery + Owl Carousel)
css/
  modal.css             Modal, skeleton, busca e rodapé TMDB
  style.css, responsive.css, pages/*
```

## Atribuição

This product uses the TMDB API but is not endorsed or certified by TMDB.
