import {
  ClipLoader,
  HashLoader,
  PulseLoader,
  BeatLoader,
  SyncLoader,
  RingLoader,
  BarLoader,
  CircleLoader,
  GridLoader,
  FadeLoader,
  ScaleLoader,
  SkewLoader,
  SquareLoader,
  PropagateLoader,
  RotateLoader,
  RiseLoader,
  BounceLoader,
  DotLoader,
  PacmanLoader,
  MoonLoader
} from 'react-spinners';

interface ReactSpinnerProps {
  type: string;
  color: string;
  size: number;
  loading?: boolean;
  className?: string;
}

export function ReactSpinner({ type, color, size, loading = true, className = '' }: ReactSpinnerProps) {
  const getColorValue = () => {
    const colorMap = {
      violet: '#7c3aed',
      blue: '#2563eb',
      green: '#16a34a',
      red: '#dc2626',
      purple: '#9333ea',
      indigo: '#4f46e5'
    };
    return colorMap[color as keyof typeof colorMap];
  };

  const colorValue = getColorValue();

  switch (type) {
    case 'clip':
      return <ClipLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'hash':
      return <HashLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'pulse':
      return <PulseLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'beat':
      return <BeatLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'sync':
      return <SyncLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'ring':
      return <RingLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'bar':
      return <BarLoader color={colorValue} width={size * 4} loading={loading} className={className} />;
    case 'circle':
      return <CircleLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'grid':
      return <GridLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'fade':
      return <FadeLoader color={colorValue} height={size} loading={loading} className={className} />;
    case 'scale':
      return <ScaleLoader color={colorValue} height={size} loading={loading} className={className} />;
    case 'skew':
      return <SkewLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'square':
      return <SquareLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'propagate':
      return <PropagateLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'rotate':
      return <RotateLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'rise':
      return <RiseLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'bounce':
      return <BounceLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'dot':
      return <DotLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'pacman':
      return <PacmanLoader color={colorValue} size={size} loading={loading} className={className} />;
    case 'moon':
      return <MoonLoader color={colorValue} size={size} loading={loading} className={className} />;
    default:
      return <ClipLoader color={colorValue} size={size} loading={loading} className={className} />;
  }
} 