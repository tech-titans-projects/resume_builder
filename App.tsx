
import React, { useState, useRef } from 'react';
import { ResumeForm } from './components/ResumeForm';
import { ResumePreview } from './components/ResumePreview';
import { ActionToolbar } from './components/ActionToolbar';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ResumeData, TemplateId } from './types';
import { sampleResumeData } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition } from 'docx';


function App() {
  const [resumeData, setResumeData] = useLocalStorage<ResumeData>('resumeData', sampleResumeData);
  const [template, setTemplate] = useState<TemplateId>('modern');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    const previewElement = previewRef.current;
    if (!previewElement) return;

    // Find the scrollable element inside the preview
    const scrollableContent = previewElement.querySelector('.overflow-y-auto') as HTMLElement | null;
    if (!scrollableContent) return;


    setIsLoading(true);
    setError(null);
    try {
      const canvas = await html2canvas(scrollableContent, {
        scale: 2, // Higher scale for better resolution
        useCORS: true,
        logging: false,
        scrollY: -window.scrollY, // Ensure we capture from the top of the element
        height: scrollableContent.scrollHeight, // Capture the full scrollable height
        windowHeight: scrollableContent.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('resume.pdf');
    } catch (e) {
      setError('Failed to generate PDF. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportHTML = () => {
    const previewElement = previewRef.current;
    if (!previewElement) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        ${previewElement.innerHTML}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'resume.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDOCX = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const { personalInfo, experience, education, skills } = resumeData;
      
      const children = [
        new Paragraph({
          children: [new TextRun({ text: personalInfo.name, bold: true, size: 44 })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `${personalInfo.location} | ${personalInfo.phone} | ${personalInfo.email} | ${personalInfo.website}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'SUMMARY', size: 24, bold: true })],
          // FIX: The 'value' property is incorrect for docx border options. Replaced with 'style'.
          border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } },
          spacing: { after: 200 },
        }),
        new Paragraph({ text: personalInfo.summary, spacing: { after: 400 } }),
        new Paragraph({
          children: [new TextRun({ text: 'EXPERIENCE', size: 24, bold: true })],
          // FIX: The 'value' property is incorrect for docx border options. Replaced with 'style'.
          border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } },
          spacing: { after: 200 },
        }),
        ...experience.flatMap(exp => [
          new Paragraph({
              children: [
                  new TextRun({ text: exp.jobTitle, bold: true }),
                  new TextRun({ text: `\t${exp.startDate} - ${exp.endDate}`, bold: true }),
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          }),
          new Paragraph({
              children: [new TextRun({ text: `${exp.company}, ${exp.location}`, italics: true })],
              spacing: { after: 100 },
          }),
          ...exp.description.split('\n').filter(d => d.trim() !== '').map(desc => new Paragraph({
              text: desc.replace(/^-/, '').trim(),
              bullet: { level: 0 },
          })),
          new Paragraph({ text: '', spacing: { after: 200 } }),
        ]),
        new Paragraph({
          children: [new TextRun({ text: 'EDUCATION', size: 24, bold: true })],
          // FIX: The 'value' property is incorrect for docx border options. Replaced with 'style'.
          border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } },
          spacing: { after: 200 },
        }),
        ...education.flatMap(edu => [
          new Paragraph({
              children: [
                  new TextRun({ text: edu.institution, bold: true }),
                  new TextRun({ text: `\t${edu.startDate} - ${edu.endDate}` }),
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          }),
          new Paragraph({
              text: `${edu.degree} in ${edu.fieldOfStudy}`,
              spacing: { after: 200 }
          }),
        ]),
        new Paragraph({
          children: [new TextRun({ text: 'SKILLS', size: 24, bold: true })],
          // FIX: The 'value' property is incorrect for docx border options. Replaced with 'style'.
          border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } },
          spacing: { after: 200 },
        }),
        new Paragraph({
            text: skills.map(s => s.name).join(' | ')
        }),
      ];

      const doc = new Document({
        styles: {
            default: {
              document: {
                run: { size: 22, font: "Arial" },
              },
            },
        },
        sections: [{ children }],
      });
  
      const blob = await Packer.toBlob(doc);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'resume.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setError('Failed to generate DOCX. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              <span className="text-indigo-500">AI</span> Resume Builder
            </h1>
            <ActionToolbar
              setTemplate={setTemplate}
              currentTemplate={template}
              onExportPDF={handleExportPDF}
              onExportHTML={handleExportHTML}
              onExportDOCX={handleExportDOCX}
              isLoading={isLoading}
            />
          </div>
        </div>
      </header>

      {error && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          <div className="mb-8 lg:mb-0">
            <ResumeForm
              resumeData={resumeData}
              setResumeData={setResumeData}
              setIsLoading={setIsLoading}
              setError={setError}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:sticky lg:top-24 self-start">
             <div ref={previewRef} className="bg-white dark:bg-slate-800 shadow-lg rounded-lg">
                <ResumePreview data={resumeData} template={template} />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
