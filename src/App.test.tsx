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
    expect(within(panel).getByText(/Elegível à glargina/)).toBeInTheDocument()
    await user.type(within(panel).getByLabelText('Dose total diária de NPH (UI/dia)'), '50')
    expect(within(panel).getByText('Glargina, 1 vez ao dia').parentElement).toHaveTextContent(
      '40 UI',
    )
    // DM2, 70 kg, 40 UI = 0,57 UI/kg → alerta do Quadro 4
    expect(within(panel).getByRole('alert')).toHaveTextContent('Insulina basal > 0,5 UI/kg/dia')
  })

  it('risco: escolhe a escala e desmarca o diabetes', async () => {
    render(<App />)
    const user = userEvent.setup()
    const panel = screen.getByRole('tabpanel', { name: 'Consulta de diabetes' })
    await user.type(within(panel).getByLabelText('Idade (anos)'), '45')
    await user.click(within(panel).getByRole('button', { name: /Risco cardiovascular/ }))
    const risk = within(panel).getByRole('region', { name: 'Risco cardiovascular' })
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
})
