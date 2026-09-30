export type TxType = 'i' | 'e'
export type Category = 'Food'|'Transport'|'Entertainment'|'Shopping'|'Subscriptions'|'Education'|'Health'|'Other'|'Income'
export interface Tx { id: number; type: TxType; amount: number; category: Category; description: string; date: string }
export interface Goal { id: number; name: string; target: number; current: number; deadline: string }
export type Provider = 'local' | 'openai' | 'anthropic'
export interface AISettings { provider: Provider; baseUrl: string; apiKey: string; model: string; personality: 'calm'|'direct'|'friendly'|'analytical' }
export interface ChatMsg { role: 'user' | 'assistant'; text: string }
export interface AppState {
  name: string; start: number; tx: Tx[]; goals: Goal[]; limits: Partial<Record<Category, number>>
  dark: boolean; chat: ChatMsg[]; ai: AISettings
}
