export const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return 'phone';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export const getDeviceSize = () => {
  const deviceType = getDeviceType();
  const deviceSizes = {
    phone: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '100%', height: '700px' },
  };
  return deviceSizes[deviceType];
};