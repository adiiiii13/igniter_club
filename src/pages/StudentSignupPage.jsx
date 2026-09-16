import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import AuthStepIndicator from '../components/auth/AuthStepIndicator';
import { animateAuthEntry, animateAuthStep, navigateWithAnimeExit } from '../utils/authAnimations';

const STEPS = ['Basic Info', 'Account Setup', 'Profile', 'Confirmation'];

const INITIAL_STATE = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  course: '',
  year: '',
  interests: '',
};

export default function StudentSignupPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const pageRef = useRef(null);
  const stepRef = useRef(null);
  const navigate = useNavigate();
  const backHover = useAnimation();
  const nextHover = useAnimation();
  const submitHover = useAnimation();

  useEffect(() => {
    animateAuthEntry(pageRef.current);
  }, []);

  useEffect(() => {
    animateAuthStep(stepRef.current);
  }, [step]);

  const isStepValid = useMemo(() => {
    if (step === 0) return Boolean(formData.firstName && formData.lastName && formData.email);
    if (step === 1) return Boolean(formData.password && formData.confirmPassword);
    return true;
  }, [formData, step]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const goNext = () => setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const goBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    console.log('Signup payload:', formData);
  };

  const gotoLogin = (event) => {
    event.preventDefault();
    navigateWithAnimeExit(navigate, '/auth/student/login');
  };

  return (
    <main ref={pageRef} className="auth-page auth-page-student" data-route-item>
      <div className="auth-bg-glow" aria-hidden="true" />
      <section className="auth-card" data-auth-enter>
        <Link to="/home" className="brand-lockup brand-lockup-auth mb-3 group" data-auth-enter aria-label="Go to home">
          <div className="brand-logo-shell brand-logo-auth">
            <img
              src="/GMITxIgnite-removebg-preview.png"
              alt="Igniter Club x GMIT Logo"
              className="brand-logo-img"
            />
          </div>

          <span className="brand-lockup-divider" aria-hidden="true" />

          <div className="brand-partner-shell">
            <img
              src="/gmit-jis-15years-dark.png"
              alt="GMIT 15 Years of Tomorrow | JIS Group"
              className="brand-partner-img"
            />
          </div>
        </Link>
        <h1 className="auth-title" data-auth-enter>Create your member account</h1>
        <p className="auth-subtitle" data-auth-enter>Progressive signup flow, one section at a time.</p>

        <form className="mt-6" onSubmit={handleSubmit}>
          <AuthStepIndicator steps={STEPS} activeIndex={step} />

          {!submitted ? (
            <div ref={stepRef} className="space-y-4">
              {step === 0 && (
                <div data-step-enter>
                  <label className="auth-label" htmlFor="firstName">First Name</label>
                  <input id="firstName" name="firstName" required className="auth-input" value={formData.firstName} onChange={handleChange} />

                  <label className="auth-label mt-4" htmlFor="lastName">Last Name</label>
                  <input id="lastName" name="lastName" required className="auth-input" value={formData.lastName} onChange={handleChange} />

                  <label className="auth-label mt-4" htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" required className="auth-input" value={formData.email} onChange={handleChange} />
                </div>
              )}

              {step === 1 && (
                <div data-step-enter>
                  <label className="auth-label" htmlFor="password">Password</label>
                  <input id="password" name="password" type="password" required className="auth-input" value={formData.password} onChange={handleChange} />

                  <label className="auth-label mt-4" htmlFor="confirmPassword">Confirm Password</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" required className="auth-input" value={formData.confirmPassword} onChange={handleChange} />
                </div>
              )}

              {step === 2 && (
                <div data-step-enter>
                  <label className="auth-label" htmlFor="course">Course (placeholder)</label>
                  <input id="course" name="course" className="auth-input" value={formData.course} onChange={handleChange} placeholder="B.Tech CSE" />

                  <label className="auth-label mt-4" htmlFor="year">Year (placeholder)</label>
                  <input id="year" name="year" className="auth-input" value={formData.year} onChange={handleChange} placeholder="2nd Year" />

                  <label className="auth-label mt-4" htmlFor="interests">Interests (placeholder)</label>
                  <textarea id="interests" name="interests" className="auth-input min-h-24" value={formData.interests} onChange={handleChange} placeholder="Web dev, AI, design systems..." />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3 text-sm text-dark-200" data-step-enter>
                  <p className="rounded-xl border border-white/10 bg-dark-900/70 px-4 py-3">
                    <strong className="text-white">Name:</strong> {`${formData.firstName} ${formData.lastName}`.trim() || '-'}
                  </p>
                  <p className="rounded-xl border border-white/10 bg-dark-900/70 px-4 py-3">
                    <strong className="text-white">Email:</strong> {formData.email || '-'}
                  </p>
                  <p className="rounded-xl border border-white/10 bg-dark-900/70 px-4 py-3">
                    <strong className="text-white">Profile placeholders:</strong> {formData.course || '-'}, {formData.year || '-'}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2" data-step-enter>
                <motion.button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  onHoverStart={() => backHover.start({ y: -1 })}
                  onHoverEnd={() => backHover.start({ y: 0 })}
                  animate={backHover}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm text-dark-200 transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="inline-flex items-center gap-2">
                    <FiArrowLeft aria-hidden="true" />
                    Back
                  </span>
                </motion.button>

                {step < STEPS.length - 1 ? (
                  <motion.button
                    type="button"
                    onClick={goNext}
                    disabled={!isStepValid}
                    onHoverStart={() => nextHover.start({ y: -2, scale: 1.01 })}
                    onHoverEnd={() => nextHover.start({ y: 0, scale: 1 })}
                    animate={nextHover}
                    transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                    className="btn-ignite px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      Continue
                      <FiArrowRight aria-hidden="true" />
                    </span>
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    className="btn-ignite px-6 py-2.5 text-sm"
                    onHoverStart={() => submitHover.start({ y: -2, scale: 1.01 })}
                    onHoverEnd={() => submitHover.start({ y: 0, scale: 1 })}
                    animate={submitHover}
                    transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                  >
                    <span className="inline-flex items-center gap-2">
                      Submit
                      <FiCheckCircle aria-hidden="true" />
                    </span>
                  </motion.button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
              Signup submitted. We logged your payload in the console for now while backend integration is pending.
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-dark-400" data-auth-enter>
          Already a member?{' '}
          <Link to="/auth/student/login" onClick={gotoLogin} className="auth-inline-link">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
