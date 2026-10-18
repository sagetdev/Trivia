export const formatNumber = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
