"use client";

import { useState } from 'react';
import LoadingScreen from '../../components/ui/LoadingScreen';
import PageAnimation from '../../components/ui/PageAnimation';

const spinnerTypes = [
  { value: 'custom', label: 'Custom Ring' },
  { value: 'ripple', label: 'Ripple Effect' },
  { value: 'bars', label: 'Bar Loader' },
];

const colorOptions = [
  { value: 'violet', label: 'Violet', class: 'violet' },
  { value: 'blue', label: 'Blue', class: 'blue' },
  { value: 'green', label: 'Green', class: 'green' },
  { value: 'red', label: 'Red', class: 'red' },
  { value: 'purple', label: 'Purple', class: 'purple' },
  { value: 'indigo', label: 'Indigo', class: 'indigo' },
];

const sizeOptions = [
  { value: 'small', label: 'Small', class: 'w-8 h-8' },
  { value: 'medium', label: 'Medium', class: 'w-12 h-12' },
  { value: 'large', label: 'Large', class: 'w-16 h-16' },
];

export default function TestPage() {
  const [currentTest, setCurrentTest] = useState('loading');
  const [spinnerType, setSpinnerType] = useState('custom');
  const [spinnerColor, setSpinnerColor] = useState('violet');
  const [spinnerSize, setSpinnerSize] = useState('medium');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [spinnerSpeed, setSpinnerSpeed] = useState(1);
  const [title, setTitle] = useState('Completing sign-in...');
  const [subtitle, setSubtitle] = useState('Please wait while we complete your authentication.');
  const [showSpinner, setShowSpinner] = useState(true);
  
  // Animation test states
  const [animationType, setAnimationType] = useState('fade');
  const [animationDuration, setAnimationDuration] = useState(300);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [triggerPageAnimation, setTriggerPageAnimation] = useState(false);

  const getSizeClass = () => {
    const sizeMap = {
      small: 'w-8 h-8',
      medium: 'w-12 h-12', 
      large: 'w-16 h-16'
    };
    return sizeMap[spinnerSize as keyof typeof sizeMap];
  };

  const getColorClass = () => {
    const colorMap = {
      violet: 'text-violet-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600'
    };
    return colorMap[spinnerColor as keyof typeof colorMap];
  };

  const getAnimationClass = () => {
    const animationMap = {
      fade: 'opacity-0',
      slide: 'transform translate-x-full',
      scale: 'transform scale-0',
      bounce: 'animate-bounce',
      rotate: 'animate-spin',
      pulse: 'animate-pulse'
    };
    return animationMap[animationType as keyof typeof animationMap];
  };

  const getPageAnimationClass = () => {
    const pageAnimationMap = {
      fade: 'opacity-0',
      slideUp: 'transform translate-y-8 opacity-0',
      slideDown: 'transform -translate-y-8 opacity-0',
      slideLeft: 'transform translate-x-8 opacity-0',
      slideRight: 'transform -translate-x-8 opacity-0',
      scale: 'transform scale-95 opacity-0',
      zoom: 'transform scale-105 opacity-0',
      blur: 'blur-sm opacity-0'
    };
    return pageAnimationMap[animationType as keyof typeof pageAnimationMap];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto h-screen flex flex-col">
        {/* Navigation - Fixed at top */}
        <div className="p-8 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading Screen Tester</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentTest('loading')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTest === 'loading' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Loading Screens
            </button>
            <button
              onClick={() => setCurrentTest('animations')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTest === 'animations' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Animations
            </button>
            <button
              onClick={() => setCurrentTest('pageAnimation')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTest === 'pageAnimation' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Page Animation Component
            </button>
            <button
              onClick={() => setCurrentTest('simpleLayout')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTest === 'simpleLayout' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Simple Layout Animation
            </button>
          </div>
        </div>

        {currentTest === 'loading' && (
          <div className="flex-1 flex flex-col">
            {/* Controls Panel - Takes up top 3/4 */}
            <div className="flex-1 overflow-y-auto px-8 pb-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Controls</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Spinner Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Spinner Type</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {spinnerTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSpinnerType(type.value)}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          spinnerType === type.value
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSpinnerColor(color.value)}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          spinnerColor === color.value
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {color.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Size</label>
                  <div className="flex space-x-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setSpinnerSize(size.value)}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          spinnerSize === size.value
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* Stroke Width (for Lucide icons) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stroke Width</label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.5"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{strokeWidth}</div>
                </div>

                {/* Spinner Speed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Speed</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={spinnerSpeed}
                    onChange={(e) => setSpinnerSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{spinnerSpeed}x</div>
                </div>

                {/* Text Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Show/Hide Spinner */}
              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showSpinner}
                    onChange={(e) => setShowSpinner(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Spinner</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sticky Preview - Takes up bottom 1/4 */}
          <div className="h-1/4 bg-white border-t border-gray-200 shadow-lg">
            <div className="h-full flex items-center justify-center">
              <LoadingScreen
                title={title}
                subtitle={subtitle}
                showSpinner={showSpinner}
                spinnerType={spinnerType as any}
                spinnerColor={spinnerColor as any}
                spinnerSize={spinnerSize as any}
                strokeWidth={strokeWidth}
                spinnerSpeed={spinnerSpeed}
              />
            </div>
          </div>
        </div>
      )}

      {currentTest === 'animations' && (
        <div className="flex-1 flex flex-col">
          {/* Controls Panel - Takes up top 3/4 */}
          <div className="flex-1 overflow-y-auto px-8 pb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Animation Controls</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Animation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Animation Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'fade', label: 'Fade In' },
                      { value: 'slideUp', label: 'Slide Up' },
                      { value: 'slideDown', label: 'Slide Down' },
                      { value: 'slideLeft', label: 'Slide Left' },
                      { value: 'slideRight', label: 'Slide Right' },
                      { value: 'scale', label: 'Scale In' },
                      { value: 'zoom', label: 'Zoom In' },
                      { value: 'blur', label: 'Blur In' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setAnimationType(type.value)}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          animationType === type.value
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (ms)</label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={animationDuration}
                    onChange={(e) => setAnimationDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{animationDuration}ms</div>
                </div>

                {/* Delay */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delay (ms)</label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={animationDelay}
                    onChange={(e) => setAnimationDelay(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{animationDelay}ms</div>
                </div>
              </div>

              {/* Trigger Button */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => setIsAnimating(false), animationDuration + animationDelay);
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Trigger Animation
                </button>
              </div>
            </div>
          </div>

          {/* Animation Preview - Takes up bottom 1/4 */}
          <div className="h-1/4 bg-white border-t border-gray-200 shadow-lg">
            <div className="h-full flex items-center justify-center">
              <div
                className={`w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6 ${
                  isAnimating ? getPageAnimationClass() : 'opacity-100 transform translate-y-0 scale-100'
                }`}
                style={{
                  transition: `all ${animationDuration}ms ease-in-out`,
                  transitionDelay: `${animationDelay}ms`
                }}
              >
                <div className="max-w-md mx-auto">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sample Page Content</h3>
                    <p className="text-gray-600 mb-4">This simulates how your pages will animate in.</p>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTest === 'pageAnimation' && (
        <div className="flex-1 flex flex-col">
          {/* Controls Panel - Takes up top 1/2 */}
          <div className="flex-1 overflow-y-auto px-8 pb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Page Animation Component Test</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Animation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Animation Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'fade', label: 'Fade In' },
                      { value: 'slideUp', label: 'Slide Up' },
                      { value: 'slideDown', label: 'Slide Down' },
                      { value: 'slideLeft', label: 'Slide Left' },
                      { value: 'slideRight', label: 'Slide Right' },
                      { value: 'scale', label: 'Scale In' },
                      { value: 'zoom', label: 'Zoom In' },
                      { value: 'blur', label: 'Blur In' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setAnimationType(type.value)}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          animationType === type.value
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (ms)</label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={animationDuration}
                    onChange={(e) => setAnimationDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{animationDuration}ms</div>
                </div>

                {/* Delay */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delay (ms)</label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={animationDelay}
                    onChange={(e) => setAnimationDelay(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{animationDelay}ms</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Usage Example:</h3>
                <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
{`<PageAnimation 
  type="${animationType}" 
  duration={${animationDuration}} 
  delay={${animationDelay}}
>
  {/* Your page content */}
</PageAnimation>`}
                </pre>
              </div>

              {/* Trigger Button */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    setTriggerPageAnimation(false);
                    setTimeout(() => setTriggerPageAnimation(true), 100);
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Trigger Page Animation
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview - Takes up bottom 1/2 */}
          <div className="h-1/2 bg-white border-t border-gray-200 shadow-lg">
            <div className="h-full flex items-center justify-center p-6">
              <PageAnimation
                key={triggerPageAnimation ? 'triggered' : 'not-triggered'}
                type={animationType as any}
                duration={animationDuration}
                delay={animationDelay}
                className="w-full max-w-md"
                trigger={triggerPageAnimation}
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Page Animation Demo</h3>
                  <p className="text-gray-600 mb-4">This shows how the PageAnimation component works in practice.</p>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="bg-violet-600 text-white px-3 py-1 rounded text-sm">Button 1</button>
                    <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">Button 2</button>
                  </div>
                </div>
              </PageAnimation>
            </div>
          </div>
        </div>
      )}

      {currentTest === 'simpleLayout' && (
        <div className="flex-1 flex flex-col">
          {/* Info Panel */}
          <div className="flex-1 overflow-y-auto px-8 pb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Simple Layout Animation</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">How it works:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Automatically applied to all pages via layout.tsx</li>
                    <li>No code needed in individual pages</li>
                    <li>Simple fade + slide up animation</li>
                    <li>Triggers on every page navigation</li>
                    <li>Zero complexity in your page components</li>
                    <li><strong>Waits for all LoadingScreen components to finish</strong></li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 mb-2">✅ Active Now!</h3>
                  <p className="text-sm text-green-700">
                    This animation is currently active on your entire app. Every page will have this smooth transition.
                    <br />
                    <strong>It automatically waits for all LoadingScreen components to finish before animating!</strong>
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Implementation:</h3>
                  <pre className="text-xs text-blue-700 bg-white p-3 rounded border overflow-x-auto">
{`// In layout.tsx
<SimpleAnimatedLayout>
  {children}
</SimpleAnimatedLayout>

// That's it! No other code needed.`}
                  </pre>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Test it:</h3>
                  <p className="text-sm text-yellow-700">
                    Navigate between pages in your app to see the animation in action. 
                    Try going to /dashboard, /test, or any other page.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Area */}
          <div className="h-1/3 bg-white border-t border-gray-200 shadow-lg">
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  ✨
                </div>
                <p className="text-gray-600">This page animates in automatically!</p>
                <p className="text-sm text-gray-500 mt-2">Try navigating to other pages to see the effect.</p>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">LoadingScreen Coordination</h4>
                  <p className="text-xs text-blue-700">
                    When any page has a LoadingScreen component, the page animation will wait until 
                    ALL LoadingScreen components are unmounted before triggering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
