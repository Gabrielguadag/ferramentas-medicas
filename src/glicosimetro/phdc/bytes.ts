// Leitura e escrita MDER (IEEE 11073-20601, Medical Device Encoding Rules): inteiros big-endian
// sem sinal e "octet strings" prefixadas por um comprimento u16. Toda leitura confere limites;
// um aparelho com firmware inesperado gera erro legível, nunca leitura fora do buffer.

export class ProtocolError extends Error {
  override name = 'ProtocolError'
}

export class Reader {
  private offset = 0
  private readonly view: DataView

  constructor(private readonly bytes: Uint8Array) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  }

  get position(): number {
    return this.offset
  }

  get remaining(): number {
    return this.bytes.byteLength - this.offset
  }

  private need(n: number, what: string): void {
    if (n < 0 || this.offset + n > this.bytes.byteLength) {
      throw new ProtocolError(
        `Mensagem truncada ao ler ${what}: faltam ${this.offset + n - this.bytes.byteLength} bytes (posição ${this.offset}).`,
      )
    }
  }

  u8(what = 'u8'): number {
    this.need(1, what)
    const v = this.view.getUint8(this.offset)
    this.offset += 1
    return v
  }

  u16(what = 'u16'): number {
    this.need(2, what)
    const v = this.view.getUint16(this.offset)
    this.offset += 2
    return v
  }

  u32(what = 'u32'): number {
    this.need(4, what)
    const v = this.view.getUint32(this.offset)
    this.offset += 4
    return v
  }

  bytesOf(n: number, what = 'bytes'): Uint8Array {
    this.need(n, what)
    const v = this.bytes.subarray(this.offset, this.offset + n)
    this.offset += n
    return v
  }

  /** Octet string MDER: u16 de comprimento seguido dos bytes. */
  octets(what = 'octet string'): Uint8Array {
    const len = this.u16(`comprimento de ${what}`)
    return this.bytesOf(len, what)
  }

  /** Lê um bloco prefixado por comprimento u16 e devolve um Reader só sobre ele. */
  sub(what = 'bloco'): Reader {
    return new Reader(this.octets(what))
  }

  skip(n: number, what = 'bytes'): void {
    this.need(n, what)
    this.offset += n
  }
}

export class Writer {
  private readonly parts: number[] = []

  u8(v: number): this {
    this.parts.push(v & 0xff)
    return this
  }

  u16(v: number): this {
    this.parts.push((v >>> 8) & 0xff, v & 0xff)
    return this
  }

  u32(v: number): this {
    this.parts.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff)
    return this
  }

  raw(bytes: Uint8Array | readonly number[]): this {
    for (const b of bytes) this.parts.push(b & 0xff)
    return this
  }

  /** Escreve u16 de comprimento + conteúdo (octet string ou estrutura aninhada). */
  block(inner: Writer | Uint8Array): this {
    const bytes = inner instanceof Writer ? inner.toBytes() : inner
    return this.u16(bytes.byteLength).raw(bytes)
  }

  get length(): number {
    return this.parts.length
  }

  toBytes(): Uint8Array {
    return Uint8Array.from(this.parts)
  }
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(' ')
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-f]/gi, '')
  if (clean.length % 2 !== 0) throw new Error('hex com número ímpar de dígitos')
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  return out
}
