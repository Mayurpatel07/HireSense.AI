import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, TrendingUp, Award, Briefcase, BookOpen, Users } from 'lucide-react';

interface ResumeAnalysis {
  overallScore: number;
  extractedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  strengthAreas: {
    technical: number;
    experience: number;
    education: number;
    softSkills: number;
  };
  detailedFeedback: {
    formatting: string;
    content: string;
    keywords: string;
    impact: string;
  };
}

const ResumeAnalyzer: React.FC = () => {
  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or DOCX file');
        return;
      }
      
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a resume file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (targetRole) {
        formData.append('targetRole', targetRole);
      }

      const response = await fetch(`${apiBaseUrl}/resume-analyzer/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze resume');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Resume Analyzer</h1>
          <p className="text-gray-600">
            Get instant feedback on your resume with AI-powered analysis
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Your Resume
          </h2>

          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume File (PDF or DOCX)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                />
              </div>
              {file && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Target Role (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role (Optional)
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2 border border-pink-100 rounded-md focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              >
                <option value="">Auto-detect from resume</option>
                <option value="frontend">Frontend Developer</option>
                <option value="backend">Backend Developer</option>
                <option value="fullstack">Full Stack Developer</option>
                <option value="devops">DevOps Engineer</option>
                <option value="data">Data Scientist</option>
              </select>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full bg-pink-500 text-white py-3 rounded-md font-semibold hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Analyze Resume
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {error}
              </div>
            )}
          </div>
        </motion.div>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Overall Resume Score</h2>
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(analysis.overallScore)} mb-4`}>
                  <span className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </span>
                </div>
                <p className="text-gray-600">
                  {analysis.overallScore >= 80 && 'Excellent! Your resume is well-optimized.'}
                  {analysis.overallScore >= 60 && analysis.overallScore < 80 && 'Good job! Some improvements can make it even better.'}
                  {analysis.overallScore < 60 && 'There\'s room for improvement. Follow the suggestions below.'}
                </p>
              </div>
            </div>

            {/* Strength Areas */}
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Strength Areas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Technical Skills', score: analysis.strengthAreas.technical, icon: '' },
                  { name: 'Experience', score: analysis.strengthAreas.experience, icon: '' },
                  { name: 'Education', score: analysis.strengthAreas.education, icon: '' },
                  { name: 'Soft Skills', score: analysis.strengthAreas.softSkills, icon: '' },
                ].map((area) => (
                  <div key={area.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center gap-2">
                        <span>{area.icon}</span>
                        {area.name}
                      </span>
                      <span className={`font-bold ${getScoreColor(area.score)}`}>
                        {area.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          area.score >= 80 ? 'bg-green-500' :
                          area.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${area.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Skills */}
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Skills Found ({analysis.extractedSkills.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.extractedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            {analysis.missingSkills.length > 0 && (
              <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-600" />
                  Recommended Skills to Add
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                Improvement Suggestions
              </h2>
              <ul className="space-y-3">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Detailed Feedback</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Formatting', feedback: analysis.detailedFeedback.formatting },
                  { title: 'Content Quality', feedback: analysis.detailedFeedback.content },
                  { title: 'Keywords', feedback: analysis.detailedFeedback.keywords },
                  { title: 'Impact', feedback: analysis.detailedFeedback.impact },
                ].map((item) => (
                  <div key={item.title} className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                    <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
