export function outputSuccess(data: unknown): void {
  process.stdout.write(JSON.stringify({ data }) + '\n')
}

export function outputError(message: string, code = 'ERROR'): void {
  process.stderr.write(JSON.stringify({ error: message, code }) + '\n')
}
