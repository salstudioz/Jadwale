'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Step1Config from './components/Step1Config';
import Step2Waktu from './components/Step2Waktu';
import Step3Master from './components/Step3Master';
import Step4Relasi from './components/Step4Relasi';
import Step5Generate from './components/Step5Generate';
import { useLanguageStore, TRANSLATIONS } from '../../store/useLanguageStore';
import LanguageToggle from '../../components/LanguageToggle';

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const steps = [
    { id: 1, title: t.step1Short, short: t.step1Short },
    { id: 2, title: t.step2Short, short: t.step2Short },
    { id: 3, title: t.step3Short, short: t.step3Short },
    { id: 4, title: t.step4Short, short: t.step4Short },
    { id: 5, title: t.step5Short, short: t.step5Short },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>

      {/* Top Nav — solid, mobile-friendly */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">{t.dashboard}</span>
        </Link>
        
        <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--foreground)' }}>
          {t.wizardTitle}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LanguageToggle compact />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--accent)', padding: '0.25rem 0.625rem', borderRadius: 6 }}>
            {currentStep}/{steps.length}
          </span>
        </div>
      </nav>

      {/* Stepper — scrollable on mobile */}
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '0.875rem 1rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content', margin: '0 auto', maxWidth: 600 }}>
          {steps.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isPast = step.id < currentStep;
            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: isPast ? 'pointer' : 'default' }}
                  onClick={() => isPast && setCurrentStep(step.id)}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', border: '2px solid',
                    borderColor: isActive || isPast ? 'var(--primary)' : 'var(--border)',
                    background: isPast ? 'var(--primary)' : isActive ? 'var(--primary)' : 'var(--card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive || isPast ? 'white' : 'var(--muted-foreground)',
                    fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0,
                  }}>
                    {isPast ? <CheckCircle2 size={15} /> : step.id}
                  </div>
                  <span style={{
                    fontSize: '0.625rem', fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                    whiteSpace: 'nowrap',
                  }}>
                    {step.short}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: isPast ? 'var(--primary)' : 'var(--border)', margin: '0 4px', marginBottom: 16 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '1rem',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
        }}>
          <div className="max-w-2xl mx-auto">
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
              {currentStep === 1 && <Step1Config />}
              {currentStep === 2 && <Step2Waktu />}
              {currentStep === 3 && <Step3Master />}
              {currentStep === 4 && <Step4Relasi />}
              {currentStep === 5 && <Step5Generate />}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation — fixed bottom on mobile */}
      <div style={{
        position: 'sticky', bottom: 0,
        background: 'var(--card)', borderTop: '1px solid var(--border)',
        padding: '0.875rem 1rem',
        paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom, 0px))',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
        zIndex: 10,
      }}>
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="btn btn-secondary"
          style={{ flex: 1, maxWidth: 140 }}
        >
          <ArrowLeft size={16} /> {t.backBtn}
        </button>

        {/* Step indicator dots */}
        <div style={{ display: 'flex', gap: 5 }}>
          {steps.map((s) => (
            <div key={s.id} style={{
              width: s.id === currentStep ? 18 : 6, height: 6, borderRadius: 3,
              background: s.id <= currentStep ? 'var(--primary)' : 'var(--border)',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>

        {currentStep < steps.length ? (
          <button onClick={nextStep} className="btn btn-primary" style={{ flex: 1, maxWidth: 140 }}>
            {t.nextBtn} <ArrowRight size={16} />
          </button>
        ) : (
          <button disabled className="btn btn-secondary" style={{ flex: 1, maxWidth: 140, opacity: 0.5 }}>
            <CheckCircle2 size={16} /> {t.finishBtn}
          </button>
        )}
      </div>
    </div>
  );
}
