



interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  showSpinner?: boolean;
  spinnerType?: 'custom' | 'ripple' | 'bars';
  spinnerColor?: 'violet' | 'blue' | 'green' | 'red' | 'purple' | 'indigo';
  spinnerSize?: 'small' | 'medium' | 'large';
  strokeWidth?: number;
  spinnerSpeed?: number;
  className?: string;
}

export default function LoadingScreen({ 
  title = "Loading...", 
  subtitle, 
  showSpinner = true,
  spinnerType = 'custom',
  spinnerColor = 'violet',
  spinnerSize = 'medium',
  strokeWidth = 2,
  spinnerSpeed = 1,
  className = ""
}: LoadingScreenProps) {
  
  const getColorClasses = () => {
    const colorMap = {
      violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-600', borderLight: 'border-violet-200', borderTop: 'border-t-violet-600' },
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', borderLight: 'border-blue-200', borderTop: 'border-t-blue-600' },
      green: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-600', borderLight: 'border-green-200', borderTop: 'border-t-green-600' },
      red: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600', borderLight: 'border-red-200', borderTop: 'border-t-red-600' },
      purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-600', borderLight: 'border-purple-200', borderTop: 'border-t-purple-600' },
      indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', borderLight: 'border-indigo-200', borderTop: 'border-t-indigo-600' },
    };
    return colorMap[spinnerColor];
  };

  const getSizeClasses = () => {
    const sizeMap = {
      small: { container: 'w-8 h-8', icon: 'w-8 h-8', dot: 'w-1.5 h-1.5', bar: 'w-0.5 h-6', wave: 'w-0.5 h-4', reactSize: 20 },
      medium: { container: 'w-12 h-12', icon: 'w-12 h-12', dot: 'w-2 h-2', bar: 'w-1 h-8', wave: 'w-1 h-6', reactSize: 30 },
      large: { container: 'w-16 h-16', icon: 'w-16 h-16', dot: 'w-3 h-3', bar: 'w-1.5 h-12', wave: 'w-1.5 h-8', reactSize: 40 },
    };
    return sizeMap[spinnerSize];
  };

  const colors = getColorClasses();
  const sizes = getSizeClasses();

  const renderSpinner = () => {
    switch (spinnerType) {
      case 'custom':
        return (
          <div className={`relative ${sizes.container} mx-auto mb-4`}>
            <div className={`absolute inset-0 border-4 ${colors.borderLight} rounded-full`}></div>
            <div className={`absolute inset-0 border-4 border-transparent ${colors.borderTop} rounded-full animate-spin`}></div>
          </div>
        );
      
      case 'ripple':
        return (
          <div className={`relative ${sizes.container} mx-auto mb-4`}>
            <div className={`absolute inset-0 border-2 ${colors.border} rounded-full animate-ping`}></div>
            <div className={`absolute inset-2 border-2 ${colors.border} rounded-full animate-ping`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`absolute inset-4 border-2 ${colors.border} rounded-full animate-ping`} style={{ animationDelay: '0.4s' }}></div>
          </div>
        );
      
      case 'bars':
        return (
          <div className="flex justify-center space-x-1 mb-4">
            <div className={`${sizes.bar} ${colors.bg} rounded-full animate-pulse`}></div>
            <div className={`${sizes.bar} ${colors.bg} rounded-full animate-pulse`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`${sizes.bar} ${colors.bg} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`${sizes.bar} ${colors.bg} rounded-full animate-pulse`} style={{ animationDelay: '0.3s' }}></div>
          </div>
        );
      
      default:
        return (
          <div className={`relative ${sizes.container} mx-auto mb-4`}>
            <div className={`absolute inset-0 border-4 ${colors.borderLight} rounded-full`}></div>
            <div className={`absolute inset-0 border-4 border-transparent border-t-${spinnerColor}-600 rounded-full animate-spin`}></div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/30 flex items-center justify-center ${className}`}>
      <div className="text-center max-w-md mx-auto px-4">
        {showSpinner && renderSpinner()}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        {subtitle && (
          <p className="text-gray-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
} 