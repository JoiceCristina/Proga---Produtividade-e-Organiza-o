//Script dar funcionalidade aos elementos.

// --- VARIÁVEIS GLOBAIS ---
// Recupera as tarefas salvas no localStorage ou inicia com array vazio.
const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

// Índice da tarefa que está sendo editada (null quando não há edição).
let indexEdicao = null;

// --- VERIFICAÇÃO DE LOGIN ---
// Se não estiver logado, redireciona para a página de login.
if (!localStorage.getItem("logado")) {
  window.location.href = "login.html";
}

// --- FUNÇÕES DE ARMAZENAMENTO ---
// Salva o array de tarefas atualizado no localStorage.
function salvar() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// Retorna a data atual em formato 'YYYY-MM-DD'.
function hojeStr() {
  const hoje = new Date();
  return hoje.toISOString().split("T")[0];
}

// --- RENDERIZAÇÃO DO CALENDÁRIO COMPLETO ---
function renderizarCalendarioCompleto() {
  const container = document.getElementById("calendarioCompleto");
  if (!container) return;  // Verifica se o container existe.
  container.innerHTML = ""; // Limpa conteúdo anterior.

  const ano = new Date().getFullYear(); // Ano atual.
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Percorre todos os meses do ano.
  for (let m = 0; m < 12; m++) {
    // Cria div para o mês.
    const divMes = document.createElement("div");
    divMes.className = "mes-calendario";

    // Cria título do mês.
    const titulo = document.createElement("h3");
    titulo.textContent = meses[m];
    divMes.appendChild(titulo);

    // Cria grid para os dias do mês.
    const grid = document.createElement("div");
    grid.className = "grid-calendario";

    // Determina o dia da semana do primeiro dia do mês (0=domingo, 6=sábado).
    const primeiroDia = new Date(ano, m, 1).getDay();

    // Número total de dias no mês.
    const diasNoMes = new Date(ano, m + 1, 0).getDate();

    // Adiciona espaços vazios no início para alinhar o primeiro dia corretamente.
    for (let i = 0; i < primeiroDia; i++) {
      const vazio = document.createElement("div");
      grid.appendChild(vazio);
    }

    // Criação dos elementos dos dias do mês.
    for (let d = 1; d <= diasNoMes; d++) {
      const dia = document.createElement("div");

      // Data formatada para comparação: 'YYYY-MM-DD'.
      const dataStr = `${ano}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Verificação se há alguma tarefa nesta data.
      const temTarefa = tarefas.some(t => t.data === dataStr);

      dia.textContent = d;
      dia.className = temTarefa ? "dia-com-tarefa" : "dia-sem-tarefa";
      grid.appendChild(dia);
    }

    // Adiciona a grade de dias ao mês e o mês ao container.
    divMes.appendChild(grid);
    container.appendChild(divMes);
  }
}

// --- FUNÇÕES DE GERENCIAMENTO DE TAREFAS ---
// Adiciona novas tarefas
function adicionarTarefa() {
  const desc = document.getElementById("descricao").value.trim();
  const prio = document.getElementById("prioridade").value;
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;

  // Validação dos campos obrigatórios.
  if (!desc || !data || !hora) {
    alert("Preencha todos os campos.");
    return;
  }

  // Cria ID único.
  const id = Date.now();

  // Adiciona a tarefa ao array.
  tarefas.push({ id, descricao: desc, prioridade: prio, data, hora, done: false });

  // Salva e atualiza.
  salvar();
  limparCampos();
  renderizarTudo();
}

// Limpa os campos do formulário após adicionar tarefa.
function limparCampos() {
  document.getElementById("descricao").value = "";
  document.getElementById("data").value = "";
  document.getElementById("hora").value = "";
}

// Abertura do modal para edição.
function abrirModalEdicao(i) {
  indexEdicao = i;
  const t = tarefas[i];
  document.getElementById("editDescricao").value = t.descricao;
  document.getElementById("editPrioridade").value = t.prioridade;
  document.getElementById("editData").value = t.data;
  document.getElementById("editHora").value = t.hora;
  document.getElementById("modalFundo").style.display = "flex";
}

// Fecha o modal de edição e limpa índice de edição.
function fecharModal() {
  document.getElementById("modalFundo").style.display = "none";
  indexEdicao = null;
}

// Salva as alterações feitas na edição.
function salvarEdicao() {
  const d = document.getElementById("editDescricao").value.trim();
  const p = document.getElementById("editPrioridade").value;
  const dt = document.getElementById("editData").value;
  const h = document.getElementById("editHora").value;

  // Valida os campos.
  if (!d || !dt || !h) {
    alert("Preencha todos os campos.");
    return;
  }

  // Verifica se existe uma tarefa válida para editar.
  if (indexEdicao === null || indexEdicao >= tarefas.length) {
    alert("Erro ao salvar. Tarefa não encontrada.");
    return;
  }

  // Atualiza a tarefa no array.
  tarefas[indexEdicao] = {
    ...tarefas[indexEdicao],
    descricao: d,
    prioridade: p,
    data: dt,
    hora: h
  };

  salvar();
  fecharModal();
  renderizarTudo();
}

// --- RENDERIZAÇÃO DAS TAREFAS ---
// Renderiza todas as partes da aplicação.
function renderizarTudo() {
  renderizarTarefas();
  renderizarTarefasDoDia();
  if (typeof renderizarEstatisticas === "function") {
    renderizarEstatisticas();
  }
}

// Renderiza a lista de tarefas.
function renderizarTarefas() {
  const lista = document.getElementById("listaTarefas");
  lista.innerHTML = "";

  // Ordena tarefas por data.
  tarefas.sort((a, b) => a.data.localeCompare(b.data)).forEach((t) => {
    const li = document.createElement("li");

    // Marca como feito.
    if (t.done) li.classList.add("done");

    // Cria o texto da tarefa com descrição, prioridade e data/hora.
    const span = document.createElement("span");
    span.innerHTML = `${t.descricao} <span class="priority ${t.prioridade}">${t.prioridade}</span> <small>[${t.data} ${t.hora}]</small>`;

    // Container para botões.
    const botoes = document.createElement("span");

    // Botão que marca/desmarca como feito.
    const btnDone = criarBotao(
      t.done ? "Desfazer" : "✅ Feito",
      () => {
        const i = tarefas.findIndex(tt => tt.id === t.id);
        toggleFeito(i);
      },
      "Marcar como feito ou desfazer"
    );

    // Botão para editar tarefa.
    const btnEdit = criarBotao(
      "✏️ Editar",
      () => {
        const i = tarefas.findIndex(tt => tt.id === t.id);
        abrirModalEdicao(i);
      },
      "Editar tarefa"
    );

    // Botão para excluir tarefa.
    const btnDel = criarBotao(
      "🗑️ Excluir",
      () => {
        const i = tarefas.findIndex(tt => tt.id === t.id);
        excluirTarefa(i);
      },
      "Excluir tarefa"
    );

    // Adiciona os botões no container.
    [btnDone, btnEdit, btnDel].forEach(btn => botoes.appendChild(btn));

    li.appendChild(span);
    li.appendChild(botoes);
    lista.appendChild(li);
  });
}

// Cria um botão com texto, ação ao clicar e tooltip opcional.
function criarBotao(texto, acao, dica = "") {
  const btn = document.createElement("button");
  btn.textContent = texto;
  btn.onclick = acao;

  if (dica) {
    const tooltip = document.createElement("span");
    tooltip.className = "tooltip-texto";
    tooltip.textContent = dica;
    btn.classList.add("botao-com-tooltip");
    btn.appendChild(tooltip);
  }

  return btn;
}

// Marca ou desmarca a tarefa como feita.
function toggleFeito(i) {
  tarefas[i].done = !tarefas[i].done;
  salvar();
  renderizarTudo();
}

// Exclui a tarefa confirmando com o usuário.
function excluirTarefa(i) {
  if (confirm("Deseja excluir esta tarefa?")) {
    tarefas.splice(i, 1);
    salvar();
    renderizarTudo();
  }
}

// --- RENDERIZAÇÃO DAS TAREFAS DO DIA ---

function renderizarTarefasDoDia() {
  const lista = document.getElementById("tarefasDoDiaLista");
  const infoData = document.getElementById("dataHoje");

  const hoje = new Date();
  const dataHoje = hoje.toISOString().split("T")[0];
  const dataFormatada = hoje.toLocaleDateString("pt-BR");

  // Exibe a data formatada no título.
  infoData.textContent = dataFormatada;

  // Filtra tarefas que são para hoje.
  const doDia = tarefas.filter(t => t.data === dataHoje);

  lista.innerHTML = "";
  document.getElementById("semTarefaHoje").style.display = doDia.length ? "none" : "block";

  // Para cada tarefa do dia, cria um item na lista.
  doDia.forEach(t => {
    const li = document.createElement("li");
    if (t.done) li.classList.add("done");

    const span = document.createElement("span");
    span.innerHTML = `${t.descricao} <span class="priority ${t.prioridade}">${t.prioridade}</span> <small>${t.hora}</small>`;

    const btn = criarBotao(
      t.done ? "Desfazer" : "Feito",
      () => {
        const i = tarefas.findIndex(tt => tt.id === t.id);
        toggleFeito(i);
      },
      "Marcar como feito ou desfazer"
    );

    li.appendChild(span);
    li.appendChild(btn);
    lista.appendChild(li);
  });

  // Conta quantas tarefas existem por prioridade hoje.
  const contagens = { Alta: 0, Média: 0, Baixa: 0 };
  doDia.forEach(t => contagens[t.prioridade]++);

  // Renderiza gráfico de pizza com as prioridades.
  const ctx = document.getElementById("graficoPrioridades").getContext("2d");

  // Destroi gráfico anterior para não sobrepor.
  if (window.grafico) window.grafico.destroy();

  window.grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Alta", "Média", "Baixa"],
      datasets: [{
        data: [contagens.Alta, contagens.Média, contagens.Baixa],
        backgroundColor: ["#ff5e5e", "#ffb74d", "#6bcb77"]
      }]
    },
    options: { responsive: true }
  });
}

// --- CONTROLE DAS ABAS DO TOPO ---

// Exibe aba selecionada e atualiza o conteúdo.
function mostrarAbaTopo(id) {
  // Remove a classe 'ativa' de todas abas e conteúdos.
  document.querySelectorAll(".aba-topo").forEach(btn => btn.classList.remove("ativa"));
  document.querySelectorAll(".conteudo-abas-topo").forEach(div => div.classList.remove("ativa"));

  // Ativa a aba e conteúdo selecionados.
  document.getElementById(id).classList.add("ativa");

  // Renderiza conteúdo específico da aba.
  if (id === "abaDoDia") renderizarTarefasDoDia();
  if (id === "abaCalendario") renderizarCalendarioCompleto();
}

// --- FUNÇÃO DE LOGOUT ---
function logout() {
  localStorage.removeItem("logado"); 
  window.location.href = "login.html"; // Redireciona para login.
}

// --- INICIALIZAÇÃO ---

// Renderiza tudo ao carregar o script.
renderizarTudo();
