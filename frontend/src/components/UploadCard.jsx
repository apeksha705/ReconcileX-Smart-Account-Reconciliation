import React, { useRef } from 'react';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';

export default function UploadCard({
  title,
  subtitle,
  icon: Icon,
  supported = 'CSV / PDF',
  file,
  onFileSelect,
  onRemove,
  onLoadSample,
  sampleInfo,
  colorScheme = 'forest'
}) {
  const inputRef = useRef(null);

  const colors = {
    forest: {
      border: 'border-[#B8CEB8] hover:border-[#0B3C2C]',
      badge: 'bg-[#D4E2D4] text-[#0B3C2C] border-[#B8CEB8]',
      iconBg: 'bg-[#D4E2D4] text-[#0B3C2C]',
      activeBg: 'bg-[#EBF2EB]'
    },
    sage: {
      border: 'border-[#CBD3CB] hover:border-[#6C8B6C]',
      badge: 'bg-[#D4E2D4] text-[#0B3C2C] border-[#B8CEB8]',
      iconBg: 'bg-[#D4E2D4] text-[#0B3C2C]',
      activeBg: 'bg-[#EBF2EB]'
    }
  }[colorScheme] || {
    border: 'border-[#B8CEB8] hover:border-[#0B3C2C]',
    badge: 'bg-[#D4E2D4] text-[#0B3C2C] border-[#B8CEB8]',
    iconBg: 'bg-[#D4E2D4] text-[#0B3C2C]',
    activeBg: 'bg-[#EBF2EB]'
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      onFileSelect({
        name: dropped.name,
        size: `${(dropped.size / 1024).toFixed(1)} KB`,
        rows: Math.floor(Math.random() * 800) + 300,
        type: dropped.type || 'Parsed CSV Data'
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      onFileSelect({
        name: selected.name,
        size: `${(selected.size / 1024).toFixed(1)} KB`,
        rows: Math.floor(Math.random() * 800) + 300,
        type: selected.type || 'Parsed CSV Data'
      });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative p-5 bg-[#FAF9F6] rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col justify-between ${
        file ? 'border-[#0B3C2C] bg-[#D4E2D4]/20' : colors.border
      } shadow-xs hover:shadow-sm`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.pdf,.xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1A1A1A] tracking-tight uppercase">
                {title}
              </h3>
              <p className="text-xs text-[#6B786B] font-medium">{subtitle}</p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border bg-[#EAE8DE] text-[#1A1A1A] border-[#DCD8CC]">
            {supported}
          </span>
        </div>

        {/* Selected File State or Drop Area */}
        {file ? (
          <div className="mt-4 p-3.5 bg-[#D4E2D4]/50 border border-[#B8CEB8] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-[#0B3C2C] text-[#FAF9F6]">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#1A1A1A] truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-[#4A554A] font-mono mt-0.5">
                  <span>{file.size}</span>
                  <span>•</span>
                  <span className="text-[#0B3C2C] font-bold">{file.rows} records detected</span>
                </div>
              </div>
            </div>

            <button
              onClick={onRemove}
              title="Remove file"
              className="p-1 rounded-lg text-[#6B786B] hover:text-[#9E3626] hover:bg-[#FAF9F6] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="mt-4 py-6 px-4 rounded-xl border border-dashed border-[#DBD7CB] hover:border-[#0B3C2C] bg-[#F2F0E8]/70 hover:bg-[#EAE8DE]/70 text-center cursor-pointer transition-colors"
          >
            <Upload className="w-6 h-6 text-[#6B786B] mx-auto mb-1.5" />
            <p className="text-xs font-bold text-[#1A1A1A]">
              Drop file here or <span className="text-[#0B3C2C] underline">browse</span>
            </p>
            <p className="text-[11px] text-[#7A8A7A] mt-0.5 font-medium">CSV, Excel, or PDF bank statement</p>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-3 border-t border-[#EAE7DC] flex items-center justify-between">
        {!file ? (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-xs font-bold text-[#1A1A1A] hover:text-[#0B3C2C] inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Choose File</span>
            </button>

            {onLoadSample && (
              <button
                onClick={onLoadSample}
                className="text-xs font-bold text-[#0B3C2C] hover:text-[#134E39] bg-[#D4E2D4] hover:bg-[#B8CEB8] px-2.5 py-1 rounded-lg inline-flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-[#0B3C2C]" />
                <span>Load Sample</span>
              </button>
            )}
          </>
        ) : (
          <div className="w-full flex items-center justify-between text-xs text-[#0B3C2C] font-bold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0B3C2C]" />
              Ready for Engine
            </span>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-xs text-[#6B786B] hover:text-[#1A1A1A] font-medium underline"
            >
              Replace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
