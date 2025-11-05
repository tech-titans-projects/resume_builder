import React from 'react';
import type { ResumeData } from '../../types';

interface TemplateProps {
  data: ResumeData;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  const renderDescription = (desc: string) => {
    return desc.split('\n').map((line, index) => (
      <p key={index} className="mb-1">{line}</p>
    ));
  }

  return (
    <div className="p-8 bg-white w-full min-h-full text-sm resume-content">
      <div className="text-center border-b-2 border-gray-400 pb-4">
        <h1 className="text-4xl font-bold tracking-wider">{personalInfo.name}</h1>
        <p className="mt-2">
          {personalInfo.location} | {personalInfo.phone} | {personalInfo.email} | {personalInfo.website}
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold tracking-widest border-b border-gray-300 pb-1 mb-2">SUMMARY</h2>
        <p>{personalInfo.summary}</p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold tracking-widest border-b border-gray-300 pb-1 mb-2">EXPERIENCE</h2>
        {experience.map(exp => (
          <div key={exp.id} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-md font-bold">{exp.jobTitle}</h3>
              <p className="text-xs font-medium">{exp.startDate} - {exp.endDate}</p>
            </div>
            <p className="italic">{exp.company}, {exp.location}</p>
            <div className="mt-1 pl-4">{renderDescription(exp.description)}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-bold tracking-widest border-b border-gray-300 pb-1 mb-2">EDUCATION</h2>
        {education.map(edu => (
          <div key={edu.id} className="mb-3">
            <div className="flex justify-between items-baseline">
              <h3 className="text-md font-bold">{edu.institution}</h3>
               <p className="text-xs font-medium">{edu.startDate} - {edu.endDate}</p>
            </div>
            <p>{edu.degree} in {edu.fieldOfStudy}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold tracking-widest border-b border-gray-300 pb-1 mb-2">SKILLS</h2>
        <p>
          {skills.map(skill => skill.name).join(' | ')}
        </p>
      </div>
    </div>
  );
};