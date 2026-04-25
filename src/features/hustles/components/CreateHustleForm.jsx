import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Upload, FileText, Trash2 } from 'lucide-react'
import { RichTextEditor } from '../../../shared/components/RichTextEditor.jsx'
import { useCreateHustle } from '../hustles.hooks.js'
import useHustlesStore from '../hustles.store.js'

/* ── Zod schema ──────────────────────────────────────────────────── */
const schema = z.object({
  title:           z.string().min(5, 'Min 5 characters').max(100, 'Max 100 characters'),
  category:        z.string().min(1, 'Required'),
  startDate:       z.string().min(1, 'Required'),
  endDate:         z.string().min(1, 'Required'),
  startTime:       z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time'),
  endTime:         z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time'),
  duration:        z.string().min(1, 'Required'),
  location:        z.string().min(1, 'Required'),
  budget:          z.string().min(1, 'Required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be positive'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']),
  description:     z.string().min(20, 'Min 20 characters'),
}).refine(d => new Date(d.endDate) >= new Date(d.startDate), {
  message: 'End date must be ≥ start date', path: ['endDate'],
}).refine(d => {
  const sameDay = new Date(d.startDate).getTime() === new Date(d.endDate).getTime()
  return sameDay ? d.endTime > d.startTime : true
}, { message: 'End time must be after start time', path: ['endTime'] })

const CATEGORIES = ['Technology','Design','Marketing','Writing','Business','Education','Health','Beauty','Other']

/* ── Tiny helpers ────────────────────────────────────────────────── */
function Label({ children }) {
  return <p className="text-[12px] font-semibold text-[#4A5A52] mb-1.5">{children}</p>
}
function ErrMsg({ msg }) {
  if (!msg) return null
  return <p className="text-[11px] text-red-500 mt-1">{msg}</p>
}
function baseInput(err) {
  return `w-full h-11 px-3.5 text-[13px] font-medium text-[#0A1A12] bg-white rounded-xl border
    outline-none transition-all placeholder:text-[#9AA49E] ${
    err ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-[#DDE0D8] focus:border-[#0A2318] focus:ring-2 focus:ring-[#0A2318]/8'
  }`
}
function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA49E] mb-3">
      {children}
    </p>
  )
}
function Divider() {
  return <div className="h-px bg-[#F0F2EC] my-6" />
}
function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ── Main form ───────────────────────────────────────────────────── */
export function CreateHustleForm({ onClose }) {
  const [skills, setSkills]         = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [files, setFiles]           = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const { formDraft, saveDraft, clearDraft } = useHustlesStore()
  const { mutate: createHustle, isPending }  = useCreateHustle()

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue, reset } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: '', category: '', startDate: '', endDate: '',
      startTime: '', endTime: '', duration: '', location: '',
      budget: '', experienceLevel: 'beginner', description: '',
    },
  })
  const description    = watch('description')
  const selectedLevel  = watch('experienceLevel')

  // Load draft
  useEffect(() => {
    if (!formDraft) return
    Object.entries(formDraft).forEach(([k, v]) => {
      if (k === 'skills') setSkills(v || [])
      else if (k !== 'files') setValue(k, v)
    })
  }, [formDraft, setValue])

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      const draft = { ...watch(), skills }
      localStorage.setItem('hustle-draft', JSON.stringify(draft))
      saveDraft(draft)
    }, 1500)
    return () => clearTimeout(timer)
  }, [watch, skills, saveDraft])

  const addSkill = () => {
    const t = skillInput.trim()
    if (t && skills.length < 5 && !skills.includes(t)) {
      setSkills([...skills, t]); setSkillInput('')
    }
  }

  const addFiles = (newFiles) => setFiles(prev => [...prev, ...Array.from(newFiles)].slice(0, 10))

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files)
  }

  const handleClearDraft = () => {
    reset(); setSkills([]); setFiles([])
    localStorage.removeItem('hustle-draft'); clearDraft()
  }

  const onSubmit = (data) => {
    if (skills.length === 0) return
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, k === 'budget' ? Number(v) : v))
    fd.append('skills', JSON.stringify(skills))
    files.forEach(f => fd.append('files', f))
    createHustle(fd, { onSuccess: () => { handleClearDraft(); onClose() } })
  }

  const isFormValid = isValid && skills.length > 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-5 sm:px-7 pt-5 pb-0">

      {/* ── Title + Category ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Enter Job title</Label>
          <input placeholder="Eg. Lash extension"
            className={baseInput(errors.title)}
            onFocus={e => { if (!errors.title) e.target.classList.add('ring-2','ring-[#0A2318]/8','border-[#0A2318]') }}
            onBlur={e => { e.target.classList.remove('ring-2','ring-[#0A2318]/8','border-[#0A2318]') }}
            {...register('title')} />
          <ErrMsg msg={errors.title?.message} />
        </div>
        <div>
          <Label>Select category</Label>
          <select className={`${baseInput(errors.category)} cursor-pointer appearance-none
            bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238A9A91' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]
            bg-no-repeat bg-[right_12px_center] pr-9`}
            {...register('category')}>
            <option value="">Select</option>
            {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
          </select>
          <ErrMsg msg={errors.category?.message} />
        </div>
      </div>

      {/* ── Preferred date ───────────────────────── */}
      <div className="mb-4">
        <SectionTitle>Preferred date</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input type="date" className={baseInput(errors.startDate)} {...register('startDate')} />
            <ErrMsg msg={errors.startDate?.message} />
          </div>
          <div>
            <input type="date" className={baseInput(errors.endDate)} {...register('endDate')} />
            <ErrMsg msg={errors.endDate?.message} />
          </div>
        </div>
      </div>

      {/* ── Preferred time ───────────────────────── */}
      <div className="mb-4">
        <SectionTitle>Preferred time</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input type="time" className={baseInput(errors.startTime)} {...register('startTime')} />
            <ErrMsg msg={errors.startTime?.message} />
          </div>
          <div>
            <input type="time" className={baseInput(errors.endTime)} {...register('endTime')} />
            <ErrMsg msg={errors.endTime?.message} />
          </div>
        </div>
      </div>

      {/* ── Duration + Location ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Service duration</Label>
          <input placeholder="e.g. 8 days" className={baseInput(errors.duration)} {...register('duration')} />
          <ErrMsg msg={errors.duration?.message} />
        </div>
        <div>
          <Label>Location</Label>
          <input placeholder="e.g. Accra, Ghana" className={baseInput(errors.location)} {...register('location')} />
          <ErrMsg msg={errors.location?.message} />
        </div>
      </div>

      {/* ── Budget ──────────────────────────────── */}
      <div className="mb-4">
        <Label>Budget</Label>
        <div className={`flex items-stretch rounded-xl border overflow-hidden transition-all ${
          errors.budget ? 'border-red-400' : 'border-[#DDE0D8] focus-within:border-[#0A2318] focus-within:ring-2 focus-within:ring-[#0A2318]/8'
        }`}>
          <span className="flex items-center px-3.5 text-[12px] font-bold text-[#6A7A70] bg-[#F6F7F3] border-r border-[#DDE0D8] flex-shrink-0">
            GHS
          </span>
          <input type="number" placeholder="Enter your budget"
            className="flex-1 min-w-0 h-11 px-3.5 text-[13px] font-medium text-[#0A1A12] bg-white outline-none placeholder:text-[#9AA49E]"
            {...register('budget')} />
        </div>
        <ErrMsg msg={errors.budget?.message} />
      </div>

      {/* ── Experience level ─────────────────────── */}
      <div className="mb-4">
        <Label>What is the experience level you want?</Label>
        <div className="flex gap-3">
          {['beginner', 'intermediate', 'expert'].map((level) => {
            const active = selectedLevel === level
            return (
              <label key={level} className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer
                transition-all text-[12px] font-semibold capitalize ${
                active
                  ? 'border-[#0A2318] bg-[#0A2318]/4 text-[#0A2318]'
                  : 'border-[#DDE0D8] bg-white text-[#6A7A70] hover:border-[#0A2318]/40'
              }`}>
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  active ? 'border-[#0A2318]' : 'border-[#C8D0CA]'
                }`}>
                  {active && <span className="w-2 h-2 rounded-full bg-[#0A2318]" />}
                </span>
                <input type="radio" value={level} className="sr-only" {...register('experienceLevel')} />
                {level}
              </label>
            )
          })}
        </div>
        <ErrMsg msg={errors.experienceLevel?.message} />
      </div>

      {/* ── Skills ──────────────────────────────── */}
      <div className="mb-4">
        <Label>Add skills required to get the job done</Label>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, idx) => {
            const existing = skills[idx]
            return existing ? (
              <div key={idx} className="flex items-center gap-1.5 h-11 px-3.5 bg-white border border-[#DDE0D8]
                rounded-xl text-[12px] font-medium text-[#0A1A12] whitespace-nowrap">
                {existing}
                <button type="button" onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                  className="text-[#9AA49E] hover:text-red-400 transition-colors ml-0.5">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <input key={idx} type="text"
                placeholder="Enter skill"
                disabled={idx > skills.length}
                value={idx === skills.length ? skillInput : ''}
                onChange={e => { if (idx === skills.length) setSkillInput(e.target.value) }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                onBlur={addSkill}
                className={`h-11 w-28 px-3 text-[12px] font-medium text-[#0A1A12] bg-white border border-[#DDE0D8]
                  rounded-xl outline-none transition-all placeholder:text-[#C8D0CA]
                  focus:border-[#0A2318] focus:ring-2 focus:ring-[#0A2318]/8
                  disabled:opacity-40 disabled:cursor-not-allowed`}
              />
            )
          })}
        </div>
        {skills.length === 0 && (
          <p className="text-[11px] text-red-500 mt-1.5">At least one skill is required</p>
        )}
      </div>

      {/* ── Description ─────────────────────────── */}
      <div className="mb-4">
        <Label>Hustle description:</Label>
        <RichTextEditor
          value={description}
          onChange={v => setValue('description', v)}
          placeholder="Describe what you want the hustler to do for you"
        />
        <ErrMsg msg={errors.description?.message} />
      </div>

      {/* ── File upload ─────────────────────────── */}
      <div className="mb-6">
        <Label>Upload a picture or document (Optional)</Label>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('hf-input').click()}
          className={`flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed
            cursor-pointer transition-all ${
            isDragging ? 'border-[#0A2318] bg-[#0A2318]/3' : 'border-[#DDE0D8] hover:border-[#0A2318]/40 bg-[#FAFAF8]'
          }`}
        >
          <input id="hf-input" type="file" multiple accept="image/*,.pdf,.doc,.docx"
            className="hidden" onChange={e => addFiles(e.target.files)} />
          <div className="w-10 h-10 rounded-full bg-white border border-[#DDE0D8] flex items-center justify-center shadow-sm">
            <Upload size={17} className="text-[#0A2318]" />
          </div>
          <p className="text-[13px] font-bold text-[#0A2318]">Drag to drop or Click to upload</p>
          <p className="text-[11px] text-[#9AA49E]">SVG, PNG, JPG or GIF (max. 800×400px)</p>
        </div>

        {/* File list */}
        {files.filter(f => !f.type.startsWith('image/')).length > 0 && (
          <div className="mt-3 space-y-2">
            {files.filter(f => !f.type.startsWith('image/')).map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-[#DDE0D8] rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={15} className="text-[#0A2318]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#0A1A12] truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-[#E8EAE4] rounded-full overflow-hidden">
                      <div className="h-full w-full bg-[#0A2318] rounded-full" />
                    </div>
                    <span className="text-[10px] font-bold text-[#6A7A70] flex-shrink-0">100%</span>
                  </div>
                  <p className="text-[10px] text-[#9AA49E]">{formatFileSize(file.size)}</p>
                </div>
                <button type="button" onClick={() => setFiles(files.filter(f2 => f2 !== file))}
                  className="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Image thumbnails */}
        {files.filter(f => f.type.startsWith('image/')).length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {files.filter(f => f.type.startsWith('image/')).map((file, idx) => {
              const url = URL.createObjectURL(file)
              return (
                <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden
                  border border-[#DDE0D8] flex-shrink-0">
                  <img src={url} alt="" className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(url)} />
                  <button type="button"
                    onClick={() => setFiles(files.filter(f2 => f2 !== file))}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/55 flex items-center justify-center text-white">
                    <X size={9} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Sticky CTA ──────────────────────────── */}
      <div className="sticky bottom-0 bg-white border-t border-[#EAECE6] -mx-5 sm:-mx-7 px-5 sm:px-7 py-4">
        <button
          type="submit"
          disabled={!isFormValid || isPending}
          className={`w-full h-12 rounded-2xl text-[14px] font-bold transition-all ${
            isFormValid && !isPending
              ? 'bg-[#0A2318] hover:bg-[#112D20] active:scale-[0.99] text-white cursor-pointer shadow-sm'
              : 'bg-[#C8D0CA] text-white cursor-not-allowed'
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 00-12 12h4z"/>
              </svg>
              Creating hustle...
            </span>
          ) : 'Create hustle'}
        </button>
      </div>

    </form>
  )
}
