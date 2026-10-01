import React, { useState } from 'react';
import { SchemaTable } from '../types';
import { 
  Database, 
  Copy, 
  Check, 
  Download, 
  FileSpreadsheet, 
  Layers, 
  Sparkles, 
  Key, 
  ExternalLink,
  TableProperties,
  Network
} from 'lucide-react';

interface SchemaViewProps {
  tables: SchemaTable[];
}

export const SchemaView: React.FC<SchemaViewProps> = ({ tables }) => {
  const [activeTableId, setActiveTableId] = useState<string>(tables[0]?.id || 'tbl_projects');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentTable = tables.find((t) => t.id === activeTableId) || tables[0];

  const handleCopyHeaders = (table: SchemaTable) => {
    // English headers row tab-separated
    const enHeaders = table.columns.map((c) => c.nameEn).join('\t');
    const arHeaders = table.columns.map((c) => c.nameAr).join('\t');
    const fullText = `${arHeaders}\n${enHeaders}`;

    navigator.clipboard.writeText(fullText);
    setCopiedId(table.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadCSV = (table: SchemaTable) => {
    const arHeaders = table.columns.map((c) => `"${c.nameAr}"`).join(',');
    const enHeaders = table.columns.map((c) => `"${c.nameEn}"`).join(',');
    const sampleRow = table.columns.map((c) => `"${c.example}"`).join(',');

    const csvContent = `\uFEFF${arHeaders}\n${enHeaders}\n${sampleRow}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${table.nameEn}_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                هندسة البيانات العلائقية (Relational Architecture)
              </span>
              <span className="text-xs text-slate-400">Google Sheets + AppSheet Ready</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              هيكل قاعدة البيانات ومخطط الجداول (Database Schema)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              تصميم هندسي متكامل ومبني على أفضل ممارسات AppSheet لتفادي تكرار البيانات وضمان الأداء السريع.
              الجداول مربوطة بعلاقات (1 to Many) عبر أعمدة المرجع (Ref Columns).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopyHeaders(currentTable)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition"
            >
              {copiedId === currentTable.id ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>نسخ رؤوس الأعمدة للشيت</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadCSV(currentTable)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل قالب CSV للشيت</span>
            </button>
          </div>
        </div>
      </div>

      {/* Relational Entity Relationship (ERD) Visual Overview */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Network className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-sm sm:text-base">
            مخطط العلاقات بين الجداول (ERD Blueprint)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl relative">
            <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
              <span>جدول العملاء (Clients)</span>
              <span className="text-2xs bg-amber-500/20 px-1.5 py-0.5 rounded">1</span>
            </div>
            <p className="text-slate-400 text-2xs mb-2">المالك والجهات المتعاقد معها</p>
            <div className="font-mono text-slate-300 text-3xs space-y-0.5">
              <div className="text-amber-300 font-bold">🔑 Client_ID (PK)</div>
              <div>• Client_Name</div>
              <div>• Phone_Number</div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-amber-500/50 rounded-xl relative shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
              <span>جدول المشاريع (Projects)</span>
              <span className="text-2xs bg-amber-500/20 px-1.5 py-0.5 rounded">Parent</span>
            </div>
            <p className="text-slate-400 text-2xs mb-2">العقد، القيمة، والمرحلة الحالية</p>
            <div className="font-mono text-slate-300 text-3xs space-y-0.5">
              <div className="text-amber-300 font-bold">🔑 Project_ID (PK)</div>
              <div className="text-blue-300">🔗 Client_Name (Ref)</div>
              <div>• Contract_Value</div>
              <div className="text-emerald-400">⚡ Total_Collected (VC)</div>
              <div className="text-amber-400">⚡ Total_Remaining (VC)</div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl relative">
            <div className="flex items-center justify-between text-blue-400 font-bold mb-1">
              <span>جدول المراحل (Stages)</span>
              <span className="text-2xs bg-blue-500/20 px-1.5 py-0.5 rounded">Many (N)</span>
            </div>
            <p className="text-slate-400 text-2xs mb-2">خطوات التنفيذ والإنجاز الميداني</p>
            <div className="font-mono text-slate-300 text-3xs space-y-0.5">
              <div className="text-blue-300 font-bold">🔑 Stage_ID (PK)</div>
              <div className="text-amber-300">🔗 Project_ID (Ref)</div>
              <div>• Stage_Name</div>
              <div>• Stage_Status</div>
              <div>• Completion_Rate %</div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-emerald-500/50 rounded-xl relative shadow-lg shadow-emerald-500/5">
            <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
              <span>جدول الدفعات (Payments)</span>
              <span className="text-2xs bg-emerald-500/20 px-1.5 py-0.5 rounded">Many (N)</span>
            </div>
            <p className="text-slate-400 text-2xs mb-2">الاستحقاقات وسندات القبض</p>
            <div className="font-mono text-slate-300 text-3xs space-y-0.5">
              <div className="text-emerald-300 font-bold">🔑 Payment_ID (PK)</div>
              <div className="text-amber-300">🔗 Project_ID (Ref)</div>
              <div className="text-blue-300">🔗 Stage_ID (Ref)</div>
              <div>• Due_Amount & Collected</div>
              <div>• Voucher_Number & Dates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tables.map((tbl) => (
          <button
            key={tbl.id}
            onClick={() => setActiveTableId(tbl.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
              activeTableId === tbl.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                : 'bg-slate-850/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>
              {tbl.nameAr} ({tbl.nameEn})
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-2xs bg-slate-900/40 font-mono">
              {tbl.columns.length} أعمدة
            </span>
          </button>
        ))}
      </div>

      {/* Selected Table Deep-Dive */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                جدول: {currentTable.nameAr}
              </h3>
              <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Sheets Tab: {currentTable.nameEn}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{currentTable.descriptionAr}</p>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            عدد الأعمدة المصممة: <strong className="text-white">{currentTable.columns.length}</strong>
          </div>
        </div>

        {/* Columns Grid / Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700">
              <tr>
                <th className="p-3">اسم العمود (بالعربية)</th>
                <th className="p-3">اسم العمود البرمجي (AppSheet / EN)</th>
                <th className="p-3">النوع في Sheets</th>
                <th className="p-3">النوع في AppSheet</th>
                <th className="p-3">المعادلة التلقائية (إن وجدت)</th>
                <th className="p-3">مثال واقعي</th>
                <th className="p-3">الوصف والدور الهندسي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {currentTable.columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 font-bold text-white whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {col.isKey && (
                        <span title="Primary Key المفتاح الأساسي">
                          <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        </span>
                      )}
                      <span>{col.nameAr}</span>
                      {col.isRequired && <span className="text-rose-400">*</span>}
                    </div>
                  </td>

                  <td className="p-3 font-mono font-bold text-amber-300 whitespace-nowrap">
                    {col.nameEn}
                  </td>

                  <td className="p-3 text-slate-300 whitespace-nowrap">
                    {col.dataTypeSheets}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-2xs font-mono font-bold ${
                        col.dataTypeAppSheet.includes('Key')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : col.dataTypeAppSheet.includes('Ref')
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : col.dataTypeAppSheet.includes('Virtual')
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : col.dataTypeAppSheet.includes('Price')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {col.dataTypeAppSheet}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-3xs text-cyan-300 max-w-xs">
                    {col.formulaSheets || col.formulaAppSheet ? (
                      <div className="space-y-1">
                        {col.formulaSheets && (
                          <div className="bg-slate-950 p-1 rounded border border-slate-800 truncate" title={col.formulaSheets}>
                            Sheets: {col.formulaSheets}
                          </div>
                        )}
                        {col.formulaAppSheet && (
                          <div className="bg-slate-950 p-1 rounded border border-slate-800 truncate text-amber-300" title={col.formulaAppSheet}>
                            AppSheet: {col.formulaAppSheet}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                    {col.example}
                  </td>

                  <td className="p-3 text-slate-400 max-w-xs leading-relaxed">
                    {col.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pro Tip Box for AppSheet */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2 text-slate-300">
          <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>نصيحة ذهبية لمهندسي AppSheet:</span>
          </div>
          <p>
            في Google Sheets، اكتب فقط الأعمدة الأساسية التي يتم إدخالها يدوياً (المعرفات، الأسماء، التواريخ، مبالغ الدفعات). أما الأعمدة المحسوبة مثل (<strong>Total_Collected</strong> و <strong>Total_Remaining</strong> و <strong>Collection_Percentage</strong>) فيُفضل بشدة إضافتها في AppSheet كـ <strong>Virtual Columns (أعمدة افتراضية)</strong>.
            هذا يجعل الحساب فوري داخل التطبيق دون الحاجة لانتظار مزامنة معادلات الإكسل الثقيلة!
          </p>
        </div>
      </div>
    </div>
  );
};
