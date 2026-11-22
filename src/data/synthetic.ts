import type {
  FinanceData, IncubationEventBucket, IncubationEventsData,
  Participant, EnterpriseProgramData, EnterpriseEvent, RegistrantSummary,
} from '../types'

// All rows and values in this module were created for the portfolio demo.
export const partners = ['Example Horizon Works', 'Example Cedar Ventures', 'Example Northstar Labs']
const districts = ['Cedar Vale', 'Juniper Coast', 'Maple Ridge', 'Fern Crossing']
const sectors = ['Clean Technology', 'Education', 'Healthcare', 'Agriculture', 'Manufacturing', 'Business Services']
const genders = ['Female', 'Male', 'Female', 'Male', 'Others']
const occupations = ['Student', 'Founder', 'Employee', 'Student']
const ages = ['18-25', '26-35', '36-45', '46-60', '60+']
const categories = ['Micro business', 'Early-stage venture', 'Independent founder']

export function tally(values: string[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const value of values) result[value] = (result[value] ?? 0) + 1
  return result
}

const firstNames = ['Aarya', 'Rohan', 'Mira', 'Vihaan', 'Anika', 'Kabir', 'Isha', 'Reyansh']
const lastNames = ['Vale', 'Briar', 'Linden', 'Alder', 'Ashford', 'Rowan']
const ventureNames = ['Lumen', 'Mossline', 'Thimble', 'Brightfen', 'Orbital', 'Trellis', 'Cloudberry', 'Pebble']
const ventureSuffixes = ['Studio', 'Systems', 'Works', 'Workshop', 'Research', 'Collective']

const applicants: Participant[] = Array.from({ length: 48 }, (_, index) => ({
  id: 'demo-founder-' + (index + 1),
  sno: index + 1,
  name: firstNames[index % firstNames.length] + ' ' + lastNames[Math.floor(index / firstNames.length)],
  startup: 'Example ' + ventureNames[index % ventureNames.length] + ' ' + ventureSuffixes[Math.floor(index / ventureNames.length)],
  gender: genders[index % genders.length],
  sector: sectors[index % sectors.length],
  location: districts[index % districts.length],
  stage: index < 8 ? (index % 3 === 0 ? 'MVP' : 'Prototype') : 'Ideation',
  occupation: occupations[index % occupations.length],
  cohort: 'Cohort ' + (index % 3 + 1),
  attended: index % 7 !== 6,
}))

const attendance = applicants.filter((participant) => participant.attended)
const validatedIdeas = attendance.slice(0, 30)
const founderParticipants = validatedIdeas.slice(0, 12)
const prototypes = founderParticipants.filter((participant) => participant.stage !== 'Ideation')
const incubationShortlist = prototypes.slice(0, 5)
const accelerated = incubationShortlist.slice(0, 3)
export const pipeline = {
  ideas: validatedIdeas.length,
  prototypes: prototypes.length,
  incubation: incubationShortlist.length,
  accelerated: accelerated.length,
  funding: { microgrant: 1, venture: 1, seed: 1 },
}

export const ideaLab = {
  summary: {
    applications: applicants.length,
    attendance: attendance.length,
    ideas: validatedIdeas.length,
    cohorts: new Set(applicants.map(({ cohort }) => cohort)).size,
    prototypes: prototypes.length,
  },
  prototypes,
  sectorDistribution: Object.entries(tally(attendance.map(({ sector }) => sector)))
    .map(([name, value]) => ({ name, value })),
}

export const founderCohort = {
  prototypes: prototypes.length,
  participants: founderParticipants.map((participant, index) => ({ ...participant, sno: index + 1 })),
  cohorts: new Set(founderParticipants.map(({ cohort }) => cohort)).size,
}

const collegeNames = [
  'Example Briar Technical College', 'Example Northstar Polytechnic',
  'Example Linden Arts & Science College', 'Example Fern Design Institute',
  'Example Alder Engineering College', 'Example Cedar Community College',
  'Example Maple Institute of Technology', 'Example Juniper Science College',
]
const colleges = collegeNames.map((college, index) => ({
  college,
  district: districts[index % districts.length],
  students: 18 + (index * 11) % 37,
  ambassador: applicants[index + 24].name,
}))

export const collegeOutreach = {
  colleges,
  districts: districts.map((name) => ({
    name,
    value: colleges.filter((college) => college.district === name).reduce((total, college) => total + college.students, 0),
  })),
  stats: {
    colleges: colleges.length,
    students: colleges.reduce((total, college) => total + college.students, 0),
    districts: new Set(colleges.map(({ district }) => district)).size,
    ambassadors: new Set(colleges.map(({ ambassador }) => ambassador)).size,
  },
  infra: [
    { label: 'Prototyping Lab / Makerspace' },
    { label: 'Technical Labs' },
    { label: 'Meeting / Training Rooms' },
    { label: 'Workstations' },
    { label: 'Dedicated Incubation Space' },
  ],
}

function eventBucket(name: string, total: number, offset: number): IncubationEventBucket {
  const attendees = Array.from({ length: total }, (_, index) => index + offset)
  const count = (values: string[]) => tally(attendees.map((index) => values[index % values.length]))
  return {
    name,
    total: attendees.length,
    gender: count(genders),
    occupation: count(occupations),
    stage: count(['Ideation', 'Prototype', 'Ideation', 'MVP', 'Validation', 'Operational']),
    sector_clean: count(sectors),
    location: count(districts),
  }
}

export const incubationEvents: IncubationEventsData = {
  drone: eventBucket('Robotics Prototyping Lab', 47, 0),
  ipr: eventBucket('IP Basics for Founders', 36, 3),
  leaders: eventBucket('Founder Leadership Workshop', 53, 5),
  mentors: eventBucket('Mentor Office Hours', 28, 7),
}

const enterpriseCategories = [
  { path: 'registration', title: 'Business Registration', description: 'Registration clinics and business formalization', short: 'REG' },
  { path: 'skills', title: 'Skills Development', description: 'Training for early-stage entrepreneurs', short: 'SKL' },
  { path: 'ip', title: 'Intellectual Property', description: 'Awareness sessions and filing support', short: 'IP' },
  { path: 'vendors', title: 'Vendor Development', description: 'Supplier readiness and buyer introductions', short: 'VEN' },
]

const eventDates = ['2026-01-14', '2026-02-18', '2026-05-13', '2026-08-19']
const venues = ['Example Cedar Commons', 'Example Juniper Studio', 'Example Maple Center', 'Example Fern Exchange']

export const msmeEvents: EnterpriseEvent[] = enterpriseCategories.flatMap((program, categoryIndex) =>
  eventDates.map((date, index) => {
    const number = String(index + 1).padStart(2, '0')
    const districtIndex = (categoryIndex + index) % districts.length
    const participantsRegistered = 24 + (categoryIndex * 7 + index * 11) % 29
    const completed = index < 3 || categoryIndex % 2 === 0
    return {
      id: 'demo-' + program.short.toLowerCase() + '-' + number,
      fiscalYear: index < 2 ? '25-26' : '26-27',
      eventType: program.title,
      eventName: program.title + ' · ' + districts[districtIndex],
      date,
      venue: venues[districtIndex],
      eventCode: 'DEMO-' + program.short + '-' + number,
      district: districts[districtIndex],
      participantsRegistered,
      participantsActual: completed ? participantsRegistered - 4 - index : null,
      status: completed ? 'Completed' : 'In Progress',
      outcomes: {
        setupBusiness: completed && categoryIndex === 0,
        esCompliance: completed && categoryIndex === 1,
        iprFiling: completed && categoryIndex === 2,
        buyerMou: completed && categoryIndex === 3,
      },
    }
  })
)

function summarizeRegistrants(total: number, offset: number): RegistrantSummary {
  const indices = Array.from({ length: total }, (_, index) => index + offset)
  const count = (labels: string[]) => tally(indices.map((index) => labels[index % labels.length]))
  return {
    total,
    byGender: count(genders),
    byCategory: count(categories),
    byAge: count(ages),
  }
}

export function combineSummaries(summaries: RegistrantSummary[]): RegistrantSummary {
  const combined: RegistrantSummary = { total: 0, byGender: {}, byCategory: {}, byAge: {} }
  for (const summary of summaries) {
    combined.total += summary.total
    for (const key of ['byGender', 'byCategory', 'byAge'] as const) {
      for (const [label, count] of Object.entries(summary[key])) {
        combined[key][label] = (combined[key][label] ?? 0) + count
      }
    }
  }
  return combined
}

export const enterprisePrograms = enterpriseCategories.map((program, categoryIndex) => {
  const data: EnterpriseProgramData = {
    batches: msmeEvents.filter((event) => event.eventType === program.title).map((event, index) => ({
      id: event.eventCode,
      component: program.title,
      implementationPartner: partners[(categoryIndex + index) % partners.length],
      district: event.district,
      constituency: event.district + ' ' + (index % 2 === 0 ? 'Central' : 'West'),
      mandal: (index % 2 === 0 ? 'Brookside' : 'Willowbank') + ' Ward',
      startDate: event.date,
      endDate: event.date,
      checklistSubmissionDate: event.status === 'Completed' ? event.date : '',
      checklistStatus: event.status === 'Completed' ? 'Received' : 'Pending',
      status: event.status,
      reviewStatus: event.status === 'Completed' ? 'Reviewed' : 'In review',
      remarks: event.status === 'Completed' ? 'Workshop and follow-up completed' : 'Follow-up in progress',
      summary: summarizeRegistrants(event.participantsRegistered, index + categoryIndex),
    })),
  }
  return { ...program, data }
})

export const finance: FinanceData = {
  grants: [
    { id: 'demo-grant-01', date: '11-12-2025', company: partners[0], amount: 275000, fiscalYear: 'FY 2025-26' },
    { id: 'demo-grant-02', date: '19-02-2026', company: partners[1], amount: 320000, fiscalYear: 'FY 2025-26' },
    { id: 'demo-grant-03', date: '14-04-2026', company: partners[2], amount: 245000, fiscalYear: 'FY 2026-27' },
    { id: 'demo-grant-04', date: '22-06-2026', company: partners[0], amount: 180000, fiscalYear: 'FY 2026-27' },
    { id: 'demo-grant-05', date: '08-08-2026', company: partners[1], amount: 465000, fiscalYear: 'FY 2026-27' },
  ],
  expenses: [
    { id: 'demo-expense-01', period: 'December', amount: 121000, fiscalYear: 'FY 2025-26' },
    { id: 'demo-expense-02', period: 'February', amount: 168000, fiscalYear: 'FY 2025-26' },
    { id: 'demo-expense-03', period: 'April', amount: 154000, fiscalYear: 'FY 2026-27' },
    { id: 'demo-expense-04', period: 'June', amount: 189000, fiscalYear: 'FY 2026-27' },
    { id: 'demo-expense-05', period: 'August', amount: 203000, fiscalYear: 'FY 2026-27' },
  ],
}

export const portfolio = {
  workspace: { occupied: 23, capacity: 36 },
  programsList: [
    { name: 'Idea Lab', desc: 'Workshops for validating early startup ideas.' },
    { name: 'Founder Cohort', desc: 'Mentoring and support for prototype development.' },
    { name: 'College Outreach', desc: 'Campus workshops and an ambassador network.' },
    { name: 'Small Business Programs', desc: 'Registration clinics, skills training, and supplier support.' },
  ],
  infrastructure: ['Prototype workshop', 'Shared studio desks', 'Training rooms'],
  digitalInfra: ['Participant tracking', 'Program reporting', 'Finance and grant reporting'],
  forwardPlan: ['Review the next founder cohort', 'Run a vendor readiness workshop', 'Expand campus mentoring'],
  notices: [
    { id: 'demo-notice-01', title: 'Mentor office hours', description: 'A sample announcement for the next cohort.', urgency: 'gold', date: '07-12-2026' },
    { id: 'demo-notice-02', title: 'Prototype review', description: 'The sample review focuses on testing and customer feedback.', urgency: 'green', date: '15-12-2026' },
  ],
}

export const upcomingPrograms = [
  { name: 'Prototype Studio', focus: 'Incubation program', date: '12 January 2027' },
  { name: 'Scale Workshop', focus: 'Growth program', date: '18 February 2027' },
]
