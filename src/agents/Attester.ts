import { Agent } from '../types/index.js'

export class Attester extends Agent {
  attest() {
    console.log('attester')
    return 'attester'
  }
}