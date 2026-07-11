# API do Linkael

Base URL (produção): `https://linkael.raelmz.workers.dev`

## `POST /api/shorten`

Cria um novo link curto.

**Body (JSON):**

```json
{
  "url": "https://exemplo.com/pagina-longa",
  "codigo": "meu-link"
}
```

- `url` (obrigatório): URL de destino, precisa começar com `http://` ou `https://`.
- `codigo` (opcional): slug personalizado, 3 a 20 caracteres alfanuméricos ou hífen. Se omitido, um código de 6 caracteres é gerado automaticamente.

**Resposta 200:**

```json
{
  "link": "https://linkael.raelmz.workers.dev/meu-link",
  "codigo": "meu-link"
}
```

**Erros possíveis:**

| Status | Motivo |
|---|---|
| 400 | URL inválida, código inválido ou código reservado |
| 409 | Código personalizado já está em uso |
| 429 | Limite de requisições excedido (rate limit) |

---

## `GET /api/stats/:codigo`

Retorna estatísticas de um link.

**Resposta 200:**

```json
{
  "codigo": "meu-link",
  "url": "https://exemplo.com/pagina-longa",
  "clicks": 12,
  "createdAt": "2026-07-10T14:32:00.000Z"
}
```

**Resposta 404:** código não encontrado.

---

## `GET /:codigo`

Redireciona (302) para a URL original e incrementa o contador de cliques.

**Resposta 404:** se o código não existir, retorna texto simples informando que o link não foi encontrado.

---

## Rate limiting

O endpoint `POST /api/shorten` é limitado a **20 requisições por minuto por IP**. Ao exceder, a API retorna `429` com uma mensagem de erro.
