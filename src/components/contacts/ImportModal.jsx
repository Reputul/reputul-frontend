// src/components/contacts/ImportModal.jsx
import React, { useState, useRef } from 'react';
import { contactsApi, handleApiError, parseCSVPreview } from '../../api/Contacts';

const ImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Processing
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState({ headers: [], rows: [] });
  const [prepareResponse, setPrepareResponse] = useState(null);
  const [mapping, setMapping] = useState({});
  const [options, setOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
    skipEmptyRows: true
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Available field mappings - matches backend expectations
  const availableFields = [
    { key: 'name', label: 'Name', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'lastJobDate', label: 'Last Job Date', required: false },
    { key: 'tags', label: 'Tags (comma-separated)', required: false },
    { key: 'smsConsent', label: 'SMS Consent (Y/N/Unknown)', required: false },
    { key: 'emailConsent', label: 'Email Consent (Y/N/Unknown)', required: false },
  ];

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setProcessing(true);

    try {
      // Step 1: Upload to backend for preparation
      const response = await contactsApi.prepareCsvImport(selectedFile);
      setPrepareResponse(response.data);

      // Step 2: Also parse locally for immediate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target.result;
          const previewData = parseCSVPreview(csvText, 5);
          setPreview(previewData);
          
          // Auto-map common field names using backend headers if available
          const headersToMap = response.data.headers || previewData.headers;
          const autoMapping = {};
          
          headersToMap.forEach((header, index) => {
            const lowerHeader = header.toLowerCase().trim();
            
            if (lowerHeader.includes('name') || lowerHeader === 'customer') {
              autoMapping[index] = 'name';
            } else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) {
              autoMapping[index] = 'email';
            } else if (lowerHeader.includes('phone') || lowerHeader.includes('tel') || lowerHeader.includes('mobile')) {
              autoMapping[index] = 'phone';
            } else if (lowerHeader.includes('date') || lowerHeader.includes('last') || lowerHeader.includes('job')) {
              autoMapping[index] = 'lastJobDate';
            } else if (lowerHeader.includes('tag') || lowerHeader.includes('category')) {
              autoMapping[index] = 'tags';
            } else if (lowerHeader.includes('sms')) {
              autoMapping[index] = 'smsConsent';
            } else if (lowerHeader.includes('email') && lowerHeader.includes('consent')) {
              autoMapping[index] = 'emailConsent';
            }
          });
          
          setMapping(autoMapping);
          setStep(2);
          setProcessing(false);
        } catch (err) {
          setError('Error reading CSV file. Please check the format.');
          setProcessing(false);
        }
      };
      
      reader.readAsText(selectedFile);

    } catch (err) {
      setError(handleApiError(err));
      setProcessing(false);
    }
  };

  const handleMappingChange = (headerIndex, field) => {
    const newMapping = { ...mapping };
    
    // Clear any existing mapping for this field
    Object.keys(newMapping).forEach(key => {
      if (newMapping[key] === field) {
        delete newMapping[key];
      }
    });
    
    // Set new mapping
    if (field) {
      newMapping[headerIndex] = field;
    } else {
      delete newMapping[headerIndex];
    }
    
    setMapping(newMapping);
  };

  const validateMapping = () => {
    const mappedFields = Object.values(mapping);
    const requiredFields = availableFields.filter(f => f.required).map(f => f.key);
    
    for (const required of requiredFields) {
      if (!mappedFields.includes(required)) {
        setError(`Required field "${required}" must be mapped`);
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const handleImport = async () => {
    if (!validateMapping() || !prepareResponse) return;
    
    setProcessing(true);
    setError('');
    setStep(3);
    
    try {
      // Step 2: Commit the import using backend's commit endpoint
      const commitRequest = {
        importId: prepareResponse.importId,
        mapping: mapping,
        options: options
      };
      
      const response = await contactsApi.commitCsvImport(commitRequest);
      
      onSuccess(response.data);
    } catch (err) {
      setError(handleApiError(err));
      setStep(2); // Go back to preview
    } finally {
      setProcessing(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setFile(null);
    setPreview({ headers: [], rows: [] });
    setPrepareResponse(null);
    setMapping({});
    setError('');
    setProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Import Contacts from CSV</h3>
            <p className="text-sm text-gray-600 mt-1">
              Step {step} of 3: {step === 1 ? 'Upload File' : step === 2 ? 'Map Fields' : 'Processing'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2 bg-gray-50">
          <div className="flex items-center">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-2 mx-4 rounded ${
                    s < step ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: File Upload */}
          {step === 1 && (
            <div className="text-center py-8">
              {processing ? (
                <div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Uploading and parsing CSV...</h4>
                  <p className="text-gray-600">Please wait while we process your file.</p>
                </div>
              ) : (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-primary-400 transition-colors">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV File</h4>
                    <p className="text-gray-600 mb-6">
                      Select a CSV file containing your contacts. Maximum file size: 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Choose CSV File
                    </button>
                  </div>
                  
                  <div className="mt-8 text-left">
                    <h5 className="font-semibold text-gray-900 mb-3">CSV Format Guidelines:</h5>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• First row should contain column headers</li>
                      <li>• Required: Name column</li>
                      <li>• Optional: Email, Phone, Last Job Date, Tags</li>
                      <li>• Tags should be comma-separated in a single column</li>
                      <li>• Consent fields can use Y/N/Yes/No or leave empty for unknown</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {step === 2 && preview.headers.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Map CSV Columns to Fields</h4>
              <p className="text-gray-600 mb-6">
                Match your CSV columns to the contact fields below:
              </p>
              
              {/* Show import summary from backend */}
              {prepareResponse && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h5 className="font-semibold text-blue-900 mb-2">Import Summary</h5>
                  <p className="text-blue-800">
                    Found {prepareResponse.totalRows} total rows with {prepareResponse.headers?.length || preview.headers.length} columns
                  </p>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                {preview.headers.map((header, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{header}</div>
                      <div className="text-sm text-gray-500">
                        Sample: {preview.rows[0]?.[index] || 'N/A'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <select
                        value={mapping[index] || ''}
                        onChange={(e) => handleMappingChange(index, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Don't import</option>
                        {availableFields.map(field => (
                          <option key={field.key} value={field.key}>
                            {field.label} {field.required ? '*' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Import Options */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h5 className="font-semibold text-gray-900 mb-4">Import Options</h5>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.skipDuplicates}
                      onChange={(e) => setOptions({...options, skipDuplicates: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Skip duplicate contacts (based on email/phone)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.updateExisting}
                      onChange={(e) => setOptions({...options, updateExisting: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Update existing contacts with new information</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.skipEmptyRows}
                      onChange={(e) => setOptions({...options, skipEmptyRows: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Skip rows with empty required fields</span>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Preview (first 5 rows)</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {preview.headers.map((header, index) => (
                          <th key={index} className="px-3 py-2 text-left font-medium text-gray-700">
                            {header}
                            {mapping[index] && (
                              <div className="text-xs text-primary-600 font-normal">
                                → {availableFields.find(f => f.key === mapping[index])?.label}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-100">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-gray-900">
                              {cell || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <div className="text-center py-12">
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-6"></div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Processing Import</h4>
                  <p className="text-gray-600">Please wait while we import your contacts...</p>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 text-green-600 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Import Complete!</h4>
                  <p className="text-gray-600">Your contacts have been successfully imported.</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {step === 3 && !processing ? 'Close' : 'Cancel'}
          </button>
          
          <div className="flex space-x-3">
            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={!validateMapping() || processing}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Import Contacts
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;