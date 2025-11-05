import React from 'react';
import type { ResumeData } from '../../types';

interface TemplateProps {
  data: ResumeData;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};


export const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;
  const initials = getInitials(personalInfo.name);

  const renderDescription = (desc: string) => {
    return desc.split('\n').map((line, index) => (
      <li key={index} className="mb-1">{line.replace(/^-/, '').trim()}</li>
    ));
  }
  
  return (
    <div className="flex w-full min-h-full text-sm resume-content">
      <div className="w-1/3 bg-slate-200 p-6">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-slate-300 mx-auto mb-4 border-4 border-slate-400 flex items-center justify-center">
             <span className="text-4xl font-bold text-slate-600">{initials}</span>
          </div>
          <h1 className="text-2xl font-bold">{personalInfo.name}</h1>
        </div>
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2">Contact</h2>
          <div className="text-xs space-y-1">
            <p>{personalInfo.phone}</p>
            <p>{personalInfo.email}</p>
            <p>{personalInfo.website}</p>
            <p>{personalInfo.location}</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2">Skills</h2>
          <ul className="text-xs list-disc list-inside space-y-1">
            {skills.map(skill => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </div>
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2">Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="mb-3 text-xs">
              <h3 className="font-semibold">{edu.degree}</h3>
              <p>{edu.institution}</p>
              <p>{edu.startDate} - {edu.endDate}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-2/3 bg-slate-50 p-8">
        <section>
          <h2 className="text-xl font-bold border-b-2 border-slate-300 pb-1 mb-4">Profile</h2>
          <p>{personalInfo.summary}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold border-b-2 border-slate-300 pb-1 mb-4">Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-6 relative pl-5">
               <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-slate-800"></div>
               <div className="absolute left-1 top-1.5 w-px h-full bg-slate-300"></div>
              <p className="text-xs font-semibold">{exp.startDate} - {exp.endDate}</p>
              <h3 className="text-md font-semibold">{exp.jobTitle}</h3>
              <p className="text-sm">{exp.company} | {exp.location}</p>
              <ul className="mt-2 list-disc list-inside space-y-1">{renderDescription(exp.description)}</ul>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};