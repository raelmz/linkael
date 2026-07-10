const btn = document.getElementById("btn");
const input = document.getElementById("url");
const codigoCustom = document.getElementById("codigo-custom");
const erro = document.getElementById("erro");
const resultado = document.getElementById("resultado");
const linkCurtoEl = document.getElementById("link-curto");
const btnCopiar = document.getElementById("btn-copiar");
const qrCodeEl = document.getElementById("qr-code");

btn.addEventListener("click", async () => {
  erro.style.display = "none";
  resultado.style.display = "none";

  const url = input.value.trim();
  if (!url) {
    erro.textContent = "Informe uma URL para gerar o link curto.";
    erro.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Gerando link...";

  try {
    const resposta = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, codigo: codigoCustom.value.trim() })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      erro.textContent = dados.erro || "Não foi possível gerar o link curto.";
      erro.style.display = "block";
    } else {
      linkCurtoEl.href = dados.link;
      linkCurtoEl.textContent = dados.link;

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(dados.link)}`;
      qrCodeEl.src = qrUrl;

      resultado.style.display = "block";
    }
  } catch {
    erro.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    erro.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.textContent = "Encurtar link";
  }
});

btnCopiar.addEventListener("click", async () => {
  const link = linkCurtoEl.textContent;
  if (!link) return;

  try {
    await navigator.clipboard.writeText(link);
    const textoOriginal = btnCopiar.textContent;
    btnCopiar.textContent = "Copiado!";
    setTimeout(() => {
      btnCopiar.textContent = textoOriginal;
    }, 2000);
  } catch {
    // Fallback silencioso: o usuário ainda pode selecionar e copiar manualmente.
  }
});
