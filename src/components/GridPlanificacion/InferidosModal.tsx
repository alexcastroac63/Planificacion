import React, { useState } from 'react';
import { Material, WeekColumn } from '../../types/mrp';
import { FileEdit, UserCheck, Calendar, Check, X } from 'lucide-react';

interface InferidosModalProps {
  material: Material;
  weekColumn: WeekColumn;
  currentInferido: number;
  currentNote?: string;
  onSave: (val: number, note: string) => void;
  onClose: () => void;
}

export const InferidosModal: React.FC<InferidosModalProps> = ({
  material,
  weekColumn,
  currentInferido,
  currentNote = '',
  onSave,
  onClose,
}) => {
  const [val, setVal] = useState<number>(currentInferido);
  const [note, setNote] = useState<string>(currentNote);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl text-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-sky-50 text-sky-700 rounded-lg border border-sky-200">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Registro de Inferidos (HU-04)</h3>
              <p className="text-xs text-slate-500">
                Semana {weekColumn.weekNumber} ({weekColumn.dateLabel})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500">Material:</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              {material.code} - {material.name}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Cantidad de Productos Adicionales (Inferidos):
            </label>
            <input
              type="number"
              min="0"
              value={val}
              onChange={(e) => setVal(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-base font-bold focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            />
            <p className="text-[11px] text-sky-700 font-medium mt-1">
              * Al ingresar una cantidad mayor a 0, la celda se resaltará en celeste en el GRID y se registrará en bitácora.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Justificación / Evento de Negocio (Bitácora de Usuario):
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej. Promoción relámpago, temporada alta, evento corporativo..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(val, note);
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition"
          >
            <Check className="w-4 h-4" />
            <span>Guardar & Auditar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
