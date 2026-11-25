# Risco cardiovascular: escalas implementadas

Atualizado em 2026-11-25. A tela oferece as cinco escalas com um seletor e uma tabela de
comparação. **Pendência para o usuário:** escolher a escala principal. A pesquisa que embasa a
escolha está em `pesquisa-risco-cv.md`.

## Escalas

| Escala                | Para quem          | O que entrega                                                               | Implementação                                  | Verificação                                                              |
| --------------------- | ------------------ | --------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| **SBC 2025**          | Todos              | Categoria (baixo a extremo) e metas de LDL, não-HDL e ApoB                  | `escalas.ts` (`sbc2025`), Fig. 4.1 da diretriz | Testes por critério                                                      |
| **SBD 2026**          | Só com diabetes    | Categoria (baixo a muito alto), metas e potência da estatina                | `escalas.ts` (`sbd2026`)                       | Testes por critério                                                      |
| **PCDT DM2 2026**     | DM2                | Alto (40–74 anos), muito alto (com DCV), individualizado (≤ 39 e ≥ 75 anos) | `escalas.ts` (`pcdt2026`)                      | Testes por critério                                                      |
| **OMS 2019 / HEARTS** | 40–74 anos         | % em 10 anos e categoria da OPAS, com e sem laboratório                     | `who2019.ts`                                   | **2.100 células da tabela oficial da OPAS reproduzidas sem divergência** |
| **PREVENT**           | 30–79 anos sem DCV | % em 10 e 30 anos (ASCVD, DCV total, IC)                                    | `prevent.ts`                                   | **40 casos de teste do pacote de referência reproduzidos**               |

### SBC 2025

A fonte é a Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose 2025 (SBC): Tab. 4.1
a 4.8, Fig. 4.1 e Tab. 5.1.

- **Ordem do fluxo (Fig. 4.1):**
  1. Evento aterosclerótico prévio: extremo, se houver múltiplos eventos ou ≥ 2 condições da
     Tab. 4.2; senão, muito alto.
  2. Obstrução ≥ 50% ou CAC > 300: muito alto.
  3. Diabetes: EMAR ou ≥ 3 EAR dá muito alto; 1 a 2 EAR dão alto; sem estratificadores, homem
     ≥ 50 ou mulher ≥ 56 anos é alto, abaixo disso é intermediário.
  4. Sem diabetes: aterosclerose subclínica, LDL ≥ 190 ou Lp(a) > 180 dão alto.
  5. Nos demais, PREVENT de ASCVD em 10 anos: ≥ 20% é alto; de 5 a < 20% é alto com agravante e
     intermediário sem; < 5% é intermediário com LDL 160–189 ou agravante, e baixo sem.
- **Ambiguidades da própria diretriz e a escolha feita:**
  - "1 ou 2 EAR" vale em qualquer idade (Tab. 4.5 e Fig. 4.1, contra a redação da Tab. 4.1).
  - "LDL > 160-189" foi lido como 160 a 189.
  - No DM, "LDL > 190 ou CT > 310" é EMAR (Tab. 4.8).
  - "3 ≥ EAR" foi lido como ≥ 3.
  - Qualquer agravante reclassifica, como na Tab. 4.1; o texto pede julgamento clínico.

### SBD 2026

A fonte é o capítulo "Manejo do risco cardiovascular: dislipidemia", Quadros 1 a 6. As
diferenças em relação à SBC:

- Há categoria **baixo**: homem < 38 e mulher < 46 anos.
- Não há a categoria extremo.
- São EAR na SBD: LDL > 190, Lp(a) ≥ 50, NT-proBNP ≥ 125 (≥ 190 em idosos) e CAC > 10 sem teto.
- A hipercolesterolemia familiar é EMAR.
- "> 3 EAR" na tabela foi lido como ≥ 3, de acordo com o texto ("até dois EAR = alto").
- Para o corte de "idoso" do NT-proBNP, a tela usa 60 anos.

### PCDT DM2 2026 (item 5.5)

- **40 a 74 anos:** o DM2 já é alto risco; com DAC, AVC ou DAP passa a muito alto.
- **≤ 39 anos:** avaliação individualizada; nefropatia ou retinopatia dão alto risco.
- **≥ 75 anos ou DM1:** avaliação individualizada.
- O PCDT afirma que a estratificação "não altera a conduta para o DM2" e remete ao PCDT de
  Dislipidemia (2019), que não foi lido.

### OMS 2019 / HEARTS

- **Modelo:** Kaptoge et al., Lancet Glob Health 2019, recalibrado para a América Latina Tropical
  (ano 2017).
- **Coeficientes:** vêm do pacote R `WHORiskCalculator` (MIT), que reproduz o programa dos autores.
- **Cálculo:** igual ao da calculadora HEARTS. Usa faixas de idade, PA e colesterol (ou IMC) e
  calcula o modelo no valor representativo de cada célula. A tela mostra também o valor contínuo.
- **Categorias:** < 5% baixo; 5–9% moderado; 10–19% alto; 20–29% muito alto; ≥ 30% crítico.

### PREVENT

- **Fonte:** Khan et al., Circulation 2024, com a errata de HbA1c de outubro de 2026.
- **Coeficientes:** vêm do pacote R `preventr` 0.12.2 (MIT).
- **Modelo escolhido como no pacote:** básico; com HbA1c; com albuminúria; ou completo, com os
  dois e sem SDI (índice dos EUA).
- **Faixas aceitas:** idade 30–79, CT 130–320, HDL 20–100, PAS 90–180 e TFGe 15–140. A IC exige
  IMC de 18,5 a 39,9. O horizonte de 30 anos é mostrado até 59 anos.
- **Não verificado:** os coeficientes contra o suplemento oficial (S12) e a calculadora da AHA.
  Os dois estavam bloqueados para download automático.

## Diabetes como fator

A caixa "Considerar diabetes" vem marcada para quem tem DM. Desmarcada:

- a SBC segue o ramo sem diabetes (PREVENT e agravantes);
- a SBD e o PCDT deixam de se aplicar;
- o PREVENT e a OMS laboratorial calculam com diabetes = não.

## Não implementado

- **Globorisk-LAC:** a SBC o cita como calibrado para o Brasil, mas não houve conferência contra
  valores publicados.
- **Steno Type 1 Risk Engine:** indicado para DM1 com menos de 20 anos de doença e sem
  estratificadores. A tela avisa e não calcula.
