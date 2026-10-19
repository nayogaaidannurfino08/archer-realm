import React, { useRef, useState } from 'react';
import { CloudUpload, FileText, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const UploadZone = ({ selectedFile, onSelectFile, onRemoveFile }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE_MB = 10;
  const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  const validateAndSetFile = (file) => {
    setErrorMsg(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('Format file tidak didukung. Mohon gunakan file PDF, PNG, atau JPG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`Ukuran file melebihi batas maksimal ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    onSelectFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isPdf = selectedFile?.type === 'application/pdf';

  return (
    <div className="flex flex-col space-y-3">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        /* Drag & Drop Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-500/15 scale-[1.01]'
              : 'border-slate-700/80 hover:border-cyan-500/60 bg-[#0a1526]/50 hover:bg-[#0c1a2e]/70'
          }`}
        >
          <div
            className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${
              isDragOver
                ? 'bg-cyan-500/30 text-cyan-300'
                : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <CloudUpload className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Tarik & Lepas (Drag & Drop) Dokumen di Sini
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            atau <span className="text-cyan-400 font-semibold underline underline-offset-4">klik untuk menjelajah file</span> dari laptop/HP Anda
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/70">
              Format: PDF, PNG, JPG
            </span>
            <span className="text-[11px] font-semibold text-slate-400 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/70">
              Maksimal: 10 MB
            </span>
          </div>
        </div>
      ) : (
        /* Attached File Preview Card */
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1828]/95 border border-cyan-500/40 shadow-xl flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`p-3 rounded-xl border shrink-0 ${
                isPdf
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                  {selectedFile.name}
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Dokumen siap dianalisis oleh Gemini</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all"
            >
              Ganti File
            </button>
            <button
              type="button"
              onClick={onRemoveFile}
              aria-label="Hapus file"
              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
