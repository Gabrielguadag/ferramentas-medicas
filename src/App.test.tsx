import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

describe('App', () => {
  const setItem = vi.spyOn(Storage.prototype, 'setItem')
  const cookieSet = vi.fn()
  const blobs: Blob[] = []

  beforeAll(() => {
    Object.defineProperty(document, 'cookie', { configurable: true, get: () => '', set: cookieSet })
    URL.createObjectURL = vi.fn((b: Blob) => {
      blobs.push(b)
      return 'blob:teste'
    })
    URL.revokeObjectURL = vi.fn()
    HTMLAnchorElement.prototype.click = vi.fn()
  })

  it('migração: paciente no painel + 30 UI de NPH em 2 aplicações = 24 UI de glargina', async () => {
    render(<App />)
    const user = userEvent.setup()
    const panel = screen.getByRole('tabpanel', { name: 'Consulta de diabetes' })
    await user.type(within(panel).getByLabelText('Idade (anos)'), '72')
    await user.type(within(panel).getByLabelText('Peso (kg)'), '70')
    const mig = within(panel).getByRole('region', { name: 'Migração para glargina' })
    expect(within(mig).getByText(/Elegível à glargina/)).toBeInTheDocument()
    await user.type(within(panel).getByLabelText('Dose total diária de NPH (UI/dia)'), '50')
    expect(within(panel).getByText('Glargina, 1 vez ao dia').parentElement).toHaveTextContent(
      '40 UI',
    )
    // DM2, 70 kg, 40 UI = 0,57 UI/kg → alerta do Quadro 4
    expect(within(panel).getByRole('alert')).toHaveTextContent('Insulina basal > 0,5 UI/kg/dia')
  })

  it('consulta: perfil criança bloqueia as quatro seções do DM2 adulto; hipoglicemia sempre alerta', async () => {
    render(<App />)
    const user = userEvent.setup()
    const panel = screen.getByRole('tabpanel', { name: 'Consulta de diabetes' })
    await user.type(within(panel).getByLabelText('Idade (anos)'), '30')
    // adulto: glicemia 55 mostra o alerta mesmo sem dose prandial
    await user.click(within(panel).getByRole('button', { name: /Insulina prandial/ }))
    await user.type(within(panel).getByLabelText('Glicemia antes da refeição (mg/dL)'), '55')
    expect(within(panel).getByText('Glicemia abaixo de 70 mg/dL.')).toBeInTheDocument()
    await user.selectOptions(within(panel).getByLabelText('Perfil (metas)'), 'crianca')
    for (const nome of [
      'Insulina prandial',
      'Início da NPH',
      'Titulação da basal',
      'Tratamento do DM2',
    ]) {
      await user.click(within(panel).getByRole('button', { name: new RegExp(nome) }))
      const sec = within(panel).getByRole('region', { name: nome })
      expect(within(sec).getByText(/Fora do escopo/)).toBeInTheDocument()
    }
  })

  it('risco: escolhe a escala e desmarca o diabetes', async () => {
    render(<App />)
    const user = userEvent.setup()
    const panel = screen.getByRole('tabpanel', { name: 'Consulta de diabetes' })
    await user.type(within(panel).getByLabelText('Idade (anos)'), '45')
    await user.click(within(panel).getByRole('button', { name: /Risco cardiovascular/ }))
    const risk = within(panel).getByRole('region', { name: 'Risco cardiovascular' })
    // sem sexo escolhido, as escalas não calculam
    expect(within(risk).getByText(/Escolha o sexo no painel do paciente/)).toBeInTheDocument()
    await user.click(within(panel).getByRole('radio', { name: 'Masc.' }))
    // SBC 2025, DM2, homem 45 anos sem estratificadores → intermediário
    expect(within(risk).getAllByText('Intermediário').length).toBeGreaterThan(0)
    await user.click(within(risk).getByRole('radio', { name: /SBD 2026/ }))
    expect(within(risk).getAllByText('Intermediário').length).toBeGreaterThan(0)
    await user.click(within(risk).getByRole('checkbox', { name: /Considerar diabetes/ }))
    expect(within(risk).getByText(/só para pessoas com diabetes/)).toBeInTheDocument()
  })

  it('glicosímetro: demonstração lê, resume e exporta CSV sem gravar nada', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Glicosímetro (USB)' }))
    await user.click(screen.getByRole('button', { name: /demonstração/ }))
    expect(await screen.findByText(/Resumo/, {}, { timeout: 5000 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))
    expect(blobs).toHaveLength(1)
    const csv = await blobs[0]!.text()
    expect(csv).toContain('Data;Hora;Glicemia (mg/dL)')
    expect(setItem).not.toHaveBeenCalled()
    expect(cookieSet).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Apagar e ler outro' }))
    expect(screen.getByRole('button', { name: 'Conectar glicosímetro' })).toBeInTheDocument()
  })
  it('gestante: IG pela DUM numa data e redatação pela ultrassonografia', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Gestante' }))
    const panel = screen.getByRole('tabpanel', { name: 'Gestante' })
    const set = (label: string, v: string) =>
      fireEvent.change(within(panel).getByLabelText(label, { selector: 'input[type="date"]' }), {
        target: { value: v },
      })
    set('Calcular a IG em', '2026-06-20')
    set('Data da última menstruação (DUM)', '2026-01-01')
    expect(
      within(panel).getByText('IG em 20/06/2026', { exact: false }).parentElement,
    ).toHaveTextContent('24s 2d')
    expect(
      within(panel).getByText('Data provável do parto', { selector: '.result-label' })
        .parentElement,
    ).toHaveTextContent('08/10/2026')
    // Pré-natal com 24s 2d: TOTG agora, exames do 1º trimestre a conferir, 3º trimestre em 16/07
    const pn = within(panel).getByRole('heading', { name: 'Pré-natal com 24s 2d' }).closest('.card')
    expect(pn).not.toBeNull()
    const card = within(pn as HTMLElement)
    expect(
      card.getByRole('heading', { name: 'Solicitar agora' }).nextElementSibling,
    ).toHaveTextContent('TOTG 75 g')
    expect(
      card.getByText('Confira o resultado', { exact: false }).nextElementSibling,
    ).toHaveTextContent('Hepatite C')
    expect(card.getByText(/A partir de 28s 0d: 16\/07\/2026/)).toBeInTheDocument()
    expect(card.getByText('mensal')).toBeInTheDocument()
    // USG em 26/02 (8s 0d pela DUM) com laudo de 9s 0d: 7 dias > 5 → redata
    await user.click(within(panel).getByRole('radio', { name: 'Ultrassonografia' }))
    set('Data da ultrassonografia', '2026-02-26')
    await user.type(within(panel).getByLabelText('IG no laudo: semanas'), '9')
    await user.type(within(panel).getByLabelText('IG no laudo: dias'), '0')
    set('DUM (opcional, para comparar)', '2026-01-01')
    expect(within(panel).getByText('Redatar pela ultrassonografia.')).toBeInTheDocument()
    expect(
      within(panel).getByText('IG em 20/06/2026', { exact: false }).parentElement,
    ).toHaveTextContent('25s 2d')
    // escolher manter a DUM volta para 24s 2d
    await user.click(within(panel).getByRole('radio', { name: 'Manter a DUM' }))
    expect(
      within(panel).getByText('IG em 20/06/2026', { exact: false }).parentElement,
    ).toHaveTextContent('24s 2d')
  })
  it('criança: introdução alimentar pela idade e classificação dos marcos', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Criança' }))
    const panel = screen.getByRole('tabpanel', { name: 'Criança' })
    const set = (label: string, v: string) =>
      fireEvent.change(within(panel).getByLabelText(label, { selector: 'input[type="date"]' }), {
        target: { value: v },
      })
    set('Data da consulta', '2026-07-15')
    set('Data de nascimento', '2026-01-01')
    expect(
      within(panel).getByText('Idade em 15/07/2026', { exact: false }).parentElement,
    ).toHaveTextContent('6 meses e 14 dias')
    const alim = within(panel).getByRole('region', { name: 'Introdução alimentar' })
    expect(within(alim).getByRole('heading', { name: 'Aos 6 meses' })).toBeInTheDocument()
    await user.click(
      within(alim).getByRole('radio', {
        name: /Leite de vaca integral \(alternativa do MS, não indicada em condições gerais\)/,
      }),
    )
    expect(
      within(alim).getByText(/não deve ser consumido no primeiro ano de vida/),
    ).toBeInTheDocument()
    expect(
      within(alim).getByRole('heading', { name: 'Entre 5 e 11 meses, com leite de vaca' }),
    ).toBeInTheDocument()

    // Marcos: 6 meses completos → faixa de 6 a 9 meses; todos presentes → adequado
    await user.click(within(panel).getByRole('button', { name: /Marcos do desenvolvimento/ }))
    const marcos = within(panel).getByRole('region', { name: 'Marcos do desenvolvimento' })
    expect(
      within(marcos).getByRole('heading', { name: 'Marcos de 6 a 9 meses' }),
    ).toBeInTheDocument()
    for (const r of within(marcos).getAllByRole('radio', { name: 'Presente' })) await user.click(r)
    expect(within(marcos).getByText('Desenvolvimento adequado')).toBeInTheDocument()

    // Prematuro de 30 semanas: idade corrigida de 4 meses → faixa de 4 a 6 meses, e a
    // prematuridade entra como fator de risco: todos presentes → alerta
    await user.type(within(panel).getByLabelText('IG ao nascer: semanas'), '30')
    expect(
      within(marcos).getByRole('heading', { name: 'Marcos de 4 a 6 meses' }),
    ).toBeInTheDocument()
    for (const r of within(marcos).getAllByRole('radio', { name: 'Presente' })) await user.click(r)
    expect(within(marcos).getByText('Alerta para o desenvolvimento')).toBeInTheDocument()
    expect(within(marcos).getByText('Marcar consulta de retorno em 30 dias.')).toBeInTheDocument()
  })

  it('canetas: 0,25 mg na caneta de 1 mg do Ozivy = 18 ou 19 cliques, 8 aplicações', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Canetas GLP-1' }))
    const panel = screen.getByRole('tabpanel', { name: 'Canetas GLP-1' })
    await user.selectOptions(within(panel).getByLabelText('Marca'), 'ozivy')
    await user.type(within(panel).getByLabelText('Dose semanal (mg)'), '0.25')
    expect(within(panel).getByText('0,25 mg nesta caneta').parentElement).toHaveTextContent(
      '18 ou 19 cliques',
    )
    expect(
      within(panel).getByText('Aplicações por caneta', { selector: 'span' }).parentElement,
    ).toHaveTextContent('8')
    expect(within(panel).getByText('Uso fora de bula (off-label).')).toBeInTheDocument()
  })

  it('início da glargina: 75 anos, 60 kg → elegível, 10 U ou 6–12 U, 2 tubetes para 30 dias', async () => {
    render(<App />)
    const user = userEvent.setup()
    const panel = screen.getByRole('tabpanel', { name: 'Consulta de diabetes' })
    await user.type(within(panel).getByLabelText('Idade (anos)'), '75')
    await user.type(within(panel).getByLabelText('Peso (kg)'), '60')
    await user.click(within(panel).getByRole('button', { name: /Início da glargina/ }))
    const sec = within(panel).getByRole('region', { name: 'Início da glargina' })
    expect(within(sec).getByText(/Elegível à glargina/)).toBeInTheDocument()
    expect(within(sec).getByText('Ou por peso (0,1 a 0,2 U/kg)').parentElement).toHaveTextContent(
      '6–12',
    )
    expect(within(sec).getByText('Tubetes de 3 mL para 30 dias').parentElement).toHaveTextContent(
      '2',
    )
  })

  it('início da glargina no DM1: 10 anos, 30 kg, pré-púbere → glargina 6–12 UI/dia (NT 169, Quadro 1)', async () => {
    render(<App />)
    const user = userEvent.setup()
    const panel = screen.getByRole('tabpanel', { name: 'Consulta de diabetes' })
    await user.type(within(panel).getByLabelText('Idade (anos)'), '10')
    await user.type(within(panel).getByLabelText('Peso (kg)'), '30')
    await user.click(within(panel).getByLabelText('DM1'))
    await user.click(within(panel).getByRole('button', { name: /Início da glargina/ }))
    const sec = within(panel).getByRole('region', { name: 'Início da glargina' })
    expect(within(sec).getByText(/Elegível à glargina/)).toBeInTheDocument()
    await user.click(within(sec).getByLabelText('Pré-púbere'))
    expect(within(sec).getByText(/^Glargina \(basal/).parentElement).toHaveTextContent('6–12')
    expect(within(sec).getByText(/^DTDI/).parentElement).toHaveTextContent('15–24')
  })

  it('pré-eclâmpsia: um fator alto indica AAS e cálcio; PA 165/100 é grave', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Gestante' }))
    const area = screen.getByRole('tabpanel', { name: 'Gestante' })
    await user.click(within(area).getByRole('button', { name: /^Pré-eclâmpsia/ }))
    const sec = within(area).getByRole('region', { name: 'Pré-eclâmpsia' })
    expect(within(sec).getByText('Prevenção com AAS e cálcio').parentElement).toHaveTextContent(
      'Sem indicação',
    )
    await user.click(within(sec).getByLabelText('Hipertensão arterial crônica'))
    expect(within(sec).getByText('Prevenção com AAS e cálcio').parentElement).toHaveTextContent(
      'Indicada',
    )
    await user.type(within(sec).getByLabelText('PA sistólica (mmHg)'), '165')
    await user.type(within(sec).getByLabelText('PA diastólica (mmHg)'), '100')
    expect(within(sec).getByText('Classificação').parentElement).toHaveTextContent(
      'Hipertensão grave',
    )
  })

  it('eclâmpsia: creatinina 1,2 reduz o Zuspan a 0,5 g/h; FR 12 bloqueia a manutenção', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Gestante' }))
    const area = screen.getByRole('tabpanel', { name: 'Gestante' })
    await user.click(within(area).getByRole('button', { name: /Eclâmpsia e sulfato/ }))
    const sec = within(area).getByRole('region', { name: 'Eclâmpsia e sulfato' })
    expect(within(sec).getByText('Manutenção').parentElement).toHaveTextContent('1 g/h')
    await user.type(within(sec).getByLabelText('Creatinina (mg/dL)'), '1.2')
    expect(within(sec).getByText('Manutenção').parentElement).toHaveTextContent('0,5 g/h')
    await user.click(within(sec).getByLabelText('Presente'))
    await user.type(within(sec).getByLabelText('Frequência respiratória (irpm)'), '12')
    await user.type(within(sec).getByLabelText('Diurese (mL/h)'), '40')
    expect(within(sec).getByRole('alert')).toHaveTextContent('frequência respiratória 12 irpm')
  })
})
