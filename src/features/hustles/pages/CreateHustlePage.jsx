import { useNavigate } from 'react-router-dom'
import { CreateHustleForm } from '../components/CreateHustleForm.jsx'

export default function CreateHustleWizard() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-[680px] mx-auto bg-white rounded-[24px] shadow-sm border border-border overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <h2 className="text-[18px] font-bold text-text-1 font-display">Create a hustle</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-[13px] text-text-3 hover:text-text-1 transition-colors"
          >
            Cancel
          </button>
        </div>
        <CreateHustleForm onClose={() => navigate('/my-hustles')} />
      </div>
    </div>
  )
}
