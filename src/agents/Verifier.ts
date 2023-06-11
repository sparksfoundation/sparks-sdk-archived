import { Agent } from '../types/index.js'

export class Verifier extends Agent {
  verify() {
    console.log('verifier')
    return true
  }
}