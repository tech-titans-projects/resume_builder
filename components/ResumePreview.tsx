
import React from 'react';
import type { ResumeData, TemplateId } from '../types';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';

interface ResumePreviewProps {
  data: ResumeData;
  template: TemplateId;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template }) => {
  const renderTemplate = () => {
    switch (template) {
      case 'classic':
        return <ClassicTemplate data={data} />;
      case 'modern':
        return <ModernTemplate data={data} />;
      case 'creative':
        return <CreativeTemplate data={data} />;
      default:
        return <ModernTemplate data={data} />;
    }
  };

  return (
    <div className="w-full aspect-[8.5/11] overflow-y-auto">
      {renderTemplate()}
    </div>
  );
};