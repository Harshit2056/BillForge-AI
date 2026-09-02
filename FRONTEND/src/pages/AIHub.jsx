import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { aiService } from '../services/ai.service';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  UploadCloud,
  FileImage,
  MessageSquare,
  TrendingDown,
  Gift,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Code2,
  ArrowRight,
  Database,
} from 'lucide-react';

export const AIHub = () => {
  const [activeTab, setActiveTab] = useState('ocr'); // 'ocr' | 'query' | 'forecast' | 'bundles'

  // OCR state
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // NL Query state
  const [prompt, setPrompt] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [showPipeline, setShowPipeline] = useState(false);

  // Forecast state
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);

  // Bundling state
  const [bundleLoading, setBundleLoading] = useState(false);
  const [bundleResult, setBundleResult] = useState(null);

  const toast = useToast();

  // Handlers
  const handleOcrSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a receipt image file.');
      return;
    }
    setOcrLoading(true);
    try {
      const res = await aiService.scanReceipt(selectedFile);
      if (res?.data) {
        setOcrResult(res.data);
        toast.success('Receipt scanned & line items extracted via Gemini OCR!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Receipt OCR scanning failed.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setQueryLoading(true);
    try {
      const res = await aiService.queryNaturalLanguage(prompt);
      if (res?.data) {
        setQueryResult(res.data);
        toast.success('Natural language query executed successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to execute query.');
    } finally {
      setQueryLoading(false);
    }
  };

  const fetchForecast = async () => {
    setForecastLoading(true);
    try {
      const res = await aiService.getForecast();
      if (res?.data) {
        setForecastResult(res.data);
        toast.success('Demand forecasting analysis complete!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate demand forecast.');
    } finally {
      setForecastLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setBundleLoading(true);
    try {
      const res = await aiService.getRecommendations();
      if (res?.data) {
        setBundleResult(res.data);
        toast.success('Dynamic bundling recommendations generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch recommendations.');
    } Tenally: setBundleLoading(false);
  };

  return (
    <AppLayout title="Gemini 2.5 AI Hub">
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 rounded-2xl border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">BillForge Intelligence Hub</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Powered by Google Gemini 2.5 Flash. Automate receipt OCR scanning, run plain-text MongoDB sales analytics queries, predict stockout run-rates, and generate profit-maximizing dead-stock bundles.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'ocr', label: 'Receipt OCR Scanner', icon: UploadCloud },
            { id: 'query', label: 'Text-to-Query Analytics', icon: MessageSquare },
            { id: 'forecast', label: 'Stock Demand Forecast', icon: TrendingDown },
            { id: 'bundles', label: 'Smart Clearance Bundles', icon: Gift },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'forecast' && !forecastResult) fetchForecast();
                  if (tab.id === 'bundles' && !bundleResult) fetchRecommendations();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: RECEIPT OCR SCANNER */}
        {activeTab === 'ocr' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Scan Purchase Receipt</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Upload a photo of a physical bill or paper receipt to extract line items, prices, and quantities automatically.
                </p>

                <form onSubmit={handleOcrSubmit} className="space-y-4">
                  <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-slate-950/50 cursor-pointer transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-200">
                      {selectedFile ? selectedFile.name : 'Drag & Drop or click to choose receipt image'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Supports JPG, PNG, WEBP (Max 5MB)</p>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedFile || ocrLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {ocrLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing Receipt with Gemini Vision...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Run OCR & Extract Items</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Extracted Structured Data Table */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-sm min-h-[350px]">
              <h3 className="text-base font-bold text-white mb-1">Extracted Receipt Data</h3>
              <p className="text-xs text-slate-400 mb-4">Structured JSON extracted from receipt image</p>

              {!ocrResult ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  <FileImage className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs">Upload a receipt on the left to view parsed line items here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500">Vendor Name:</span>
                      <p className="font-bold text-white">{ocrResult.vendorName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Bill Total Amount:</span>
                      <p className="font-extrabold text-emerald-400">₹{ocrResult.totalBillAmount || 0}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold bg-slate-900">
                          <th className="py-2.5 px-4">Item Name</th>
                          <th className="py-2.5 px-4">Qty</th>
                          <th className="py-2.5 px-4">Unit Cost</th>
                          <th className="py-2.5 px-4">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {ocrResult.items?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-4 font-bold text-slate-200">{item.name}</td>
                            <td className="py-2.5 px-4 text-slate-300">{item.quantity}</td>
                            <td className="py-2.5 px-4 text-slate-300">₹{item.costPrice}</td>
                            <td className="py-2.5 px-4 font-bold text-white">₹{item.totalAmount || item.quantity * item.costPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TEXT-TO-QUERY NATURAL LANGUAGE ANALYTICS */}
        {activeTab === 'query' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-white">Natural Language Sales Analytics</h3>
              <p className="text-xs text-slate-400">
                Ask any question about your shop's sales in plain English. Gemini automatically translates it into a tenant-isolated MongoDB aggregation pipeline.
              </p>

              {/* Sample Prompt Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Sample Prompts:</span>
                {[
                  'Show top 5 payment modes by total revenue',
                  'Which product generated the highest revenue?',
                  'Total sales revenue grouped by payment status',
                ].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setPrompt(sample)}
                    className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>

              <form onSubmit={handleQuerySubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask a question (e.g. 'Show total revenue grouped by paymentMode')..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={queryLoading || !prompt.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {queryLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Run Query</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Query Results */}
            {queryResult && (
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">Query Results ({queryResult.resultsCount} items)</h4>
                    <p className="text-xs text-indigo-400 font-mono">Prompt: "{queryResult.query}"</p>
                  </div>
                  <button
                    onClick={() => setShowPipeline(!showPipeline)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{showPipeline ? 'Hide Mongo Pipeline' : 'Inspect Mongo Pipeline'}</span>
                  </button>
                </div>

                {/* MongoDB Pipeline Inspector */}
                {showPipeline && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Executed Tenant-Isolated Pipeline ($match stage 0 enforced):
                    </p>
                    <pre className="text-xs font-mono text-emerald-400">
                      {JSON.stringify(queryResult.executedPipeline, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Results JSON / Table View */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-96">
                  {Array.isArray(queryResult.results) && queryResult.results.length > 0 ? (
                    <pre className="text-xs font-mono text-slate-200">
                      {JSON.stringify(queryResult.results, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No records matched the generated aggregation pipeline.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SMART DEMAND FORECASTING */}
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Stock Depletion & Reorder Forecast</h3>
                <p className="text-xs text-slate-400">Predicts stock run-out days based on 30-day sales velocity</p>
              </div>
              <button
                onClick={fetchForecast}
                disabled={forecastLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                {forecastLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Refresh Forecast</span>
              </button>
            </div>

            {forecastResult?.analysisSummary && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl text-xs text-indigo-200">
                <span className="font-bold block uppercase tracking-wider text-[10px] text-indigo-400 mb-1">AI Executive Summary:</span>
                {forecastResult.analysisSummary}
              </div>
            )}

            {forecastLoading ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="text-xs font-medium">Running 30-day velocity calculations...</span>
              </div>
            ) : forecastResult?.forecasts?.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">No active inventory products to forecast.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forecastResult?.forecasts?.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-100">{item.productName}</h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            item.urgencyLevel === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : item.urgencyLevel === 'MODERATE'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {item.urgencyLevel}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-500">Days Remaining:</span>
                          <p className="font-bold text-white text-sm">{item.daysUntilStockout} days</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Rec. Reorder:</span>
                          <p className="font-bold text-indigo-400 text-sm">+{item.recommendedReorderQuantity} units</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                      "{item.insights}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DYNAMIC DEAD-STOCK BUNDLING */}
        {activeTab === 'bundles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Dynamic Clearance Bundling Recommender</h3>
                <p className="text-xs text-slate-400">Pairs stagnant inventory with top-selling anchor items</p>
              </div>
              <button
                onClick={fetchRecommendations}
                disabled={bundleLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                {bundleLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Generate New Bundles</span>
              </button>
            </div>

            {bundleLoading ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                <span className="text-xs font-medium">Detecting zero-velocity items & generating bundle copy...</span>
              </div>
            ) : bundleResult?.bundles?.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">No stagnant dead stock detected in inventory!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bundleResult?.bundles?.map((bundle, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-base text-purple-300">{bundle.bundleTitle}</h4>
                      <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                        {bundle.suggestedDiscountPercent}% OFF Bundle
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block text-[10px] uppercase">Anchor Product</span>
                        <p className="font-bold text-slate-200 mt-0.5">{bundle.anchorProductName}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold block text-[10px] uppercase">Clearance Item</span>
                        <p className="font-bold text-rose-400 mt-0.5">{bundle.slowMovingProductName}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Marketing Copy / Promotion Pitch:
                      </span>
                      <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 italic">
                        "{bundle.marketingPitch}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
