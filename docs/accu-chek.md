# Leitura de glicosímetros Accu-Chek por cabo USB

Atualizado em 2026-11-24.

## O que é suportado

Glicosímetros Roche com porta micro-USB que falam o protocolo de saúde USB (classe **PHDC**,
IEEE 11073-20601, perfil de glicose 10417): Accu-Chek **Guide**, **Guide Me**, **Instant** (1 e 2
botões), **Instant S**, **Performa Connect**, **Aviva Connect** e ReliOn Platinum. O pedido original
falava em "Accu-Chek v4 e v5"; o usuário confirmou que se trata dos modelos Guide/Instant
com micro-USB (2026-11-24).

Ficam de fora:

- **Active** e **Performa** antigos, sem USB (só infravermelho, via Smart Pix);
- **Accu-Chek Mobile**, que aparece como pendrive e grava CSV (seria outro leitor, via
  File System Access).

## Como funciona

- O transporte é a **WebUSB** (Chrome ou Edge no desktop, Chrome no Android). O código está em
  `src/glicosimetro/usbTransport.ts`. O filtro usa o fabricante `0x173A`, e o código exige uma
  interface de classe `0x0F` (PHDC) com endpoints bulk. A PHDC não está na lista de classes que a
  WebUSB bloqueia.
- O protocolo fica em `src/glicosimetro/phdc/`, com código próprio. Nós somos o _manager_ e o
  aparelho é o _agent_. As etapas são estas:
  1. AARQ → AARE (accepted-unknown-config).
  2. Relatório de configuração → aceite (ecoando o `config-report-id`).
  3. GET do MDS: modelo, número de série e relógio.
  4. `MDC_ACT_SEG_GET_INFO`: lista de segmentos do PM-Store, com o mapa de entradas e o contador.
  5. `MDC_ACT_SEG_TRIG_XFER` em cada segmento, seguido de lotes `MDC_NOTI_SEGMENT_DATA`, cada um
     confirmado.
  6. RLRQ → RLRE.
- A remontagem de APDUs junta pacotes USB fragmentados (64 bytes). Os testes cobrem esse caso.
- As medições são decodificadas pelo **PmSegmentEntryMap**, quando o aparelho informa o mapa.
  Sem mapa, o leitor usa o layout fixo de 12 bytes que os drivers de referência leem:
  AbsoluteTime (8, BCD) + SFLOAT (2) + status (2).
- Valores especiais do SFLOAT: `0x07FE` (+INF) é **HI** e `0x0802` (−INF) é **LO**. A
  transferência é tratada como **mg/dL**. Se o aparelho declarar mmol/L na configuração, a
  leitura é **bloqueada** com mensagem (não há conversão testada com aparelho em mmol/L). A
  conversão para mmol/L (1 mmol/L = 18,016 mg/dL, ou seja, 180,16 g/mol ÷ 10) só afeta a exibição.

## Resumo estatístico e fonte

- Limiares: alvo 70–180 mg/dL (3,9–10,0 mmol/L), abaixo de 70 e de 54, acima de 180 e de 250,
  todos com comparação estrita. Fonte: Battelino T et al., Clinical Targets for CGM Data
  Interpretation: Recommendations From the International Consensus on Time in Range. Diabetes
  Care 2019;42(8):1593–1603 (doi 10.2337/dci19-0028). São metas de CGM, aplicadas aqui por
  convenção às glicemias capilares; a tela diz isso e que, com poucas medições, os percentuais
  são só indicativos.
- O alvo é canônico em mg/dL: trocar a unidade só muda a exibição, nunca o valor guardado (100 mg/dL
  continua 100 depois de ir a mmol/L e voltar). Digitado em mmol/L, é convertido e arredondado
  (3,9 → 70; 10,0 → 180). O alvo só é aceito entre 54 e 250 mg/dL (os limiares fixos <54 e >250 da
  fonte) e com mínimo < máximo; fora disso a tela avisa e usa 70–180. Campo vazio também avisa e
  usa o padrão. A fonte na tela mostra o alvo em uso e os limiares da fonte. 70–180 vale para
  adultos em geral; gestação e outros grupos usam alvos diferentes (linha curta na tela, sem regra).
- Percentuais nunca aparecem como "0%" se houve ocorrência ("<1%"), e vêm com a contagem (n de N).
- Média, desvio padrão, menor e maior não incluem HI/LO; o menor/maior mostra "LO"/"HI" quando há.
- O filtro "Últimos N dias" conta a partir da última medição que não seja futura (relógio do
  computador), não de hoje. Medições com data posterior a hoje não deslocam a janela: ficam fora dos
  períodos de 7 a 90 dias (a tela avisa) e só "Toda a memória" as inclui. A tela também avisa
  medições sem data e relógio do aparelho a mais de 1 dia do computador.
- Medições repetidas (mesma data/hora, mesmo valor ou HI/LO e mesmo tipo controle/paciente, vindas de
  segmentos diferentes) são contadas uma vez; vale a primeira lida. A tela diz quantas foram ignoradas.
  Mesmo horário com valor diferente não é duplicata; medição sem data nunca é removida.
- O resumo mostra "Mediu em N de M dias": N = dias com medição de paciente; M = do primeiro ao último
  dia com medição dentro do período (no máximo N do filtro), para não sugerir dias sem teste antes
  do começo da memória. "Medições por dia" divide só pelos dias com medição.
- Plausibilidade: valores fora de 10–600 mg/dL (faixa típica de medidores capilares; critério do
  app, não de fonte clínica) são tratados como registro inválido e avisados. Se todos os valores
  numéricos forem menores que 30 (típico de mmol/L lido como mg/dL), o resumo, o gráfico e a
  exportação são bloqueados com aviso. Unidade não declarada pelo aparelho também gera aviso.
- Datas do aparelho inválidas (dia inexistente no mês, como 30/02, ou ano fora de 2000–2099) viram
  "sem data".
- Deduplicação: usa data, hora com segundos, valor e tipo. Não se sabe se o Accu-Chek envia
  segundos diferentes de 00; revisar após o teste com aparelho físico (GLI2-13, pendente).
- CSV: 1ª linha é o cabeçalho das colunas (abre direto em planilha), sem linhas "#" e sem
  metadados (paciente, aparelho, data): a opção mais simples e que não quebra a importação.
  O CSV leva só o período escolhido na tela; o nome do arquivo traz o período e a data da
  exportação, e a coluna "Ordem de leitura" é a ordem após a leitura e a remoção de repetidas (não é
  a posição física na memória).
- Privacidade: a página não envia nem guarda nada; ficam no computador só os arquivos exportados
  (CSV, PDF, diagnóstico), que contêm dado de saúde.
- Aviso fixo na leitura de aparelho real: leitura ainda não validada com aparelho físico.
  Sem mapa de entradas, testes com solução de controle não são identificados (aviso na tela).

## Referências estudadas

Nenhum código foi copiado das referências.

- Tidepool Uploader, `lib/drivers/roche/accuChekUSB.js`, `utils.js` e `models.js`, sob BSD-2.
  Dele vêm a sequência de mensagens, os valores do AARE e a tabela de códigos de modelo.
- emogenet/accuchek (`main.cpp`), em domínio público. Dele vêm o `lsusb` do Guide
  (VID 173A, PID 21D5, classe 0x0F, bulk 0x81/0x01, 64 bytes).
- O teste `compatibilidade com os offsets dos drivers de referência`, em `phdc.test.ts`, garante que
  o simulador produz os bytes nas mesmas posições que esses drivers leem nos aparelhos reais.

## O que ainda não foi provado (testar com aparelho real)

1. **Windows**: falta saber se o Chrome abre o aparelho sem driver. A WebUSB precisa do WinUSB.
   Se o Windows prender o aparelho a outro driver (por exemplo, o do Accu-Chek 360°), será preciso
   o Zadig. A ajuda da tela já orienta isso. **Este é o maior risco.**
2. **Mapa de entradas**: não sabemos se os Accu-Chek mandam o `PmSegmentEntryMap`, nem com quais
   códigos de métrica. Os códigos de glicose (29112 e vizinhos) e de solução de controle (29136)
   vêm do 10417 e não foram conferidos. Sem mapa reconhecido, o leitor cai no layout fixo, que
   está validado pelos drivers de referência.
3. **Marcadores de refeição e solução de controle**: os drivers de referência não leem esses
   dados. O campo de status de cada medição é mostrado e exportado **bruto** (hex), sem
   interpretação, até que o significado seja confirmado.
4. **Vários segmentos**: o leitor percorre todos os segmentos que o aparelho lista. As
   referências só leem o segmento 0.
5. **Linux e Android**: precisam de teste. No Linux, é preciso uma regra udev para o VID 173a.

### Roteiro de teste com aparelho

1. Rodar `npm run build && npm run preview` e abrir no Chrome. O preview serve em localhost, que
   conta como contexto seguro.
2. Conectar o glicosímetro e clicar em "Conectar glicosímetro".
3. Conferir 5 medições da tela contra o visor do aparelho: valor, data e hora. Incluir um HI ou
   LO, se houver.
4. Baixar o diagnóstico em "Detalhes técnicos" e guardá-lo localmente. Ele contém dado de saúde,
   então só deve ser usado com dados de quem consentiu. Ele mostra se veio mapa de entradas e
   quais códigos.
5. Anotar o sistema operacional, o navegador e se foi preciso Zadig.
