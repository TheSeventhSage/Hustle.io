import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';

const STEPS = [
  { id: 1, title: 'Hustle Category', desc: 'Select a category' },
  { id: 2, title: 'Hustle Details', desc: 'Title and description' },
  { id: 3, title: 'Budget & Location', desc: 'Set your terms' },
  { id: 4, title: 'Review', desc: 'Confirm details' }
];

const CATEGORIES = [
  { id: 'design', label: 'Design & Creative', icon: '🎨' },
  { id: 'dev', label: 'Development & IT', icon: '💻' },
  { id: 'marketing', label: 'Marketing', icon: '📈' },
  { id: 'writing', label: 'Writing', icon: '✍️' },
];

export default function CreateHustleWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    budget: '',
    location: '',
  });

  const next = () => setStep(s => Math.min(s + 1, 4));
  const back = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-[800px] mx-auto bg-white rounded-[24px] shadow-sm border border-border overflow-hidden">

        {/* ── Progress Header ───────────────────────────── */}
        <div className="px-8 py-6 border-b border-mist bg-mist">
          <div className="flex justify-between items-center">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center flex-1 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all ${step >= s.id ? 'bg-primary-btn text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                  {s.id}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-text-1' : 'text-text-4'
                  }`}>
                  {s.title}
                </span>
                {/* Connector Line */}
                {s.id !== 4 && <div className="absolute top-4 left-[60%] w-[80%] h-[2px] bg-gray-100 -z-10" />}
              </div>
            ))}
          </div>
        </div>

        {/* ── Form Content ─────────────────────────────── */}
        <div className="p-10 min-h-[450px]">

          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-text-1 mb-2">What kind of hustle?</h2>
              <p className="text-text-3 mb-8">Choose the category that best fits your project.</p>
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.category === cat.id
                      ? 'border-primary-btn bg-primary-btn/5'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <span className="text-2xl mb-3 block">{cat.icon}</span>
                    <span className="font-bold text-text-1">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-bold text-text-1">Describe your hustle</h2>
              <Input
                label="Hustle Title"
                placeholder="e.g. Need a professional Logo Designer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-2">Description</label>
                <textarea
                  className="w-full p-4 rounded-xl border border-border focus:border-primary-btn outline-none min-h-[150px] transition-all"
                  placeholder="Explain the requirements and expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 3: Budget & Terms */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-bold text-text-1">Budget & Terms</h2>
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Budget (₦)"
                  type="number"
                  placeholder="50,000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
                <Input
                  label="Location"
                  placeholder="Remote or City Name"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="animate-in fade-in">
              <h2 className="text-2xl font-bold text-text-1 mb-6">Review & Post</h2>
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-text-3">Category</span>
                  <span className="font-bold uppercase text-xs">{formData.category}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-text-3">Title</span>
                  <span className="font-bold">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Budget</span>
                  <span className="font-bold text-primary-btn">₦{Number(formData.budget).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Action Footer ────────────────────────────── */}
        <div className="px-10 py-6 bg-mist border-t border-mist flex justify-between items-center">
          <Button
            variant="text"
            onClick={back}
            disabled={step === 1}
            style={{ width: 'auto' }}
          >
            Back
          </Button>

          <div className="w-[180px]">
            {step < 4 ? (
              <Button
                variant="solid"
                onClick={next}
                disabled={step === 1 && !formData.category}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => console.log("Submit", formData)}
              >
                Post Hustle
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}