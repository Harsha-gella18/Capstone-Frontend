import React, { useState, useEffect } from 'react';

const SmartSuggestions = ({ topic, subject, onSelect, messages = [] }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Categorized suggestion templates
  const suggestionTemplates = {
    'Mathematics': [
      'Explain this concept with examples',
      'Show me step-by-step solution',
      'What are common mistakes to avoid?',
      'Give me practice problems',
      'How is this used in real life?',
      'Can you simplify this for me?'
    ],
    'Physics': [
      'What are real-world applications?',
      'Explain the underlying principles',
      'Show me the derivation',
      'Compare with related concepts',
      'What experiments demonstrate this?',
      'How does this relate to other topics?'
    ],
    'Chemistry': [
      'Explain the chemical reaction',
      'What are the properties of this compound?',
      'Show me the molecular structure',
      'What are practical applications?',
      'How do I balance this equation?',
      'What safety precautions are needed?'
    ],
    'Biology': [
      'Explain the biological process',
      'What is the function of this organ/cell?',
      'How does this system work?',
      'What are examples in nature?',
      'Compare different organisms',
      'What diseases are related to this?'
    ],
    'Social Science': [
      'Explain the historical context',
      'What were the causes and effects?',
      'Compare different perspectives',
      'How does this impact society?',
      'What are the key dates and events?',
      'Why is this important to study?'
    ]
  };

  // Generic suggestions when subject is not recognized
  const genericSuggestions = [
    'Explain this concept in simple terms',
    'Give me examples',
    'What should I know about this?',
    'How does this work?',
    'Can you elaborate on this?',
    'What are the key points?'
  ];

  useEffect(() => {
    // Get suggestions based on subject, fall back to generic if not found
    const subjectSuggestions = suggestionTemplates[subject] || genericSuggestions;
    setSuggestions(subjectSuggestions);
  }, [subject]);

  const handleSuggestionClick = (suggestion) => {
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-4">
      <div className="flex items-center mb-3">
        <svg 
          className="w-5 h-5 text-blue-600 mr-2" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-700">
          💡 Smart Suggestions for {subject}
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="group text-xs px-3 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
            title="Click to use this suggestion"
          >
            <span className="flex items-center space-x-1">
              <svg 
                className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
              <span>{suggestion}</span>
            </span>
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-3 flex items-center">
        <svg 
          className="w-3 h-3 mr-1" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
            clipRule="evenodd" 
          />
        </svg>
        Click any suggestion to quickly ask a relevant question
      </p>
    </div>
  );
};

export default SmartSuggestions;
