import { useState } from 'react'
import { NumberField } from '../shared/NumberField'
import { Alert, Card, Check, Details, Result, Results, Src } from '../shared/ui'
import {
  type ClassePa,
  FATORES_ALTO,
  FATORES_MODERADO,
  type MomentoAas,
  classificarPa,
  indicaPrevencao,
  momentoAas,
} from './preeclampsia'
import { RBEHG_2023 } from './sources'

const MOMENTO_TEXTO: Record<MomentoAas, string> = {
  'antes-12': 'Ainda antes de 12 semanas: iniciar o AAS a partir da 12ª semana.',
  ideal: 'Iniciar agora (o ideal é começar antes da 16ª semana).',
  'ainda-pode': 'Ainda pode iniciar: o AAS pode ser começado até a 20ª semana.',
  'apos-20': 'Passou da 20ª semana: o protocolo indica iniciar o AAS até a 20ª semana.',
  'suspender-36': 'A partir de 36 semanas o AAS não é mais usado (manter até a 36ª semana).',
}

export function PreeclampsiaSection() {
  return (
    <>
      <RiscoPrevencao />
      <AntiHipertensivos />
    </>
  )
}

function RiscoPrevencao() {
  const [altos, setAltos] = useState<boolean[]>(FATORES_ALTO.map(() => false))
  const [mods, setMods] = useState<boolean[]>(FATORES_MODERADO.map(() => false))
  const [ig, setIg] = useState<number | null>(null)
  const nAltos = altos.filter(Boolean).length
  const nMods = mods.filter(Boolean).length
  const indica = indicaPrevencao(nAltos, nMods)
  const igOk = ig !== null && ig >= 4 && ig <= 42

  const toggle = (arr: boolean[], set: (v: boolean[]) => void, i: number) => (v: boolean) =>
    set(arr.map((x, j) => (j === i ? v : x)))

  return (
    <>
      <Card
        title="Fatores de risco"
        subtitle="Rastrear todas as gestantes. Um fator alto ou dois moderados indicam a prevenção."
      >
        <p className="label">Risco alto (basta um)</p>
        <div className="checks">
          {FATORES_ALTO.map((f, i) => (
            <Check
              key={f}
              label={f}
              checked={altos[i] ?? false}
              onChange={toggle(altos, setAltos, i)}
            />
          ))}
        </div>
        <p className="label">Risco moderado (dois ou mais)</p>
        <div className="checks">
          {FATORES_MODERADO.map((f, i) => (
            <Check
              key={f}
              label={f}
              checked={mods[i] ?? false}
              onChange={toggle(mods, setMods, i)}
            />
          ))}
        </div>
        <Results>
          <Result
            label="Prevenção com AAS e cálcio"
            value={indica ? 'Indicada' : 'Sem indicação'}
            tone={indica ? 'warn' : 'neutral'}
          >
            {indica
              ? `${nAltos} fator(es) alto(s) e ${nMods} moderado(s).`
              : nMods === 1
                ? 'Um fator moderado: são necessários dois.'
                : 'Pelos marcadores clínicos. Havendo disponibilidade, o teste combinado de 11 a 14 semanas pode ser usado.'}
          </Result>
        </Results>
        <Details summary="Fonte">
          <Src href={RBEHG_2023.url}>{RBEHG_2023.titulo}, Quadro 1 (pág. 19 e 20).</Src>
        </Details>
      </Card>

      <Card title="Prevenção" subtitle="Para gestantes com indicação pelos fatores de risco.">
        <div className="fields">
          <NumberField
            label="Idade gestacional"
            unit="semanas"
            value={ig}
            onChange={setIg}
            step={1}
            hint="Opcional: diz se é hora de iniciar o AAS"
          />
        </div>
        {igOk ? (
          <Alert
            tone={momentoAas(ig) === 'ideal' || momentoAas(ig) === 'ainda-pode' ? 'ok' : 'info'}
          >
            {MOMENTO_TEXTO[momentoAas(ig)]}
          </Alert>
        ) : null}
        <ul className="checklist">
          <li>
            <strong>AAS 100 mg/dia, à noite</strong> (dose disponível no SUS): a partir da 12ª
            semana, de preferência antes da 16ª (pode ser iniciado até a 20ª), mantido até a 36ª
            semana.
          </li>
          <li>
            <strong>Carbonato de cálcio 1 a 2 g/dia</strong>, dividido em 2 ou 3 tomadas às
            refeições (ou citrato de cálcio 2 a 4 g/dia): do primeiro trimestre até o fim da
            gestação.
          </li>
          <li>Suspender o AAS e o cálcio se a pré-eclâmpsia for confirmada.</li>
          <li>
            Para todas as gestantes, sem contraindicação: atividade física moderada, pelo menos 140
            minutos por semana.
          </li>
          <li>
            Não reduzem o risco: repouso, restrição de sal, vitaminas C, E e D, ômega-3, ácido
            fólico e enoxaparina.
          </li>
        </ul>
        <Details summary="Fonte">
          <Src href={RBEHG_2023.url}>{RBEHG_2023.titulo}, Prevenção (pág. 22 e 23).</Src>
        </Details>
      </Card>
    </>
  )
}

const PA_TEXTO: Record<ClassePa, { valor: string; tom: 'ok' | 'warn' | 'danger'; texto: string }> =
  {
    normal: { valor: 'Abaixo de 140/90', tom: 'ok', texto: 'Sem hipertensão nesta medida.' },
    leve: {
      valor: 'Hipertensão leve',
      tom: 'warn',
      texto:
        'PA persistente ≥ 140/90: tratar com anti-hipertensivo oral, buscando PA diastólica em torno de 85 mmHg.',
    },
    grave: {
      valor: 'Hipertensão grave',
      tom: 'danger',
      texto:
        'Crise hipertensiva se persistir após 15 minutos: anti-hipertensivo de ação rápida, internação ou encaminhamento, e sulfato de magnésio se houver pré-eclâmpsia conhecida ou suspeita. Com sintomas (emergência hipertensiva), não esperar os 15 minutos e iniciar o sulfato antes do anti-hipertensivo.',
    },
  }

function AntiHipertensivos() {
  const [pas, setPas] = useState<number | null>(null)
  const [pad, setPad] = useState<number | null>(null)
  const plausivel =
    pas !== null && pad !== null && pas >= 60 && pas <= 260 && pad >= 30 && pad <= 160
  const classe = plausivel ? classificarPa(pas, pad) : null

  return (
    <>
      <Card title="Pressão arterial" subtitle="Classificação para decidir o tratamento.">
        <div className="fields">
          <NumberField label="PA sistólica" unit="mmHg" value={pas} onChange={setPas} step={1} />
          <NumberField label="PA diastólica" unit="mmHg" value={pad} onChange={setPad} step={1} />
        </div>
        {classe ? (
          <Results>
            <Result
              label="Classificação"
              value={PA_TEXTO[classe].valor}
              tone={PA_TEXTO[classe].tom}
            >
              {PA_TEXTO[classe].texto}
            </Result>
          </Results>
        ) : pas !== null && pad !== null ? (
          <Alert tone="warn">Pressão fora da faixa esperada: confira os valores.</Alert>
        ) : (
          <p className="empty">Informe a PA sistólica e a diastólica.</p>
        )}
      </Card>

      <Card
        title="Manutenção por via oral"
        subtitle="Formas não graves. Nenhuma classe é melhor que outra: escolher pela experiência e pela disponibilidade na rede."
      >
        <table className="compact">
          <caption className="sr-only">Anti-hipertensivos para uso na gestação</caption>
          <thead>
            <tr>
              <th scope="col">Medicamento</th>
              <th scope="col">Dose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Metildopa (250 e 500 mg)</th>
              <td>750 a 2.000 mg/dia, 2 a 4 vezes ao dia</td>
            </tr>
            <tr>
              <th scope="row">Nifedipino retard (10 e 20 mg)</th>
              <td>20 a 120 mg/dia, 1 a 3 vezes ao dia</td>
            </tr>
            <tr>
              <th scope="row">Nifedipino de liberação rápida (10 e 20 mg)</th>
              <td>20 a 60 mg/dia, 2 a 3 vezes ao dia</td>
            </tr>
            <tr>
              <th scope="row">Anlodipino (2,5, 5 e 10 mg)</th>
              <td>5 a 20 mg/dia, 1 a 2 vezes ao dia</td>
            </tr>
            <tr>
              <th scope="row">Hidralazina* (25 e 50 mg)</th>
              <td>50 a 150 mg/dia, 2 a 3 vezes ao dia</td>
            </tr>
            <tr>
              <th scope="row">Metoprolol* (25, 50 e 100 mg)</th>
              <td>100 a 200 mg/dia, 1 a 2 vezes ao dia</td>
            </tr>
            <tr>
              <th scope="row">Carvedilol* (6,25 e 12,5 mg)</th>
              <td>
                12,5 a 50 mg/dia, 1 a 2 vezes ao dia; iniciar com 12,5 mg/dia por 2 dias e então
                aumentar
              </td>
            </tr>
          </tbody>
        </table>
        <ul className="checklist">
          <li>
            * Hidralazina e betabloqueadores: como terceira droga ou quando não for possível usar as
            de primeira escolha.
          </li>
          <li>
            Contraindicados na gestação: IECA, bloqueadores do receptor da angiotensina II e
            alisquireno. Quem usa deve trocar ao planejar a gestação ou assim que confirmar.
          </li>
        </ul>
        <Details summary="Fonte">
          <Src href={RBEHG_2023.url}>
            {RBEHG_2023.titulo}, Tratamento farmacológico e Quadro 3 (pág. 27 a 30).
          </Src>
        </Details>
      </Card>

      <Card
        title="Crise hipertensiva"
        subtitle="PA ≥ 160 e/ou ≥ 110 mmHg persistente após 15 minutos."
      >
        <p className="lead">
          Meta: reduzir a PA em 15% a 25%, para sistólica entre 140 e 150 mmHg e diastólica entre 90
          e 100 mmHg, sem quedas bruscas. Depois, iniciar ou otimizar a manutenção por via oral.
        </p>
        <table className="compact">
          <caption className="sr-only">Agentes para a crise hipertensiva</caption>
          <thead>
            <tr>
              <th scope="col">Agente</th>
              <th scope="col">Dose inicial</th>
              <th scope="col">Repetir</th>
              <th scope="col">Máximo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Hidralazina IV</th>
              <td>5 mg</td>
              <td>5 mg a cada 20 min</td>
              <td>30 mg</td>
            </tr>
            <tr>
              <th scope="row">Nifedipino VO (comprimido de 10 mg)</th>
              <td>10 mg</td>
              <td>10 mg a cada 20 min</td>
              <td>30 mg</td>
            </tr>
          </tbody>
        </table>
        <ul className="checklist">
          <li>
            Hidralazina: ampola de 1 mL com 20 mg; diluir 1 ampola em 19 mL de água destilada (1
            mg/mL). Infusão contínua, se necessária: 5 mg/h (80 mg, ou 4 mL, em 500 mL de SF a 30
            mL/h).
          </li>
          <li>
            Nifedipino: não mastigar, não usar por via sublingual e não usar a forma de liberação
            lenta na crise.
          </li>
          <li>
            Nitroprussiato de sódio (sobretudo com edema pulmonar): 0,5 a 10 mcg/kg/min em infusão
            contínua; 1 ampola (50 mg/2 mL) em 248 mL de soro glicosado 5% (200 mcg/mL).
          </li>
          <li>
            Na crise com pré-eclâmpsia, o sulfato de magnésio é indispensável (módulo{' '}
            <strong>Eclâmpsia e sulfato</strong>).
          </li>
        </ul>
        <Details summary="Fonte">
          <Src href={RBEHG_2023.url}>
            {RBEHG_2023.titulo}, Crise hipertensiva e Quadro 4 (pág. 31 a 34).
          </Src>
        </Details>
      </Card>
    </>
  )
}
