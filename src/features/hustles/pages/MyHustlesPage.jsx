import { useState, useRef } from 'react'
import { Plus, X, Upload, FileText, Trash2, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { HustleCard } from '../components/HustleCard.jsx'
import { HustleDetailPanel } from '../components/HustleDetailPanel.jsx'
import { RichTextEditor } from '../../../shared/components/RichTextEditor.jsx'
import useHustlesStore from '../hustles.store.js'
import { HUSTLE_STATES } from '../machines/hustle.machine.js'
import { Button } from '../../../shared/components/Button.jsx'

const STATUS_TABS = [
  { key: 'active', label: 'Created', status: HUSTLE_STATES.ACTIVE },
  { key: 'in_progress', label: 'In-progress', status: HUSTLE_STATES.IN_PROGRESS },
  { key: 'pending_approval', label: 'Pending approval', status: HUSTLE_STATES.PENDING_APPROVAL },
  { key: 'completed', label: 'Completed', status: HUSTLE_STATES.COMPLETED },
  { key: 'reviews', label: 'Reviews', status: 'reviews' },
]

const SEED_HUSTLES = [
  {
    id: 'h1', title: 'Lash Extension Expert Needed',
    description: 'Looking for a skilled lash tech to create natural-looking or volume lash sets for quick, one-off gigs.',
    image: null, applicantCount: 5,
    postedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    experienceLevel: 'expert', duration: '1 week', amount: 2000,
    location: 'Accra, Ghana', status: HUSTLE_STATES.ACTIVE,
  },
  {
    id: 'h2', title: 'Makeup Artist for Wedding',
    description: 'Need a professional makeup artist for a wedding event. Must have experience with bridal looks.',
    image: null, applicantCount: 3,
    postedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    experienceLevel: 'intermediate', duration: '1 day', amount: 1500,
    location: 'Kumasi, Ghana', status: HUSTLE_STATES.ACTIVE,
  },
]

const schema = z.object({
  title: z.string().min(5, 'Min 5 characters').max(100),
  category: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time'),
  duration: z.string().min(1, 'Required'),
  location: z.string().min(1, 'Required'),
  budget: z.string().min(1, 'Required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be positive'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']),
  description: z.string().min(20, 'Min 20 characters'),
})

const CATEGORIES = ['Technology', 'Design', 'Marketing', 'Writing', 'Business', 'Education', 'Health', 'Beauty', 'Other']
function Lbl({ children }) { return <p className="text-[12px] font-semibold text-text-3 mb-1.5">{children}</p> }
function Err({ msg }) { return msg ? <p className="text-[11px] text-red-500 mt-1">{msg}</p> : null }
function inp(err) {
  return `w-full h-11 px-3.5 text-[13px] font-medium text-text-1 bg-surface rounded-xl border outline-none transition-all placeholder:text-text-4 ${err ? 'border-red-400' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/8'}`
}
function fmtSize(b) { return b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB` }

function SuccessBanner({ onDismiss }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 bg-primary rounded-2xl mb-6" style={{ animation: 'fadeSlideDown 0.3s ease' }}>
      <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary-light/20 flex items-center justify-center">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5L4 8L9.5 2" stroke="var(--color-primary-light)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-white leading-tight mb-0.5">Your Hustle is created</p>
        <p className="text-[12px] text-white/70 leading-relaxed">You have successfully created a hustle. We will share the profiles of all hustlers who apply for this hustle with you to review and book an appointment.</p>
      </div>
      <button onClick={onDismiss} className="flex-shrink-0 text-white/40 hover:text-white transition-colors p-1">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
    </div>
  )
}

function CreateHustlePanel({ onClose, onCreated }) {
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const inputRef = useRef(null)

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = useForm({
    resolver: zodResolver(schema), mode: 'onChange',
    defaultValues: { title: '', category: '', startDate: '', endDate: '', startTime: '', endTime: '', duration: '', location: '', budget: '', experienceLevel: 'beginner', description: '' },
  })
  const description = watch('description')
  const selectedLevel = watch('experienceLevel')

  const addSkill = () => {
    const t = skillInput.trim()
    if (t && skills.length < 5 && !skills.includes(t)) { setSkills([...skills, t]); setSkillInput('') }
  }
  const addFiles = (f) => setFiles(p => [...p, ...Array.from(f)].slice(0, 10))

  const onSubmit = (data) => {
    setIsPending(true)
    setTimeout(() => {
      onCreated({
        id: `h${Date.now()}`, title: data.title, description: data.description,
        image: null, applicantCount: 0, postedAt: new Date().toISOString(),
        experienceLevel: data.experienceLevel, duration: data.duration,
        amount: Number(data.budget), location: data.location,
        status: HUSTLE_STATES.ACTIVE,
      })
      setIsPending(false)
      onClose()
    }, 800)
  }

  return (
    <AnimatePresence>
      <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }} onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" />
      <motion.div key="panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-surface shadow-2xl w-full sm:w-[580px] lg:w-[620px]">
        <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-text-3 hover:bg-mist transition-all" aria-label="Back"><ArrowLeft size={17} /></button>
            <h2 className="text-[17px] sm:text-[18px] font-bold text-text-1">Create a hustle</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4 hover:bg-mist transition-all" aria-label="Close"><X size={17} /></button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <form onSubmit={handleSubmit(onSubmit)} className="px-5 sm:px-7 pt-5 pb-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div><Lbl>Enter Job title</Lbl><input placeholder="Eg. Lash extension" className={inp(errors.title)} {...register('title')} /><Err msg={errors.title?.message} /></div>
              <div>
                <Lbl>Select category</Lbl>
                <select className={`${inp(errors.category)} cursor-pointer`} {...register('category')}>
                  <option value="">Select</option>
                  {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                </select>
                <Err msg={errors.category?.message} />
              </div>
            </div>
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-4 mb-3">Preferred date</p>
              <div className="grid grid-cols-2 gap-3">
                <div><input type="date" className={inp(errors.startDate)} {...register('startDate')} /><Err msg={errors.startDate?.message} /></div>
                <div><input type="date" className={inp(errors.endDate)} {...register('endDate')} /><Err msg={errors.endDate?.message} /></div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-4 mb-3">Preferred time</p>
              <div className="grid grid-cols-2 gap-3">
                <div><input type="time" className={inp(errors.startTime)} {...register('startTime')} /><Err msg={errors.startTime?.message} /></div>
                <div><input type="time" className={inp(errors.endTime)} {...register('endTime')} /><Err msg={errors.endTime?.message} /></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div><Lbl>Service duration</Lbl><input placeholder="e.g. 8 days" className={inp(errors.duration)} {...register('duration')} /><Err msg={errors.duration?.message} /></div>
              <div><Lbl>Location</Lbl><input placeholder="e.g. Accra, Ghana" className={inp(errors.location)} {...register('location')} /><Err msg={errors.location?.message} /></div>
            </div>
            <div className="mb-4">
              <Lbl>Budget</Lbl>
              <div className={`flex items-stretch rounded-xl border overflow-hidden transition-all ${errors.budget ? 'border-red-400' : 'border-border focus-within:border-primary'}`}>
                <span className="flex items-center px-3.5 text-[12px] font-bold text-text-3 bg-mist border-r border-border">GHS</span>
                <input type="number" placeholder="Enter your budget" className="flex-1 min-w-0 h-11 px-3.5 text-[13px] font-medium text-text-1 bg-surface outline-none placeholder:text-text-4" {...register('budget')} />
              </div>
              <Err msg={errors.budget?.message} />
            </div>
            <div className="mb-4">
              <Lbl>Experience level</Lbl>
              <div className="flex gap-3">
                {['beginner', 'intermediate', 'expert'].map(level => {
                  const active = selectedLevel === level
                  return (
                    <label key={level} className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-[12px] font-semibold capitalize ${active ? 'border-primary bg-primary/4 text-primary' : 'border-border bg-surface text-text-3'}`}>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? 'border-primary' : 'border-text-4'}`}>
                        {active && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </span>
                      <input type="radio" value={level} className="sr-only" {...register('experienceLevel')} />
                      {level}
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="mb-4">
              <Lbl>Skills required</Lbl>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const existing = skills[idx]
                  return existing ? (
                    <div key={idx} className="flex items-center gap-1.5 h-11 px-3.5 bg-surface border border-border rounded-xl text-[12px] font-medium text-text-1 whitespace-nowrap">
                      {existing}
                      <button type="button" onClick={() => setSkills(skills.filter((_, i) => i !== idx))} className="text-text-4 hover:text-red-400 ml-0.5"><X size={12} /></button>
                    </div>
                  ) : (
                    <input key={idx} type="text" placeholder="Enter skill" disabled={idx > skills.length}
                      value={idx === skills.length ? skillInput : ''}
                      onChange={e => { if (idx === skills.length) setSkillInput(e.target.value) }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                      onBlur={addSkill}
                      className="h-11 w-28 px-3 text-[12px] font-medium text-text-1 bg-surface border border-border rounded-xl outline-none focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed" />
                  )
                })}
              </div>
              {skills.length === 0 && <p className="text-[11px] text-red-500 mt-1.5">At least one skill is required</p>}
            </div>
            <div className="mb-4">
              <Lbl>Hustle description</Lbl>
              <RichTextEditor value={description} onChange={v => setValue('description', v)} placeholder="Describe what you want the hustler to do for you" />
              <Err msg={errors.description?.message} />
            </div>
            <div className="mb-6">
              <Lbl>Upload a picture or document (Optional)</Lbl>
              <div onDragOver={e => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-bg'}`}>
                <input ref={inputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm"><Upload size={17} className="text-primary" /></div>
                <p className="text-[13px] font-bold text-primary">Drag to drop or Click to upload</p>
                <p className="text-[11px] text-text-4">Images, PDF, DOC (max 5MB)</p>
              </div>
              {files.filter(f => !f.type.startsWith('image/')).length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.filter(f => !f.type.startsWith('image/')).map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0"><FileText size={15} className="text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-text-1 truncate">{file.name}</p>
                        <p className="text-[10px] text-text-4">{fmtSize(file.size)}</p>
                      </div>
                      <button type="button" onClick={() => setFiles(files.filter(f2 => f2 !== file))} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              {files.filter(f => f.type.startsWith('image/')).length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {files.filter(f => f.type.startsWith('image/')).map((file, idx) => {
                    const url = URL.createObjectURL(file)
                    return (
                      <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border flex-shrink-0">
                        <img src={url} alt="" className="w-full h-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                        <button type="button" onClick={() => setFiles(files.filter(f2 => f2 !== file))} className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/55 flex items-center justify-center text-white"><X size={9} /></button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-surface border-t border-border -mx-5 sm:-mx-7 px-5 sm:px-7 py-4">
              <button type="submit" disabled={!isValid || skills.length === 0 || isPending}
                className={`w-full h-12 rounded-2xl text-[14px] font-bold transition-all ${isValid && skills.length > 0 && !isPending ? 'bg-primary hover:bg-primary-sat active:scale-[0.99] text-white cursor-pointer' : 'bg-text-4 text-white cursor-not-allowed'}`}>
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 00-12 12h4z" /></svg>
                    Creating hustle...
                  </span>
                ) : 'Create hustle'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function MyHustlesPage() {
  const { activeTab, setActiveTab, openDetailPanel, detailPanelOpen, selectedHustleId, closeDetailPanel } = useHustlesStore()
  const [hustles, setHustles] = useState(SEED_HUSTLES)
  const [showBanner, setShowBanner] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = hustles.filter(h => h.status === activeTab)
  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.status] = hustles.filter(h => h.status === tab.status).length
    return acc
  }, {})

  const handleViewDetails = (hustleId) => {
    openDetailPanel(hustleId)
  }

  const handleCreated = (newHustle) => {
    setHustles(prev => [newHustle, ...prev])
    setShowBanner(true)
    setTimeout(() => setShowBanner(false), 7000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-text-1 tracking-tight">My hustles</h1>
        <Button variant="solid" onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 w-fit h-10 sm:h-11 px-4 sm:px-5 active:scale-95 text-white font-bold rounded-full transition-all shadow-sm">
          <Plus size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">Create a hustle</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {showBanner && <SuccessBanner onDismiss={() => setShowBanner(false)} />}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {STATUS_TABS.map(tab => {
          const isActive = activeTab === tab.status
          return (
            <Button key={tab.key} onClick={() => setActiveTab(tab.status)} variant="primary"
              className={`w-fit text-[14px] flex-shrink-0 h-9 px-4 font-semibold rounded-full border transition-all whitespace-nowrap ${isActive ? 'bg-primary text-white border-transparent shadow-sm' : 'bg-surface text-text-3 border-border hover:border-primary-light/70'}`}>
              {tab.label} ({counts[tab.status] ?? 0})
            </Button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          illustration="/src/assets/images/pana.png"
          title={`No hustle ${STATUS_TABS.find(t => t.status === activeTab)?.label?.toLowerCase() || ''}`}
          description="All hustles created will be displayed here"
          action={{ label: 'Create a hustle', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map(hustle => (
            <HustleCard key={hustle.id} hustle={hustle} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}

      {createOpen && <CreateHustlePanel onClose={() => setCreateOpen(false)} onCreated={handleCreated} />}
      <HustleDetailPanel
        isOpen={detailPanelOpen}
        onClose={closeDetailPanel}
        hustleId={selectedHustleId}
      />

      <style>{`
        @keyframes fadeSlideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}
