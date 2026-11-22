export interface Participant {
  id: string
  sno: number
  name: string
  startup: string
  gender: string
  sector: string
  location: string
  stage: string
  occupation: string
  cohort: string
  attended: boolean
}

export interface IncubationEventBucket {
  name: string
  total: number
  gender: Record<string, number>
  occupation: Record<string, number>
  stage: Record<string, number>
  sector_clean: Record<string, number>
  location: Record<string, number>
}

export type IncubationEventKey = 'drone' | 'ipr' | 'leaders' | 'mentors'
export type IncubationEventsData = Record<IncubationEventKey, IncubationEventBucket>

export interface EnterpriseEvent {
  id: string
  fiscalYear: string
  eventType: string
  eventName: string
  date: string
  venue: string
  eventCode: string
  district: string
  participantsRegistered: number
  participantsActual: number | null
  outcomes: {
    setupBusiness: boolean
    esCompliance: boolean
    iprFiling: boolean
    buyerMou: boolean
  }
  status: 'Completed' | 'In Progress'
}

export interface RegistrantSummary {
  total: number
  byGender: Record<string, number>
  byCategory: Record<string, number>
  byAge: Record<string, number>
}

export interface EnterpriseBatch {
  id: string
  component: string
  implementationPartner: string
  district: string
  constituency: string
  mandal: string
  startDate: string
  endDate: string
  checklistSubmissionDate: string
  checklistStatus: string
  status: string
  reviewStatus: string
  remarks: string
  summary: RegistrantSummary
}

export interface EnterpriseProgramData {
  batches: EnterpriseBatch[]
}

export interface FinanceData {
  grants: { id: string; date: string; company: string; amount: number; fiscalYear: string }[]
  expenses: { id: string; period: string; amount: number; fiscalYear: string }[]
}
