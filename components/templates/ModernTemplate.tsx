import React from 'react';
import type { ResumeData } from '../../types';

interface TemplateProps {
  data: ResumeData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;
  
  const renderDescription = (desc: string) => {
    return desc.split('\n').map((line, index) => (
      <li key={index} className="mb-1">{line.replace(/^-/, '').trim()}</li>
    ));
  }

  return (
    <div className="p-8 bg-white w-full min-h-full text-sm resume-content">
      <header className="flex items-center justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-4xl font-bold text-black">{personalInfo.name}</h1>
          <p className="text-lg mt-1">Professional Summary</p>
        </div>
        <div className="text-right text-xs">
          <p>{personalInfo.location}</p>
          <p>{personalInfo.phone}</p>
          <p>{personalInfo.email}</p>
          <p>{personalInfo.website}</p>
        </div>
      </header>

      <div className="mt-6">
        <p>{personalInfo.summary}</p>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-8">
        <div className="col-span-2">
          <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4">Work Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-6">
              <div className="flex justify-between items-baseline">
                <h3 className="text-md font-semibold">{exp.jobTitle}</h3>
                <p className="text-xs font-medium">{exp.startDate} - {exp.endDate}</p>
              </div>
              <p className="text-sm">{exp.company} | {exp.location}</p>
              <ul className="mt-2 list-disc list-inside space-y-1">{renderDescription(exp.description)}</ul>
            </div>
          ))}
        </div>
        
        <div className="col-span-1">
           <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4">Skills</h2>
           <div className="flex flex-wrap gap-2">
             {skills.map(skill => (
               <span key={skill.id} className="bg-gray-200 text-black text-xs font-medium px-2.5 py-0.5 rounded-full">{skill.name}</span>
             ))}
           </div>

           <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4 mt-8">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-4">
                <h3 className="text-md font-semibold">{edu.institution}</h3>
                <p className="text-sm">{edu.degree}</p>
                <p className="text-xs">{edu.fieldOfStudy}</p>
                <p className="text-xs">{edu.startDate} - {edu.endDate}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};