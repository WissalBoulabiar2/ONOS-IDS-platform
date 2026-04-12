'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api';
import { Terminal, Send, Trash2, RefreshCw, Server, Network } from 'lucide-react';

interface HistoryEntry {
  type: 'ssh' | 'onos';
  command: string;
  output: string;
  success: boolean;
  timestamp: string;
}

interface CLIOutput {
  command: string;
  type: 'ssh' | 'onos';
  output: string;
  success: boolean;
  timestamp: string;
  host?: string;
}

const SSH_SUGGESTIONS = [
  'ip link show',
  'ip addr show',
  'sudo ip link set s1-eth2 down',
  'sudo ip link set s1-eth2 up',
  'sudo ovs-vsctl show',
  'sudo ovs-ofctl show s1',
  'ping -c 3 192.168.1.10',
  'sudo ovs-vsctl list-br',
];

const ONOS_SUGGESTIONS = [
  'help',
  'devices',
  'hosts',
  'links',
  'flows',
  'topology',
  'stats',
  'apps',
  'ports of:0000000000000001',
  'paths of:0000000000000001 of:0000000000000003',
];

export default function CLIPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'ssh' | 'onos'>('ssh');
  const [input, setInput] = useState('');
  const [outputs, setOutputs] = useState<CLIOutput[]>([]);
  const [loading, setLoading] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputs]);

  // Welcome message
  useEffect(() => {
    if (user) {
      setOutputs([{
        command: '',
        type: 'ssh',
        output: `NetGuard CLI Terminal
${'─'.repeat(50)}
SSH Mode  → execute commands on VM Linux (${user.role === 'admin' ? '192.168.91.133' : 'restricted'})
ONOS Mode → query ONOS controller via REST API

Type 'help' in ONOS mode for available commands.
Switch mode using the buttons above.
${'─'.repeat(50)}`,
        success: true,
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [user]);

  const executeCommand = async (cmd?: string) => {
    const command = (cmd || input).trim();
    if (!command || loading) return;

    setInput('');
    setHistoryIndex(-1);
    setCmdHistory(prev => [command, ...prev.slice(0, 49)]);
    setLoading(true);

    try {
      const endpoint = mode === 'ssh' ? '/cli/ssh' : '/cli/onos';
      const res = await apiClient(endpoint, {
        method: 'POST',
        body: JSON.stringify({ command }),
      });

      const data = await res.json();

      if (res.ok) {
        setOutputs(prev => [...prev, {
          command,
          type: mode,
          output: data.output,
          success: data.success,
          timestamp: data.timestamp,
          host: data.host,
        }]);
      } else {
        setOutputs(prev => [...prev, {
          command,
          type: mode,
          output: `Error: ${data.detail || 'Command failed'}`,
          success: false,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (e) {
      setOutputs(prev => [...prev, {
        command,
        type: mode,
        output: 'Network error — check API connection',
        success: false,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(newIndex);
      setInput(cmdHistory[newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? '' : cmdHistory[newIndex] || '');
    }
  };

  const clearTerminal = () => {
    setOutputs([]);
    apiClient('/cli/history', { method: 'DELETE' });
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (isLoading || !user) return null;
  const canUse = ['admin', 'manager'].includes(user.role);

  if (!canUse) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Terminal className="mx-auto mb-4 h-12 w-12 text-slate-700" />
          <p className="text-slate-400">CLI access requires Admin or Manager role</p>
        </div>
      </div>
    );
  }

  const suggestions = mode === 'ssh' ? SSH_SUGGESTIONS : ONOS_SUGGESTIONS;

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-green-400" />
          <h1 className="font-bold text-white">NetGuard CLI Terminal</h1>
          <span className="text-xs text-slate-500">
            {mode === 'ssh' ? `SSH → ${user.role === 'admin' ? '192.168.91.133' : 'VM'}` : 'ONOS REST API'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode switcher */}
          <div className="flex rounded-xl border border-slate-700 overflow-hidden">
            <button
              onClick={() => setMode('ssh')}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                mode === 'ssh'
                  ? 'bg-green-700/30 text-green-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Server className="h-4 w-4" />
              SSH Linux
            </button>
            <button
              onClick={() => setMode('onos')}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                mode === 'onos'
                  ? 'bg-cyan-700/30 text-cyan-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Network className="h-4 w-4" />
              ONOS CLI
            </button>
          </div>
          <button
            onClick={clearTerminal}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-400 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 bg-slate-900/50 px-6 py-2">
        <span className="shrink-0 text-xs text-slate-500">Quick:</span>
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => executeCommand(s)}
            disabled={loading}
            className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:border-slate-500 hover:text-white transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Terminal output */}
      <div
        className="flex-1 overflow-y-auto p-6 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {outputs.map((out, i) => (
          <div key={i} className="mb-4">
            {out.command && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-500 text-xs">{formatTime(out.timestamp)}</span>
                <span className={mode === 'ssh' ? 'text-green-400' : 'text-cyan-400'}>
                  {mode === 'ssh' ? 'wissal@vm' : 'onos'}
                </span>
                <span className="text-slate-500">$</span>
                <span className="text-white">{out.command}</span>
              </div>
            )}
            <pre className={`whitespace-pre-wrap break-words rounded-lg p-3 text-xs leading-relaxed ${
              out.command === ''
                ? 'text-slate-400'
                : out.success
                ? 'text-green-300 bg-green-950/20'
                : 'text-red-300 bg-red-950/20'
            }`}>
              {out.output}
            </pre>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span className="text-xs">Executing...</span>
          </div>
        )}
        <div ref={outputEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 bg-slate-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`shrink-0 text-sm font-bold ${
            mode === 'ssh' ? 'text-green-400' : 'text-cyan-400'
          }`}>
            {mode === 'ssh' ? 'wissal@vm $' : 'onos $'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'ssh'
                ? 'ip link show, ping -c 3 192.168.1.10, sudo ovs-vsctl show...'
                : 'devices, hosts, links, flows, topology, help...'
            }
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
          />
          <button
            onClick={() => executeCommand()}
            disabled={loading || !input.trim()}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
              mode === 'ssh'
                ? 'bg-green-700/30 text-green-400 hover:bg-green-700/50'
                : 'bg-cyan-700/30 text-cyan-400 hover:bg-cyan-700/50'
            }`}
          >
            {loading
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          ↑↓ History · Enter to execute · Switch mode for SSH/ONOS commands
        </p>
      </div>
    </div>
  );
}