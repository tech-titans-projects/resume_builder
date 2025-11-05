import React, { useState, useRef } from 'react';
import type { ResumeData, AIFeedback } from '../types';
import { generateSummary, analyzeResume, checkATSCompatibility } from '../services/geminiService';
import { PlusIcon, TrashIcon, SparklesIcon, DocumentMagnifyingGlassIcon, ShieldCheckIcon, WandSparklesIcon } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow">
    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = (props: React.ComponentProps<'input'>) => (
  <input {...props} className={`form-input ${props.className || ''}`} />
);

const Textarea = (props: React.ComponentProps<'textarea'>) => (
  <textarea {...props} className={`form-textarea ${props.className || ''}`} />
);

export const ResumeForm: React.FC<ResumeFormProps> = ({
  resumeData,
  setResumeData,
  setIsLoading,
  setError,
  isLoading,
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{ score: number; analysis: string; suggestions: string[] } | null>(null);
  const [atsReport, setAtsReport] = useState<{ score: number; analysis: string; suggestions: string[] } | null>(null);
  
  const [feedback, setFeedback] = useLocalStorage<AIFeedback[]>('aiFeedback', []);
  const aiFeedbackCache = useRef<Record<string, string>>({});


  const handleChange = (section: keyof ResumeData, field: string, value: any, index?: number) => {
    setResumeData(prevData => {
      if (index !== undefined && Array.isArray(prevData[section])) {
        const newArr = [...(prevData[section] as any[])];
        newArr[index] = { ...newArr[index], [field]: value };
        return { ...prevData, [section]: newArr };
      }
      return {
        ...prevData,
        [section]: {
          ...(prevData[section] as object),
          [field]: value,
        },
      };
    });
  };
  
  const handleBlur = (fieldIdentifier: string, currentValue: string) => {
    const originalText = aiFeedbackCache.current[fieldIdentifier];
    if (originalText && originalText.trim() !== currentValue.trim()) {
      setFeedback(prev => [...prev, { original: originalText, edited: currentValue }]);
      delete aiFeedbackCache.current[fieldIdentifier];
    }
  };

  const addItem = (section: 'experience' | 'education' | 'skills') => {
    setResumeData(prevData => {
      let newItem;
      if (section === 'experience') {
        newItem = { id: `exp${Date.now()}`, jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' };
      } else if (section === 'education') {
        newItem = { id: `edu${Date.now()}`, institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' };
      } else { // skills
        newItem = { id: `skill${Date.now()}`, name: '' };
      }
      return {
        ...prevData,
        [section]: [...(prevData[section] as any[]), newItem],
      };
    });
  };

  const removeItem = (section: 'experience' | 'education' | 'skills', index: number) => {
    setResumeData(prevData => {
      const newArr = [...(prevData[section] as any[])];
      newArr.splice(index, 1);
      return { ...prevData, [section]: newArr };
    });
  };
  
  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const summary = await generateSummary(resumeData, feedback);
        handleChange('personalInfo', 'summary', summary);
        aiFeedbackCache.current['personalInfo.summary'] = summary;
    } catch (e: any) {
        setError(e.message || 'Failed to generate summary.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!jobDescription.trim()) {
        setError('Please paste a job description to analyze.');
        return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
        const result = await analyzeResume(resumeData, jobDescription);
        setAnalysisResult(result);
    } catch (e: any) {
        setError(e.message || 'Failed to analyze resume.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleCheckATS = async () => {
    setIsLoading(true);
    setError(null);
    setAtsReport(null);
    try {
        const result = await checkATSCompatibility(resumeData);
        setAtsReport(result);
    } catch (e: any) {
        setError(e.message || 'Failed to check ATS compatibility.');
    } finally {
        setIsLoading(false);
    }
  };

  const clearAIPersonalization = () => {
    setFeedback([]);
    aiFeedbackCache.current = {};
  }

  return (
    <div className="space-y-8">
      <FormSection title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="form-label">Full Name</label>
            <Input id="name" type="text" value={resumeData.personalInfo.name} onChange={e => handleChange('personalInfo', 'name', e.target.value)} />
          </div>
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <Input id="email" type="email" value={resumeData.personalInfo.email} onChange={e => handleChange('personalInfo', 'email', e.target.value)} />
          </div>
          <div>
            <label htmlFor="phone" className="form-label">Phone</label>
            <Input id="phone" type="tel" value={resumeData.personalInfo.phone} onChange={e => handleChange('personalInfo', 'phone', e.target.value)} />
          </div>
          <div>
            <label htmlFor="website" className="form-label">Website/Portfolio</label>
            <Input id="website" type="url" value={resumeData.personalInfo.website} onChange={e => handleChange('personalInfo', 'website', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="location" className="form-label">Location</label>
            <Input id="location" type="text" value={resumeData.personalInfo.location} onChange={e => handleChange('personalInfo', 'location', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="summary" className="form-label">Professional Summary</label>
            <Textarea 
              id="summary" 
              rows={4} 
              value={resumeData.personalInfo.summary} 
              onChange={e => handleChange('personalInfo', 'summary', e.target.value)} 
              onBlur={e => handleBlur('personalInfo.summary', e.target.value)}
            />
            <button onClick={handleGenerateSummary} disabled={isLoading} className="ai-button mt-2">
              <SparklesIcon /> {isLoading ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Work Experience">
        {resumeData.experience.map((exp, index) => (
          <div key={exp.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Job Title</label>
                <Input type="text" value={exp.jobTitle} onChange={e => handleChange('experience', 'jobTitle', e.target.value, index)} />
              </div>
              <div>
                <label className="form-label">Company</label>
                <Input type="text" value={exp.company} onChange={e => handleChange('experience', 'company', e.target.value, index)} />
              </div>
              <div>
                <label className="form-label">Location</label>
                <Input type="text" value={exp.location} onChange={e => handleChange('experience', 'location', e.target.value, index)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="form-label">Start Date</label>
                    <Input type="month" value={exp.startDate} onChange={e => handleChange('experience', 'startDate', e.target.value, index)} />
                </div>
                <div>
                    <label className="form-label">End Date</label>
                    <Input 
                        type="month" 
                        value={exp.endDate === 'Present' ? '' : exp.endDate} 
                        onChange={e => handleChange('experience', 'endDate', e.target.value, index)}
                        disabled={exp.endDate === 'Present'}
                    />
                    <div className="mt-2 flex items-center">
                        <input 
                            type="checkbox" 
                            id={`present-${exp.id}`}
                            checked={exp.endDate === 'Present'}
                            onChange={e => {
                                const newValue = e.target.checked ? 'Present' : '';
                                handleChange('experience', 'endDate', newValue, index);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`present-${exp.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            I currently work here
                        </label>
                    </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Description / Achievements</label>
                <Textarea 
                    rows={5} 
                    value={exp.description} 
                    onChange={e => handleChange('experience', 'description', e.target.value, index)} 
                    onBlur={e => handleBlur(`experience.${index}.description`, e.target.value)}
                    placeholder="Describe your responsibilities and achievements."
                />
              </div>
            </div>
            <button onClick={() => removeItem('experience', index)} className="remove-button">
              <TrashIcon /> Remove Experience
            </button>
          </div>
        ))}
        <button onClick={() => addItem('experience')} className="add-button">
          <PlusIcon /> Add Experience
        </button>
      </FormSection>

      <FormSection title="Education">
        {resumeData.education.map((edu, index) => (
            <div key={edu.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">Institution</label>
                        <Input type="text" value={edu.institution} onChange={e => handleChange('education', 'institution', e.target.value, index)} />
                    </div>
                    <div>
                        <label className="form-label">Degree</label>
                        <Input type="text" value={edu.degree} onChange={e => handleChange('education', 'degree', e.target.value, index)} />
                    </div>
                     <div>
                        <label className="form-label">Field of Study</label>
                        <Input type="text" value={edu.fieldOfStudy} onChange={e => handleChange('education', 'fieldOfStudy', e.target.value, index)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="form-label">Start Date</label>
                            <Input type="month" value={edu.startDate} onChange={e => handleChange('education', 'startDate', e.target.value, index)} />
                        </div>
                        <div>
                            <label className="form-label">End Date</label>
                            <Input type="month" value={edu.endDate} onChange={e => handleChange('education', 'endDate', e.target.value, index)} />
                        </div>
                    </div>
                </div>
                 <button onClick={() => removeItem('education', index)} className="remove-button">
                    <TrashIcon /> Remove Education
                </button>
            </div>
        ))}
        <button onClick={() => addItem('education')} className="add-button">
            <PlusIcon /> Add Education
        </button>
      </FormSection>

      <FormSection title="Skills">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {resumeData.skills.map((skill, index) => (
                <div key={skill.id} className="flex items-center gap-2">
                    <Input type="text" value={skill.name} onChange={e => handleChange('skills', 'name', e.target.value, index)} />
                    <button onClick={() => removeItem('skills', index)} className="remove-button-icon">
                        <TrashIcon />
                    </button>
                </div>
            ))}
        </div>
        <button onClick={() => addItem('skills')} className="add-button mt-4">
            <PlusIcon /> Add Skill
        </button>
      </FormSection>

      <FormSection title="Resume Analyzer">
        <div>
            <label htmlFor="job-description" className="form-label">Paste Job Description Here</label>
            <Textarea id="job-description" rows={6} value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="e.g., Senior Frontend Engineer at Google..." />
             <button onClick={handleAnalyzeResume} disabled={isLoading} className="ai-button mt-2">
                <DocumentMagnifyingGlassIcon /> {isLoading ? 'Analyzing...' : 'Analyze Against Job Description'}
            </button>
        </div>
        {analysisResult && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <h3 className="font-bold text-lg">Analysis Result</h3>
                <p className="font-bold mt-2">Match Score: <span className="text-indigo-500">{analysisResult.score}/100</span></p>
                <p className="mt-2"><strong className="block">Analysis:</strong> {analysisResult.analysis}</p>
                <div className="mt-2">
                    <strong className="block">Suggestions:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                        {analysisResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            </div>
        )}
      </FormSection>

      <FormSection title="ATS Compatibility Check">
        <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Get an instant analysis of your resume's compatibility with Applicant Tracking Systems (ATS). This tool checks for common issues like formatting, keywords, and clarity to help you get past the initial screening.
            </p>
             <button onClick={handleCheckATS} disabled={isLoading} className="ai-button">
                <ShieldCheckIcon /> {isLoading ? 'Checking...' : 'Check ATS Compatibility'}
            </button>
        </div>
        {atsReport && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <h3 className="font-bold text-lg">ATS Report</h3>
                <p className="font-bold mt-2">Compatibility Score: <span className="text-indigo-500">{atsReport.score}/100</span></p>
                <p className="mt-2"><strong className="block">Analysis:</strong> {atsReport.analysis}</p>
                <div className="mt-2">
                    <strong className="block">Suggestions:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                        {atsReport.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            </div>
        )}
      </FormSection>

      <div className="p-6 bg-indigo-50 dark:bg-slate-800/50 rounded-lg shadow flex items-start gap-4">
        <div className="flex-shrink-0 text-indigo-500">
           <WandSparklesIcon />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">AI Personalization</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Your edits to AI-generated content help the system learn your unique style. This makes future suggestions more accurate and personalized to you. This data is stored only in your browser.
          </p>
          <button onClick={clearAIPersonalization} className="remove-button text-sm">
            <TrashIcon /> Clear AI Personalization Data
          </button>
        </div>
      </div>
      
      <style>{`
        .form-label {
            display: block;
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            color: #475569; /* slate-600 */
        }
        .dark .form-label {
            color: #cbd5e1; /* slate-300 */
        }
        .form-input, .form-textarea {
            width: 100%;
            border-radius: 0.375rem;
            border: 1px solid #cbd5e1; /* slate-300 */
            background-color: white;
            padding: 0.5rem 0.75rem;
            font-size: 1rem;
            color: #1e293b; /* slate-800 */
        }
        .dark .form-input, .dark .form-textarea {
            background-color: #334155; /* slate-700 */
            border-color: #475569; /* slate-600 */
            color: #f1f5f9; /* slate-100 */
        }
        .form-input:focus, .form-textarea:focus {
            outline: 2px solid transparent;
            outline-offset: 2px;
            border-color: #6366f1; /* indigo-500 */
            box-shadow: 0 0 0 2px #6366f1; /* indigo-500 */
        }
        .ai-button, .add-button, .remove-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 600;
          transition: background-color 0.2s;
          border: 1px solid transparent;
        }
        .ai-button {
            background-color: #6366f1; /* indigo-500 */
            color: white;
        }
        .ai-button:hover:not(:disabled) {
            background-color: #4f46e5; /* indigo-600 */
        }
        .add-button {
            background-color: #10b981; /* emerald-500 */
            color: white;
        }
        .add-button:hover:not(:disabled) {
            background-color: #059669; /* emerald-600 */
        }
        .remove-button {
            background-color: transparent;
            color: #ef4444; /* red-500 */
            border-color: #ef4444; /* red-500 */
        }
        .remove-button:hover:not(:disabled) {
            background-color: #fef2f2; /* red-50 */
        }
        .dark .remove-button:hover:not(:disabled) {
            background-color: rgba(239, 68, 68, 0.1);
        }
        .remove-button-icon {
            padding: 0.5rem;
            border-radius: 9999px;
            color: #64748b; /* slate-500 */
        }
        .remove-button-icon:hover {
            background-color: #f1f5f9; /* slate-100 */
            color: #ef4444; /* red-500 */
        }
        .dark .remove-button-icon:hover {
            background-color: #334155; /* slate-700 */
        }
        .ai-button:disabled, .add-button:disabled, .remove-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};