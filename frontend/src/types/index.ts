export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  created_at: string
}

export interface Question {
  id: string
  question_text: string
  order_index: number
}

export interface Interview {
  id: string
  title: string
  topic: string
  about: string | null
  created_at: string
  questions: Question[]
  queries?: Query[]
}

export interface Query {
  id: string
  interview_id: string
  sender_name: string
  sender_email: string
  phone_number?: string
  message: string
  image_url?: string | null
  file_url?: string | null
  created_at: string
  replies?: any[]
}

export interface InterviewListResponse {
  interviews: Interview[]
  total: number
}

export interface UserListResponse {
  users: User[]
  total: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
