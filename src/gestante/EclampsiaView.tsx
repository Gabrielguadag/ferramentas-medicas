import { useState } from 'react'
import { NumberField, RadioGroup } from '../shared/NumberField'
import { Alert, Card, Details, Result, Results, Src } from '../shared/ui'
import {
  AMPOLAS,
  CREATININA_METADE,
  type Esquema,
  manutencao,
  mlDaAmpola,
  monitorizar,
} from './preeclampsia'
import { MS_ALTO_RISCO, RBEHG_2023 } from './sources'

const fmtMl = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

export function EclampsiaSection() {
  const [esquema, setEsquema] = useState<Esquema>('zuspan')
  const [creat, setCreat] = useState<number | null>(null)
  const creatOk = creat !== null && creat > 0 && creat < 20 ? creat : null
  const man = manutencao(esquema, creatOk)

  return (
    <>
      <Card
        title="Quando usar o sulfato de magnésio"
        subtitle="Droga de escolha para prevenir e tratar a eclâmpsia."
      >
        <ul className="checklist">
          <li>
            <strong>Iminência de eclâmpsia</strong>: cefaleia, fotofobia, escotomas, embaçamento
            visual, náuseas e vômitos, dor epigástrica ou no hipocôndrio direito, hiper-reflexia.
            Uso imediato.
          </li>
          <li>
            <strong>Eclâmpsia</strong>: convulsão tônico-clônica em gestante com pré-eclâmpsia.
            Convulsão após 20 semanas é eclâmpsia até prova em contrário.
          </li>
          <li>
            <strong>Síndrome HELLP</strong>.
          </li>
          <li>
            <strong>Pré-eclâmpsia com deterioração clínica e/ou laboratorial</strong>, inclusive
            hipertensão de difícil controle, mesmo sem sintomas.
          </li>
          <li>
            <strong>Crise hipertensiva</strong> (≥ 160/110 por 15 min) com pré-eclâmpsia conhecida
            ou suspeita, mesmo sem sintomas. Na emergência hipertensiva (com sintomas), iniciar o
            sulfato antes do anti-hipertensivo.
          </li>
          <li>
            A indicação do sulfato não obriga a resolver a gestação. Avaliar a vitalidade fetal só
            depois de estabilizar a mãe.
          </li>
        </ul>
        <Alert tone="warn">
          Contraindicado na miastenia grave (Manual de Gestação de Alto Risco do MS, Quadro 7).
        </Alert>
      </Card>

      <Card
        title="Esquema e doses"
        subtitle="Pritchard e Zuspan têm a mesma eficácia; usar o de experiência do serviço."
      >
        <div className="fields">
          <RadioGroup
            legend="Esquema"
            value={esquema}
            options={[
              { value: 'zuspan', label: 'Zuspan (IV exclusivo, em bomba)' },
              { value: 'pritchard', label: 'Pritchard (IV + IM)' },
            ]}
            onChange={setEsquema}
            column
          />
          <NumberField
            label="Creatinina"
            unit="mg/dL"
            value={creat}
            onChange={setCreat}
            hint={`Opcional: ≥ ${CREATININA_METADE.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} reduz a manutenção à metade`}
          />
        </div>
        <Results>
          <Result label="Dose inicial (ataque)" value="4 g IV" tone="info">
            8 mL de MgSO4 50% + 12 mL de água destilada ou SF 0,9% (4 g em 20 mL), IV lentamente em
            15 a 20 minutos. Ou 8 mL em 100 mL de SF 0,9% em bomba a 300 mL/h (cerca de 20 min).
            {esquema === 'pritchard' ? ' Mais 10 g IM: 5 g (1 ampola de 50%) em cada nádega.' : ''}
          </Result>
          <Result
            label={esquema === 'zuspan' ? 'Manutenção' : 'Manutenção (a cada 4 h)'}
            value={esquema === 'zuspan' ? `${fmtMl(man.doseG)} g/h` : `${fmtMl(man.doseG)} g IM`}
            tone={man.metade ? 'warn' : 'info'}
          >
            {man.texto}
            {man.metade ? ' Metade da dose por creatinina ≥ 1,0 mg/dL.' : ''}
          </Result>
        </Results>
        <ul className="checklist">
          {esquema === 'zuspan' && !man.metade ? (
            <li>
              Se continuar sintomática: 2 g/h (20 mL de MgSO4 50% em 480 mL de SF 0,9%, mantendo 100
              mL/h).
            </li>
          ) : null}
          {esquema === 'pritchard' ? (
            <li>Preferido para transferir a gestante: mais seguro no transporte.</li>
          ) : null}
          <li>
            Manter por <strong>24 horas</strong> após o parto ou após a última convulsão (também
            quando usado por crise hipertensiva). Depois da estabilização, pode ser retirado de uma
            vez.
          </li>
          <li>
            Com creatinina ≥ 1,0 mg/dL, só interromper a infusão se a diurese ficar abaixo de 25
            mL/h.
          </li>
        </ul>
        <Details summary="Ampolas de 20% e 10%">
          <p>
            As diluições acima usam a ampola de <strong>50%</strong>. Confira a concentração: o
            volume muda.
          </p>
          <table className="compact">
            <caption className="sr-only">Volume por dose e concentração</caption>
            <thead>
              <tr>
                <th scope="col">Ampola</th>
                <th scope="col" className="num">
                  2 g
                </th>
                <th scope="col" className="num">
                  4 g
                </th>
                <th scope="col" className="num">
                  5 g
                </th>
              </tr>
            </thead>
            <tbody>
              {AMPOLAS.map((a) => (
                <tr key={a.id}>
                  <th scope="row">{a.rotulo}</th>
                  {[2, 4, 5].map((g) => (
                    <td key={g} className="num">
                      {fmtMl(mlDaAmpola(g, a.gPorMl))} mL
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Details>
        <Details summary="Fonte">
          <Src href={RBEHG_2023.url}>
            {RBEHG_2023.titulo}, Sulfato de magnésio e Quadro 6 (pág. 34 a 39).
          </Src>
        </Details>
      </Card>

      <Monitorizacao />

      <Card title="Convulsão de novo" subtitle="Recorrência durante o uso do sulfato.">
        <ul className="checklist">
          <li>
            Mais <strong>2 g IV em bolus</strong> (4 mL de MgSO4 50% diluídos em 10 mL de água
            destilada ou SF) e manutenção de 2 g/h.
          </li>
          <li>
            Se dois bolus não controlarem: <strong>difenil-hidantoína</strong> no esquema clássico,
            e investigar complicação cerebral, principalmente hemorragia intracraniana.
          </li>
        </ul>
      </Card>

      <Card title="Antídoto" subtitle="Sinais de intoxicação pelo magnésio.">
        <Results>
          <Result label="Gluconato de cálcio 10%" value="10 mL (1 g) IV" tone="danger">
            Administrar lentamente.
          </Result>
        </Results>
        <ul className="checklist">
          <li>
            Magnésio sérico: faixa terapêutica de 4 a 7 mEq/L (4,8 a 8,4 mg/dL). Reflexo patelar
            some com 8 a 10 mEq/L; risco de parada respiratória a partir de 12 mEq/L.
          </li>
          <li>
            A dose inicial bem administrada não causa intoxicação; o risco está na manutenção.
          </li>
        </ul>
        <Details summary="Fonte">
          <Src href={RBEHG_2023.url}>
            {RBEHG_2023.titulo}, Aspectos relacionados ao uso do MgSO4 (pág. 37 e 38).
          </Src>
          <Src href={MS_ALTO_RISCO.url}>{MS_ALTO_RISCO.titulo} (miastenia grave).</Src>
        </Details>
      </Card>
    </>
  )
}

function Monitorizacao() {
  const [reflexo, setReflexo] = useState<'' | 'sim' | 'nao'>('')
  const [fr, setFr] = useState<number | null>(null)
  const [diurese, setDiurese] = useState<number | null>(null)
  const m = monitorizar({
    reflexo: reflexo === '' ? null : reflexo === 'sim',
    fr,
    diurese,
  })
  const algum = reflexo !== '' || fr !== null || diurese !== null

  return (
    <Card
      title="Antes de cada manutenção"
      subtitle="Reflexo patelar presente, FR ≥ 16 irpm e diurese ≥ 25 mL/h."
    >
      <div className="fields">
        <RadioGroup
          legend="Reflexo patelar"
          value={reflexo}
          options={[
            { value: 'sim', label: 'Presente' },
            { value: 'nao', label: 'Ausente' },
          ]}
          onChange={setReflexo}
        />
        <NumberField
          label="Frequência respiratória"
          unit="irpm"
          value={fr}
          onChange={setFr}
          step={1}
        />
        <NumberField label="Diurese" unit="mL/h" value={diurese} onChange={setDiurese} step={1} />
      </div>
      {!algum ? (
        <p className="empty">Informe os três parâmetros.</p>
      ) : m.falhas.length ? (
        <Alert tone="danger" title="Não fazer a manutenção como está.">
          Alterado: {m.falhas.join('; ')}. Reduzir ou parar a infusão IV, ou não aplicar a dose IM.
          Dosar o magnésio e avaliar a função renal; com valores normais, reiniciar. Sinais de
          intoxicação: gluconato de cálcio (abaixo).
        </Alert>
      ) : m.incompleta ? (
        <p className="empty">Falta informar algum parâmetro.</p>
      ) : (
        <Alert tone="ok">Parâmetros adequados: manter a manutenção.</Alert>
      )}
    </Card>
  )
}
