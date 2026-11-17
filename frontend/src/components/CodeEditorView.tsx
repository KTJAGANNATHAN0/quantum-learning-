import React, { useState } from 'react';
import { Play, Copy, Check, Code, FileCode } from 'lucide-react';
import { sound } from '../services/audioEngine';

interface CodeEditorViewProps {
  qiskitCode: string;
  onRunRawCode: (code: string) => void;
  isLoading?: boolean;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  qiskitCode,
  onRunRawCode,
  isLoading = false
}) => {
  const [editableCode, setEditableCode] = useState(qiskitCode);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setEditableCode(qiskitCode);
  }, [qiskitCode]);

  const handleCopy = () => {
    sound.playTick();
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="outer-chassis" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--red-50)',
            color: 'var(--red-700)',
            border: '1px solid var(--red-border)',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
          }}>
            <FileCode size={14} /> QISKIT PYTHON SCRIPT
          </div>
          <span className="doc-stamp">
            LIVE REPL
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleCopy} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            {copied ? <Check size={14} color="#15803D" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Script'}
          </button>
          <button
            onClick={() => {
              sound.playSimulationSweep();
              onRunRawCode(editableCode);
            }}
            disabled={isLoading}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            <Play size={14} fill="#FFFFFF" /> {isLoading ? 'Executing...' : 'Execute Raw Qiskit'}
          </button>
        </div>
      </div>

      <div className="inner-bezel" style={{ padding: '4px', background: '#FFFFFF' }}>
        <textarea
          value={editableCode}
          onChange={(e) => setEditableCode(e.target.value)}
          style={{
            width: '100%',
            minHeight: '260px',
            background: 'var(--bg-canvas)',
            color: 'var(--ink-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.84rem',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid var(--border-bezel)',
            resize: 'vertical',
            lineHeight: 1.6,
            outline: 'none'
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
