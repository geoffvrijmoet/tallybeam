'use client';

import { useState, useEffect } from 'react';
import { useAppNavigation } from '../lib/navigation';
import { CreateInvoiceRequest } from '../lib/models/Transaction';
import { ParsedInvoiceData } from '../lib/services/ai';
import { InvoicePreview } from '../components/InvoicePreview';

type ViewMode = 'landing' | 'instant' | 'success';

export default function Page() {
  const navigation = useAppNavigation();
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [parsedData, setParsedData] = useState<ParsedInvoiceData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseInput = async (input: string): Promise<ParsedInvoiceData | null> => {
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.parsedData;
    } catch (error) {
      console.error('Error calling parse API:', error);
      throw error;
    }
  };

  // Auto-parse when user stops typing
  useEffect(() => {
    if (viewMode !== 'instant' || inputValue.length < 5) {
      setParsedData(null);
      setParseError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsParsing(true);
      setParseError(null);
      try {
        const parsed = await parseInput(inputValue);
        if (parsed) {
          setParsedData(parsed);
        } else {
          setParsedData(null);
          setParseError('Unable to parse. Try including client name, amount, and description.');
        }
      } catch (error: unknown) {
        console.error('Error parsing input:', error);
        setParsedData(null);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('500')) {
          setParseError('AI service not configured. Please check your GEMINI_API_KEY in .env.local');
        } else if (errorMessage.includes('400')) {
          setParseError('Invalid input format. Please try again.');
        } else {
          setParseError('Network error. Please check your connection and try again.');
        }
      } finally {
        setIsParsing(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [inputValue, viewMode]);

  const handleSubmit = async () => {
    if (!parsedData || !parsedData.clientName || parsedData.amount <= 0) {
      const parsed = await parseInput(inputValue);
      if (!parsed || !parsed.clientName || parsed.amount <= 0) {
        return;
      }
      setParsedData(parsed);
    }

    setIsProcessing(true);

    try {
      const invoiceData: CreateInvoiceRequest = {
        clientName: parsedData!.clientName,
        amount: parsedData!.amount,
        description: parsedData!.description,
        currency: 'USD',
        dueDate: parsedData!.dueDate || '',
        paymentMethod: 'venmo'
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        const result = await response.json();
        setInvoiceNumber(result.invoiceNumber);
        setViewMode('success');
      } else {
        const errorData = await response.json();
        console.error('Error creating invoice:', errorData);
        // You could add error handling here if needed
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToLanding = () => {
    setViewMode('landing');
    setInputValue('');
    setParsedData(null);
    setInvoiceNumber('');
    setParseError(null);
  };

  const resetForm = () => {
    setInputValue('');
    setParsedData(null);
    setInvoiceNumber('');
    setViewMode('instant');
  };

  const handleSignInClick = () => {
    navigation.goToSignIn();
  };

  // Landing Page View
  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/40 to-purple-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-orange-300/20 rounded-full blur-3xl animate-float-delay"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-6xl text-center space-y-16 animate-fade-in">
            
            {/* Hero Section */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-light bg-gradient-to-r from-violet-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight tracking-tight max-w-4xl mx-auto">
                  Invoices that move as fast as you
                </h1>
              </div>
              
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                  <span className="font-light">10-second creation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"></div>
                  <span className="font-light">Smart AI parsing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                  <span className="font-light">Email magic</span>
                </div>
              </div>
            </div>

            {/* Two Main Options */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-16 max-w-4xl mx-auto">
              
              {/* Sign In / Account Option */}
              <div className="flex flex-col items-center space-y-4">
                <button 
                  onClick={handleSignInClick}
                  className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-[1.1] shadow-xl hover:shadow-2xl group"
                >
                  <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <h3 className="text-xl font-semibold text-gray-900">
                  Sign In
                </h3>
              </div>

              {/* OR Divider */}
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="h-px w-12 bg-gray-300"></div>
                <span className="text-lg font-light">or</span>
                <div className="h-px w-12 bg-gray-300"></div>
              </div>

              {/* Instant Invoice Option */}
              <div className="flex flex-col items-center space-y-4">
                <button 
                  onClick={() => setViewMode('instant')}
                  className="w-24 h-24 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-[1.1] shadow-xl hover:shadow-2xl group"
                >
                  <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <h3 className="text-xl font-semibold text-gray-900">Make an invoice now</h3>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/50 shadow-lg">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Or try our email magic ✨
                </h3>
                <p className="text-gray-600">
                  Send invoice details to{' '}
                  <span className="inline-flex items-center mx-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                    invoice@geoffvrijmoet.com
                  </span>
                  {' '}and get a professional invoice back instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success View
  if (viewMode === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/40 to-purple-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-orange-300/20 rounded-full blur-3xl animate-float-delay"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce-once">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full animate-ping"></div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl font-thin bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                  Invoice Created!
                </h2>
                <p className="text-xl text-gray-600 font-light">
                  Invoice <span className="font-medium text-violet-600">#{invoiceNumber}</span> is ready to go
                </p>
              </div>
              
              {parsedData && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-white/50 shadow-xl">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-light">Client:</span>
                      <span className="font-medium text-gray-700">{parsedData.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-light">Amount:</span>
                      <span className="font-medium text-green-600">${parsedData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-light">For:</span>
                      <span className="font-medium text-gray-700">{parsedData.description}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetForm}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  Create Another Invoice
                </button>
                <button
                  onClick={resetToLanding}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 font-medium py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg border border-gray-200"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Instant Invoice View (existing functionality)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/40 to-purple-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-orange-300/20 rounded-full blur-3xl animate-float-delay"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-green-300/20 to-blue-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-2xl"></div>
      </div>
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={resetToLanding}
          className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg border border-gray-200 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center space-y-12 animate-fade-in">
            <div className="space-y-8">
              <div className="relative">
                <h1 className="text-5xl md:text-6xl font-thin bg-gradient-to-r from-violet-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight tracking-tight">
                  Type your invoice details
                </h1>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-3">
                  <div className="text-xl text-gray-500 font-light">
                    Don&apos;t worry about formatting. Just type naturally.
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Try: John Smith $500 web design work"
                      rows={3}
                      className="w-full px-8 py-6 text-lg text-left border border-gray-200 rounded-2xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg resize-none placeholder-gray-400"
                      autoFocus
                    />
                  
                    {inputValue.length >= 5 && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                          {isParsing ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              🤖 AI is parsing...
                            </span>
                          ) : parsedData ? (
                            '✨ Parsed successfully!'
                          ) : (
                            'Ready for AI parsing! ✨'
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Show AI parsing feedback */}
                  {parsedData && parsedData.confidence && !isProcessing && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700 font-medium">✨ AI Parsed Successfully:</span>
                        <span className="text-green-600">
                          {Math.round(parsedData.confidence * 100)}% confidence
                        </span>
                      </div>
                      <div className="mt-2 text-green-700">
                        <strong>{parsedData.clientName}</strong> • ${parsedData.amount} • {parsedData.description}
                        {parsedData.dueDate && <span> • Due: {parsedData.dueDate}</span>}
                      </div>
                    </div>
                  )}

                  {/* Show Invoice Preview */}
                  {parsedData && parsedData.confidence && !isProcessing && (
                    <InvoicePreview 
                      data={parsedData} 
                      invoiceNumber={invoiceNumber || undefined}
                    />
                  )}

                  {/* Show parsing errors */}
                  {parseError && !isParsing && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="text-red-700 text-sm">
                        <span className="font-medium">❌ Parsing failed:</span> {parseError}
                      </div>
                      {parseError.includes('API key') && (
                        <div className="mt-2 text-xs text-red-600">
                          Make sure you have GEMINI_API_KEY set in your .env.local file.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {parsedData && parsedData.clientName && parsedData.amount > 0 && (
                    <button
                      onClick={handleSubmit}
                      disabled={isProcessing || isParsing}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-medium px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:scale-100"
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating invoice...
                        </span>
                      ) : isParsing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          AI is parsing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Create Invoice for {parsedData?.clientName}
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                <span className="font-light">10-second creation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"></div>
                <span className="font-light">Smart parsing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                <span className="font-light">Email magic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 