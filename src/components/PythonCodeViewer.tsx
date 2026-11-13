/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, ExternalLink, Terminal, Sparkles } from 'lucide-react';
import { PYTHON_CODE_SNIPPETS } from '../data/pythonCodeSnippets';

export const PythonCodeViewer: React.FC = () => {
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentSnippet = PYTHON_CODE_SNIPPETS[selectedSnippetIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([currentSnippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentSnippet.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const combined = PYTHON_CODE_SNIPPETS.map(
      s => `### =======================================================
### FILE: ${s.path}
### PURPOSE: ${s.description}
### =======================================================\n\n${s.code}\n\n`
    ).join('\n\n');

    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MFA_OTP_Python_Flask_Fixed_Modules.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Python / Flask Codebase
            </span>
            <span className="text-xs text-slate-400 font-mono">Proposal Section 12 Modular Structure</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Backend Source Code Exporter</h2>
          <p className="text-xs text-slate-400">
            Production-ready Python modules generated to fill all missing functionality in your <code className="text-slate-300 font-mono">flask-auth-system</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Download Complete Python Bundle
          </button>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* File Tabs Bar */}
        <div className="bg-slate-950 px-4 pt-3 flex items-center justify-between border-b border-slate-800 overflow-x-auto gap-2">
          <div className="flex items-center gap-1">
            {PYTHON_CODE_SNIPPETS.map((snippet, idx) => (
              <button
                key={snippet.path}
                onClick={() => setSelectedSnippetIndex(idx)}
                className={`px-4 py-2 rounded-t-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
                  selectedSnippetIndex === idx
                    ? 'bg-slate-900 text-teal-400 border-t-2 border-teal-500 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-950/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                {snippet.filename}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>

            <button
              onClick={handleDownloadSingle}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              Download {currentSnippet.filename}
            </button>
          </div>
        </div>

        {/* File Info Bar */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <span className="font-mono text-slate-300">Target path: <strong>{currentSnippet.path}</strong></span>
          <span className="text-[11px] text-slate-500">{currentSnippet.description}</span>
        </div>

        {/* Code Content */}
        <div className="p-6 bg-slate-950 overflow-x-auto max-h-[550px] font-mono text-xs text-emerald-300/90 leading-relaxed select-all">
          <pre>{currentSnippet.code}</pre>
        </div>
      </div>
    </div>
  );
};
