const LoaderBars = () => {
  const barCount = 10;

  const bars = Array.from({ length: barCount }, (_, i) => {
    const delay = (i - 8) * 0.1; // from -0.8s to 0.1s
    return (
      <div
        key={i}
        className="w-[10px] h-[20px] mx-[2px] rounded bg-primary"
        style={{
          animation: 'barScale 3s ease-in-out infinite',
          animationDelay: `${delay}s`,
        }}
      ></div>
    );
  });

  return (
    <>
      <style>{`
        @keyframes barScale {
          0% { transform: scale(1); }
          20% { transform: scale(1, 2.32); }
          40% { transform: scale(1); }
        }
      `}</style>

      <div className="flex justify-center items-center">{bars}</div>
    </>
  );
};

export default LoaderBars;
