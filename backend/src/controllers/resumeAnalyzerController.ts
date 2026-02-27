import { Request, Response } from 'express';
import { analyzeResumeStandalone, analyzeResumeWithGemini } from '../services/aiResumeAnalysis';
import PdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Analyze uploaded resume
 */
export const analyzeUploadedResume = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Resume analysis request received');

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const { targetRole } = req.body;
    const file = req.file;

    console.log('📄 File details:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Extract text from file
    let resumeText = '';

    if (file.mimetype === 'application/pdf') {
      console.log('📑 Parsing PDF...');
      const pdfData = await PdfParse(file.buffer);
      resumeText = pdfData.text;
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      console.log('📝 Parsing DOCX...');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      resumeText = result.value;
    } else {
      res.status(400).json({ message: 'Unsupported file format. Please upload PDF or DOCX.' });
      return;
    }

    if (!resumeText || resumeText.trim().length < 50) {
      res.status(400).json({ 
        message: 'Could not extract text from resume. Please ensure the file is not empty or corrupted.' 
      });
      return;
    }

    console.log('✅ Resume text extracted, length:', resumeText.length);

    // Analyze resume with Gemini first, fallback to local analysis if needed
    let analysis;
    try {
      analysis = await analyzeResumeWithGemini(resumeText, targetRole);
      console.log('🤖 Gemini analysis successful');
    } catch (geminiError) {
      console.warn('⚠️ Gemini analysis failed, using fallback analyzer:', geminiError);
      analysis = await analyzeResumeStandalone(resumeText, targetRole);
    }

    console.log('✅ Analysis complete, score:', analysis.overallScore);

    res.status(200).json({
      message: 'Resume analyzed successfully',
      analysis
    });
  } catch (error) {
    console.error('❌ Error analyzing resume:', error);
    res.status(500).json({ 
      message: 'Failed to analyze resume',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
